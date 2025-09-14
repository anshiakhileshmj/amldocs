import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import Card from '../ui/Card'

interface KPICardProps {
  title: string
  value: string
  change?: {
    value: string
    type: 'increase' | 'decrease'
  }
  icon: LucideIcon
  iconColor: string
  iconBg: string
}

export default function KPICard({ title, value, change, icon: Icon, iconColor, iconBg }: KPICardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {change && (
            <p className={`text-sm flex items-center mt-1 ${
              change.type === 'increase' ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {change.type === 'increase' ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {change.value}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </Card>
  )
}
