'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from './api'

interface User {
  id: number
  email: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    console.log('Auth context initializing...', { hasToken: !!token, hasUserData: !!userData, token, userData })
    
    if (token && userData && token !== 'undefined' && userData !== 'undefined') {
      try {
        const parsedUser = JSON.parse(userData)
        console.log('Restoring user from localStorage:', parsedUser)
        
        // Validate parsed user data
        if (parsedUser && parsedUser.id && parsedUser.email) {
          setUser(parsedUser)
          // Set the authorization header for all future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          console.log('Authorization header set:', `Bearer ${token.substring(0, 20)}...`)
        } else {
          console.error('Invalid user data structure:', parsedUser)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        // Invalid stored data, clear it
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    } else {
      // Clear any invalid data
      if (token === 'undefined' || userData === 'undefined') {
        console.log('Clearing invalid localStorage data')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login...')
      const response = await api.post('/auth/login', { email, password })
      const { token, user: userData } = response.data
      
      console.log('Login successful, storing data...', { token: token?.substring(0, 20) + '...', user: userData })
      
      // Validate data before storing
      if (!token || !userData) {
        console.error('Invalid response data:', { token: !!token, userData: !!userData })
        return false
      }
      
      // Store auth data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      console.log('Setting user state...', userData)
      setUser(userData)
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting registration...')
      const response = await api.post('/auth/register', { email, password })
      const { token, user: userData } = response.data
      
      console.log('Registration successful, storing data...', { token: token?.substring(0, 20) + '...', user: userData })
      
      // Validate data before storing
      if (!token || !userData) {
        console.error('Invalid response data:', { token: !!token, userData: !!userData })
        return false
      }
      
      // Store auth data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      console.log('Setting user state...', userData)
      setUser(userData)
      return true
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}