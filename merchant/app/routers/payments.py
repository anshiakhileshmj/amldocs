from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
from decimal import Decimal

from app.models import (
    PaymentRequestCreate, PaymentRequestResponse, PaymentRequestUpdate,
    PaymentStatus, TransactionResponse, ChainType, TokenType
)
from app.core.security import get_current_merchant
from app.database import get_supabase
from app.blockchain.manager import blockchain_manager

router = APIRouter()

@router.post("/create", response_model=PaymentRequestResponse)
async def create_payment_request(
    payment_data: PaymentRequestCreate,
    current_merchant: dict = Depends(get_current_merchant)
):
    """Create a new payment request"""
    supabase = get_supabase()
    
    # Generate unique payment ID
    payment_id = f"pay_{uuid.uuid4().hex[:16]}"
    
    # Set expiration time (default 24 hours if not provided)
    expires_at = payment_data.expires_at
    if not expires_at:
        expires_at = datetime.utcnow() + timedelta(hours=24)
    
    # Create payment request
    payment_request = {
        "merchant_id": current_merchant["id"],
        "payment_id": payment_id,
        "chain": payment_data.chain.value,
        "token": payment_data.token.value,
        "amount": str(payment_data.amount),
        "recipient_address": payment_data.recipient_address,
        "status": PaymentStatus.PENDING.value,
        "expires_at": expires_at.isoformat(),
        "metadata": payment_data.metadata or {}
    }
    
    result = supabase.table("payment_requests").insert(payment_request).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment request"
        )
    
    created_payment = result.data[0]
    return PaymentRequestResponse(**created_payment)

@router.get("/{payment_id}", response_model=PaymentRequestResponse)
async def get_payment_request(
    payment_id: str,
    current_merchant: dict = Depends(get_current_merchant)
):
    """Get payment request details"""
    supabase = get_supabase()
    
    result = supabase.table("payment_requests").select("*").eq("payment_id", payment_id).eq("merchant_id", current_merchant["id"]).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment request not found"
        )
    
    payment = result.data[0]
    return PaymentRequestResponse(**payment)

@router.get("/", response_model=List[PaymentRequestResponse])
async def list_payment_requests(
    current_merchant: dict = Depends(get_current_merchant),
    status: Optional[PaymentStatus] = Query(None),
    chain: Optional[ChainType] = Query(None),
    token: Optional[TokenType] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0)
):
    """List payment requests with optional filters"""
    supabase = get_supabase()
    
    query = supabase.table("payment_requests").select("*").eq("merchant_id", current_merchant["id"])
    
    if status:
        query = query.eq("status", status.value)
    if chain:
        query = query.eq("chain", chain.value)
    if token:
        query = query.eq("token", token.value)
    
    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    
    result = query.execute()
    
    return [PaymentRequestResponse(**payment) for payment in result.data]

@router.put("/{payment_id}", response_model=PaymentRequestResponse)
async def update_payment_request(
    payment_id: str,
    update_data: PaymentRequestUpdate,
    current_merchant: dict = Depends(get_current_merchant)
):
    """Update payment request"""
    supabase = get_supabase()
    
    # Check if payment request exists and belongs to merchant
    existing = supabase.table("payment_requests").select("id").eq("payment_id", payment_id).eq("merchant_id", current_merchant["id"]).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment request not found"
        )
    
    # Prepare update data
    update_dict = {}
    if update_data.status:
        update_dict["status"] = update_data.status.value
    if update_data.metadata is not None:
        update_dict["metadata"] = update_data.metadata
    
    # Update payment request
    result = supabase.table("payment_requests").update(update_dict).eq("payment_id", payment_id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update payment request"
        )
    
    updated_payment = result.data[0]
    return PaymentRequestResponse(**updated_payment)

