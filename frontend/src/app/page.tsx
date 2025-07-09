'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { 
  Brain, 
  Zap, 
  Target, 
  BookOpen, 
  FileText, 
  Upload, 
  CheckCircle, 
  Star,
  ArrowRight,
  Sparkles,
  Timer,
  TrendingUp,
  Users,
  Shield,
  Clock,
  Menu,
  X
} from 'lucide-react'

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
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
        if (!isLogin) {
          // Store email for potential resend confirmation
          localStorage.setItem('lastRegisteredEmail', formData.email)
        }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Synth</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#features" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">Features</a>
                <a href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">Pricing</a>
                <button
                  onClick={() => {
                    setShowAuthModal(true)
                    setMobileMenuOpen(false)
                  }}
                  className="w-full text-left bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Learning Revolution
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Any Content Into
              <span className="text-blue-600 block">Smart Flashcards</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Upload documents, paste text, or describe any topic. Our AI creates comprehensive 
              flashcards instantly, then grades your answers with detailed feedback.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Start Learning Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">AI-Powered</div>
              <div className="text-gray-600">Flashcard Generation</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">Instant</div>
              <div className="text-gray-600">Smart Grading</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">PDF & Text</div>
              <div className="text-gray-600">File Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Learn Faster
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powered by advanced AI, Synth transforms your study materials into an intelligent learning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Generated Flashcards</h3>
              <p className="text-gray-600">
                Upload any document or paste text. Our AI analyzes content and creates comprehensive flashcards automatically.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8">
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Grading</h3>
              <p className="text-gray-600">
                Get instant feedback on your answers with AI-powered grading that understands context and partial credit.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8">
              <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Progress Tracking</h3>
              <p className="text-gray-600">
                Monitor your learning progress with detailed analytics and spaced repetition algorithms.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-8">
              <div className="bg-yellow-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">PDF & Text Support</h3>
              <p className="text-gray-600">
                Upload PDF documents or paste text directly. Transform any written content into flashcards.
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-8">
              <div className="bg-red-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Spaced Repetition</h3>
              <p className="text-gray-600">
                Scientifically-proven spaced repetition system adapts to your learning pace for maximum retention.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-8">
              <div className="bg-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Private</h3>
              <p className="text-gray-600">
                Your study materials and progress are encrypted and secure. Privacy-first approach to learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              From content to mastery in minutes, not hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Upload Content</h3>
              <p className="text-gray-600">
                Upload your PDFs, documents, or paste any text you want to study from.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. AI Creates Flashcards</h3>
              <p className="text-gray-600">
                Our AI analyzes your content and automatically generates comprehensive flashcards.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Study & Master</h3>
              <p className="text-gray-600">
                Study with intelligent feedback and track your progress as you master the material.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Affordable Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free, upgrade as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                $0<span className="text-lg text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>3 flashcard decks</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>50 cards per deck</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>PDF & text upload</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>AI grading</span>
                </li>
              </ul>
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Get Started Free
              </button>
            </div>

            <div className="bg-blue-600 rounded-xl p-8 shadow-lg text-white relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Basic</h3>
              <div className="text-4xl font-bold mb-6">
                $1<span className="text-lg text-blue-200">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-200 mr-3" />
                  <span>10 flashcard decks</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-200 mr-3" />
                  <span>Unlimited cards per deck</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-200 mr-3" />
                  <span>Progress tracking</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-200 mr-3" />
                  <span>Export to PDF</span>
                </li>
              </ul>
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Upgrade to Basic
              </button>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Pro</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                $5<span className="text-lg text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Unlimited decks</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Custom study modes</span>
                </li>
              </ul>
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start creating AI-powered flashcards from your study materials today.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Learning Free Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Brain className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">Synth</span>
              </div>
              <p className="text-gray-400">
                AI-powered flashcard generation for smarter studying.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Synth. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full relative">
            {/* Close Button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-600">
                {isLogin ? 'Sign in to your account' : 'Start your learning journey'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={submitting}
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={submitting}
              />
              
              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}
              
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                disabled={submitting}
              >
                {submitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                )}
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
              
              <div className="flex flex-col space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setError('')
                  }}
                  className="w-full text-blue-600 py-2 font-medium hover:text-blue-700 transition-colors"
                  disabled={submitting}
                >
                  {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                </button>
                
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAuthModal(false)
                      router.push('/forgot-password')
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    disabled={submitting}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}