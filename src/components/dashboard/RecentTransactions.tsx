import { CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'

const recentTransactions = [
  {
    id: '0x1234...5678',
    type: 'Payment',
    amount: '$1,250.00',
    token: 'USDC',
    chain: 'Ethereum',
    status: 'completed',
    time: '2 min ago',
    direction: 'in' as const,
  },
  {
    id: '0x9876...5432',
    type: 'Payout',
    amount: '$850.00',
    token: 'USDT',
    chain: 'Polygon',
    status: 'pending',
    time: '15 min ago',
    direction: 'out' as const,
  },
  {
    id: '0xabcd...efgh',
    type: 'Payment',
    amount: '$2,100.00',
    token: 'USDC',
    chain: 'BSC',
    status: 'completed',
    time: '1 hour ago',
    direction: 'in' as const,
  },
  {
    id: '0xijkl...mnop',
    type: 'Payment',
    amount: '$750.00',
    token: 'DAI',
    chain: 'Ethereum',
    status: 'failed',
    time: '2 hours ago',
    direction: 'in' as const,
  },
]

function getStatusVariant(status: string) {
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

function getChainColor(chain: string) {
  switch (chain) {
    case 'Ethereum':
      return 'bg-blue-500'
    case 'Polygon':
      return 'bg-purple-500'
    case 'BSC':
      return 'bg-yellow-500'
    case 'Solana':
      return 'bg-green-500'
    default:
      return 'bg-slate-500'
  }
}

export default function RecentTransactions() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {recentTransactions.map((tx, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
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
            
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{tx.amount}</p>
              <p className="text-sm text-slate-500">{tx.token}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getChainColor(tx.chain)}`}></div>
              <span className="text-sm text-slate-700">{tx.chain}</span>
            </div>
            
            <Badge variant={getStatusVariant(tx.status)}>
              {tx.status}
            </Badge>
            
            <span className="text-sm text-slate-500">{tx.time}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
