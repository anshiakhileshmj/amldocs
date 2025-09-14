from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from decimal import Decimal
import uuid

from app.models import (
    WalletCreate, WalletResponse, BalanceResponse, MerchantBalancesResponse,
    ChainType, TokenType
)
from app.core.security import get_current_merchant
from app.database import get_supabase
from app.blockchain.manager import blockchain_manager

router = APIRouter()

@router.post("/create", response_model=WalletResponse)
async def create_wallet(
    wallet_data: WalletCreate,
    current_merchant: dict = Depends(get_current_merchant)
):
    """Create a new wallet for a specific chain"""
    supabase = get_supabase()
    
    # Check if wallet already exists for this chain
    existing = supabase.table("merchant_wallets").select("id").eq("merchant_id", current_merchant["id"]).eq("chain", wallet_data.chain.value).execute()
    
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Wallet already exists for {wallet_data.chain.value}"
        )
    
    # Generate new wallet if address not provided
    if wallet_data.address:
        address = wallet_data.address
        private_key = None  # Non-custodial mode
    else:
        address, private_key = await blockchain_manager.create_wallet(wallet_data.chain)
    
    # Create wallet record
    wallet = {
        "merchant_id": current_merchant["id"],
        "chain": wallet_data.chain.value,
        "address": address,
        "private_key_encrypted": private_key,  # In production, encrypt this
        "is_active": True
    }
    
    result = supabase.table("merchant_wallets").insert(wallet).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create wallet"
        )
    
    created_wallet = result.data[0]
    return WalletResponse(**created_wallet)

@router.get("/", response_model=List[WalletResponse])
async def list_wallets(
    current_merchant: dict = Depends(get_current_merchant),
    chain: Optional[ChainType] = Query(None),
    active_only: bool = Query(True)
):
    """List merchant wallets with optional filters"""
    supabase = get_supabase()
    
    query = supabase.table("merchant_wallets").select("*").eq("merchant_id", current_merchant["id"])
    
    if chain:
        query = query.eq("chain", chain.value)
    if active_only:
        query = query.eq("is_active", True)
    
    query = query.order("created_at", desc=True)
    
    result = query.execute()
    
    return [WalletResponse(**wallet) for wallet in result.data]

@router.get("/{wallet_id}", response_model=WalletResponse)
async def get_wallet(
    wallet_id: str,
    current_merchant: dict = Depends(get_current_merchant)
):
    """Get wallet details"""
    supabase = get_supabase()
    
    result = supabase.table("merchant_wallets").select("*").eq("id", wallet_id).eq("merchant_id", current_merchant["id"]).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found"
        )
    
    wallet = result.data[0]
    return WalletResponse(**wallet)

@router.get("/{wallet_id}/balance", response_model=BalanceResponse)
async def get_wallet_balance(
    wallet_id: str,
    token: TokenType,
    current_merchant: dict = Depends(get_current_merchant)
):
    """Get wallet balance for a specific token"""
    supabase = get_supabase()
    
    # Get wallet details
    wallet_result = supabase.table("merchant_wallets").select("*").eq("id", wallet_id).eq("merchant_id", current_merchant["id"]).execute()
    
    if not wallet_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found"
        )
    
    wallet = wallet_result.data[0]
    
    try:
        # Get balance from blockchain
        chain = ChainType(wallet["chain"])
        balance = await blockchain_manager.get_balance(chain, wallet["address"], token)
        
        return BalanceResponse(
            chain=wallet["chain"],
            token=token.value,
            balance=balance,
            address=wallet["address"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get balance: {str(e)}"
        )

@router.get("/{wallet_id}/balances", response_model=List[BalanceResponse])
async def get_wallet_balances(
    wallet_id: str,
    current_merchant: dict = Depends(get_current_merchant)
):
    """Get wallet balances for all supported tokens on this chain"""
    supabase = get_supabase()
    
    # Get wallet details
    wallet_result = supabase.table("merchant_wallets").select("*").eq("id", wallet_id).eq("merchant_id", current_merchant["id"]).execute()
    
    if not wallet_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found"
        )
    
    wallet = wallet_result.data[0]
    chain = ChainType(wallet["chain"])
    
    # Get supported tokens for this chain
    supported_tokens = []
    if chain == ChainType.ETHEREUM:
        supported_tokens = [TokenType.USDC, TokenType.USDT, TokenType.DAI]
    elif chain == ChainType.POLYGON:
        supported_tokens = [TokenType.USDC, TokenType.USDT, TokenType.DAI]
    elif chain == ChainType.BSC:
        supported_tokens = [TokenType.USDC, TokenType.USDT, TokenType.BUSD]
    elif chain == ChainType.AVALANCHE:
        supported_tokens = [TokenType.USDC, TokenType.USDT, TokenType.DAI]
    elif chain == ChainType.TRON:
        supported_tokens = [TokenType.USDC, TokenType.USDT]
    elif chain == ChainType.SOLANA:
        supported_tokens = [TokenType.USDC, TokenType.USDT]
    
    balances = []
    for token in supported_tokens:
        try:
            balance = await blockchain_manager.get_balance(chain, wallet["address"], token)
            balances.append(BalanceResponse(
                chain=wallet["chain"],
                token=token.value,
                balance=balance,
                address=wallet["address"]
            ))
        except Exception:
            # If balance check fails, add zero balance
            balances.append(BalanceResponse(
                chain=wallet["chain"],
                token=token.value,
                balance=Decimal(0),
                address=wallet["address"]
            ))
    
    return balances

