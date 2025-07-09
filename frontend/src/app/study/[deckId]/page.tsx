'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { studyApi, Card, StudySession } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, BookOpen, CheckCircle, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function StudyPage({ params }: { params: { deckId: string } }) {
  const { user } = useAuth()
  const [cards, setCards] = useState<Card[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<StudySession | null>(null)
  const [loading, setLoading] = useState(false)
  const deckId = parseInt(params.deckId)

  useEffect(() => {
    if (user) {
      studyApi.getCardsForStudy(deckId)
        .then(response => setCards(response.data))
        .catch(console.error)
    }
  }, [user, deckId])

  const submitAnswer = async () => {
    if (!answer.trim()) return
    
    setLoading(true)
    try {
      const response = await studyApi.submitAnswer({
        cardId: cards[currentIndex].id,
        answer: answer
      })
      setResult(response.data)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setAnswer('')
      setResult(null)
    } else {
      window.location.href = '/dashboard'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <UICard className="p-6">
          <CardContent className="text-center">
            <p className="text-gray-600">Please log in to continue</p>
          </CardContent>
        </UICard>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cards...</p>
        </motion.div>
      </div>
    )
  }

  const card = cards[currentIndex]
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50'
    if (score >= 0.6) return 'text-blue-600 bg-blue-50'
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <Button variant="ghost" asChild className="p-2">
                <a href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-800">
                  <ArrowLeft size={20} className="mr-2" />
                  Back to Dashboard
                </a>
              </Button>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center text-gray-600">
                <BookOpen size={20} className="mr-2" />
                <span className="font-medium">Card {currentIndex + 1} of {cards.length}</span>
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-blue-500 h-2 rounded-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <UICard className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle className="text-xl text-gray-800">
                  {card.question}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-8">
                <AnimatePresence mode="wait">
                  {!result ? (
                    <motion.div
                      key="question"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Answer
                          </label>
                          <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Type your answer here..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                            rows={4}
                            disabled={loading}
                          />
                        </div>
                        
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={submitAnswer}
                            disabled={!answer.trim() || loading}
                            className="w-full h-12 text-lg"
                          >
                            {loading ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Submitting...
                              </div>
                            ) : (
                              'Submit Answer'
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-6">
                        {/* Score */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className={`p-6 rounded-lg border-2 ${getScoreColor(result.score)}`}
                        >
                          <div className="flex items-center justify-center space-x-3">
                            {result.score >= 0.7 ? (
                              <CheckCircle size={32} className="text-current" />
                            ) : (
                              <XCircle size={32} className="text-current" />
                            )}
                            <div className="text-center">
                              <div className="text-3xl font-bold">{Math.round(result.score * 100)}%</div>
                              <div className="text-sm opacity-80">Score</div>
                            </div>
                          </div>
                        </motion.div>

                        {/* Answers */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <UICard className="p-4 bg-blue-50 border-blue-200">
                              <h3 className="font-semibold text-blue-800 mb-2">Your Answer</h3>
                              <p className="text-gray-700">{answer}</p>
                            </UICard>
                          </motion.div>
                          
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <UICard className="p-4 bg-green-50 border-green-200">
                              <h3 className="font-semibold text-green-800 mb-2">Correct Answer</h3>
                              <p className="text-gray-700">{card.answer}</p>
                            </UICard>
                          </motion.div>
                        </div>

                        {/* AI Feedback */}
                        {result.feedback && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            <UICard className="p-4 bg-purple-50 border-purple-200">
                              <h3 className="font-semibold text-purple-800 mb-2">AI Feedback</h3>
                              <p className="text-gray-700">{result.feedback}</p>
                            </UICard>
                          </motion.div>
                        )}

                        {/* Next Button */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={nextCard}
                            className="w-full h-12 text-lg"
                            variant={currentIndex < cards.length - 1 ? "default" : "secondary"}
                          >
                            {currentIndex < cards.length - 1 ? 'Next Card' : 'Finish Study Session'}
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </UICard>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}