import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  DollarSign, 
  Receipt, 
  Wallet, 
  CheckCircle,
  TrendingUp
} from 'lucide-react'
import KPICard from '../components/dashboard/KPICard'
import RevenueChart from '../components/dashboard/RevenueChart'
import ChainVolume from '../components/dashboard/ChainVolume'
import RecentTransactions from '../components/dashboard/RecentTransactions'

export default function Dashboard() {
  const { merchant } = useAuth()
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    activeWallets: 0,
    successRate: 0
  })

  useEffect(() => {
    // Fetch dashboard stats
    // This would typically come from your API
    setStats({
      totalRevenue: 24567.89,
      totalTransactions: 1234,
      activeWallets: 8,
      successRate: 98.7
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value="$24,567"
          change={{ value: "+12.5% from last month", type: "increase" }}
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
        />
        
        <KPICard
          title="Transactions"
          value="1,234"
          change={{ value: "+8.2% from last month", type: "increase" }}
          icon={Receipt}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        
        <KPICard
          title="Active Wallets"
          value="8"
          change={{ value: "Across 6 chains", type: "increase" }}
          icon={Wallet}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        
        <KPICard
          title="Success Rate"
          value="98.7%"
          change={{ value: "Excellent", type: "increase" }}
          icon={CheckCircle}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
        />
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <ChainVolume />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  )
}