# 📖 Stablecoin Merchant Payment Rails API Documentation

## Overview

The Stablecoin Merchant Payment Rails API is a comprehensive multi-chain payment processing system that enables merchants to accept and process stablecoin payments across 6 major blockchains: Ethereum, Polygon, BSC, Avalanche, Tron, and Solana.

## Base URL
```
https://your-domain.com/api/v1
```

## Authentication

The API supports two authentication methods:

### 1. JWT Token Authentication
Include the JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### 2. API Key Authentication
Include the API key in the X-API-Key header:
```
X-API-Key: <api_key>
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "data": { ... },
  "message": "Success message",
  "status": "success"
}
```

### Error Response
```json
{
  "error": "Error type",
  "message": "Error description",
  "details": { ... }
}
```

## Rate Limiting

- **Default**: 1000 requests per hour per API key
- **Headers**: Rate limit information is included in response headers
- **Exceeded**: Returns 429 Too Many Requests

---

## 🔐 Authentication Endpoints

### Register Merchant
**POST** `/auth/register`

Register a new merchant account.

**Request Body:**
```json
{
  "email": "merchant@example.com",
  "company_name": "My Store",
  "webhook_url": "https://my-store.com/webhooks"
}
```

**Response:**
```json
{
  "id": "merchant-uuid",
  "email": "merchant@example.com",
  "company_name": "My Store",
  "api_key": "api_key_here",
  "webhook_url": "https://my-store.com/webhooks",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Login Merchant
**POST** `/auth/login`

Login and receive JWT token.

**Request Body:**
```json
{
  "email": "merchant@example.com",
  "api_key": "api_key_here"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

### Get Current Merchant
**GET** `/auth/me`

Get current merchant information.

**Headers:** `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "id": "merchant-uuid",
  "email": "merchant@example.com",
  "company_name": "My Store",
  "api_key": "api_key_here",
  "webhook_url": "https://my-store.com/webhooks",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## 💳 Payment Processing Endpoints

### Create Payment Request
**POST** `/payments/create`

Create a new payment request.

**Headers:** `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "chain": "ethereum",
  "token": "USDC",
  "amount": "100.00",
  "recipient_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "expires_at": "2024-12-31T23:59:59Z",
  "metadata": {
    "order_id": "order_123",
    "customer_email": "customer@example.com"
  }
}
```

**Response:**
```json
{
  "id": "payment-uuid",
  "payment_id": "pay_abc123",
  "merchant_id": "merchant-uuid",
  "chain": "ethereum",
  "token": "USDC",
  "amount": "100.00",
  "recipient_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "status": "pending",
  "expires_at": "2024-12-31T23:59:59Z",
  "metadata": {
    "order_id": "order_123",
    "customer_email": "customer@example.com"
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Get Payment Request
**GET** `/payments/{payment_id}`

Get payment request details.

**Headers:** `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "id": "payment-uuid",
  "payment_id": "pay_abc123",
  "merchant_id": "merchant-uuid",
  "chain": "ethereum",
  "token": "USDC",
  "amount": "100.00",
  "recipient_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "status": "completed",
  "expires_at": "2024-12-31T23:59:59Z",
  "metadata": { ... },
  "created_at": "2024-01-01T00:00:00Z"
}
```

### List Payment Requests
**GET** `/payments/`

List payment requests with optional filters.

**Headers:** `Authorization: Bearer <jwt_token>`

**Query Parameters:**
- `status` (optional): Filter by status (pending, completed, failed, expired, refunded)
- `chain` (optional): Filter by blockchain (ethereum, polygon, bsc, avalanche, tron, solana)
- `token` (optional): Filter by token (USDC, USDT, DAI, BUSD)
- `limit` (optional): Number of results (default: 50, max: 100)
- `offset` (optional): Number of results to skip (default: 0)

**Response:**
```json
[
  {
    "id": "payment-uuid",
    "payment_id": "pay_abc123",
    "merchant_id": "merchant-uuid",
    "chain": "ethereum",
    "token": "USDC",
    "amount": "100.00",
    "recipient_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "status": "completed",
    "expires_at": "2024-12-31T23:59:59Z",
    "metadata": { ... },
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Verify Payment
**POST** `/payments/{payment_id}/verify`

Verify a payment transaction.

**Headers:** `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "tx_hash": "0x1234567890abcdef..."
}
```

**Response:**
```json
{
  "message": "Payment verified successfully",
  "status": "confirmed"
}
```

### Refund Payment
**POST** `/payments/{payment_id}/refund`

Mark a payment as refunded.

**Headers:** `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "message": "Payment refunded successfully"
}
```

---

## 💰 Wallet Management Endpoints

### Create Wallet
**POST** `/wallets/create`

Create a new wallet for a specific blockchain.

**Headers:** `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "chain": "ethereum",
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
}
```

**Response:**
```json
{
  "id": "wallet-uuid",
  "merchant_id": "merchant-uuid",
  "chain": "ethereum",
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### List Wallets
**GET** `/wallets/`

List merchant wallets with optional filters.

**Headers:** `Authorization: Bearer <jwt_token>`

**Query Parameters:**
- `chain` (optional): Filter by blockchain
- `active_only` (optional): Show only active wallets (default: true)

**Response:**
```json
[
  {
    "id": "wallet-uuid",
    "merchant_id": "merchant-uuid",
    "chain": "ethereum",
    "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Get Wallet Balance
**GET** `/wallets/{wallet_id}/balance`

Get wallet balance for a specific token.

**Headers:** `Authorization: Bearer <jwt_token>`

**Query Parameters:**
- `token`: Token type (USDC, USDT, DAI, BUSD)

**Response:**
```json
{
  "chain": "ethereum",
  "token": "USDC",
  "balance": "1000.50",
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
}
```

### Get All Balances
**GET** `/wallets/balances/all`

Get all balances across all chains and tokens.

**Headers:** `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "merchant_id": "merchant-uuid",
  "balances": [
    {
      "chain": "ethereum",
      "token": "USDC",
      "balance": "1000.50",
      "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
    },
    {
      "chain": "polygon",
      "token": "USDC",
      "balance": "500.25",
      "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
    }
  ]
}
```

---

## 📊 Transaction Monitoring Endpoints

### List Transactions
**GET** `/transactions/`

List transactions with optional filters.

**Headers:** `Authorization: Bearer <jwt_token>`

**Query Parameters:**
- `chain` (optional): Filter by blockchain
- `token` (optional): Filter by token
- `status` (optional): Filter by status (pending, confirmed, failed)
- `tx_hash` (optional): Filter by transaction hash
- `limit` (optional): Number of results (default: 50, max: 100)
- `offset` (optional): Number of results to skip (default: 0)

**Response:**
```json
[
  {
    "id": "tx-uuid",
    "payment_request_id": "payment-uuid",
    "tx_hash": "0x1234567890abcdef...",
    "chain": "ethereum",
    "token": "USDC",
    "amount": "100.00",
    "from_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "to_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "block_number": 12345678,
    "confirmation_count": 12,
    "status": "confirmed",
    "gas_used": 21000,
    "gas_price": 20000000000,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Get Transaction Details
**GET** `/transactions/{tx_hash}`

Get transaction details by hash.

**Headers:** `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "id": "tx-uuid",
  "payment_request_id": "payment-uuid",
  "tx_hash": "0x1234567890abcdef...",
  "chain": "ethereum",
  "token": "USDC",
  "amount": "100.00",
  "from_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "to_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "block_number": 12345678,
  "confirmation_count": 12,
  "status": "confirmed",
  "gas_used": 21000,
  "gas_price": 20000000000,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Refresh Transaction Status
**POST** `/transactions/{tx_hash}/refresh`

Refresh transaction status from blockchain.

**Headers:** `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "tx_hash": "0x1234567890abcdef...",
  "status": "confirmed",
  "message": "Transaction status updated successfully"
}
```

---

## 💸 Payout Endpoints

### Create Payout
**POST** `/payouts/create`

Create a new payout request.

**Headers:** `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "chain": "ethereum",
  "token": "USDC",
  "amount": "50.00",
  "recipient_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
}
```

**Response:**
```json
{
  "id": "payout-uuid",
  "payout_id": "payout_abc123",
  "merchant_id": "merchant-uuid",
  "chain": "ethereum",
  "token": "USDC",
  "amount": "50.00",
  "recipient_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "status": "pending",
  "tx_hash": null,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Execute Payout
**POST** `/payouts/{payout_id}/execute`

Execute a payout transaction.

**Headers:** `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "payout_id": "payout_abc123",
  "tx_hash": "0x1234567890abcdef...",
  "status": "completed",
  "message": "Payout executed successfully"
}
```

### List Payouts
**GET** `/payouts/`

List payouts with optional filters.

**Headers:** `Authorization: Bearer <jwt_token>`

**Query Parameters:**
- `chain` (optional): Filter by blockchain
- `token` (optional): Filter by token
- `status` (optional): Filter by status (pending, completed, failed)
- `limit` (optional): Number of results (default: 50, max: 100)
- `offset` (optional): Number of results to skip (default: 0)

**Response:**
```json
[
  {
    "id": "payout-uuid",
    "payout_id": "payout_abc123",
    "merchant_id": "merchant-uuid",
    "chain": "ethereum",
    "token": "USDC",
    "amount": "50.00",
    "recipient_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "status": "completed",
    "tx_hash": "0x1234567890abcdef...",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Create Batch Payouts
**POST** `/payouts/batch`

Create multiple payouts in batch.

**Headers:** `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
[
  {
    "chain": "ethereum",
    "token": "USDC",
    "amount": "50.00",
    "recipient_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
  },
  {
    "chain": "polygon",
    "token": "USDC",
    "amount": "25.00",
    "recipient_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
  }
]
```

**Response:**
```json
{
  "message": "Batch payout processing completed. 2 payouts processed.",
  "payouts": [
    {
      "id": "payout-uuid-1",
      "payout_id": "payout_abc123",
      "merchant_id": "merchant-uuid",
      "chain": "ethereum",
      "token": "USDC",
      "amount": "50.00",
      "recipient_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      "status": "pending",
      "tx_hash": null,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## 🔔 Webhook Endpoints

### Test Webhook
**POST** `/webhooks/test`

Test webhook configuration.

**Headers:** `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "success": true,
  "message": "Test webhook sent"
}
```

### Get Webhook Logs
**GET** `/webhooks/logs`

Get webhook delivery logs.

**Headers:** `Authorization: Bearer <jwt_token>`

**Query Parameters:**
- `event_type` (optional): Filter by event type
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Number of results to skip (default: 0)

**Response:**
```json
[
  {
    "id": "log-uuid",
    "merchant_id": "merchant-uuid",
    "event_type": "payment.completed",
    "payload": { ... },
    "response_status": 200,
    "response_body": "OK",
    "retry_count": 0,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Retry Webhook
**POST** `/webhooks/retry/{log_id}`

Retry a failed webhook.

**Headers:** `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "success": true,
  "message": "Webhook retry completed"
}
```

### Get Supported Events
**GET** `/webhooks/events/supported`

Get list of supported webhook events.

**Response:**
```json
{
  "events": [
    {
      "name": "payment.created",
      "description": "A new payment request was created"
    },
    {
      "name": "payment.completed",
      "description": "A payment was successfully completed"
    }
  ]
}
```

---

## 📈 Statistics Endpoints

### Get Transaction Stats
**GET** `/transactions/stats/summary`

Get transaction statistics summary.

**Headers:** `Authorization: Bearer <jwt_token>`

**Query Parameters:**
- `days` (optional): Number of days to include (default: 30, max: 365)

**Response:**
```json
{
  "period_days": 30,
  "total_transactions": 150,
  "status_breakdown": {
    "confirmed": 140,
    "pending": 5,
    "failed": 5
  },
  "token_volumes": {
    "USDC": 50000.00,
    "USDT": 25000.00,
    "DAI": 10000.00
  },
  "chain_breakdown": {
    "ethereum": 100,
    "polygon": 30,
    "bsc": 20
  },
  "date_range": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}
```

### Get Payout Stats
**GET** `/payouts/stats/summary`

Get payout statistics summary.

**Headers:** `Authorization: Bearer <jwt_token>`

**Query Parameters:**
- `days` (optional): Number of days to include (default: 30, max: 365)

**Response:**
```json
{
  "period_days": 30,
  "total_payouts": 50,
  "status_breakdown": {
    "completed": 45,
    "pending": 3,
    "failed": 2
  },
  "token_volumes": {
    "USDC": 25000.00,
    "USDT": 15000.00
  },
  "chain_breakdown": {
    "ethereum": 30,
    "polygon": 20
  },
  "date_range": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}
```

---

## 🔒 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Invalid or missing authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## 📝 Supported Blockchains & Tokens

### Ethereum
- **Tokens**: USDC, USDT, DAI
- **Network**: Mainnet
- **Standard**: ERC-20

### Polygon
- **Tokens**: USDC, USDT, DAI
- **Network**: Mainnet
- **Standard**: ERC-20

### Binance Smart Chain (BSC)
- **Tokens**: USDC, USDT, BUSD
- **Network**: Mainnet
- **Standard**: BEP-20

### Avalanche C-Chain
- **Tokens**: USDC, USDT, DAI
- **Network**: Mainnet
- **Standard**: ERC-20

### Tron
- **Tokens**: USDC, USDT
- **Network**: Mainnet
- **Standard**: TRC-20

### Solana
- **Tokens**: USDC, USDT
- **Network**: Mainnet
- **Standard**: SPL

---

## 🚀 Getting Started

1. **Register** a merchant account
2. **Create wallets** for supported blockchains
3. **Create payment requests** for customers
4. **Monitor transactions** in real-time
5. **Process payouts** as needed
6. **Set up webhooks** for notifications

For more detailed examples and integration guides, visit our [GitHub repository](https://github.com/your-repo/merchant-payment-api).
