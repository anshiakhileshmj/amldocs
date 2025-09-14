import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import axios from 'axios'
import { 
  Plus, 
  Wallet, 
  Copy, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Wallet {
  id: string
  chain: string
  address: string
  is_active: boolean
  created_at: string
}

interface Balance {
  chain: string
  token: string
  balance: string
  address: string
}

export default function Wallets() {
  const { merchant } = useAuth()
  const router = useRouter()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [showAddresses, setShowAddresses] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (!merchant) {
      router.push('/login')
      return
    }
    fetchWallets()
  }, [merchant, router])

  const fetchWallets = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/wallets/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setWallets(response.data)
    } catch (error) {
      console.error('Failed to fetch wallets:', error)
      toast.error('Failed to fetch wallets')
    } finally {
      setLoading(false)
    }
  }

  const fetchBalances = async (walletId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/wallets/${walletId}/balances`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setBalances(response.data)
      setSelectedWallet(walletId)
    } catch (error) {
      console.error('Failed to fetch balances:', error)
      toast.error('Failed to fetch balances')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const toggleAddressVisibility = (walletId: string) => {
    setShowAddresses(prev => ({
      ...prev,
      [walletId]: !prev[walletId]
    }))
  }

  const getChainIcon = (chain: string) => {
    const icons = {
      ethereum: 'Ξ',
      polygon: '⬟',
      bsc: 'B',
      avalanche: 'A',
      tron: 'T',
      solana: 'S'
    }
    return icons[chain as keyof typeof icons] || '?'
  }

  const getChainColor = (chain: string) => {
    const colors = {
      ethereum: 'blue',
      polygon: 'purple',
      bsc: 'yellow',
      avalanche: 'red',
      tron: 'orange',
      solana: 'green'
    }
    return colors[chain as keyof typeof colors] || 'gray'
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
        <title>Wallets - Stablecoin Merchant</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Wallets</h1>
                  <p className="text-gray-600">Manage your blockchain wallets</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Wallet
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Wallets List */}
            <div className="lg:col-span-2">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Wallets</h3>
                
                {wallets.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Wallet className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No wallets found</h3>
                    <p className="text-gray-600 mb-4">
                      Create your first wallet to start accepting payments
                    </p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="btn btn-primary"
                    >
                      Create Wallet
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {wallets.map((wallet) => (
                      <div
                        key={wallet.id}
                        className={`p-4 border rounded-lg ${
                          selectedWallet === wallet.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`bg-${getChainColor(wallet.chain)}-100 rounded-full w-10 h-10 flex items-center justify-center mr-3`}>
                              <span className={`text-lg font-bold text-${getChainColor(wallet.chain)}-600`}>
                                {getChainIcon(wallet.chain)}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 capitalize">
                                {wallet.chain} Wallet
                              </h4>
                              <p className="text-sm text-gray-500">
                                {showAddresses[wallet.id] ? wallet.address : `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleAddressVisibility(wallet.id)}
                              className="p-2 text-gray-400 hover:text-gray-600"
                            >
                              {showAddresses[wallet.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                            
                            <button
                              onClick={() => copyToClipboard(wallet.address)}
                              className="p-2 text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => fetchBalances(wallet.id)}
                              className="btn btn-secondary text-sm"
                            >
                              View Balances
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center">
                            {wallet.is_active ? (
                              <span className="badge badge-success flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="badge badge-danger flex items-center">
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactive
                              </span>
                            )}
                          </div>
                          
                          <span className="text-xs text-gray-500">
                            Created {new Date(wallet.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Balances */}
            <div className="lg:col-span-1">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Balances</h3>
                  {selectedWallet && (
                    <button
                      onClick={() => fetchBalances(selectedWallet)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                {!selectedWallet ? (
                  <p className="text-gray-500 text-sm">
                    Select a wallet to view balances
                  </p>
                ) : balances.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No balances found for this wallet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {balances.map((balance, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{balance.token}</p>
                          <p className="text-sm text-gray-500 capitalize">{balance.chain}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {parseFloat(balance.balance).toFixed(6)}
                          </p>
                          <p className="text-sm text-gray-500">{balance.token}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Create Wallet Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Create New Wallet</h3>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blockchain
                    </label>
                    <select className="input">
                      <option value="ethereum">Ethereum</option>
                      <option value="polygon">Polygon</option>
                      <option value="bsc">BSC</option>
                      <option value="avalanche">Avalanche</option>
                      <option value="tron">Tron</option>
                      <option value="solana">Solana</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wallet Address (Optional)
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Leave empty to generate new wallet"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      If you provide an address, we'll monitor it. If empty, we'll create a new wallet for you.
                    </p>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn btn-primary"
                    >
                      Create Wallet
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
