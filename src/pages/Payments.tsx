import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CreditCard, Copy, ExternalLink, QrCode } from 'lucide-react'
import { Button, Input, Card, Badge } from '../components/ui'
import toast from 'react-hot-toast'

interface PaymentFormData {
  amount: string
  token: string
  chain: string
  description: string
}

const tokens = [
  { value: 'USDC', label: 'USDC' },
  { value: 'USDT', label: 'USDT' },
  { value: 'DAI', label: 'DAI' },
  { value: 'BUSD', label: 'BUSD' },
]

const chains = [
  { value: 'ethereum', label: 'Ethereum', color: 'bg-blue-500' },
  { value: 'polygon', label: 'Polygon', color: 'bg-purple-500' },
  { value: 'bsc', label: 'BSC', color: 'bg-yellow-500' },
  { value: 'avalanche', label: 'Avalanche', color: 'bg-red-500' },
  { value: 'tron', label: 'Tron', color: 'bg-orange-500' },
  { value: 'solana', label: 'Solana', color: 'bg-green-500' },
]

const recentPayments = [
  {
    id: 'pay_123456',
    amount: '$1,250.00',
    token: 'USDC',
    chain: 'Ethereum',
    status: 'completed',
    createdAt: '2 hours ago',
    paymentUrl: 'https://pay.merchant.com/123456'
  },
  {
    id: 'pay_123457',
    amount: '$850.00',
    token: 'USDT',
    chain: 'Polygon',
    status: 'pending',
    createdAt: '4 hours ago',
    paymentUrl: 'https://pay.merchant.com/123457'
  },
  {
    id: 'pay_123458',
    amount: '$2,100.00',
    token: 'USDC',
    chain: 'BSC',
    status: 'completed',
    createdAt: '1 day ago',
    paymentUrl: 'https://pay.merchant.com/123458'
  },
]

export default function Payments() {
  const [selectedChain, setSelectedChain] = useState('ethereum')
  const [paymentPreview, setPaymentPreview] = useState({
    amount: '0.00',
    token: 'USDC',
    chain: 'Ethereum',
    fee: '0.00',
    total: '0.00'
  })

  const { register, handleSubmit, watch, formState: { errors } } = useForm<PaymentFormData>({
    defaultValues: {
      amount: '',
      token: 'USDC',
      chain: 'ethereum',
      description: ''
    }
  })

  const watchedAmount = watch('amount')
  const watchedToken = watch('token')
  const watchedChain = watch('chain')

  // Update preview when form changes
  useState(() => {
    const selectedChainData = chains.find(c => c.value === watchedChain)
    const fee = watchedAmount ? (parseFloat(watchedAmount) * 0.0025).toFixed(2) : '0.00'
    const total = watchedAmount ? (parseFloat(watchedAmount) + parseFloat(fee)).toFixed(2) : '0.00'
    
    setPaymentPreview({
      amount: watchedAmount || '0.00',
      token: watchedToken,
      chain: selectedChainData?.label || 'Ethereum',
      fee,
      total
    })
  }, [watchedAmount, watchedToken, watchedChain])

  const onSubmit = async (data: PaymentFormData) => {
    try {
      // Here you would call your API to create the payment
      console.log('Creating payment:', data)
      toast.success('Payment link created successfully!')
    } catch (error) {
      toast.error('Failed to create payment link')
    }
  }

  const copyPaymentUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('Payment URL copied to clipboard!')
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Payment Processing</h1>
        <p className="text-slate-600">Create payment links and manage your payment requests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Create Payment</h3>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('amount', { required: 'Amount is required' })}
                  error={errors.amount?.message}
                />
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Token
                  </label>
                  <select 
                    {...register('token')}
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
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Blockchain
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                <input type="hidden" {...register('chain')} value={selectedChain} />
              </div>
              
              <Input
                label="Description"
                placeholder="Payment description..."
                {...register('description')}
              />
              
              <Button type="submit" className="w-full">
                Create Payment Link
              </Button>
            </form>
          </Card>
        </div>
        
        {/* Payment Preview */}
        <div>
          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Payment Preview</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600">Amount:</span>
                <span className="font-semibold">${paymentPreview.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Token:</span>
                <span className="font-semibold">{paymentPreview.token}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Network:</span>
                <span className="font-semibold">{paymentPreview.chain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Fee (0.25%):</span>
                <span className="font-semibold">${paymentPreview.fee}</span>
              </div>
              
              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-slate-900 font-semibold">Total:</span>
                  <span className="text-slate-900 font-bold">${paymentPreview.total}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Payments */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Recent Payments</h3>
          <Button variant="outline">View All</Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Payment ID
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
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentPayments.map((payment, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                        <CreditCard className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {payment.id}
                        </p>
                        <p className="text-sm text-slate-500">{payment.token}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-semibold text-slate-900">{payment.amount}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        chains.find(c => c.label === payment.chain)?.color || 'bg-slate-500'
                      }`}></div>
                      <span className="text-sm text-slate-700">{payment.chain}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {payment.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyPaymentUrl(payment.paymentUrl)}
                        className="text-slate-400 hover:text-slate-600"
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(payment.paymentUrl, '_blank')}
                        className="text-slate-400 hover:text-slate-600"
                        title="Open Payment"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        className="text-slate-400 hover:text-slate-600"
                        title="QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}