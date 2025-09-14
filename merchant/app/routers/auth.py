from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from datetime import timedelta
import secrets

from app.models import MerchantCreate, MerchantResponse, LoginRequest, TokenResponse
from app.core.security import get_password_hash, create_access_token, verify_password, generate_api_key
from app.core.config import settings
from app.database import get_supabase

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=MerchantResponse)
async def register_merchant(merchant_data: MerchantCreate):
    """Register a new merchant"""
    supabase = get_supabase()
    
    # Check if merchant already exists
    existing = supabase.table("merchants").select("id").eq("email", merchant_data.email).execute()
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Merchant with this email already exists"
        )
    
    # Generate API key
    api_key = generate_api_key()
    
    # Create merchant
    merchant = {
        "email": merchant_data.email,
        "company_name": merchant_data.company_name,
        "api_key": api_key,
        "webhook_url": merchant_data.webhook_url,
        "is_active": True
    }
    
    result = supabase.table("merchants").insert(merchant).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create merchant"
        )
    
    created_merchant = result.data[0]
    return MerchantResponse(**created_merchant)

@router.post("/login", response_model=TokenResponse)
async def login_merchant(login_data: LoginRequest):
    """Login merchant and get access token"""
    supabase = get_supabase()
    
    # Find merchant by email and API key
    result = supabase.table("merchants").select("*").eq("email", login_data.email).eq("api_key", login_data.api_key).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or API key"
        )
    
    merchant = result.data[0]
    if not merchant.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Merchant account is inactive"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": merchant["id"]}, 
        expires_delta=access_token_expires
    )
    
    return TokenResponse(access_token=access_token, token_type="bearer")

@router.post("/refresh-api-key", response_model=MerchantResponse)
async def refresh_api_key(current_merchant: dict = Depends(security)):
    """Generate a new API key for the merchant"""
    supabase = get_supabase()
    
    # Generate new API key
    new_api_key = generate_api_key()
    
    # Update merchant with new API key
    result = supabase.table("merchants").update({"api_key": new_api_key}).eq("id", current_merchant["id"]).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to refresh API key"
        )
    
    updated_merchant = result.data[0]
    return MerchantResponse(**updated_merchant)

@router.get("/me", response_model=MerchantResponse)
async def get_current_merchant_info(current_merchant: dict = Depends(security)):
    """Get current merchant information"""
    return MerchantResponse(**current_merchant)

@router.post("/deactivate")
async def deactivate_merchant(current_merchant: dict = Depends(security)):
    """Deactivate merchant account"""
    supabase = get_supabase()
    
    result = supabase.table("merchants").update({"is_active": False}).eq("id", current_merchant["id"]).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate merchant account"
        )
    
    return {"message": "Merchant account deactivated successfully"}

@router.post("/activate")
async def activate_merchant(current_merchant: dict = Depends(security)):
    """Activate merchant account"""
    supabase = get_supabase()
    
    result = supabase.table("merchants").update({"is_active": True}).eq("id", current_merchant["id"]).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to activate merchant account"
        )
    
    return {"message": "Merchant account activated successfully"}
