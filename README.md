# 🌐 Stablecoin Merchant Payment Rails - Frontend

A modern React.js frontend for the Stablecoin Merchant Payment Rails API, built with Vite, TypeScript, and Tailwind CSS.

## 🚀 Features

### Modern React Stack
- ✅ **React 18** - Latest React with hooks and concurrent features
- ✅ **TypeScript** - Full type safety and better developer experience
- ✅ **Vite** - Lightning-fast build tool and dev server
- ✅ **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- ✅ **React Router** - Client-side routing for SPA navigation
- ✅ **Lucide React** - Beautiful, customizable icons

### Frontend Features
- ✅ **Authentication System** - Login/signup with API key management
- ✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ✅ **Dashboard** - Overview of payments, wallets, and statistics
- ✅ **Payment Management** - Create and monitor payment requests
- ✅ **Wallet Management** - Multi-chain wallet creation and monitoring
- ✅ **Transaction Monitoring** - Real-time transaction status updates
- ✅ **Payout Processing** - Send payments to recipients
- ✅ **Webhook Management** - Configure and monitor webhook notifications
- ✅ **Profile Management** - Update account settings and API keys

### Multi-Chain Support
- **Ethereum** (ERC-20): USDC, USDT, DAI
- **Polygon** (ERC-20): USDC, USDT, DAI  
- **Binance Smart Chain** (BEP-20): USDC, USDT, BUSD
- **Avalanche C-Chain** (ERC-20): USDC, USDT, DAI
- **Tron** (TRC-20): USDC, USDT
- **Solana** (SPL): USDC, USDT

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main layout with sidebar navigation
├── contexts/           # React contexts for state management
│   └── AuthContext.tsx # Authentication context
├── pages/              # Page components
│   ├── Home.tsx        # Landing page
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Payments.tsx    # Payment management
│   ├── Wallets.tsx     # Wallet management
│   ├── Transactions.tsx # Transaction monitoring
│   ├── Payouts.tsx     # Payout processing
│   ├── Webhooks.tsx    # Webhook management
│   └── Profile.tsx     # Profile settings
├── App.tsx             # Main app component with routing
├── main.tsx           # App entry point
└── index.css          # Global styles and Tailwind imports
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running (Python FastAPI)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd stablecoin-merchant-frontend
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables:**
```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_NAME=Stablecoin Merchant Portal
VITE_APP_VERSION=1.0.0
```

4. **Start the development server:**
```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:3000`

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically**

### Other Platforms

The app can be deployed to any platform that supports static sites:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

## 📱 Pages Overview

### Public Pages
- **Home** (`/`) - Landing page with features and pricing
- **Login** (`/login`) - Merchant authentication
- **Register** (`/register`) - New merchant registration

### Protected Pages (Require Authentication)
- **Dashboard** (`/dashboard`) - Main merchant dashboard with stats
- **Payments** (`/payments`) - Create and manage payment requests
- **Wallets** (`/wallets`) - Multi-chain wallet management
- **Transactions** (`/transactions`) - Real-time transaction monitoring
- **Payouts** (`/payouts`) - Process payouts to recipients
- **Webhooks** (`/webhooks`) - Configure webhook notifications
- **Profile** (`/profile`) - Account settings and API key management

## 🎨 UI Components

### Design System
- **Colors**: Primary, success, warning, danger color palettes
- **Typography**: Inter font family with proper hierarchy
- **Spacing**: Consistent spacing scale using Tailwind
- **Components**: Reusable button, input, card, badge components

### Responsive Design
- **Mobile-first**: Optimized for mobile devices
- **Breakpoints**: sm, md, lg, xl responsive breakpoints
- **Navigation**: Collapsible sidebar on mobile
- **Tables**: Horizontal scroll on small screens

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
```

### Code Structure

- **Components**: Reusable UI components in `/components`
- **Pages**: Full page components in `/pages`
- **Contexts**: React contexts for global state in `/contexts`
- **Types**: TypeScript interfaces and types
- **Styles**: Global styles and Tailwind configuration

### State Management

- **React Context**: For authentication and global state
- **Local State**: useState for component-specific state
- **API Calls**: Axios for HTTP requests
- **Cookies**: js-cookie for token storage

## 🔗 API Integration

The frontend integrates with the Python FastAPI backend:

### Authentication
- JWT token-based authentication
- API key management
- Automatic token refresh

### API Endpoints Used
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `POST /auth/refresh-api-key` - Refresh API key
- `GET /payments/` - List payments
- `POST /payments/create` - Create payment
- `GET /wallets/` - List wallets
- `POST /wallets/create` - Create wallet
- And many more...

## 🎯 Key Features

### Authentication Flow
1. User registers with email and company name
2. Receives API key for authentication
3. Can login with email and API key
4. JWT token stored in cookies for session management

### Payment Management
1. Create payment requests for customers
2. Monitor payment status in real-time
3. View payment history with filters
4. Handle refunds and cancellations

### Wallet Management
1. Create wallets for multiple blockchains
2. View balances across all supported tokens
3. Monitor wallet activity
4. Generate new addresses

### Transaction Monitoring
1. Real-time transaction status updates
2. Filter by chain, token, status
3. Refresh transaction status
4. View transaction details

### Payout Processing
1. Create payout requests
2. Execute payouts to recipients
3. Monitor payout status
4. Batch payout processing

### Webhook Management
1. Configure webhook URLs
2. Test webhook delivery
3. View delivery logs
4. Retry failed webhooks

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **API Key Management** - Secure key storage and rotation
- **Input Validation** - Client-side form validation
- **HTTPS Only** - Secure communication
- **XSS Protection** - React's built-in XSS protection
- **CSRF Protection** - SameSite cookie attributes

## 📊 Performance

- **Vite Build Tool** - Lightning-fast development and builds
- **Code Splitting** - Automatic route-based code splitting
- **Tree Shaking** - Remove unused code
- **Image Optimization** - Optimized assets
- **Lazy Loading** - Components loaded on demand

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test

# Run tests with coverage
npm run test:coverage
```

## 📦 Build

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment Checklist

- [ ] Set environment variables
- [ ] Configure API URL
- [ ] Set up Supabase credentials
- [ ] Test all functionality
- [ ] Optimize images and assets
- [ ] Configure domain and SSL
- [ ] Set up monitoring and analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check the API documentation
- **Issues**: Create an issue in the repository
- **Discussions**: Use GitHub discussions for questions

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**

*Modern, responsive, and user-friendly interface for stablecoin payment processing.*