from typing import Dict, Optional
from app.blockchain.ethereum import EthereumBlockchain
from app.blockchain.polygon import PolygonBlockchain
from app.blockchain.bsc import BSCBlockchain
from app.blockchain.avalanche import AvalancheBlockchain
from app.blockchain.tron import TronBlockchain
from app.blockchain.solana import SolanaBlockchain
from app.models import ChainType, TokenType
from app.core.config import settings

class BlockchainManager:
    """Manages all blockchain integrations"""
    
    def __init__(self):
        self.blockchains: Dict[ChainType, any] = {
            ChainType.ETHEREUM: EthereumBlockchain(settings.ethereum_rpc_url),
            ChainType.POLYGON: PolygonBlockchain(settings.polygon_rpc_url),
            ChainType.BSC: BSCBlockchain(settings.bsc_rpc_url),
            ChainType.AVALANCHE: AvalancheBlockchain(settings.avalanche_rpc_url),
            ChainType.TRON: TronBlockchain(settings.tron_rpc_url),
            ChainType.SOLANA: SolanaBlockchain(settings.solana_rpc_url),
        }
    
    def get_blockchain(self, chain: ChainType):
        """Get blockchain instance for a specific chain"""
        if chain not in self.blockchains:
            raise ValueError(f"Unsupported chain: {chain}")
        return self.blockchains[chain]
    
    async def get_balance(self, chain: ChainType, address: str, token: TokenType):
        """Get token balance for a specific chain"""
        blockchain = self.get_blockchain(chain)
        return await blockchain.get_balance(address, token)
    
    async def get_native_balance(self, chain: ChainType, address: str):
        """Get native token balance for a specific chain"""
        blockchain = self.get_blockchain(chain)
        return await blockchain.get_native_balance(address)
    
    async def create_wallet(self, chain: ChainType):
        """Create new wallet for a specific chain"""
        blockchain = self.get_blockchain(chain)
        return await blockchain.create_wallet()
    
    async def send_transaction(self, chain: ChainType, from_address: str, to_address: str, amount, token: TokenType, private_key: str):
        """Send transaction on a specific chain"""
        blockchain = self.get_blockchain(chain)
        return await blockchain.send_transaction(from_address, to_address, amount, token, private_key)
    
    async def get_transaction_status(self, chain: ChainType, tx_hash: str):
        """Get transaction status for a specific chain"""
        blockchain = self.get_blockchain(chain)
        return await blockchain.get_transaction_status(tx_hash)
    
    async def get_token_contract_address(self, chain: ChainType, token: TokenType):
        """Get token contract address for a specific chain"""
        blockchain = self.get_blockchain(chain)
        return await blockchain.get_token_contract_address(token)
    
    async def estimate_gas(self, chain: ChainType, from_address: str, to_address: str, amount, token: TokenType):
        """Estimate gas cost for a specific chain"""
        blockchain = self.get_blockchain(chain)
        return await blockchain.estimate_gas(from_address, to_address, amount, token)
    
    async def get_latest_block_number(self, chain: ChainType):
        """Get latest block number for a specific chain"""
        blockchain = self.get_blockchain(chain)
        return await blockchain.get_latest_block_number()
    
    async def get_transaction_receipt(self, chain: ChainType, tx_hash: str):
        """Get transaction receipt for a specific chain"""
        blockchain = self.get_blockchain(chain)
        return await blockchain.get_transaction_receipt(tx_hash)

# Global blockchain manager instance
blockchain_manager = BlockchainManager()
