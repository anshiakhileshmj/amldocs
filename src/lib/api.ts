import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

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
  register: (data: { email: string; company_name: string; webhook_url?: string }) => 
    api.post('/auth/register', data),
  login: (data: { email: string; api_key: string }) => 
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  refreshApiKey: () => api.post('/auth/refresh-api-key'),
  deactivate: () => api.post('/auth/deactivate'),
}

// Payments API
export const paymentsAPI = {
  create: (data: {
    chain: string;
    token: string;
    amount: string;
    recipient_address: string;
    description?: string;
    expires_in?: number;
  }) => api.post('/payments/create', data),
  get: (paymentId: string) => api.get(`/payments/${paymentId}`),
  list: (params: any = {}) => api.get('/payments/', { params }),
  update: (paymentId: string, data: any) => api.put(`/payments/${paymentId}`, data),
  verify: (paymentId: string, txHash: string) => 
    api.post(`/payments/${paymentId}/verify`, { tx_hash: txHash }),
  refund: (paymentId: string) => api.post(`/payments/${paymentId}/refund`),
  getStatus: (paymentId: string) => api.get(`/payments/${paymentId}/status`),
}

// Wallets API
export const walletsAPI = {
  create: (data: { chain: string; address?: string }) => 
    api.post('/wallets/create', data),
  list: (params: any = {}) => api.get('/wallets/', { params }),
  get: (walletId: string) => api.get(`/wallets/${walletId}`),
  getBalance: (walletId: string, token: string) => 
    api.get(`/wallets/${walletId}/balance`, { params: { token } }),
  getAllBalances: (walletId: string) => api.get(`/wallets/${walletId}/balances`),
  getAllBalancesAll: () => api.get('/wallets/balances/all'),
  activate: (walletId: string) => api.post(`/wallets/${walletId}/activate`),
  deactivate: (walletId: string) => api.post(`/wallets/${walletId}/deactivate`),
}

// Transactions API
export const transactionsAPI = {
  list: (params: any = {}) => api.get('/transactions/', { params }),
  get: (txHash: string) => api.get(`/transactions/${txHash}`),
  refresh: (txHash: string) => api.post(`/transactions/${txHash}/refresh`),
  getStats: (params: any = {}) => api.get('/transactions/stats/summary', { params }),
  checkPending: () => api.get('/transactions/pending/check'),
}

// Payouts API
export const payoutsAPI = {
  create: (data: {
    chain: string;
    token: string;
    amount: string;
    recipient_address: string;
    description?: string;
  }) => api.post('/payouts/create', data),
  execute: (payoutId: string) => api.post(`/payouts/${payoutId}/execute`),
  list: (params: any = {}) => api.get('/payouts/', { params }),
  get: (payoutId: string) => api.get(`/payouts/${payoutId}`),
  batch: (data: { payouts: any[] }) => api.post('/payouts/batch', data),
  getStats: (params: any = {}) => api.get('/payouts/stats/summary', { params }),
}

// Webhooks API
export const webhooksAPI = {
  test: () => api.post('/webhooks/test'),
  getLogs: (params: any = {}) => api.get('/webhooks/logs', { params }),
  retry: (logId: string) => api.post(`/webhooks/retry/${logId}`),
  getSupportedEvents: () => api.get('/webhooks/events/supported'),
}

// Merchants API
export const merchantsAPI = {
  getProfile: () => api.get('/merchants/profile'),
  updateProfile: (data: { company_name?: string; webhook_url?: string }) => 
    api.put('/merchants/profile', data),
  getStats: () => api.get('/merchants/stats'),
}

export default api
