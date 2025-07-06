'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { User, LogOut } from 'lucide-react'

export default function HomePage() {
  const { user, login, register, logout, loading } = useAuth()
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const success = isLogin 
        ? await login(formData.email, formData.password)
        : await register(formData.email, formData.password)

      if (success) {
        // Redirect to dashboard after successful login/register
        router.push('/dashboard')
      } else {
        setError(isLogin ? 'Invalid email or password' : 'Registration failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render anything if user is logged in (useEffect handles redirect)
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <div className="mb-6">
            <User size={48} className="mx-auto text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Flashcard Generator
            </h1>
            <p className="text-gray-600">
              AI-powered flashcard generation and study tool
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="input"
              required
              disabled={submitting}
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="input"
              required
              disabled={submitting}
            />
            
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            
            <button 
              type="submit" 
              className="btn-primary w-full flex items-center justify-center"
              disabled={submitting}
            >
              {submitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              )}
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="btn-secondary w-full"
              disabled={submitting}
            >
              {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}