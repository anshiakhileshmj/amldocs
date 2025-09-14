import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import axios from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)

interface Merchant {
  id: string
  email: string
  company_name: string
  api_key: string
  webhook_url?: string
  is_active: boolean
  created_at: string
}

interface AuthContextType {
  merchant: Merchant | null
  loading: boolean
  login: (email: string, apiKey: string) => Promise<boolean>
  register: (email: string, companyName: string, webhookUrl?: string) => Promise<boolean>
  logout: () => void
  refreshApiKey: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [loading, setLoading] = useState(true)

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = Cookies.get('auth_token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setMerchant(response.data)
    } catch (error) {
      console.error('Auth check failed:', error)
      Cookies.remove('auth_token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, apiKey: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        api_key: apiKey
      })

      const { access_token } = response.data
      Cookies.set('auth_token', access_token, { expires: 7 })

      // Get merchant info
      const merchantResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      })

      setMerchant(merchantResponse.data)
      toast.success('Login successful!')
      return true
    } catch (error: any) {
      console.error('Login failed:', error)
      toast.error(error.response?.data?.detail || 'Login failed')
      return false
    }
  }

  const register = async (email: string, companyName: string, webhookUrl?: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        company_name: companyName,
        webhook_url: webhookUrl
      })

      toast.success('Registration successful! Please save your API key.')
      return true
    } catch (error: any) {
      console.error('Registration failed:', error)
      toast.error(error.response?.data?.detail || 'Registration failed')
      return false
    }
  }

  const logout = () => {
    setMerchant(null)
    Cookies.remove('auth_token')
    toast.success('Logged out successfully')
  }

  const refreshApiKey = async (): Promise<boolean> => {
    try {
      const token = Cookies.get('auth_token')
      if (!token) return false

      const response = await axios.post(`${API_URL}/auth/refresh-api-key`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setMerchant(response.data)
      toast.success('API key refreshed successfully!')
      return true
    } catch (error: any) {
      console.error('API key refresh failed:', error)
      toast.error(error.response?.data?.detail || 'Failed to refresh API key')
      return false
    }
  }

  const value = {
    merchant,
    loading,
    login,
    register,
    logout,
    refreshApiKey
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
