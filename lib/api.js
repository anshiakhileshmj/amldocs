import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      Cookies.remove('auth_token')
      Cookies.remove('api_key')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  refreshApiKey: () => api.post('/auth/refresh-api-key'),
  deactivate: () => api.post('/auth/deactivate'),
}

// Payments API
export const paymentsAPI = {
  create: (data) => api.post('/payments/create', data),
  get: (paymentId) => api.get(`/payments/${paymentId}`),
  list: (params = {}) => api.get('/payments/', { params }),
  update: (paymentId, data) => api.put(`/payments/${paymentId}`, data),
  verify: (paymentId, txHash) => api.post(`/payments/${paymentId}/verify`, { tx_hash: txHash }),
  refund: (paymentId) => api.post(`/payments/${paymentId}/refund`),
  getStatus: (paymentId) => api.get(`/payments/${paymentId}/status`),
}

// Wallets API
export const walletsAPI = {
  create: (data) => api.post('/wallets/create', data),
  list: (params = {}) => api.get('/wallets/', { params }),
  get: (walletId) => api.get(`/wallets/${walletId}`),
  getBalance: (walletId, token) => api.get(`/wallets/${walletId}/balance`, { params: { token } }),
  getAllBalances: (walletId) => api.get(`/wallets/${walletId}/balances`),
  getAllBalancesAll: () => api.get('/wallets/balances/all'),
  activate: (walletId) => api.post(`/wallets/${walletId}/activate`),
  deactivate: (walletId) => api.post(`/wallets/${walletId}/deactivate`),
}

// Transactions API
export const transactionsAPI = {
  list: (params = {}) => api.get('/transactions/', { params }),
  get: (txHash) => api.get(`/transactions/${txHash}`),
  refresh: (txHash) => api.post(`/transactions/${txHash}/refresh`),
  getStats: (params = {}) => api.get('/transactions/stats/summary', { params }),
  checkPending: () => api.get('/transactions/pending/check'),
}

// Payouts API
export const payoutsAPI = {
  create: (data) => api.post('/payouts/create', data),
  execute: (payoutId) => api.post(`/payouts/${payoutId}/execute`),
  list: (params = {}) => api.get('/payouts/', { params }),
  get: (payoutId) => api.get(`/payouts/${payoutId}`),
  batch: (data) => api.post('/payouts/batch', data),
  getStats: (params = {}) => api.get('/payouts/stats/summary', { params }),
}

// Webhooks API
export const webhooksAPI = {
  test: () => api.post('/webhooks/test'),
  getLogs: (params = {}) => api.get('/webhooks/logs', { params }),
  retry: (logId) => api.post(`/webhooks/retry/${logId}`),
  getSupportedEvents: () => api.get('/webhooks/events/supported'),
}

// Merchants API
export const merchantsAPI = {
  getProfile: () => api.get('/merchants/profile'),
  updateProfile: (data) => api.put('/merchants/profile', data),
  getStats: () => api.get('/merchants/stats'),
}

export default api
