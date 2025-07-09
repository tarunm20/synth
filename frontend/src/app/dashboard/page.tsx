'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { deckApi, studyApi, subscriptionApi, DeckStats, StudyProgress } from '@/lib/api'
import { Plus, BookOpen, Target, TrendingUp, LogOut, Play, RotateCcw, Settings, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteDeckDialog } from '@/components/delete-deck-dialog'
import { SubscriptionLimitDialog } from '@/components/subscription-limit-dialog'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [decks, setDecks] = useState<DeckStats[]>([])
  const [activeProgress, setActiveProgress] = useState<StudyProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [limitDialog, setLimitDialog] = useState<{
    isOpen: boolean
    currentTier: string
    maxDecks: number
    message: string
  }>({
    isOpen: false,
    currentTier: '',
    maxDecks: 0,
    message: ''
  })

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

  const handleDeleteDeck = async (deckId: number) => {
    setDeleting(deckId)
    try {
      await deckApi.deleteDeck(deckId)
      setDecks(prev => prev.filter(deck => deck.id !== deckId))
      setActiveProgress(prev => prev.filter(p => p.deck.id !== deckId))
      
      toast({
        title: "Deck deleted",
        description: "The flashcard deck has been permanently deleted.",
        variant: "destructive",
      })
    } catch (error) {
      console.error('Failed to delete deck:', error)
      toast({
        title: "Error",
        description: "Failed to delete deck. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const handleNewDeck = async () => {
    try {
      const response = await subscriptionApi.canCreateDeck()
      const data = response.data
      
      if (data.canCreate) {
        // User can create a deck, redirect to upload page
        window.location.href = '/upload'
      } else {
        // Show subscription limit dialog
        setLimitDialog({
          isOpen: true,
          currentTier: data.currentTier || 'FREE',
          maxDecks: data.maxDecks || 3,
          message: data.message || 'You have reached your deck limit.'
        })
      }
    } catch (error) {
      console.error('Failed to check subscription limits:', error)
      // If API fails, still allow deck creation (fail open)
      window.location.href = '/upload'
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
            <div className="flex items-center space-x-3">
              <a
                href="/settings"
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Settings size={20} className="mr-2" />
                Settings
              </a>
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
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="text-blue-600 mr-3"
                >
                  <BookOpen size={24} />
                </motion.div>
                <div>
                  <motion.p 
                    className="text-2xl font-bold text-gray-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    {decks.length}
                  </motion.p>
                  <p className="text-gray-600">Total Decks</p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="text-green-600 mr-3"
                >
                  <Target size={24} />
                </motion.div>
                <div>
                  <motion.p 
                    className="text-2xl font-bold text-gray-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    {decks.reduce((sum, deck) => sum + deck.cardCount, 0)}
                  </motion.p>
                  <p className="text-gray-600">Total Cards</p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="text-purple-600 mr-3"
                >
                  <TrendingUp size={24} />
                </motion.div>
                <div>
                  <motion.p 
                    className="text-2xl font-bold text-gray-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    {decks.length > 0 
                      ? Math.round(decks.reduce((sum, deck) => sum + deck.masteryScore, 0) / decks.length)
                      : 0}%
                  </motion.p>
                  <p className="text-gray-600">Avg Mastery</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Resume Study Section */}
        {activeProgress.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Continue Studying</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeProgress.map((progress, index) => (
                    <motion.div
                      key={progress.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <Card className="p-4">
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
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                        <Button asChild size="sm" className="w-full">
                          <a href={`/study/${progress.deck.id}?resume=true`} className="flex items-center justify-center">
                            <Play size={16} className="mr-1" />
                            Resume
                          </a>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleClearProgress(progress.deck.id)}
                          className="px-3"
                        >
                          <RotateCcw size={16} />
                        </Button>
                      </motion.div>
                    </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Decks Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Your Flashcard Decks</CardTitle>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={handleNewDeck}>
                    <Plus size={20} className="mr-2" />
                    New Deck
                  </Button>
                </motion.div>
              </div>
            </CardHeader>

            <CardContent>
            {decks.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No flashcard decks yet</h3>
                <p className="text-gray-600 mb-6">Create your first deck to start studying</p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild size="lg">
                    <a href="/upload" className="inline-flex items-center">
                      <Plus size={20} className="mr-2" />
                      Create Your First Deck
                    </a>
                  </Button>
                </motion.div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {decks.map((deck) => (
                  <motion.div
                    key={deck.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: deck.id * 0.1 }}
                  >
                    <Card className="h-full p-6">
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
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                        <Button asChild className="w-full">
                          <a href={`/study/${deck.id}`}>
                            Study
                          </a>
                        </Button>
                      </motion.div>
                      <DeleteDeckDialog
                        deckName={deck.name}
                        cardCount={deck.cardCount}
                        isDeleting={deleting === deck.id}
                        onDelete={() => handleDeleteDeck(deck.id)}
                      />
                    </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Subscription Limit Dialog */}
      <SubscriptionLimitDialog
        isOpen={limitDialog.isOpen}
        onClose={() => setLimitDialog(prev => ({ ...prev, isOpen: false }))}
        currentTier={limitDialog.currentTier}
        maxDecks={limitDialog.maxDecks}
        message={limitDialog.message}
      />
    </div>
  )
}