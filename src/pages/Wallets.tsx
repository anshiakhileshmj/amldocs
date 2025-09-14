import { useState } from 'react'
import { 
  Wallet, 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { Button, Input, Card, Badge } from '../components/ui'
import toast from 'react-hot-toast'

interface WalletData {
  id: string
  address: string
  chain: string
  balance: string
  token: string
  status: 'active' | 'inactive'
  createdAt: string
  lastActivity: string
}

const wallets: WalletData[] = [
  {
    id: 'wallet_1',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    chain: 'Ethereum',
    balance: '12,450.50',
    token: 'USDC',
    status: 'active',
    createdAt: '2024-01-01',
    lastActivity: '2 hours ago'
  },
  {
    id: 'wallet_2',
    address: '0x9876543210fedcba9876543210fedcba98765432',
    chain: 'Polygon',
    balance: '8,230.75',
    token: 'USDT',
    status: 'active',
    createdAt: '2024-01-02',
    lastActivity: '1 day ago'
  },
  {
    id: 'wallet_3',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    chain: 'BSC',
    balance: '4,120.00',
    token: 'USDC',
    status: 'active',
    createdAt: '2024-01-03',
    lastActivity: '3 days ago'
  },
  {
    id: 'wallet_4',
    address: '0xfedcba0987654321fedcba0987654321fedcba09',
    chain: 'Solana',
    balance: '2,767.25',
    token: 'USDC',
    status: 'inactive',
    createdAt: '2024-01-04',
    lastActivity: '1 week ago'
  },
]

const chains = [
  { value: 'ethereum', label: 'Ethereum', color: 'bg-blue-500' },
  { value: 'polygon', label: 'Polygon', color: 'bg-purple-500' },
  { value: 'bsc', label: 'BSC', color: 'bg-yellow-500' },
  { value: 'avalanche', label: 'Avalanche', color: 'bg-red-500' },
  { value: 'tron', label: 'Tron', color: 'bg-orange-500' },
  { value: 'solana', label: 'Solana', color: 'bg-green-500' },
]

const tokens = [
  { value: 'USDC', label: 'USDC' },
  { value: 'USDT', label: 'USDT' },
  { value: 'DAI', label: 'DAI' },
  { value: 'BUSD', label: 'BUSD' },
]

export default function Wallets() {
  const [showPrivateKeys, setShowPrivateKeys] = useState(false)
  const [selectedChain, setSelectedChain] = useState('ethereum')
  const [selectedToken, setSelectedToken] = useState('USDC')
  const [isCreating, setIsCreating] = useState(false)

  const totalBalance = wallets.reduce((sum, wallet) => {
    return sum + parseFloat(wallet.balance.replace(/,/g, ''))
  }, 0)

  const activeWallets = wallets.filter(wallet => wallet.status === 'active').length

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const openInExplorer = (chain: string, address: string) => {
    const explorers = {
      'Ethereum': `https://etherscan.io/address/${address}`,
      'Polygon': `https://polygonscan.com/address/${address}`,
      'BSC': `https://bscscan.com/address/${address}`,
      'Avalanche': `https://snowtrace.io/address/${address}`,
      'Tron': `https://tronscan.org/#/address/${address}`,
      'Solana': `https://explorer.solana.com/address/${address}`,
    }
    
    const url = explorers[chain as keyof typeof explorers]
    if (url) {
      window.open(url, '_blank')
    }
  }

  const createWallet = async () => {
    setIsCreating(true)
    try {
      // Here you would call your API to create a new wallet
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      toast.success('New wallet created successfully!')
    } catch (error) {
      toast.error('Failed to create wallet')
    } finally {
      setIsCreating(false)
    }
  }

  const getChainColor = (chain: string) => {
    const chainData = chains.find(c => c.label === chain)
    return chainData?.color || 'bg-slate-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Wallet Management</h1>
          <p className="text-slate-600">Manage your multi-chain wallets and balances</p>
        </div>
        <Button onClick={createWallet} disabled={isCreating}>
          {isCreating ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Create Wallet
        </Button>
      </div>

      {/* Wallet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Balance</p>
              <p className="text-3xl font-bold text-slate-900">${totalBalance.toLocaleString()}</p>
              <p className="text-sm text-emerald-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +5.2% from last week
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Wallets</p>
              <p className="text-3xl font-bold text-slate-900">{activeWallets}</p>
              <p className="text-sm text-slate-500 mt-1">Across {chains.length} chains</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Inactive Wallets</p>
              <p className="text-3xl font-bold text-slate-900">{wallets.length - activeWallets}</p>
              <p className="text-sm text-amber-600 flex items-center mt-1">
                <AlertCircle className="w-4 h-4 mr-1" />
                Needs attention
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Create New Wallet */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Create New Wallet</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Blockchain</label>
            <div className="grid grid-cols-2 gap-3">
              {chains.map(chain => (
                <button 
                  key={chain.value}
                  type="button"
                  onClick={() => setSelectedChain(chain.value)}
                  className={`p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors ${
                    selectedChain === chain.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-300'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${chain.color}`}></div>
                    <span className="text-sm font-medium text-slate-700">{chain.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Token</label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {tokens.map(token => (
                <option key={token.value} value={token.value}>
                  {token.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Wallets List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Your Wallets</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPrivateKeys(!showPrivateKeys)}
              className="flex items-center text-slate-600 hover:text-slate-900"
            >
              {showPrivateKeys ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {showPrivateKeys ? 'Hide' : 'Show'} Private Keys
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-slate-900">{wallet.chain}</h4>
                      <Badge variant={wallet.status === 'active' ? 'success' : 'warning'}>
                        {wallet.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                      {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-semibold text-slate-900">${wallet.balance}</p>
                  <p className="text-sm text-slate-500">{wallet.token}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(wallet.address, 'Address')}
                    className="p-2 text-slate-400 hover:text-slate-600"
                    title="Copy Address"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openInExplorer(wallet.chain, wallet.address)}
                    className="p-2 text-slate-400 hover:text-slate-600"
                    title="View on Explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Created:</span>
                    <span className="ml-2 text-slate-900">{wallet.createdAt}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Last Activity:</span>
                    <span className="ml-2 text-slate-900">{wallet.lastActivity}</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${getChainColor(wallet.chain)}`}></div>
                    <span className="text-slate-500">Chain:</span>
                    <span className="ml-2 text-slate-900">{wallet.chain}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}