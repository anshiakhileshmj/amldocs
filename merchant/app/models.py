from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime
from decimal import Decimal
from enum import Enum

class ChainType(str, Enum):
    ETHEREUM = "ethereum"
    POLYGON = "polygon"
    BSC = "bsc"
    AVALANCHE = "avalanche"
    TRON = "tron"
    SOLANA = "solana"

class TokenType(str, Enum):
    USDC = "USDC"
    USDT = "USDT"
    DAI = "DAI"
    BUSD = "BUSD"
    FRAX = "FRAX"

class TransactionStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    FAILED = "failed"
    EXPIRED = "expired"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    EXPIRED = "expired"
    REFUNDED = "refunded"

# Authentication Models
class MerchantCreate(BaseModel):
    email: EmailStr
    company_name: str
    webhook_url: Optional[str] = None

class MerchantResponse(BaseModel):
    id: str
    email: str
    company_name: str
    api_key: str
    webhook_url: Optional[str]
    is_active: bool
    created_at: datetime

class LoginRequest(BaseModel):
    email: EmailStr
    api_key: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# Wallet Models
class WalletCreate(BaseModel):
    chain: ChainType
    address: Optional[str] = None  # If not provided, will generate new wallet

class WalletResponse(BaseModel):
    id: str
    merchant_id: str
    chain: str
    address: str
    is_active: bool
    created_at: datetime

# Payment Models
class PaymentRequestCreate(BaseModel):
    chain: ChainType
    token: TokenType
    amount: Decimal
    recipient_address: str
    expires_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

class PaymentRequestResponse(BaseModel):
    id: str
    payment_id: str
    merchant_id: str
    chain: str
    token: str
    amount: Decimal
    recipient_address: str
    status: str
    expires_at: Optional[datetime]
    metadata: Optional[Dict[str, Any]]
    created_at: datetime

class PaymentRequestUpdate(BaseModel):
    status: Optional[PaymentStatus] = None
    metadata: Optional[Dict[str, Any]] = None

# Transaction Models
class TransactionResponse(BaseModel):
    id: str
    payment_request_id: str
    tx_hash: str
    chain: str
    token: str
    amount: Decimal
    from_address: str
    to_address: str
    block_number: Optional[int]
    confirmation_count: int
    status: str
    gas_used: Optional[int]
    gas_price: Optional[int]
    created_at: datetime

# Payout Models
class PayoutCreate(BaseModel):
    chain: ChainType
    token: TokenType
    amount: Decimal
    recipient_address: str

class PayoutResponse(BaseModel):
    id: str
    payout_id: str
    merchant_id: str
    chain: str
    token: str
    amount: Decimal
    recipient_address: str
    status: str
    tx_hash: Optional[str]
    created_at: datetime

# Webhook Models
class WebhookEvent(BaseModel):
    event_type: str
    merchant_id: str
    data: Dict[str, Any]
    timestamp: datetime

class WebhookLogResponse(BaseModel):
    id: str
    merchant_id: str
    event_type: str
    payload: Dict[str, Any]
    response_status: Optional[int]
    response_body: Optional[str]
    retry_count: int
    created_at: datetime

# Balance Models
class BalanceResponse(BaseModel):
    chain: str
    token: str
    balance: Decimal
    address: str

class MerchantBalancesResponse(BaseModel):
    merchant_id: str
    balances: list[BalanceResponse]

# Error Models
class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None
