import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { CreditCard, ArrowLeft, Copy, Check, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const success = await register(email, companyName, webhookUrl || undefined)
    if (success) {
      // In a real app, you'd get the API key from the response
      // For demo purposes, we'll show a placeholder
      setApiKey('sk_live_' + Math.random().toString(36).substr(2, 40))
      setShowApiKey(true)
    }
    
    setLoading(false)
  }

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    toast.success('API key copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-500 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <CreditCard className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Start accepting stablecoin payments today
          </p>
        </div>

        {/* Registration Form */}
        <div className="card">
          {!showApiKey ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="merchant@example.com"
                />
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="input"
                  placeholder="My Store Inc."
                />
              </div>

              <div>
                <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL (Optional)
                </label>
                <input
                  id="webhookUrl"
                  name="webhookUrl"
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="input"
                  placeholder="https://my-store.com/webhooks"
                />
                <p className="mt-1 text-xs text-gray-500">
                  We'll send payment notifications to this URL
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary flex justify-center items-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-100 mb-4">
                  <Check className="h-6 w-6 text-success-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Account Created Successfully!
                </h3>
                <p className="text-sm text-gray-600">
                  Your API key has been generated. Please save it securely.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your API Key
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={apiKey}
                    readOnly
                    className="input pr-20 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={copyApiKey}
                    className="absolute inset-y-0 right-0 px-3 flex items-center bg-primary-600 text-white rounded-r-lg hover:bg-primary-700"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-danger-600">
                  ⚠️ Save this API key securely. You won't be able to see it again.
                </p>
              </div>

              <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-warning-800 mb-2">
                  Next Steps:
                </h4>
                <ul className="text-xs text-warning-700 space-y-1">
                  <li>• Save your API key in a secure location</li>
                  <li>• Use this key to authenticate API requests</li>
                  <li>• Check our documentation for integration examples</li>
                  <li>• Set up webhooks for real-time notifications</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <Link to="/login" className="flex-1 btn btn-primary">
                  Sign In
                </Link>
                <a
                  href="/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 btn btn-secondary"
                >
                  View Docs
                </a>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/login" className="w-full btn btn-secondary flex justify-center">
                Sign In Instead
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-primary-600 hover:text-primary-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary-600 hover:text-primary-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
