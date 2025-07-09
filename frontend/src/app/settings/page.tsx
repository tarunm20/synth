'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { User, Settings, CreditCard, ArrowLeft, Check, Zap } from 'lucide-react'

interface SubscriptionStatus {
  tier: string
  limits: {
    maxDecks: number
    maxCardsPerDeck: number
    hasAdvancedFeatures: boolean
  }
  usage: {
    currentDecks: number
  }
}

interface PricingTier {
  price: number
  maxDecks: number | string
  maxCardsPerDeck: number | string
  features: string[]
}

interface PricingInfo {
  tiers: {
    FREE: PricingTier
    BASIC: PricingTier
    PRO: PricingTier
  }
}

export default function SettingsPage() {
  const { user, loading: authLoading, logout } = useAuth()
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [pricingInfo, setPricingInfo] = useState<PricingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/'
    }
  }, [user, authLoading])

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const [statusResponse, pricingResponse] = await Promise.all([
          api.get('/subscription/status'),
          api.get('/subscription/pricing')
        ])
        
        setSubscriptionStatus(statusResponse.data)
        setPricingInfo(pricingResponse.data)
      } catch (error) {
        console.error('Failed to fetch subscription data:', error)
        setError('Failed to load subscription information')
      } finally {
        setLoading(false)
      }
    }

    if (user && !authLoading) {
      fetchSubscriptionData()
    }
  }, [user, authLoading])

  const handleUpgrade = async (targetTier: string) => {
    setUpgrading(targetTier)
    setError('')
    setSuccess('')

    try {
      const response = await api.post('/subscription/upgrade', { tier: targetTier })
      setSuccess(`Successfully upgraded to ${response.data.newTier} tier!`)
      
      // Refresh subscription status
      const statusResponse = await api.get('/subscription/status')
      setSubscriptionStatus(statusResponse.data)
    } catch (error: any) {
      console.error('Upgrade failed:', error)
      setError(error.response?.data?.message || 'Failed to upgrade subscription')
    } finally {
      setUpgrading(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const currentTier = subscriptionStatus?.tier || 'FREE'
  const isCurrentTier = (tier: string) => tier === currentTier

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <a href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center mb-6">
            <Settings className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          </div>

          {/* User Information */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Account Information
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID</label>
                  <p className="mt-1 text-sm text-gray-900">{user.id}</p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Current Subscription */}
          {subscriptionStatus && (
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Current Subscription
              </h2>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">
                      {currentTier} Plan
                    </h3>
                    <p className="text-sm text-blue-700">
                      ${pricingInfo?.tiers[currentTier as keyof typeof pricingInfo.tiers]?.price || 0}/month
                    </p>
                  </div>
                  {currentTier !== 'FREE' && (
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Decks Used:</span>
                    <span className="ml-2 text-gray-900">
                      {subscriptionStatus.usage.currentDecks} / {
                        subscriptionStatus.limits.maxDecks === -1 ? '∞' : subscriptionStatus.limits.maxDecks
                      }
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Cards per Deck:</span>
                    <span className="ml-2 text-gray-900">
                      {subscriptionStatus.limits.maxCardsPerDeck === -1 ? 'Unlimited' : subscriptionStatus.limits.maxCardsPerDeck}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Advanced Features:</span>
                    <span className="ml-2 text-gray-900">
                      {subscriptionStatus.limits.hasAdvancedFeatures ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* Subscription Plans */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Subscription Plans
            </h2>
            
            {pricingInfo && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(pricingInfo.tiers).map(([tier, info]) => (
                  <div
                    key={tier}
                    className={`rounded-lg border-2 p-6 ${
                      isCurrentTier(tier)
                        ? 'border-blue-500 bg-blue-50'
                        : tier === 'BASIC'
                        ? 'border-yellow-300 bg-yellow-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {tier === 'BASIC' && (
                      <div className="text-center mb-4">
                        <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">{tier}</h3>
                      <div className="text-3xl font-bold text-gray-900 mt-2">
                        ${info.price}<span className="text-lg text-gray-600">/month</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        <span>
                          {typeof info.maxDecks === 'number' ? info.maxDecks : info.maxDecks} decks
                        </span>
                      </li>
                      <li className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        <span>
                          {typeof info.maxCardsPerDeck === 'number' 
                            ? `${info.maxCardsPerDeck} cards per deck` 
                            : `${info.maxCardsPerDeck} cards per deck`}
                        </span>
                      </li>
                      {info.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="w-4 h-4 text-green-600 mr-2" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="text-center">
                      {isCurrentTier(tier) ? (
                        <button className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg cursor-not-allowed">
                          Current Plan
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpgrade(tier.toLowerCase())}
                          disabled={upgrading === tier.toLowerCase()}
                          className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                            tier === 'BASIC'
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : tier === 'PRO'
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          }`}
                        >
                          {upgrading === tier.toLowerCase() ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Upgrading...
                            </div>
                          ) : (
                            `Upgrade to ${tier}`
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Processing Notice */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">Demo Mode</h3>
            <p className="text-sm text-yellow-700">
              This is a demonstration of the subscription system. In production, this would integrate with a payment processor like Stripe for secure payment handling.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}