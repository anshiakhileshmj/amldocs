import Card from '../ui/Card'

const chainData = [
  { chain: 'Ethereum', amount: '$12,450', percentage: 45, color: 'bg-blue-500' },
  { chain: 'Polygon', amount: '$8,230', percentage: 30, color: 'bg-purple-500' },
  { chain: 'BSC', amount: '$4,120', percentage: 15, color: 'bg-yellow-500' },
  { chain: 'Solana', amount: '$2,767', percentage: 10, color: 'bg-green-500' },
]

export default function ChainVolume() {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Volume by Chain</h3>
      <div className="space-y-4">
        {chainData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              <span className="text-sm font-medium text-slate-700">{item.chain}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{item.amount}</p>
              <p className="text-xs text-slate-500">{item.percentage}%</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