@router.get("/{payment_id}/transactions", response_model=List[TransactionResponse])
async def get_payment_transactions(
    payment_id: str,
    current_merchant: dict = Depends(get_current_merchant)
):
    """Get all transactions for a payment request"""
    supabase = get_supabase()
    
    # First verify payment request belongs to merchant
    payment_result = supabase.table("payment_requests").select("id").eq("payment_id", payment_id).eq("merchant_id", current_merchant["id"]).execute()
    
    if not payment_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment request not found"
        )
    
    payment_request_id = payment_result.data[0]["id"]
    
    # Get transactions
    result = supabase.table("transactions").select("*").eq("payment_request_id", payment_request_id).order("created_at", desc=True).execute()
    
    return [TransactionResponse(**tx) for tx in result.data]

@router.post("/{payment_id}/verify")
async def verify_payment(
    payment_id: str,
    tx_hash: str,
    current_merchant: dict = Depends(get_current_merchant)
):
    """Verify a payment transaction"""
    supabase = get_supabase()
    
    # Get payment request
    payment_result = supabase.table("payment_requests").select("*").eq("payment_id", payment_id).eq("merchant_id", current_merchant["id"]).execute()
    
    if not payment_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment request not found"
        )
    
    payment = payment_result.data[0]
    
    # Get transaction status from blockchain
    try:
        chain = ChainType(payment["chain"])
        tx_status = await blockchain_manager.get_transaction_status(chain, tx_hash)
        
        if tx_status["status"] == "confirmed":
            # Update payment status
            supabase.table("payment_requests").update({"status": PaymentStatus.COMPLETED.value}).eq("id", payment["id"]).execute()
            
            # Create transaction record
            transaction_data = {
                "payment_request_id": payment["id"],
                "tx_hash": tx_hash,
                "chain": payment["chain"],
                "token": payment["token"],
                "amount": payment["amount"],
                "from_address": tx_status.get("from", ""),
                "to_address": payment["recipient_address"],
                "block_number": tx_status.get("block_number"),
                "confirmation_count": 1,
                "status": "confirmed",
                "gas_used": tx_status.get("gas_used"),
                "gas_price": tx_status.get("gas_price")
            }
            
            supabase.table("transactions").insert(transaction_data).execute()
            
            return {"message": "Payment verified successfully", "status": "confirmed"}
        else:
            return {"message": "Transaction not confirmed yet", "status": tx_status["status"]}
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify payment: {str(e)}"
        )

@router.post("/{payment_id}/refund")
async def refund_payment(
    payment_id: str,
    current_merchant: dict = Depends(get_current_merchant)
):
    """Refund a payment (mark as refunded)"""
    supabase = get_supabase()
    
    # Get payment request
    payment_result = supabase.table("payment_requests").select("*").eq("payment_id", payment_id).eq("merchant_id", current_merchant["id"]).execute()
    
    if not payment_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment request not found"
        )
    
    payment = payment_result.data[0]
    
    # Check if payment can be refunded
    if payment["status"] != PaymentStatus.COMPLETED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only completed payments can be refunded"
        )
    
    # Update payment status
    result = supabase.table("payment_requests").update({"status": PaymentStatus.REFUNDED.value}).eq("id", payment["id"]).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to refund payment"
        )
    
    return {"message": "Payment refunded successfully"}

@router.get("/{payment_id}/status")
async def get_payment_status(
    payment_id: str,
    current_merchant: dict = Depends(get_current_merchant)
):
    """Get current payment status"""
    supabase = get_supabase()
    
    result = supabase.table("payment_requests").select("status, created_at, expires_at").eq("payment_id", payment_id).eq("merchant_id", current_merchant["id"]).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment request not found"
        )
    
    payment = result.data[0]
    
    # Check if payment has expired
    if payment["status"] == PaymentStatus.PENDING.value:
        expires_at = datetime.fromisoformat(payment["expires_at"].replace('Z', '+00:00'))
        if datetime.utcnow().replace(tzinfo=expires_at.tzinfo) > expires_at:
            # Update status to expired
            supabase.table("payment_requests").update({"status": PaymentStatus.EXPIRED.value}).eq("payment_id", payment_id).execute()
            payment["status"] = PaymentStatus.EXPIRED.value
    
    return {
        "payment_id": payment_id,
        "status": payment["status"],
        "created_at": payment["created_at"],
        "expires_at": payment["expires_at"]
    }
