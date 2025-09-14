from pydantic_settings import BaseSettings
from typing import Dict, List
import os

class Settings(BaseSettings):
    # Supabase Configuration
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_key: str = os.getenv("SUPABASE_KEY", "")
    supabase_service_key: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    
    # JWT Configuration
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Blockchain RPC URLs
    ethereum_rpc_url: str = os.getenv("ETHEREUM_RPC_URL", "")
    polygon_rpc_url: str = os.getenv("POLYGON_RPC_URL", "")
    bsc_rpc_url: str = os.getenv("BSC_RPC_URL", "")
    avalanche_rpc_url: str = os.getenv("AVALANCHE_RPC_URL", "")
    tron_rpc_url: str = os.getenv("TRON_RPC_URL", "")
    solana_rpc_url: str = os.getenv("SOLANA_RPC_URL", "")
    
    # Redis Configuration
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Webhook Configuration
    webhook_base_url: str = os.getenv("WEBHOOK_BASE_URL", "")
    webhook_secret: str = os.getenv("WEBHOOK_SECRET", "your-webhook-secret")
    
    # Supported Stablecoins
    supported_tokens: Dict[str, Dict[str, str]] = {
        "ethereum": {
            "USDC": os.getenv("USDC_ETH", "0xA0b86a33E6441b8c4C8C0e4b8b8b8b8b8b8b8b8b"),
            "USDT": os.getenv("USDT_ETH", "0xdAC17F958D2ee523a2206206994597C13D831ec7"),
            "DAI": os.getenv("DAI_ETH", "0x6B175474E89094C44Da98b954EedeAC495271d0F")
        },
        "polygon": {
            "USDC": os.getenv("USDC_POLYGON", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"),
            "USDT": os.getenv("USDT_POLYGON", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"),
            "DAI": os.getenv("DAI_POLYGON", "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063")
        },
        "bsc": {
            "USDC": os.getenv("USDC_BSC", "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"),
            "USDT": os.getenv("USDT_BSC", "0x55d398326f99059fF775485246999027B3197955"),
            "BUSD": os.getenv("BUSD_BSC", "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56")
        },
        "avalanche": {
            "USDC": os.getenv("USDC_AVALANCHE", "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"),
            "USDT": os.getenv("USDT_AVALANCHE", "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7"),
            "DAI": os.getenv("DAI_AVALANCHE", "0xd586E7F844cEa2F87f5015260BC9602C7B7C8E5")
        },
        "tron": {
            "USDC": os.getenv("USDC_TRON", "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"),
            "USDT": os.getenv("USDT_TRON", "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t")
        },
        "solana": {
            "USDC": os.getenv("USDC_SOLANA", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
            "USDT": os.getenv("USDT_SOLANA", "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB")
        }
    }
    
    # Supported chains
    supported_chains: List[str] = ["ethereum", "polygon", "bsc", "avalanche", "tron", "solana"]
    
    class Config:
        env_file = ".env"

settings = Settings()
