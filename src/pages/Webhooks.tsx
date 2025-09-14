import { useEffect, useState } from 'react'
import { webhooksAPI } from '../lib/api'
import { 
  Webhook, 
  TestTube, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

interface WebhookLog {
  id: string
  event_type: string
  payload: any
  response_status?: number
  response_body?: string
  retry_count: number
  created_at: string
}

export default function Webhooks() {
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    fetchWebhookLogs()
  }, [])

  const fetchWebhookLogs = async () => {
    try {
      const response = await webhooksAPI.getLogs()
      setLogs(response.data)
    } catch (error) {
      console.error('Failed to fetch webhook logs:', error)
      toast.error('Failed to fetch webhook logs')
    } finally {
      setLoading(false)
    }
  }

  const testWebhook = async () => {
    setTesting(true)
    try {
      await webhooksAPI.test()
      toast.success('Test webhook sent successfully!')
      fetchWebhookLogs()
    } catch (error) {
      console.error('Failed to test webhook:', error)
      toast.error('Failed to test webhook')
    } finally {
      setTesting(false)
    }
  }

  const retryWebhook = async (logId: string) => {
    try {
      await webhooksAPI.retry(logId)
      toast.success('Webhook retry initiated!')
      fetchWebhookLogs()
    } catch (error) {
      console.error('Failed to retry webhook:', error)
      toast.error('Failed to retry webhook')
    }
  }

  const getStatusIcon = (status?: number) => {
    if (!status) return <Clock className="h-4 w-4 text-gray-400" />
    if (status >= 200 && status < 300) return <CheckCircle className="h-4 w-4 text-success-600" />
    return <XCircle className="h-4 w-4 text-danger-600" />
  }

  const getStatusText = (status?: number) => {
    if (!status) return 'Pending'
    if (status >= 200 && status < 300) return 'Success'
    return 'Failed'
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
        <p className="text-gray-600">Manage webhook notifications and delivery logs</p>
      </div>

      {/* Webhook Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                className="input"
                placeholder="https://your-domain.com/webhooks"
                defaultValue="https://your-domain.com/webhooks"
              />
              <p className="mt-1 text-xs text-gray-500">
                We'll send payment notifications to this URL
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook Secret
              </label>
              <input
                type="text"
                className="input"
                placeholder="your-webhook-secret"
                defaultValue="whsec_1234567890abcdef"
              />
              <p className="mt-1 text-xs text-gray-500">
                Used to verify webhook signatures
              </p>
            </div>
            
            <button className="btn btn-primary">
              Update Configuration
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Webhook</h3>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Send a test webhook to verify your configuration is working correctly.
            </p>
            
            <button
              onClick={testWebhook}
              disabled={testing}
              className="btn btn-primary flex items-center"
            >
              {testing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Send Test Webhook
            </button>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Supported Events:
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• payment.created</li>
                <li>• payment.completed</li>
                <li>• payment.failed</li>
                <li>• transaction.confirmed</li>
                <li>• payout.completed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook Logs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Webhook Delivery Logs</h3>
          <button
            onClick={fetchWebhookLogs}
            className="btn btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
        
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Webhook className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No webhook logs found</h3>
            <p className="text-gray-600">
              Webhook delivery logs will appear here once events are triggered
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retries
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {log.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(log.response_status)}
                        <span className="ml-2 text-sm text-gray-900">
                          {getStatusText(log.response_status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.response_status || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.retry_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {log.response_status && log.response_status >= 400 && log.retry_count < 5 ? (
                        <button
                          onClick={() => retryWebhook(log.id)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Retry
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
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
