from solana.rpc.api import Client
from solana.keypair import Keypair
from solana.publickey import PublicKey
from solana.transaction import Transaction
from solana.system_program import TransferParams, transfer
from spl.token.client import Token
from spl.token.constants import TOKEN_PROGRAM_ID
from spl.token.instructions import transfer_checked, TransferCheckedParams
from typing import Dict, List, Optional, Tuple
from decimal import Decimal
import asyncio
import base58

from app.blockchain.base import BlockchainInterface
from app.models import ChainType, TokenType
from app.core.config import settings

class SolanaBlockchain(BlockchainInterface):
    """Solana blockchain integration"""
    
    def __init__(self, rpc_url: str):
        super().__init__(rpc_url, ChainType.SOLANA)
        self.client = Client(rpc_url)
    
    async def get_balance(self, address: str, token: TokenType) -> Decimal:
        """Get SPL token balance"""
        if token == TokenType.USDC:
            mint_address = settings.supported_tokens["solana"]["USDC"]
        elif token == TokenType.USDT:
            mint_address = settings.supported_tokens["solana"]["USDT"]
        else:
            raise ValueError(f"Unsupported token: {token}")
        
        try:
            # Get token accounts for the address
            response = self.client.get_token_accounts_by_owner(
                PublicKey(address),
                {"mint": PublicKey(mint_address)}
            )
            
            if not response.value:
                return Decimal(0)
            
            # Get account info
            account_info = self.client.get_account_info(response.value[0].pubkey)
            if not account_info.value:
                return Decimal(0)
            
            # Parse balance (SPL tokens have 6 decimals for USDC/USDT)
            balance = int.from_bytes(account_info.value.data[64:72], byteorder='little')
            return Decimal(balance) / Decimal(10 ** 6)
            
        except Exception:
            return Decimal(0)
    
    async def get_native_balance(self, address: str) -> Decimal:
        """Get SOL balance"""
        try:
            balance = self.client.get_balance(PublicKey(address))
            return Decimal(balance.value) / Decimal(10 ** 9)  # SOL has 9 decimals
        except Exception:
            return Decimal(0)
    
    async def create_wallet(self) -> Tuple[str, str]:
        """Create new Solana wallet"""
        keypair = Keypair()
        return str(keypair.public_key), base58.b58encode(keypair.secret_key).decode()
    
    async def send_transaction(self, from_address: str, to_address: str, amount: Decimal, token: TokenType, private_key: str) -> str:
        """Send SPL token transaction"""
        if token == TokenType.USDC:
            mint_address = settings.supported_tokens["solana"]["USDC"]
        elif token == TokenType.USDT:
            mint_address = settings.supported_tokens["solana"]["USDT"]
        else:
            raise ValueError(f"Unsupported token: {token}")
        
        try:
            # Create keypair from private key
            secret_key = base58.b58decode(private_key)
            keypair = Keypair.from_secret_key(secret_key)
            
            # Get source token account
            source_response = self.client.get_token_accounts_by_owner(
                keypair.public_key,
                {"mint": PublicKey(mint_address)}
            )
            
            if not source_response.value:
                raise ValueError("Source token account not found")
            
            source_token_account = source_response.value[0].pubkey
            
            # Get destination token account
            dest_response = self.client.get_token_accounts_by_owner(
                PublicKey(to_address),
                {"mint": PublicKey(mint_address)}
            )
            
            if not dest_response.value:
                raise ValueError("Destination token account not found")
            
            dest_token_account = dest_response.value[0].pubkey
            
            # Create transfer instruction
            amount_lamports = int(amount * Decimal(10 ** 6))  # USDC/USDT have 6 decimals
            
            transfer_ix = transfer_checked(
                TransferCheckedParams(
                    program_id=TOKEN_PROGRAM_ID,
                    source=source_token_account,
                    mint=PublicKey(mint_address),
                    dest=dest_token_account,
                    owner=keypair.public_key,
                    amount=amount_lamports,
                    decimals=6
                )
            )
            
            # Create and send transaction
            transaction = Transaction().add(transfer_ix)
            
            # Get recent blockhash
            recent_blockhash = self.client.get_latest_blockhash()
            transaction.recent_blockhash = recent_blockhash.value.blockhash
            
            # Sign transaction
            transaction.sign(keypair)
            
            # Send transaction
            result = self.client.send_transaction(transaction)
            
            return result.value
            
        except Exception as e:
            raise ValueError(f"Failed to send transaction: {str(e)}")
    
    async def get_transaction_status(self, tx_hash: str) -> Dict:
        """Get transaction status and details"""
        try:
            response = self.client.get_transaction(tx_hash)
            
            if not response.value:
                return {
                    "tx_hash": tx_hash,
                    "status": "pending",
                    "error": "Transaction not found"
                }
            
            tx = response.value
            return {
                "tx_hash": tx_hash,
                "status": "confirmed" if tx.meta.err is None else "failed",
                "slot": tx.slot,
                "fee": tx.meta.fee,
                "error": tx.meta.err
            }
            
        except Exception as e:
            return {
                "tx_hash": tx_hash,
                "status": "pending",
                "error": str(e)
            }
    
    async def get_token_contract_address(self, token: TokenType) -> str:
        """Get token mint address"""
        return settings.supported_tokens["solana"][token.value]
    
    async def estimate_gas(self, from_address: str, to_address: str, amount: Decimal, token: TokenType) -> int:
        """Estimate transaction fee (Solana uses fixed fees)"""
        # Solana has a fixed transaction fee of 5000 lamports
        return 5000
    
    async def get_latest_block_number(self) -> int:
        """Get latest slot number"""
        try:
            response = self.client.get_slot()
            return response.value
        except Exception:
            return 0
    
    async def get_transaction_receipt(self, tx_hash: str) -> Optional[Dict]:
        """Get transaction receipt"""
        try:
            response = self.client.get_transaction(tx_hash)
            if response.value:
                return {
                    "slot": response.value.slot,
                    "fee": response.value.meta.fee,
                    "error": response.value.meta.err,
                    "logs": response.value.meta.log_messages
                }
            return None
        except Exception:
            return None
