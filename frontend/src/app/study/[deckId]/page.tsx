'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { studyApi, Card, StudySession, StudyProgress } from '@/lib/api'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'

export default function StudyPage({ params }: { params: { deckId: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isResume = searchParams.get('resume') === 'true'
  
  const [cards, setCards] = useState<Card[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [currentResult, setCurrentResult] = useState<StudySession | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [sessionResults, setSessionResults] = useState<StudySession[]>([])
  const [showResumeDialog, setShowResumeDialog] = useState(false)
  const [existingProgress, setExistingProgress] = useState<StudyProgress | null>(null)
  const [totalCompleted, setTotalCompleted] = useState(0)
  const deckId = parseInt(params.deckId)

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/'
      return
    }
    if (user) {
      initializeStudy()
    }
  }, [deckId, user, authLoading])

  const initializeStudy = async () => {
    try {
      // Fetch cards and check for existing progress
      const [cardsResponse, progressResponse] = await Promise.all([
        studyApi.getCardsForStudy(deckId),
        studyApi.getProgress(deckId).catch(() => ({ data: null }))
      ])
      
      setCards(cardsResponse.data)
      
      if (progressResponse.data && !progressResponse.data.isCompleted) {
        setExistingProgress(progressResponse.data)
        setTotalCompleted(progressResponse.data.cardsCompleted)
        if (isResume) {
          // Resume from saved progress
          setCurrentCardIndex(progressResponse.data.currentCardIndex)
          setSessionResults(Array(progressResponse.data.cardsCompleted).fill(null)) // Placeholder for completed cards
        } else if (!isResume) {
          // Show dialog asking if user wants to resume or restart
          setShowResumeDialog(true)
        }
      }
    } catch (error) {
      console.error('Failed to initialize study:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProgress = async () => {
    try {
      await studyApi.saveProgress(deckId, {
        currentCardIndex,
        totalCards: cards.length,
        cardsCompleted: sessionResults.length,
        isCompleted: sessionComplete
      })
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  const handleResumeChoice = (resume: boolean) => {
    if (resume && existingProgress) {
      setCurrentCardIndex(existingProgress.currentCardIndex)
      setSessionResults(Array(existingProgress.cardsCompleted).fill(null))
      setTotalCompleted(existingProgress.cardsCompleted)
    } else {
      // Clear existing progress and start fresh
      studyApi.clearProgress(deckId).catch(console.error)
      setTotalCompleted(0)
    }
    setShowResumeDialog(false)
  }

  // Removed handleShowAnswer - users now answer first

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return

    setSubmitting(true)
    try {
      const response = await studyApi.submitAnswer({
        cardId: cards[currentCardIndex].id,
        answer: userAnswer,
      })
      setCurrentResult(response.data)
      setSessionResults(prev => [...prev, response.data])
      setTotalCompleted(prev => prev + 1)
      setShowResult(true)
    } catch (error) {
      console.error('Failed to submit answer:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleNextCard = async () => {
    if (currentCardIndex < cards.length - 1) {
      const nextCardIndex = currentCardIndex + 1
      setCurrentCardIndex(nextCardIndex)
      resetCardState()
      // Save progress after each card with the correct next card index
      await studyApi.saveProgress(deckId, {
        currentCardIndex: nextCardIndex,
        totalCards: cards.length,
        cardsCompleted: totalCompleted,
        isCompleted: false
      })
    } else {
      setSessionComplete(true)
      // Mark as completed
      await studyApi.saveProgress(deckId, {
        currentCardIndex: cards.length,
        totalCards: cards.length,
        cardsCompleted: totalCompleted,
        isCompleted: true
      })
    }
  }

  const resetCardState = () => {
    setUserAnswer('')
    setShowResult(false)
    setCurrentResult(null)
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50'
    if (score >= 0.6) return 'text-blue-600 bg-blue-50'
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getScoreIcon = (score: number) => {
    return score >= 0.6 ? (
      <CheckCircle className="inline mr-2" size={20} />
    ) : (
      <XCircle className="inline mr-2" size={20} />
    )
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Resume dialog
  if (showResumeDialog && existingProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Continue Studying?</h2>
          <p className="text-gray-600 mb-2">
            You have progress saved for this deck.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {existingProgress.cardsCompleted} of {existingProgress.totalCards} cards completed
          </p>
          <div className="space-y-3">
            <button
              onClick={() => handleResumeChoice(true)}
              className="btn-primary w-full"
            >
              Resume from where I left off
            </button>
            <button
              onClick={() => handleResumeChoice(false)}
              className="btn-secondary w-full"
            >
              Start over
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (sessionComplete) {
    const averageScore = sessionResults.reduce((sum, result) => sum + result.score, 0) / sessionResults.length
    const correctAnswers = sessionResults.filter(result => result.score >= 0.6).length

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Study Session Complete!
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Cards Studied</h3>
              <p className="text-3xl font-bold text-blue-600">{cards.length}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Correct Answers</h3>
              <p className="text-3xl font-bold text-green-600">{correctAnswers}</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Average Score</h3>
              <p className="text-3xl font-bold text-purple-600">{Math.round(averageScore * 100)}%</p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary px-8 py-3"
            >
              Study Again
            </button>
            <div>
              <a
                href="/dashboard"
                className="btn-secondary px-8 py-3 inline-block"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No cards to study
          </h2>
          <p className="text-gray-600 mb-6">
            This deck doesn't have any flashcards available for study.
          </p>
          <a href="/dashboard" className="btn-primary">
            Back to Dashboard
          </a>
        </div>
      </div>
    )
  }

  const currentCard = cards[currentCardIndex]

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="text-gray-600 hover:text-gray-800">
                <ArrowLeft size={24} />
              </a>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Study Session</h1>
                <p className="text-gray-600">
                  Card {currentCardIndex + 1} of {cards.length} • {totalCompleted} completed
                </p>
              </div>
            </div>
            <div className="w-48 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(totalCompleted / cards.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="card max-w-2xl mx-auto min-h-96 flex flex-col justify-center">
          {!showResult && (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-blue-600 mb-6">Answer this Question</h3>
              <p className="text-lg text-gray-800 mb-8 leading-relaxed">
                {currentCard.question}
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Answer:
                  </label>
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="textarea min-h-32"
                    disabled={submitting}
                  />
                </div>
                
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim() || submitting}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  {submitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  )}
                  {submitting ? 'Grading Answer...' : 'Submit Answer'}
                </button>
              </div>
            </div>
          )}

          {showResult && currentResult && (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-blue-600 mb-6">Your Score</h3>
              
              {/* Score Display */}
              <div className={`p-6 rounded-lg mb-6 ${getScoreColor(currentResult.score)}`}>
                <div className="flex items-center justify-center mb-4">
                  {getScoreIcon(currentResult.score)}
                  <span className="text-3xl font-bold">
                    {Math.round(currentResult.score * 100)}%
                  </span>
                </div>
                <p className="text-sm opacity-75">
                  AI Confidence: {Math.round(currentResult.confidence * 100)}%
                </p>
              </div>

              {/* Answer Comparison */}
              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-left">
                  <h4 className="font-semibold text-blue-800 mb-2">Your Answer:</h4>
                  <p className="text-blue-700">
                    {currentResult.response}
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg text-left">
                  <h4 className="font-semibold text-green-800 mb-2">Correct Answer:</h4>
                  <p className="text-green-700">
                    {currentCard.answer}
                  </p>
                </div>
                
                {currentResult.feedback && (
                  <div className="bg-purple-50 p-4 rounded-lg text-left">
                    <h4 className="font-semibold text-purple-800 mb-2">AI Feedback:</h4>
                    <p className="text-purple-700">
                      {currentResult.feedback}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleNextCard}
                className="btn-primary px-8 py-3"
              >
                {currentCardIndex < cards.length - 1 ? 'Next Card' : 'Finish Session'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}