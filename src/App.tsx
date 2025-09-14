import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Payments from './pages/Payments'
import Wallets from './pages/Wallets'
import Transactions from './pages/Transactions'
import Payouts from './pages/Payouts'
import Webhooks from './pages/Webhooks'
import Profile from './pages/Profile'

function App() {
  const { merchant, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        merchant ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />
      } />
      <Route path="/payments" element={
        merchant ? <Layout><Payments /></Layout> : <Navigate to="/login" />
      } />
      <Route path="/wallets" element={
        merchant ? <Layout><Wallets /></Layout> : <Navigate to="/login" />
      } />
      <Route path="/transactions" element={
        merchant ? <Layout><Transactions /></Layout> : <Navigate to="/login" />
      } />
      <Route path="/payouts" element={
        merchant ? <Layout><Payouts /></Layout> : <Navigate to="/login" />
      } />
      <Route path="/webhooks" element={
        merchant ? <Layout><Webhooks /></Layout> : <Navigate to="/login" />
      } />
      <Route path="/analytics" element={
        merchant ? <Layout><div className="p-6"><h1 className="text-2xl font-semibold">Analytics</h1><p className="text-slate-600">Advanced analytics coming soon...</p></div></Layout> : <Navigate to="/login" />
      } />
      <Route path="/api-keys" element={
        merchant ? <Layout><div className="p-6"><h1 className="text-2xl font-semibold">API Keys</h1><p className="text-slate-600">API key management coming soon...</p></div></Layout> : <Navigate to="/login" />
      } />
      <Route path="/profile" element={
        merchant ? <Layout><Profile /></Layout> : <Navigate to="/login" />
      } />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
