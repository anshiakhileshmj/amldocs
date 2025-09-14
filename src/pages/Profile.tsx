import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import { merchantsAPI } from '../lib/api'
import { User, Save, Copy, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
  const { merchant, refreshApiKey } = useAuth()
  const [loading, setLoading] = useState(false)
  const [companyName, setCompanyName] = useState(merchant?.company_name || '')
  const [webhookUrl, setWebhookUrl] = useState(merchant?.webhook_url || '')
  const [showApiKey, setShowApiKey] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await merchantsAPI.updateProfile({
        company_name: companyName,
        webhook_url: webhookUrl
      })
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshApiKey = async () => {
    setRefreshing(true)
    const success = await refreshApiKey()
    if (success) {
      setShowApiKey(true)
    }
    setRefreshing(false)
  }

  const copyApiKey = () => {
    if (merchant?.api_key) {
      navigator.clipboard.writeText(merchant.api_key)
      toast.success('API key copied to clipboard!')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your merchant account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={merchant?.email || ''}
                disabled
                className="input bg-gray-50"
              />
              <p className="mt-1 text-xs text-gray-500">
                Email address cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input"
                placeholder="Your Company Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="input"
                placeholder="https://your-domain.com/webhooks"
              />
              <p className="mt-1 text-xs text-gray-500">
                We'll send payment notifications to this URL
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Status
              </label>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  merchant?.is_active ? 'bg-success-500' : 'bg-danger-500'
                }`}></div>
                <span className="text-sm text-gray-900">
                  {merchant?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Since
              </label>
              <p className="text-sm text-gray-900">
                {merchant?.created_at ? new Date(merchant.created_at).toLocaleDateString() : '-'}
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="btn btn-primary flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </div>

        {/* API Key Management */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Key Management</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={merchant?.api_key || ''}
                  readOnly
                  className="input pr-20 font-mono text-sm"
                />
                <button
                  onClick={copyApiKey}
                  className="absolute inset-y-0 right-0 px-3 flex items-center bg-primary-600 text-white rounded-r-lg hover:bg-primary-700"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Keep your API key secure and never share it publicly
              </p>
            </div>

            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-warning-800 mb-2">
                Security Best Practices:
              </h4>
              <ul className="text-xs text-warning-700 space-y-1">
                <li>• Store your API key in environment variables</li>
                <li>• Never commit API keys to version control</li>
                <li>• Use HTTPS for all API requests</li>
                <li>• Rotate your API key regularly</li>
                <li>• Monitor API usage for suspicious activity</li>
              </ul>
            </div>

            <button
              onClick={handleRefreshApiKey}
              disabled={refreshing}
              className="btn btn-warning flex items-center"
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Generate New API Key
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                API Usage:
              </h4>
              <p className="text-xs text-blue-700">
                Include your API key in the Authorization header: 
                <code className="block mt-1 bg-blue-100 p-1 rounded">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Statistics */}
      <div className="card mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {merchant?.created_at ? Math.floor((Date.now() - new Date(merchant.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
            </div>
            <div className="text-sm text-gray-500">Days Active</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-success-600 mb-1">
              {merchant?.api_key ? 'Active' : 'Inactive'}
            </div>
            <div className="text-sm text-gray-500">API Status</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-warning-600 mb-1">
              {webhookUrl ? 'Configured' : 'Not Set'}
            </div>
            <div className="text-sm text-gray-500">Webhook Status</div>
          </div>
        </div>
      </div>
    </div>
  )
}
