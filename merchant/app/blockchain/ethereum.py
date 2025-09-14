from web3 import Web3
from web3.middleware import geth_poa_middleware
from typing import Dict, List, Optional, Tuple
from decimal import Decimal
import json
import asyncio
from eth_account import Account

from app.blockchain.base import BlockchainInterface
from app.models import ChainType, TokenType
from app.core.config import settings

class EthereumBlockchain(BlockchainInterface):
    """Ethereum blockchain integration"""
    
    def __init__(self, rpc_url: str):
        super().__init__(rpc_url, ChainType.ETHEREUM)
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        
        # Add PoA middleware for some networks
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
    
    async def get_balance(self, address: str, token: TokenType) -> Decimal:
        """Get ERC-20 token balance"""
        if token == TokenType.USDC:
            contract_address = settings.supported_tokens["ethereum"]["USDC"]
        elif token == TokenType.USDT:
            contract_address = settings.supported_tokens["ethereum"]["USDT"]
        elif token == TokenType.DAI:
            contract_address = settings.supported_tokens["ethereum"]["DAI"]
        else:
            raise ValueError(f"Unsupported token: {token}")
        
        # ERC-20 balanceOf function ABI
        balance_abi = [{"constant": True, "inputs": [{"name": "_owner", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "balance", "type": "uint256"}], "type": "function"}]
        
        contract = self.w3.eth.contract(address=contract_address, abi=balance_abi)
        balance = contract.functions.balanceOf(address).call()
        
        # Get token decimals
        decimals_abi = [{"constant": True, "inputs": [], "name": "decimals", "outputs": [{"name": "", "type": "uint8"}], "type": "function"}]
        decimals_contract = self.w3.eth.contract(address=contract_address, abi=decimals_abi)
        decimals = decimals_contract.functions.decimals().call()
        
        return Decimal(balance) / Decimal(10 ** decimals)
    
    async def get_native_balance(self, address: str) -> Decimal:
        """Get ETH balance"""
        balance = self.w3.eth.get_balance(address)
        return Decimal(balance) / Decimal(10 ** 18)
    
    async def create_wallet(self) -> Tuple[str, str]:
        """Create new Ethereum wallet"""
        account = Account.create()
        return account.address, account.private_key.hex()
    
    async def send_transaction(self, from_address: str, to_address: str, amount: Decimal, token: TokenType, private_key: str) -> str:
        """Send ERC-20 token transaction"""
        if token == TokenType.USDC:
            contract_address = settings.supported_tokens["ethereum"]["USDC"]
        elif token == TokenType.USDT:
            contract_address = settings.supported_tokens["ethereum"]["USDT"]
        elif token == TokenType.DAI:
            contract_address = settings.supported_tokens["ethereum"]["DAI"]
        else:
            raise ValueError(f"Unsupported token: {token}")
        
        # Get token decimals
        decimals_abi = [{"constant": True, "inputs": [], "name": "decimals", "outputs": [{"name": "", "type": "uint8"}], "type": "function"}]
        decimals_contract = self.w3.eth.contract(address=contract_address, abi=decimals_abi)
        decimals = decimals_contract.functions.decimals().call()
        
        # Convert amount to wei
        amount_wei = int(amount * Decimal(10 ** decimals))
        
        # ERC-20 transfer function ABI
        transfer_abi = [
            {"constant": False, "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}], "name": "transfer", "outputs": [{"name": "", "type": "bool"}], "type": "function"}
        ]
        
        contract = self.w3.eth.contract(address=contract_address, abi=transfer_abi)
        
        # Build transaction
        nonce = self.w3.eth.get_transaction_count(from_address)
        gas_price = self.w3.eth.gas_price
        
        transaction = contract.functions.transfer(to_address, amount_wei).build_transaction({
            'from': from_address,
            'gas': 100000,  # Standard gas limit for ERC-20 transfer
            'gasPrice': gas_price,
            'nonce': nonce,
        })
        
        # Sign transaction
        signed_txn = self.w3.eth.account.sign_transaction(transaction, private_key)
        
        # Send transaction
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        return tx_hash.hex()
    
    async def get_transaction_status(self, tx_hash: str) -> Dict:
        """Get transaction status and details"""
        try:
            tx = self.w3.eth.get_transaction(tx_hash)
            receipt = self.w3.eth.get_transaction_receipt(tx_hash)
            
            return {
                "tx_hash": tx_hash,
                "status": "confirmed" if receipt.status == 1 else "failed",
                "block_number": receipt.blockNumber,
                "gas_used": receipt.gasUsed,
                "from": tx.get("from"),
                "to": tx.get("to"),
                "value": tx.get("value"),
                "gas_price": tx.get("gasPrice")
            }
        except Exception as e:
            return {
                "tx_hash": tx_hash,
                "status": "pending",
                "error": str(e)
            }
    
    async def get_token_contract_address(self, token: TokenType) -> str:
        """Get token contract address"""
        return settings.supported_tokens["ethereum"][token.value]
    
    async def estimate_gas(self, from_address: str, to_address: str, amount: Decimal, token: TokenType) -> int:
        """Estimate gas cost for transaction"""
        if token == TokenType.USDC:
            contract_address = settings.supported_tokens["ethereum"]["USDC"]
        elif token == TokenType.USDT:
            contract_address = settings.supported_tokens["ethereum"]["USDT"]
        elif token == TokenType.DAI:
            contract_address = settings.supported_tokens["ethereum"]["DAI"]
        else:
            raise ValueError(f"Unsupported token: {token}")
        
        # Get token decimals
        decimals_abi = [{"constant": True, "inputs": [], "name": "decimals", "outputs": [{"name": "", "type": "uint8"}], "type": "function"}]
        decimals_contract = self.w3.eth.contract(address=contract_address, abi=decimals_abi)
        decimals = decimals_contract.functions.decimals().call()
        
        # Convert amount to wei
        amount_wei = int(amount * Decimal(10 ** decimals))
        
        # ERC-20 transfer function ABI
        transfer_abi = [
            {"constant": False, "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}], "name": "transfer", "outputs": [{"name": "", "type": "bool"}], "type": "function"}
        ]
        
        contract = self.w3.eth.contract(address=contract_address, abi=transfer_abi)
        
        try:
            gas_estimate = contract.functions.transfer(to_address, amount_wei).estimate_gas({'from': from_address})
            return gas_estimate
        except Exception:
            return 100000  # Default gas limit
    
    async def get_latest_block_number(self) -> int:
        """Get latest block number"""
        return self.w3.eth.block_number
    
    async def get_transaction_receipt(self, tx_hash: str) -> Optional[Dict]:
        """Get transaction receipt"""
        try:
            receipt = self.w3.eth.get_transaction_receipt(tx_hash)
            return dict(receipt)
        except Exception:
            return None
