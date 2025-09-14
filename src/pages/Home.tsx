import { Link } from 'react-router-dom'
import { 
  CreditCard, 
  Shield, 
  Zap, 
  Globe, 
  Lock, 
  BarChart3,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <CreditCard className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Stablecoin Merchant
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Multi-Chain
            <span className="text-primary-600"> Stablecoin</span>
            <br />
            Payment Rails
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Accept stablecoin payments across 6 major blockchains with a single API. 
            Support for Ethereum, Polygon, BSC, Avalanche, Tron, and Solana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
              Start Building
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/login" className="btn btn-secondary text-lg px-8 py-3">
              View Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need to accept crypto payments
          </h2>
          <p className="text-xl text-gray-600">
            Built for developers, designed for merchants
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="card">
            <div className="flex items-center mb-4">
              <Globe className="h-8 w-8 text-primary-600" />
              <h3 className="text-xl font-semibold ml-3">Multi-Chain Support</h3>
            </div>
            <p className="text-gray-600">
              Support for Ethereum, Polygon, BSC, Avalanche, Tron, and Solana with unified API.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-success-600" />
              <h3 className="text-xl font-semibold ml-3">Secure & Reliable</h3>
            </div>
            <p className="text-gray-600">
              Enterprise-grade security with JWT authentication and webhook signatures.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <Zap className="h-8 w-8 text-warning-600" />
              <h3 className="text-xl font-semibold ml-3">Real-time Processing</h3>
            </div>
            <p className="text-gray-600">
              Instant payment verification and real-time transaction monitoring.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-8 w-8 text-primary-600" />
              <h3 className="text-xl font-semibold ml-3">Analytics & Reporting</h3>
            </div>
            <p className="text-gray-600">
              Comprehensive analytics and reporting for all your payment data.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <Lock className="h-8 w-8 text-success-600" />
              <h3 className="text-xl font-semibold ml-3">API Key Management</h3>
            </div>
            <p className="text-gray-600">
              Secure API key generation and management with easy rotation.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-8 w-8 text-warning-600" />
              <h3 className="text-xl font-semibold ml-3">Easy Integration</h3>
            </div>
            <p className="text-gray-600">
              Simple REST API with comprehensive documentation and examples.
            </p>
          </div>
        </div>
      </div>

      {/* Supported Chains */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Supported Blockchains & Tokens
            </h2>
            <p className="text-xl text-gray-600">
              Accept payments across all major stablecoin networks
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">Ξ</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Ethereum</h3>
              <p className="text-gray-600">USDC, USDT, DAI</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">⬟</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Polygon</h3>
              <p className="text-gray-600">USDC, USDT, DAI</p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-yellow-600">B</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">BSC</h3>
              <p className="text-gray-600">USDC, USDT, BUSD</p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">A</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Avalanche</h3>
              <p className="text-gray-600">USDC, USDT, DAI</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">T</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Tron</h3>
              <p className="text-gray-600">USDC, USDT</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">S</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Solana</h3>
              <p className="text-gray-600">USDC, USDT</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start accepting stablecoin payments?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Get started in minutes with our simple API integration
          </p>
          <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
            Create Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-primary-400" />
              <span className="ml-2 text-xl font-bold">Stablecoin Merchant</span>
            </div>
            <p className="text-gray-400">
              Multi-chain stablecoin payment processing for the decentralized future
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
