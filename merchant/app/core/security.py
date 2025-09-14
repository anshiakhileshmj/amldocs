from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import secrets
import string
import hashlib

from app.core.config import settings
from app.database import get_supabase

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token scheme
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def generate_api_key() -> str:
    """Generate a secure API key"""
    # Generate 32 random bytes and encode as hex
    return secrets.token_hex(32)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def verify_token(token: str) -> dict:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_merchant(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current merchant from JWT token"""
    token = credentials.credentials
    payload = verify_token(token)
    
    merchant_id = payload.get("sub")
    if merchant_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get merchant from database
    supabase = get_supabase()
    result = supabase.table("merchants").select("*").eq("id", merchant_id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Merchant not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    merchant = result.data[0]
    if not merchant.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Merchant account is inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return merchant

async def verify_api_key(api_key: str) -> dict:
    """Verify API key and return merchant data"""
    supabase = get_supabase()
    result = supabase.table("merchants").select("*").eq("api_key", api_key).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    merchant = result.data[0]
    if not merchant.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Merchant account is inactive"
        )
    
    return merchant

def hash_webhook_payload(payload: str, secret: str) -> str:
    """Create HMAC-SHA256 hash for webhook signature verification"""
    return hashlib.sha256(f"{payload}{secret}".encode()).hexdigest()

def verify_webhook_signature(payload: str, signature: str, secret: str) -> bool:
    """Verify webhook signature"""
    expected_signature = hash_webhook_payload(payload, secret)
    return secrets.compare_digest(signature, expected_signature)
