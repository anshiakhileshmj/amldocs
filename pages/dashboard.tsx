import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import axios from 'axios'
import { 
  CreditCard, 
  Wallet, 
  TrendingUp, 
  Settings, 
  LogOut,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DashboardStats {
  total_payments: number
  total_transactions: number
  total_payouts: number
  active_wallets: number
}

export default function Dashboard() {
  const { merchant, logout, refreshApiKey } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showApiKey, setShowApiKey] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!merchant) {
      router.push('/login')
      return
    }
    fetchStats()
  }, [merchant, router])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/merchants/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setStats(response.data.statistics)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleRefreshApiKey = async () => {
    setRefreshing(true)
    const success = await refreshApiKey()
    if (success) {
      setShowApiKey(true)
    }
    setRefreshing(false)
  }

  const copyApiKey = () => {
    if (merchant?.api_key) {
      navigator.clipboard.writeText(merchant.api_key)
      toast.success('API key copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Dashboard - Stablecoin Merchant</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
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
                <span className="text-sm text-gray-700">
                  {merchant?.company_name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {merchant?.company_name}!
            </h1>
            <p className="text-gray-600">
              Manage your stablecoin payments across multiple blockchains
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCard className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Payments</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats?.total_payments || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Transactions</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats?.total_transactions || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Wallet className="h-8 w-8 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Payouts</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats?.total_payouts || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Settings className="h-8 w-8 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Wallets</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats?.active_wallets || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* API Key Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">API Key</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="btn btn-secondary text-sm"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={handleRefreshApiKey}
                    disabled={refreshing}
                    className="btn btn-warning text-sm"
                  >
                    {refreshing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={merchant?.api_key || ''}
                      readOnly
                      className="input pr-20 font-mono text-sm"
                    />
                    <button
                      onClick={copyApiKey}
                      className="absolute inset-y-0 right-0 px-3 flex items-center bg-primary-600 text-white rounded-r-lg hover:bg-primary-700"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                  <p className="text-xs text-warning-800">
                    <strong>Security Note:</strong> Keep your API key secure and never share it publicly. 
                    Use it in the Authorization header: <code>Bearer YOUR_API_KEY</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/payments" className="block w-full btn btn-primary text-center">
                  Create Payment Request
                </Link>
                <Link href="/wallets" className="block w-full btn btn-secondary text-center">
                  Manage Wallets
                </Link>
                <Link href="/payouts" className="block w-full btn btn-secondary text-center">
                  Process Payouts
                </Link>
                <Link href="/transactions" className="block w-full btn btn-secondary text-center">
                  View Transactions
                </Link>
              </div>
            </div>
          </div>

          {/* Supported Chains */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Blockchains</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: 'Ethereum', symbol: 'Ξ', color: 'blue', tokens: ['USDC', 'USDT', 'DAI'] },
                { name: 'Polygon', symbol: '⬟', color: 'purple', tokens: ['USDC', 'USDT', 'DAI'] },
                { name: 'BSC', symbol: 'B', color: 'yellow', tokens: ['USDC', 'USDT', 'BUSD'] },
                { name: 'Avalanche', symbol: 'A', color: 'red', tokens: ['USDC', 'USDT', 'DAI'] },
                { name: 'Tron', symbol: 'T', color: 'orange', tokens: ['USDC', 'USDT'] },
                { name: 'Solana', symbol: 'S', color: 'green', tokens: ['USDC', 'USDT'] },
              ].map((chain) => (
                <div key={chain.name} className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className={`bg-${chain.color}-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2`}>
                    <span className={`text-xl font-bold text-${chain.color}-600`}>{chain.symbol}</span>
                  </div>
                  <h4 className="font-medium text-gray-900">{chain.name}</h4>
                  <p className="text-xs text-gray-500">{chain.tokens.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* API Documentation */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Documentation</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Base URL</h4>
                <code className="block bg-gray-100 p-2 rounded text-sm">
                  {process.env.NEXT_PUBLIC_API_URL}
                </code>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Authentication</h4>
                <code className="block bg-gray-100 p-2 rounded text-sm">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
            </div>
            <div className="mt-4">
              <a
                href="/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                View Full Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
