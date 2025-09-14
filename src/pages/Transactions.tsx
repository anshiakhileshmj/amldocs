import { useState } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  ChevronDown
} from 'lucide-react'
import { Button, Input, Card, Badge } from '../components/ui'

const transactions = [
  {
    id: '0x1234567890abcdef1234567890abcdef12345678',
    type: 'payment',
    amount: '$1,250.00',
    token: 'USDC',
    chain: 'Ethereum',
    status: 'completed',
    from: '0xabcd...efgh',
    to: '0xijkl...mnop',
    timestamp: '2024-01-15T10:30:00Z',
    fee: '$5.20',
    blockNumber: 18500000,
    direction: 'in' as const,
  },
  {
    id: '0x9876543210fedcba9876543210fedcba98765432',
    type: 'payout',
    amount: '$850.00',
    token: 'USDT',
    chain: 'Polygon',
    status: 'pending',
    from: '0xijkl...mnop',
    to: '0xabcd...efgh',
    timestamp: '2024-01-15T09:15:00Z',
    fee: '$0.50',
    blockNumber: 45000000,
    direction: 'out' as const,
  },
  {
    id: '0xabcdef1234567890abcdef1234567890abcdef12',
    type: 'payment',
    amount: '$2,100.00',
    token: 'USDC',
    chain: 'BSC',
    status: 'completed',
    from: '0xmnop...qrst',
    to: '0xijkl...mnop',
    timestamp: '2024-01-14T16:45:00Z',
    fee: '$0.30',
    blockNumber: 35000000,
    direction: 'in' as const,
  },
  {
    id: '0xfedcba0987654321fedcba0987654321fedcba09',
    type: 'payment',
    amount: '$750.00',
    token: 'DAI',
    chain: 'Ethereum',
    status: 'failed',
    from: '0xqrst...uvwx',
    to: '0xijkl...mnop',
    timestamp: '2024-01-14T14:20:00Z',
    fee: '$0.00',
    blockNumber: null,
    direction: 'in' as const,
  },
]

const chains = [
  { value: 'all', label: 'All Chains' },
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'bsc', label: 'BSC' },
  { value: 'avalanche', label: 'Avalanche' },
  { value: 'tron', label: 'Tron' },
  { value: 'solana', label: 'Solana' },
]

const tokens = [
  { value: 'all', label: 'All Tokens' },
  { value: 'USDC', label: 'USDC' },
  { value: 'USDT', label: 'USDT' },
  { value: 'DAI', label: 'DAI' },
  { value: 'BUSD', label: 'BUSD' },
]

const statuses = [
  { value: 'all', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
]

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChain, setSelectedChain] = useState('all')
  const [selectedToken, setSelectedToken] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.to.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesChain = selectedChain === 'all' || tx.chain.toLowerCase() === selectedChain
    const matchesToken = selectedToken === 'all' || tx.token === selectedToken
    const matchesStatus = selectedStatus === 'all' || tx.status === selectedStatus

    return matchesSearch && matchesChain && matchesToken && matchesStatus
  })

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'pending':
        return 'warning'
      case 'failed':
        return 'danger'
      default:
        return 'default'
    }
  }

  const getChainColor = (chain: string) => {
    switch (chain) {
      case 'Ethereum':
        return 'bg-blue-500'
      case 'Polygon':
        return 'bg-purple-500'
      case 'BSC':
        return 'bg-yellow-500'
      case 'Avalanche':
        return 'bg-red-500'
      case 'Tron':
        return 'bg-orange-500'
      case 'Solana':
        return 'bg-green-500'
      default:
        return 'bg-slate-500'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const openInExplorer = (chain: string, txId: string) => {
    const explorers = {
      'Ethereum': `https://etherscan.io/tx/${txId}`,
      'Polygon': `https://polygonscan.com/tx/${txId}`,
      'BSC': `https://bscscan.com/tx/${txId}`,
      'Avalanche': `https://snowtrace.io/tx/${txId}`,
      'Tron': `https://tronscan.org/#/transaction/${txId}`,
      'Solana': `https://explorer.solana.com/tx/${txId}`,
    }
    
    const url = explorers[chain as keyof typeof explorers]
    if (url) {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Transactions</h1>
          <p className="text-slate-600">View and manage all your blockchain transactions</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by transaction ID, address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          <div className="text-sm text-slate-500">
            {filteredTransactions.length} transactions
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Chain</label>
              <select
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {chains.map(chain => (
                  <option key={chain.value} value={chain.value}>
                    {chain.label}
                  </option>
                ))}
              </select>
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Transactions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Chain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTransactions.map((tx, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                        {tx.direction === 'in' ? (
                          <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {tx.id.slice(0, 8)}...{tx.id.slice(-8)}
                        </p>
                        <p className="text-sm text-slate-500">{tx.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-semibold text-slate-900">{tx.amount}</p>
                    <p className="text-sm text-slate-500">{tx.token}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${getChainColor(tx.chain)}`}></div>
                      <span className="text-sm text-slate-700">{tx.chain}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusVariant(tx.status)}>
                      {tx.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {formatTimestamp(tx.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(tx.id)}
                        className="text-slate-400 hover:text-slate-600"
                        title="Copy Transaction ID"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openInExplorer(tx.chain, tx.id)}
                        className="text-slate-400 hover:text-slate-600"
                        title="View on Explorer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No transactions found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </Card>
    </div>
  )
}