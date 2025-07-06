'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { deckApi, studyApi, DeckStats, StudyProgress } from '@/lib/api'
import { Plus, BookOpen, Target, TrendingUp, LogOut, Play, RotateCcw } from 'lucide-react'

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const [decks, setDecks] = useState<DeckStats[]>([])
  const [activeProgress, setActiveProgress] = useState<StudyProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      // Use a timeout to avoid redirect loops
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      return
    }
    if (user) {
      fetchData()
    }
  }, [user, authLoading])

  const fetchData = async () => {
    try {
      const [decksResponse, progressResponse] = await Promise.all([
        deckApi.getUserDecks(),
        studyApi.getActiveProgress()
      ])
      setDecks(decksResponse.data)
      setActiveProgress(progressResponse.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearProgress = async (deckId: number) => {
    try {
      await studyApi.clearProgress(deckId)
      setActiveProgress(prev => prev.filter(p => p.deck.id !== deckId))
    } catch (error) {
      console.error('Failed to clear progress:', error)
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

  const getMasteryColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-blue-600 bg-blue-50'
    if (score >= 40) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getMasteryLabel = (score: number) => {
    if (score >= 80) return 'Mastered'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Learning'
    return 'Beginner'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <LogOut size={20} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <BookOpen className="text-blue-600 mr-3" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{decks.length}</p>
                <p className="text-gray-600">Total Decks</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Target className="text-green-600 mr-3" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {decks.reduce((sum, deck) => sum + deck.cardCount, 0)}
                </p>
                <p className="text-gray-600">Total Cards</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <TrendingUp className="text-purple-600 mr-3" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {decks.length > 0 
                    ? Math.round(decks.reduce((sum, deck) => sum + deck.masteryScore, 0) / decks.length)
                    : 0}%
                </p>
                <p className="text-gray-600">Avg Mastery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resume Study Section */}
        {activeProgress.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Continue Studying</h2>
              <p className="text-gray-600">Pick up where you left off</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeProgress.map((progress) => (
                  <div
                    key={progress.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-medium text-gray-900 mb-2">{progress.deck.name}</h3>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{progress.cardsCompleted}/{progress.totalCards}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(progress.cardsCompleted / progress.totalCards) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={`/study/${progress.deck.id}?resume=true`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <Play size={16} className="mr-1" />
                        Resume
                      </a>
                      <button
                        onClick={() => handleClearProgress(progress.deck.id)}
                        className="bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-300 transition-colors flex items-center"
                      >
                        <RotateCcw size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Decks Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Your Flashcard Decks</h2>
              <a
                href="/upload"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus size={20} className="mr-2" />
                New Deck
              </a>
            </div>
          </div>

          <div className="p-6">
            {decks.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No flashcard decks yet</h3>
                <p className="text-gray-600 mb-6">Create your first deck to start studying</p>
                <a
                  href="/upload"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <Plus size={20} className="mr-2" />
                  Create Your First Deck
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {decks.map((deck) => (
                  <div
                    key={deck.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{deck.name}</h3>
                      {deck.description && (
                        <p className="text-gray-600 text-sm mb-3">{deck.description}</p>
                      )}
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <span>{deck.cardCount} cards</span>
                        {deck.lastStudied && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Last studied {new Date(deck.lastStudied).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Mastery Score */}
                    <div className={`px-3 py-2 rounded-lg mb-4 ${getMasteryColor(deck.masteryScore)}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{getMasteryLabel(deck.masteryScore)}</span>
                        <span className="font-bold">{deck.masteryScore}%</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <a
                        href={`/study/${deck.id}`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        Study
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}