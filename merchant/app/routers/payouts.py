from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from decimal import Decimal
import uuid

from app.models import PayoutCreate, PayoutResponse, ChainType, TokenType
from app.core.security import get_current_merchant
from app.database import get_supabase
from app.blockchain.manager import blockchain_manager
from app.routers.webhooks import send_webhook

router = APIRouter()

@router.post("/create", response_model=PayoutResponse)
async def create_payout(
    payout_data: PayoutCreate,
    current_merchant: dict = Depends(get_current_merchant)
):
    """Create a new payout request"""
    supabase = get_supabase()
    
    # Check if merchant has sufficient balance
    merchant_wallets = supabase.table("merchant_wallets").select("*").eq("merchant_id", current_merchant["id"]).eq("chain", payout_data.chain.value).eq("is_active", True).execute()
    
    if not merchant_wallets.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No active wallet found for {payout_data.chain.value}"
        )
    
    wallet = merchant_wallets.data[0]
    
    # Check balance
    try:
        balance = await blockchain_manager.get_balance(payout_data.chain, wallet["address"], payout_data.token)
        if balance < payout_data.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient balance. Available: {balance}, Required: {payout_data.amount}"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check balance: {str(e)}"
        )
    
    # Generate unique payout ID
    payout_id = f"payout_{uuid.uuid4().hex[:16]}"
    
    # Create payout record
    payout = {
        "merchant_id": current_merchant["id"],
        "payout_id": payout_id,
        "chain": payout_data.chain.value,
        "token": payout_data.token.value,
        "amount": str(payout_data.amount),
        "recipient_address": payout_data.recipient_address,
        "status": "pending"
    }
    
    result = supabase.table("payouts").insert(payout).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payout"
        )
    
    created_payout = result.data[0]
    
    # Send webhook notification
    await send_webhook(
        current_merchant["id"],
        "payout.created",
        {
            "payout_id": payout_id,
            "chain": payout_data.chain.value,
            "token": payout_data.token.value,
            "amount": str(payout_data.amount),
            "recipient_address": payout_data.recipient_address
        }
    )
    
    return PayoutResponse(**created_payout)

@router.post("/{payout_id}/execute")
async def execute_payout(
    payout_id: str,
    current_merchant: dict = Depends(get_current_merchant)
):
    """Execute a payout transaction"""
    supabase = get_supabase()
    
    # Get payout details
    payout_result = supabase.table("payouts").select("*").eq("payout_id", payout_id).eq("merchant_id", current_merchant["id"]).execute()
    
    if not payout_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payout not found"
        )
    
    payout = payout_result.data[0]
    
    if payout["status"] != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payout is not in pending status"
        )
    
    # Get merchant wallet
    wallet_result = supabase.table("merchant_wallets").select("*").eq("merchant_id", current_merchant["id"]).eq("chain", payout["chain"]).eq("is_active", True).execute()
    
    if not wallet_result.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active wallet found for this chain"
        )
    
    wallet = wallet_result.data[0]
    
    if not wallet.get("private_key_encrypted"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wallet private key not available (non-custodial mode)"
        )
    
    try:
        # Execute payout transaction
        chain = ChainType(payout["chain"])
        token = TokenType(payout["token"])
        amount = Decimal(payout["amount"])
        
        tx_hash = await blockchain_manager.send_transaction(
            chain=chain,
            from_address=wallet["address"],
            to_address=payout["recipient_address"],
            amount=amount,
            token=token,
            private_key=wallet["private_key_encrypted"]
        )
        
        # Update payout status
        supabase.table("payouts").update({
            "status": "completed",
            "tx_hash": tx_hash
        }).eq("id", payout["id"]).execute()
        
        # Send webhook notification
        await send_webhook(
            current_merchant["id"],
            "payout.completed",
            {
                "payout_id": payout_id,
                "tx_hash": tx_hash,
                "chain": payout["chain"],
                "token": payout["token"],
                "amount": payout["amount"],
                "recipient_address": payout["recipient_address"]
            }
        )
        
        return {
            "payout_id": payout_id,
            "tx_hash": tx_hash,
            "status": "completed",
            "message": "Payout executed successfully"
        }
        
    except Exception as e:
        # Update payout status to failed
        supabase.table("payouts").update({
            "status": "failed"
        }).eq("id", payout["id"]).execute()
        
        # Send webhook notification
        await send_webhook(
            current_merchant["id"],
            "payout.failed",
            {
                "payout_id": payout_id,
                "chain": payout["chain"],
                "token": payout["token"],
                "amount": payout["amount"],
                "recipient_address": payout["recipient_address"],
                "error": str(e)
            }
        )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute payout: {str(e)}"
        )