@router.get("/balances/all", response_model=MerchantBalancesResponse)
async def get_all_balances(
    current_merchant: dict = Depends(get_current_merchant)
):
    """Get all balances across all chains and tokens"""
    supabase = get_supabase()
    
    # Get all active wallets
    wallets_result = supabase.table("merchant_wallets").select("*").eq("merchant_id", current_merchant["id"]).eq("is_active", True).execute()
    
    all_balances = []
    
    for wallet in wallets_result.data:
        chain = ChainType(wallet["chain"])
        
        # Get supported tokens for this chain
        supported_tokens = []
        if chain == ChainType.ETHEREUM:
            supported_tokens = [TokenType.USDC, TokenType.USDT, TokenType.DAI]
        elif chain == ChainType.POLYGON:
            supported_tokens = [TokenType.USDC, TokenType.USDT, TokenType.DAI]
        elif chain == ChainType.BSC:
            supported_tokens = [TokenType.USDC, TokenType.USDT, TokenType.BUSD]
        elif chain == ChainType.AVALANCHE:
            supported_tokens = [TokenType.USDC, TokenType.USDT, TokenType.DAI]
        elif chain == ChainType.TRON:
            supported_tokens = [TokenType.USDC, TokenType.USDT]
        elif chain == ChainType.SOLANA:
            supported_tokens = [TokenType.USDC, TokenType.USDT]
        
        for token in supported_tokens:
            try:
                balance = await blockchain_manager.get_balance(chain, wallet["address"], token)
                all_balances.append(BalanceResponse(
                    chain=wallet["chain"],
                    token=token.value,
                    balance=balance,
                    address=wallet["address"]
                ))
            except Exception:
                # If balance check fails, add zero balance
                all_balances.append(BalanceResponse(
                    chain=wallet["chain"],
                    token=token.value,
                    balance=Decimal(0),
                    address=wallet["address"]
                ))
    
    return MerchantBalancesResponse(
        merchant_id=current_merchant["id"],
        balances=all_balances
    )

@router.post("/{wallet_id}/deactivate")
async def deactivate_wallet(
    wallet_id: str,
    current_merchant: dict = Depends(get_current_merchant)
):
    """Deactivate a wallet"""
    supabase = get_supabase()
    
    # Check if wallet exists and belongs to merchant
    existing = supabase.table("merchant_wallets").select("id").eq("id", wallet_id).eq("merchant_id", current_merchant["id"]).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found"
        )
    
    # Deactivate wallet
    result = supabase.table("merchant_wallets").update({"is_active": False}).eq("id", wallet_id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate wallet"
        )
    
    return {"message": "Wallet deactivated successfully"}

@router.post("/{wallet_id}/activate")
async def activate_wallet(
    wallet_id: str,
    current_merchant: dict = Depends(get_current_merchant)
):
    """Activate a wallet"""
    supabase = get_supabase()
    
    # Check if wallet exists and belongs to merchant
    existing = supabase.table("merchant_wallets").select("id").eq("id", wallet_id).eq("merchant_id", current_merchant["id"]).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found"
        )
    
    # Activate wallet
    result = supabase.table("merchant_wallets").update({"is_active": True}).eq("id", wallet_id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to activate wallet"
        )
    
    return {"message": "Wallet activated successfully"}
