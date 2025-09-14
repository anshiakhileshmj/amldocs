from solana.rpc.api import Client
from solders.keypair import Keypair
from solders.pubkey import Pubkey as PublicKey
from solana.transaction import Transaction
from solders.system_program import TransferParams, transfer
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
        """Get token balance - simplified implementation"""
        try:
            if token == TokenType.SOL:
                return await self.get_native_balance(address)
            else:
                # For SPL tokens, we'll need to implement token account lookup
                # This is a simplified version that returns 0 for now
                # In a production environment, you'd need proper SPL token support
                return Decimal(0)
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
        return str(keypair.pubkey()), base58.b58encode(bytes(keypair)).decode()
    
    async def send_transaction(self, from_address: str, to_address: str, amount: Decimal, token: TokenType, private_key: str) -> str:
        """Send transaction - simplified implementation for SOL only"""
        if token != TokenType.SOL:
            raise ValueError("Only SOL transfers are currently supported in this simplified implementation")
        
        try:
            # Create keypair from private key
            secret_key = base58.b58decode(private_key)
            keypair = Keypair.from_bytes(secret_key)
            
            # Create transfer instruction for SOL
            amount_lamports = int(amount * Decimal(10 ** 9))  # SOL has 9 decimals
            
            transfer_ix = transfer(
                TransferParams(
                    from_pubkey=keypair.pubkey(),
                    to_pubkey=PublicKey(to_address),
                    lamports=amount_lamports
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
