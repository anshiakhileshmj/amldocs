import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { auth } from '../lib/auth'

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = auth.isAuthenticated()
    
    // If not on login/register page and not authenticated, redirect to login
    if (!isAuthenticated && !router.pathname.startsWith('/login') && !router.pathname.startsWith('/register')) {
      router.push('/login')
    } else {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <>
      <Component {...pageProps} />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  )
}
