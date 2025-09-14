from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, timedelta

from app.models import TransactionResponse, ChainType, TokenType, TransactionStatus
from app.core.security import get_current_merchant
from app.database import get_supabase
from app.blockchain.manager import blockchain_manager

router = APIRouter()

@router.get("/", response_model=List[TransactionResponse])
async def list_transactions(
    current_merchant: dict = Depends(get_current_merchant),
    chain: Optional[ChainType] = Query(None),
    token: Optional[TokenType] = Query(None),
    status: Optional[TransactionStatus] = Query(None),
    tx_hash: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0)
):
    """List transactions with optional filters"""
    supabase = get_supabase()
    
    # Build query with joins to get merchant's transactions
    query = supabase.table("transactions").select("""
        *,
        payment_requests!inner(merchant_id)
    """).eq("payment_requests.merchant_id", current_merchant["id"])
    
    if chain:
        query = query.eq("chain", chain.value)
    if token:
        query = query.eq("token", token.value)
    if status:
        query = query.eq("status", status.value)
    if tx_hash:
        query = query.eq("tx_hash", tx_hash)
    
    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    
    result = query.execute()
    
    return [TransactionResponse(**tx) for tx in result.data]

@router.get("/{tx_hash}", response_model=TransactionResponse)
async def get_transaction(
    tx_hash: str,
    current_merchant: dict = Depends(get_current_merchant)
):
    """Get transaction details by hash"""
    supabase = get_supabase()
    
    result = supabase.table("transactions").select("""
        *,
        payment_requests!inner(merchant_id)
    """).eq("tx_hash", tx_hash).eq("payment_requests.merchant_id", current_merchant["id"]).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    tx = result.data[0]
    return TransactionResponse(**tx)

@router.post("/{tx_hash}/refresh")
async def refresh_transaction_status(
    tx_hash: str,
    current_merchant: dict = Depends(get_current_merchant)
):
    """Refresh transaction status from blockchain"""
    supabase = get_supabase()
    
    # Get transaction details
    tx_result = supabase.table("transactions").select("""
        *,
        payment_requests!inner(merchant_id)
    """).eq("tx_hash", tx_hash).eq("payment_requests.merchant_id", current_merchant["id"]).execute()
    
    if not tx_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    tx = tx_result.data[0]
    
    try:
        # Get updated status from blockchain
        chain = ChainType(tx["chain"])
        tx_status = await blockchain_manager.get_transaction_status(chain, tx_hash)
        
        # Update transaction record
        update_data = {
            "status": tx_status["status"],
            "block_number": tx_status.get("block_number"),
            "gas_used": tx_status.get("gas_used"),
            "gas_price": tx_status.get("gas_price")
        }
        
        if tx_status["status"] == "confirmed":
            update_data["confirmation_count"] = 1  # In production, calculate actual confirmations
        
        result = supabase.table("transactions").update(update_data).eq("id", tx["id"]).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update transaction status"
            )
        
        return {
            "tx_hash": tx_hash,
            "status": tx_status["status"],
            "message": "Transaction status updated successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to refresh transaction status: {str(e)}"
        )

@router.get("/stats/summary")
async def get_transaction_stats(
    current_merchant: dict = Depends(get_current_merchant),
    days: int = Query(30, ge=1, le=365)
):
    """Get transaction statistics summary"""
    supabase = get_supabase()
    
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get transaction counts by status
    status_query = supabase.table("transactions").select("status").select("count", count="exact").eq("payment_requests.merchant_id", current_merchant["id"]).gte("created_at", start_date.isoformat())
    
    # Get total volume by token
    volume_query = supabase.table("transactions").select("token, amount").eq("payment_requests.merchant_id", current_merchant["id"]).eq("status", "confirmed").gte("created_at", start_date.isoformat())
    
    # Get transactions by chain
    chain_query = supabase.table("transactions").select("chain").select("count", count="exact").eq("payment_requests.merchant_id", current_merchant["id"]).gte("created_at", start_date.isoformat())
    
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
            "total_transactions": sum(status_counts.values()),
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
            detail=f"Failed to get transaction stats: {str(e)}"
        )

@router.get("/pending/check")
async def check_pending_transactions(
    current_merchant: dict = Depends(get_current_merchant)
):
    """Check and update status of pending transactions"""
    supabase = get_supabase()
    
    # Get all pending transactions for this merchant
    pending_txs = supabase.table("transactions").select("""
        *,
        payment_requests!inner(merchant_id)
    """).eq("payment_requests.merchant_id", current_merchant["id"]).eq("status", "pending").execute()
    
    updated_count = 0
    
    for tx in pending_txs.data:
        try:
            # Get updated status from blockchain
            chain = ChainType(tx["chain"])
            tx_status = await blockchain_manager.get_transaction_status(chain, tx["tx_hash"])
            
            if tx_status["status"] != "pending":
                # Update transaction status
                update_data = {
                    "status": tx_status["status"],
                    "block_number": tx_status.get("block_number"),
                    "gas_used": tx_status.get("gas_used"),
                    "gas_price": tx_status.get("gas_price")
                }
                
                if tx_status["status"] == "confirmed":
                    update_data["confirmation_count"] = 1
                
                supabase.table("transactions").update(update_data).eq("id", tx["id"]).execute()
                updated_count += 1
                
        except Exception:
            # Skip transactions that can't be updated
            continue
    
    return {
        "message": f"Checked {len(pending_txs.data)} pending transactions",
        "updated": updated_count
    }
