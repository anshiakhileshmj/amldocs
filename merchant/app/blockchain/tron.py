from tronpy import Tron
from tronpy.keys import PrivateKey
from typing import Dict, List, Optional, Tuple
from decimal import Decimal
import asyncio
import json

from app.blockchain.base import BlockchainInterface
from app.models import ChainType, TokenType
from app.core.config import settings

class TronBlockchain(BlockchainInterface):
    """Tron blockchain integration"""
    
    def __init__(self, rpc_url: str):
        super().__init__(rpc_url, ChainType.TRON)
        self.tron = Tron(network="mainnet")
    
    async def get_balance(self, address: str, token: TokenType) -> Decimal:
        """Get TRC-20 token balance"""
        if token == TokenType.USDC:
            contract_address = settings.supported_tokens["tron"]["USDC"]
        elif token == TokenType.USDT:
            contract_address = settings.supported_tokens["tron"]["USDT"]
        else:
            raise ValueError(f"Unsupported token: {token}")
        
        try:
            # Get TRC-20 token balance
            contract = self.tron.get_contract(contract_address)
            balance = contract.functions.balanceOf(address)
            
            # Get token decimals
            decimals = contract.functions.decimals()
            
            return Decimal(balance) / Decimal(10 ** decimals)
            
        except Exception:
            return Decimal(0)
    
    async def get_native_balance(self, address: str) -> Decimal:
        """Get TRX balance"""
        try:
            balance = self.tron.get_account_balance(address)
            return Decimal(balance) / Decimal(10 ** 6)  # TRX has 6 decimals
        except Exception:
            return Decimal(0)
    
    async def create_wallet(self) -> Tuple[str, str]:
        """Create new Tron wallet"""
        private_key = PrivateKey.random()
        address = private_key.public_key.to_base58check_address()
        return address, private_key.hex()
    
    async def send_transaction(self, from_address: str, to_address: str, amount: Decimal, token: TokenType, private_key: str) -> str:
        """Send TRC-20 token transaction"""
        if token == TokenType.USDC:
            contract_address = settings.supported_tokens["tron"]["USDC"]
        elif token == TokenType.USDT:
            contract_address = settings.supported_tokens["tron"]["USDT"]
        else:
            raise ValueError(f"Unsupported token: {token}")
        
        try:
            # Create private key object
            priv_key = PrivateKey(bytes.fromhex(private_key))
            
            # Get contract
            contract = self.tron.get_contract(contract_address)
            
            # Get token decimals
            decimals = contract.functions.decimals()
            
            # Convert amount to smallest unit
            amount_smallest = int(amount * Decimal(10 ** decimals))
            
            # Build transaction
            txn = contract.functions.transfer(to_address, amount_smallest).with_owner(from_address).build()
            
            # Sign and broadcast transaction
            signed_txn = txn.sign(priv_key)
            result = signed_txn.broadcast()
            
            return result.get('txid')
            
        except Exception as e:
            raise ValueError(f"Failed to send transaction: {str(e)}")
    
    async def get_transaction_status(self, tx_hash: str) -> Dict:
        """Get transaction status and details"""
        try:
            tx_info = self.tron.get_transaction(tx_hash)
            
            if not tx_info:
                return {
                    "tx_hash": tx_hash,
                    "status": "pending",
                    "error": "Transaction not found"
                }
            
            return {
                "tx_hash": tx_hash,
                "status": "confirmed" if tx_info.get('ret', [{}])[0].get('contractRet') == 'SUCCESS' else "failed",
                "block_number": tx_info.get('blockNumber'),
                "fee": tx_info.get('fee', 0),
                "from": tx_info.get('raw_data', {}).get('contract', [{}])[0].get('parameter', {}).get('value', {}).get('owner_address'),
                "to": tx_info.get('raw_data', {}).get('contract', [{}])[0].get('parameter', {}).get('value', {}).get('to_address')
            }
            
        except Exception as e:
            return {
                "tx_hash": tx_hash,
                "status": "pending",
                "error": str(e)
            }
    
    async def get_token_contract_address(self, token: TokenType) -> str:
        """Get token contract address"""
        return settings.supported_tokens["tron"][token.value]
    
    async def estimate_gas(self, from_address: str, to_address: str, amount: Decimal, token: TokenType) -> int:
        """Estimate energy cost for transaction"""
        # Tron uses energy instead of gas, return estimated energy cost
        return 100000  # Default energy cost for TRC-20 transfer
    
    async def get_latest_block_number(self) -> int:
        """Get latest block number"""
        try:
            return self.tron.get_latest_block_number()
        except Exception:
            return 0
    
    async def get_transaction_receipt(self, tx_hash: str) -> Optional[Dict]:
        """Get transaction receipt"""
        try:
            tx_info = self.tron.get_transaction(tx_hash)
            if tx_info:
                return {
                    "block_number": tx_info.get('blockNumber'),
                    "fee": tx_info.get('fee', 0),
                    "ret": tx_info.get('ret', []),
                    "raw_data": tx_info.get('raw_data', {})
                }
            return None
        except Exception:
            return None
