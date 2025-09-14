from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.models import MerchantResponse
from app.core.security import get_current_merchant
from app.database import get_supabase

router = APIRouter()

@router.get("/profile", response_model=MerchantResponse)
async def get_merchant_profile(
    current_merchant: dict = Depends(get_current_merchant)
):
    """Get merchant profile information"""
    return MerchantResponse(**current_merchant)

@router.put("/profile", response_model=MerchantResponse)
async def update_merchant_profile(
    company_name: str = None,
    webhook_url: str = None,
    current_merchant: dict = Depends(get_current_merchant)
):
    """Update merchant profile information"""
    supabase = get_supabase()
    
    update_data = {}
    if company_name is not None:
        update_data["company_name"] = company_name
    if webhook_url is not None:
        update_data["webhook_url"] = webhook_url
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    result = supabase.table("merchants").update(update_data).eq("id", current_merchant["id"]).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update merchant profile"
        )
    
    updated_merchant = result.data[0]
    return MerchantResponse(**updated_merchant)

@router.get("/stats")
async def get_merchant_stats(
    current_merchant: dict = Depends(get_current_merchant)
):
    """Get merchant statistics"""
    supabase = get_supabase()
    
    # Get payment request counts
    payment_counts = supabase.table("payment_requests").select("status").select("count", count="exact").eq("merchant_id", current_merchant["id"]).execute()
    
    # Get transaction counts
    transaction_counts = supabase.table("transactions").select("status").select("count", count="exact").eq("payment_requests.merchant_id", current_merchant["id"]).execute()
    
    # Get payout counts
    payout_counts = supabase.table("payouts").select("status").select("count", count="exact").eq("merchant_id", current_merchant["id"]).execute()
    
    # Get wallet counts
    wallet_counts = supabase.table("merchant_wallets").select("chain").select("count", count="exact").eq("merchant_id", current_merchant["id"]).eq("is_active", True).execute()
    
    # Process results
    payment_stats = {}
    for row in payment_counts.data:
        payment_stats[row["status"]] = row["count"]
    
    transaction_stats = {}
    for row in transaction_counts.data:
        transaction_stats[row["status"]] = row["count"]
    
    payout_stats = {}
    for row in payout_counts.data:
        payout_stats[row["status"]] = row["count"]
    
    wallet_stats = {}
    for row in wallet_counts.data:
        wallet_stats[row["chain"]] = row["count"]
    
    return {
        "merchant_id": current_merchant["id"],
        "company_name": current_merchant["company_name"],
        "is_active": current_merchant["is_active"],
        "created_at": current_merchant["created_at"],
        "statistics": {
            "payments": payment_stats,
            "transactions": transaction_stats,
            "payouts": payout_stats,
            "wallets": wallet_stats
        }
    }
