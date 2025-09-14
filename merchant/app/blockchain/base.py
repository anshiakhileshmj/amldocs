from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Tuple
from decimal import Decimal
from app.models import ChainType, TokenType

class BlockchainInterface(ABC):
    """Base interface for blockchain integrations"""
    
    def __init__(self, rpc_url: str, chain: ChainType):
        self.rpc_url = rpc_url
        self.chain = chain
    
    @abstractmethod
    async def get_balance(self, address: str, token: TokenType) -> Decimal:
        """Get token balance for an address"""
        pass
    
    @abstractmethod
    async def get_native_balance(self, address: str) -> Decimal:
        """Get native token balance (ETH, BNB, AVAX, etc.)"""
        pass
    
    @abstractmethod
    async def create_wallet(self) -> Tuple[str, str]:
        """Create new wallet and return (address, private_key)"""
        pass
    
    @abstractmethod
    async def send_transaction(self, from_address: str, to_address: str, amount: Decimal, token: TokenType, private_key: str) -> str:
        """Send transaction and return transaction hash"""
        pass
    
    @abstractmethod
    async def get_transaction_status(self, tx_hash: str) -> Dict:
        """Get transaction status and details"""
        pass
    
    @abstractmethod
    async def get_token_contract_address(self, token: TokenType) -> str:
        """Get token contract address for this chain"""
        pass
    
    @abstractmethod
    async def estimate_gas(self, from_address: str, to_address: str, amount: Decimal, token: TokenType) -> int:
        """Estimate gas cost for transaction"""
        pass
    
    @abstractmethod
    async def get_latest_block_number(self) -> int:
        """Get latest block number"""
        pass
    
    @abstractmethod
    async def get_transaction_receipt(self, tx_hash: str) -> Optional[Dict]:
        """Get transaction receipt"""
        pass