@router.get("/", response_model=List[PayoutResponse])
async def list_payouts(
    current_merchant: dict = Depends(get_current_merchant),
    chain: Optional[ChainType] = Query(None),
    token: Optional[TokenType] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0)
):
    """List payouts with optional filters"""
    supabase = get_supabase()
    
    query = supabase.table("payouts").select("*").eq("merchant_id", current_merchant["id"])
    
    if chain:
        query = query.eq("chain", chain.value)
    if token:
        query = query.eq("token", token.value)
    if status:
        query = query.eq("status", status)
    
    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    
    result = query.execute()
    
    return [PayoutResponse(**payout) for payout in result.data]

@router.get("/{payout_id}", response_model=PayoutResponse)
async def get_payout(
    payout_id: str,
    current_merchant: dict = Depends(get_current_merchant)
):
    """Get payout details"""
    supabase = get_supabase()
    
    result = supabase.table("payouts").select("*").eq("payout_id", payout_id).eq("merchant_id", current_merchant["id"]).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payout not found"
        )
    
    payout = result.data[0]
    return PayoutResponse(**payout)

@router.post("/batch")
async def create_batch_payout(
    payouts: List[PayoutCreate],
    current_merchant: dict = Depends(get_current_merchant)
):
    """Create multiple payouts in batch"""
    if len(payouts) > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 100 payouts allowed per batch"
        )
    
    created_payouts = []
    
    for payout_data in payouts:
        try:
            # Create individual payout
            payout_response = await create_payout(payout_data, current_merchant)
            created_payouts.append(payout_response)
        except Exception as e:
            # Log error but continue with other payouts
            created_payouts.append({
                "error": str(e),
                "payout_data": payout_data.dict()
            })
    
    return {
        "message": f"Batch payout processing completed. {len(created_payouts)} payouts processed.",
        "payouts": created_payouts
    }

@router.get("/stats/summary")
async def get_payout_stats(
    current_merchant: dict = Depends(get_current_merchant),
    days: int = Query(30, ge=1, le=365)
):
    """Get payout statistics summary"""
    supabase = get_supabase()
    
    from datetime import datetime, timedelta
    
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get payout counts by status
    status_query = supabase.table("payouts").select("status").select("count", count="exact").eq("merchant_id", current_merchant["id"]).gte("created_at", start_date.isoformat())
    
    # Get total volume by token
    volume_query = supabase.table("payouts").select("token, amount").eq("merchant_id", current_merchant["id"]).eq("status", "completed").gte("created_at", start_date.isoformat())
    
    # Get payouts by chain
    chain_query = supabase.table("payouts").select("chain").select("count", count="exact").eq("merchant_id", current_merchant["id"]).gte("created_at", start_date.isoformat())
    
    try:
        # Execute queries
        status_result = status_query.execute()
        volume_result = volume_query.execute()
        chain_result = chain_query.execute()
        
        # Process results
        status_counts = {}
        for row in status_result.data:
            status_counts[row["status"]] = row["count"]
        
        token_volumes = {}
        for row in volume_result.data:
            token = row["token"]
            amount = float(row["amount"])
            if token not in token_volumes:
                token_volumes[token] = 0
            token_volumes[token] += amount
        
        chain_counts = {}
        for row in chain_result.data:
            chain_counts[row["chain"]] = row["count"]
        
        return {
            "period_days": days,
            "total_payouts": sum(status_counts.values()),
            "status_breakdown": status_counts,
            "token_volumes": token_volumes,
            "chain_breakdown": chain_counts,
            "date_range": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get payout stats: {str(e)}"
        )
