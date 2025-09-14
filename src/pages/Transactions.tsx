import { useEffect, useState } from 'react'
import { transactionsAPI } from '../lib/api'
import { 
  Search, 
  Copy, 
  CheckCircle, 
  Clock, 
  XCircle,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Transaction {
  id: string
  payment_request_id: string
  tx_hash: string
  chain: string
  token: string
  amount: string
  from_address: string
  to_address: string
  block_number?: number
  confirmation_count: number
  status: string
  gas_used?: number
  gas_price?: number
  created_at: string
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [chainFilter, setChainFilter] = useState('all')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await transactionsAPI.list()
      setTransactions(response.data)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      toast.error('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'warning', icon: Clock },
      confirmed: { color: 'success', icon: CheckCircle },
      failed: { color: 'danger', icon: XCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <span className={`badge badge-${config.color} flex items-center`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </span>
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const refreshTransaction = async (txHash: string) => {
    try {
      await transactionsAPI.refresh(txHash)
      toast.success('Transaction status refreshed!')
      fetchTransactions()
    } catch (error) {
      console.error('Failed to refresh transaction:', error)
      toast.error('Failed to refresh transaction')
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.tx_hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.from_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.to_address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter
    const matchesChain = chainFilter === 'all' || transaction.chain === chainFilter
    return matchesSearch && matchesStatus && matchesChain
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600">Monitor your blockchain transactions</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="md:w-48">
            <select
              value={chainFilter}
              onChange={(e) => setChainFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Chains</option>
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
              <option value="bsc">BSC</option>
              <option value="avalanche">Avalanche</option>
              <option value="tron">Tron</option>
              <option value="solana">Solana</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Clock className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || chainFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Transactions will appear here once payments are made'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction Hash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Block
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 font-mono">
                          {transaction.tx_hash.slice(0, 10)}...{transaction.tx_hash.slice(-8)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(transaction.tx_hash)}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">
                        {transaction.chain}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {transaction.token}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {transaction.amount} {transaction.token}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.block_number ? transaction.block_number.toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => refreshTransaction(transaction.tx_hash)}
                        className="text-primary-600 hover:text-primary-900 flex items-center"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
