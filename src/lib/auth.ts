import Cookies from 'js-cookie'
import { authAPI } from './api'

export const auth = {
  // Login user
  login: async (email: string, apiKey: string) => {
    try {
      const response = await authAPI.login({ email, api_key: apiKey })
      const { access_token } = response.data
      
      // Store tokens in cookies
      Cookies.set('auth_token', access_token, { expires: 7 }) // 7 days
      Cookies.set('api_key', apiKey, { expires: 7 })
      
      return { success: true, data: response.data }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      }
    }
  },

  // Register user
  register: async (email: string, companyName: string, webhookUrl: string = '') => {
    try {
      const response = await authAPI.register({
        email,
        company_name: companyName,
        webhook_url: webhookUrl
      })
      
      return { success: true, data: response.data }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      }
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await authAPI.getProfile()
      return { success: true, data: response.data }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to get profile' 
      }
    }
  },

  // Refresh API key
  refreshApiKey: async () => {
    try {
      const response = await authAPI.refreshApiKey()
      
      // Update stored API key
      Cookies.set('api_key', response.data.api_key, { expires: 7 })
      
      return { success: true, data: response.data }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to refresh API key' 
      }
    }
  },

  // Logout user
  logout: () => {
    Cookies.remove('auth_token')
    Cookies.remove('api_key')
    window.location.href = '/login'
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!Cookies.get('auth_token')
  },

  // Get stored API key
  getApiKey: () => {
    return Cookies.get('api_key')
  },

  // Get stored auth token
  getToken: () => {
    return Cookies.get('auth_token')
  }
}
