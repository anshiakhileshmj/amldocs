# 🌐 Stablecoin Merchant Payment Rails API

A comprehensive multi-chain stablecoin payment processing API that supports Ethereum, Polygon, BSC, Avalanche, Tron, and Solana blockchains. Built with FastAPI and Supabase backend.

## 🚀 Features

### Multi-Chain Support
- **Ethereum** (ERC-20): USDC, USDT, DAI
- **Polygon** (ERC-20): USDC, USDT, DAI  
- **Binance Smart Chain** (BEP-20): USDC, USDT, BUSD
- **Avalanche C-Chain** (ERC-20): USDC, USDT, DAI
- **Tron** (TRC-20): USDC, USDT
- **Solana** (SPL): USDC, USDT

### Core Functionality
- ✅ **Merchant Management**: Registration, API key management, profile management
- ✅ **Wallet Management**: Multi-chain wallet creation and management
- ✅ **Payment Processing**: Create, monitor, and verify payments
- ✅ **Transaction Monitoring**: Real-time blockchain transaction tracking
- ✅ **Settlement & Payouts**: Cross-chain payout processing
- ✅ **Webhook System**: Real-time notifications for all events
- ✅ **Balance Management**: Multi-chain balance tracking
- ✅ **Security**: JWT authentication, API key management, webhook signatures

## 🛠️ Installation

### Prerequisites
- Python 3.8+
- Supabase account
- Redis (for background tasks)
- Node.js (for Solana integration)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd merchant
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Environment Configuration**
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# JWT Configuration
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Blockchain RPC URLs
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_project_id
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/your_project_id
BSC_RPC_URL=https://bsc-dataseed.binance.org
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
TRON_RPC_URL=https://api.trongrid.io
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Webhook Configuration
WEBHOOK_BASE_URL=https://your-domain.com/webhooks
WEBHOOK_SECRET=your_webhook_secret
```

4. **Database Setup**
Run the SQL schema in your Supabase SQL editor:
```sql
-- Copy the contents of app/database.py DATABASE_SCHEMA
```

5. **Start the API**
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

### Base URL
```
https://your-domain.com/api/v1
```

### Authentication
All endpoints (except registration and login) require authentication via:
- **JWT Token**: Include in `Authorization: Bearer <token>` header
- **API Key**: Include in `X-API-Key: <api_key>` header

### Core Endpoints

#### Authentication
- `POST /auth/register` - Register new merchant
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current merchant info
- `POST /auth/refresh-api-key` - Generate new API key

#### Payment Processing
- `POST /payments/create` - Create payment request
- `GET /payments/{payment_id}` - Get payment details
- `GET /payments/` - List payments with filters
- `POST /payments/{payment_id}/verify` - Verify payment transaction
- `POST /payments/{payment_id}/refund` - Refund payment

#### Wallet Management
- `POST /wallets/create` - Create new wallet
- `GET /wallets/` - List merchant wallets
- `GET /wallets/{wallet_id}/balance` - Get wallet balance
- `GET /wallets/balances/all` - Get all balances

#### Transaction Monitoring
- `GET /transactions/` - List transactions
- `GET /transactions/{tx_hash}` - Get transaction details
- `POST /transactions/{tx_hash}/refresh` - Refresh transaction status

#### Payouts & Settlement
- `POST /payouts/create` - Create payout request
- `POST /payouts/{payout_id}/execute` - Execute payout
- `GET /payouts/` - List payouts
- `POST /payouts/batch` - Create batch payouts

#### Webhooks
- `POST /webhooks/test` - Test webhook configuration
- `GET /webhooks/logs` - Get webhook delivery logs
- `POST /webhooks/retry/{log_id}` - Retry failed webhook

## 🔧 Usage Examples

### 1. Register a Merchant
```bash
curl -X POST "https://your-domain.com/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "merchant@example.com",
    "company_name": "My Store",
    "webhook_url": "https://my-store.com/webhooks"
  }'
```

### 2. Create a Payment Request
```bash
curl -X POST "https://your-domain.com/api/v1/payments/create" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "chain": "ethereum",
    "token": "USDC",
    "amount": "100.00",
    "recipient_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "expires_at": "2024-12-31T23:59:59Z"
  }'
```

### 3. Create a Wallet
```bash
curl -X POST "https://your-domain.com/api/v1/wallets/create" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "chain": "polygon"
  }'
```

### 4. Execute a Payout
```bash
curl -X POST "https://your-domain.com/api/v1/payouts/create" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "chain": "ethereum",
    "token": "USDC",
    "amount": "50.00",
    "recipient_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
  }'
```

## 🔔 Webhook Events

The API sends webhooks for the following events:

- `payment.created` - New payment request created
- `payment.completed` - Payment successfully completed
- `payment.failed` - Payment failed
- `payment.expired` - Payment request expired
- `payment.refunded` - Payment refunded
- `transaction.confirmed` - Transaction confirmed on blockchain
- `transaction.failed` - Transaction failed on blockchain
- `payout.created` - Payout created
- `payout.completed` - Payout completed
- `payout.failed` - Payout failed
- `wallet.created` - New wallet created

### Webhook Payload Example
```json
{
  "event_type": "payment.completed",
  "merchant_id": "merchant-uuid",
  "data": {
    "payment_id": "pay_abc123",
    "amount": "100.00",
    "token": "USDC",
    "chain": "ethereum",
    "tx_hash": "0x123...",
    "recipient_address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **API Key Management**: Rotatable API keys for merchant access
- **Webhook Signatures**: HMAC-SHA256 signature verification
- **Rate Limiting**: Built-in rate limiting (configurable)
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses without sensitive data

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables
Ensure all required environment variables are set in your deployment environment.

### Database Migration
Run the database schema in your Supabase instance before deploying.

## 📊 Monitoring & Analytics

The API provides comprehensive analytics:
- Transaction volume by chain and token
- Payment success rates
- Payout statistics
- Webhook delivery logs
- Merchant activity metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/docs`
- Review the webhook logs for debugging

## 🔮 Roadmap

- [ ] Additional blockchain support (Arbitrum, Optimism, etc.)
- [ ] Advanced analytics dashboard
- [ ] Mobile SDKs
- [ ] Multi-signature wallet support
- [ ] Cross-chain bridge integration
- [ ] Advanced fraud detection
- [ ] Compliance tools (KYC/AML)

---

**Built with ❤️ for the decentralized future**
