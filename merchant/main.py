from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from app.database import init_supabase
from app.routers import auth, merchants, payments, wallets, transactions, webhooks, payouts
from app.core.config import settings

# Load environment variables
load_dotenv()

# Initialize Supabase
supabase_client = init_supabase()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting Stablecoin Merchant Payment Rails API")
    yield
    # Shutdown
    print("🛑 Shutting down API")

app = FastAPI(
    title="Stablecoin Merchant Payment Rails API",
    description="Multi-chain stablecoin payment processing API supporting Ethereum, Polygon, BSC, Avalanche, Tron, and Solana",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(merchants.router, prefix="/api/v1/merchants", tags=["Merchants"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
app.include_router(wallets.router, prefix="/api/v1/wallets", tags=["Wallets"])
app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["Transactions"])
app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["Webhooks"])
app.include_router(payouts.router, prefix="/api/v1/payouts", tags=["Payouts"])

@app.get("/")
async def root():
    return {
        "message": "Stablecoin Merchant Payment Rails API",
        "version": "1.0.0",
        "supported_chains": ["ethereum", "polygon", "bsc", "avalanche", "tron", "solana"],
        "supported_tokens": ["USDC", "USDT", "DAI", "BUSD", "FRAX"]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
