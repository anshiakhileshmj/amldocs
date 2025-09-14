import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { auth } from '../lib/auth'
import toast from 'react-hot-toast'

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


  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = auth.getToken()
      if (!token) {
        setLoading(false)
        return
      }

      const result = await auth.getProfile()
      if (result.success) {
        setMerchant(result.data)
      } else {
        auth.logout()
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      auth.logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, apiKey: string): Promise<boolean> => {
    const result = await auth.login(email, apiKey)
    
    if (result.success) {
      // Get merchant info
      const profileResult = await auth.getProfile()
      if (profileResult.success) {
        setMerchant(profileResult.data)
        toast.success('Login successful!')
        return true
      }
    }
    
    toast.error(result.error || 'Login failed')
    return false
  }

  const register = async (email: string, companyName: string, webhookUrl?: string): Promise<boolean> => {
    const result = await auth.register(email, companyName, webhookUrl || '')
    
    if (result.success) {
      toast.success('Registration successful! Please save your API key.')
      return true
    }
    
    toast.error(result.error || 'Registration failed')
    return false
  }

  const logout = () => {
    setMerchant(null)
    auth.logout()
    toast.success('Logged out successfully')
  }

  const refreshApiKey = async (): Promise<boolean> => {
    const result = await auth.refreshApiKey()
    
    if (result.success) {
      setMerchant(result.data)
      toast.success('API key refreshed successfully!')
      return true
    }
    
    toast.error(result.error || 'Failed to refresh API key')
    return false
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
