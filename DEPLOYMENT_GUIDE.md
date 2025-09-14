# 🚀 Deployment Guide

This guide will help you deploy the Stablecoin Merchant Payment Rails API and Frontend.

## 📋 Prerequisites

- Python 3.8+ (for API)
- Node.js 18+ (for Frontend)
- Supabase account
- Render account (for API)
- Vercel account (for Frontend)
- Redis instance (for background tasks)

## 🔧 Backend API Deployment (Render)

### 1. Prepare Your Repository

1. Push your code to GitHub
2. Make sure all files are committed

### 2. Deploy to Render

1. **Create a new Web Service on Render:**
   - Connect your GitHub repository
   - Choose "Web Service"
   - Select your repository

2. **Configure Build Settings:**
   ```
   Build Command: pip install -r requirements.txt
   Start Command: python main.py
   ```

3. **Set Environment Variables:**
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   SECRET_KEY=your_secret_key_here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_project_id
   POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/your_project_id
   BSC_RPC_URL=https://bsc-dataseed.binance.org
   AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
   TRON_RPC_URL=https://api.trongrid.io
   SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   REDIS_URL=your_redis_url
   WEBHOOK_BASE_URL=https://your-api-domain.onrender.com/webhooks
   WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your API URL (e.g., `https://your-app.onrender.com`)

### 3. Set Up Database

1. **Run Database Schema:**
   - Go to your Supabase SQL Editor
   - Copy the contents of `app/database.py` DATABASE_SCHEMA
   - Execute the SQL to create all tables

2. **Verify Tables:**
   - Check that all tables are created:
     - merchants
     - merchant_wallets
     - payment_requests
     - transactions
     - payouts
     - webhook_logs

## 🎨 Frontend Deployment (Vercel)

### 1. Prepare Environment Variables

Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.onrender.com/api/v1
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_NAME=Stablecoin Merchant Portal
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 2. Deploy to Vercel

1. **Connect Repository:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project:**
   - Framework: Next.js
   - Root Directory: `./` (or wherever your frontend code is)
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Set Environment Variables:**
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.local`

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your frontend URL (e.g., `https://your-app.vercel.app`)

## 🔗 API Endpoints Summary

Your deployed API will have **35+ endpoints** across these categories:

### Authentication (5 endpoints)
- `POST /api/v1/auth/register` - Register new merchant
- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/me` - Get current merchant info
- `POST /api/v1/auth/refresh-api-key` - Generate new API key
- `POST /api/v1/auth/deactivate` - Deactivate merchant account

### Payment Processing (7 endpoints)
- `POST /api/v1/payments/create` - Create payment request
- `GET /api/v1/payments/{payment_id}` - Get payment details
- `GET /api/v1/payments/` - List payments with filters
- `PUT /api/v1/payments/{payment_id}` - Update payment request
- `POST /api/v1/payments/{payment_id}/verify` - Verify payment transaction
- `POST /api/v1/payments/{payment_id}/refund` - Refund payment
- `GET /api/v1/payments/{payment_id}/status` - Get payment status

### Wallet Management (7 endpoints)
- `POST /api/v1/wallets/create` - Create new wallet
- `GET /api/v1/wallets/` - List merchant wallets
- `GET /api/v1/wallets/{wallet_id}` - Get wallet details
- `GET /api/v1/wallets/{wallet_id}/balance` - Get wallet balance for specific token
- `GET /api/v1/wallets/{wallet_id}/balances` - Get all token balances for wallet
- `GET /api/v1/wallets/balances/all` - Get all balances across all chains
- `POST /api/v1/wallets/{wallet_id}/activate` - Activate/deactivate wallet

### Transaction Monitoring (5 endpoints)
- `GET /api/v1/transactions/` - List transactions with filters
- `GET /api/v1/transactions/{tx_hash}` - Get transaction details
- `POST /api/v1/transactions/{tx_hash}/refresh` - Refresh transaction status
- `GET /api/v1/transactions/stats/summary` - Get transaction statistics
- `GET /api/v1/transactions/pending/check` - Check pending transactions

### Payouts & Settlement (6 endpoints)
- `POST /api/v1/payouts/create` - Create payout request
- `POST /api/v1/payouts/{payout_id}/execute` - Execute payout
- `GET /api/v1/payouts/` - List payouts with filters
- `GET /api/v1/payouts/{payout_id}` - Get payout details
- `POST /api/v1/payouts/batch` - Create batch payouts
- `GET /api/v1/payouts/stats/summary` - Get payout statistics

### Webhooks (5 endpoints)
- `POST /api/v1/webhooks/test` - Test webhook configuration
- `GET /api/v1/webhooks/logs` - Get webhook delivery logs
- `POST /api/v1/webhooks/retry/{log_id}` - Retry failed webhook
- `POST /api/v1/webhooks/incoming` - Receive incoming webhooks
- `GET /api/v1/webhooks/events/supported` - Get supported webhook events

### Merchant Management (2 endpoints)
- `GET /api/v1/merchants/profile` - Get merchant profile
- `PUT /api/v1/merchants/profile` - Update merchant profile
- `GET /api/v1/merchants/stats` - Get merchant statistics

## 🧪 Testing Your Deployment

### 1. Test API Health
```bash
curl https://your-api-domain.onrender.com/health
```

### 2. Test Frontend
Visit: `https://your-frontend-domain.vercel.app`

### 3. Test Registration
```bash
curl -X POST https://your-api-domain.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "company_name": "Test Store",
    "webhook_url": "https://your-webhook-url.com"
  }'
```

### 4. Test Login
```bash
curl -X POST https://your-api-domain.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "api_key": "your_api_key_here"
  }'
```

## 🔒 Security Checklist

- [ ] Change all default secrets and keys
- [ ] Set up proper CORS policies
- [ ] Enable HTTPS for all endpoints
- [ ] Set up rate limiting
- [ ] Configure webhook signature verification
- [ ] Set up monitoring and logging
- [ ] Regular security updates

## 📊 Monitoring

### API Monitoring
- Use Render's built-in monitoring
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor error rates and response times

### Database Monitoring
- Use Supabase's built-in monitoring
- Set up alerts for high usage
- Monitor query performance

### Frontend Monitoring
- Use Vercel's built-in analytics
- Set up error tracking (Sentry)
- Monitor Core Web Vitals

## 🚀 Production Optimizations

### API Optimizations
- Enable Redis caching
- Set up CDN for static assets
- Optimize database queries
- Implement connection pooling

### Frontend Optimizations
- Enable Vercel's Edge Network
- Optimize images and assets
- Implement code splitting
- Use Next.js Image optimization

## 📞 Support

If you encounter issues during deployment:

1. Check the logs in Render/Vercel dashboards
2. Verify all environment variables are set correctly
3. Ensure database schema is properly created
4. Test API endpoints individually
5. Check network connectivity and firewall settings

## 🎉 Success!

Once deployed, you'll have:
- ✅ Multi-chain stablecoin payment API
- ✅ Modern React frontend
- ✅ Real-time transaction monitoring
- ✅ Webhook notifications
- ✅ Comprehensive analytics
- ✅ Secure API key management

Your merchants can now:
1. Register and get API keys
2. Create wallets for multiple blockchains
3. Process payments in USDC, USDT, DAI, BUSD
4. Monitor transactions in real-time
5. Process payouts across chains
6. Receive webhook notifications
7. View comprehensive analytics

**Total Endpoints Created: 35+**
**Supported Blockchains: 6 (Ethereum, Polygon, BSC, Avalanche, Tron, Solana)**
**Supported Tokens: 4 (USDC, USDT, DAI, BUSD)**
