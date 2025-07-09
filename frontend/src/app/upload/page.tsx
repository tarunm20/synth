'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { deckApi } from '@/lib/api'
import { Upload, FileText, ArrowLeft, Loader2, CheckCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function UploadPage() {
  const { user, loading: authLoading } = useAuth()
  const [uploadType, setUploadType] = useState<'file' | 'text'>('file')
  const [file, setFile] = useState<File | null>(null)
  const [textContent, setTextContent] = useState('')
  const [deckName, setDeckName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [subscriptionError, setSubscriptionError] = useState(false)
  const [deckId, setDeckId] = useState<number | null>(null)
  const [loadingMessage, setLoadingMessage] = useState('Creating your flashcards...')
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/'
    }
  }, [user, authLoading])


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !deckName) return

    setLoading(true)
    setError('')
    setSubscriptionError(false)
    setLoadingMessage('Creating your flashcards...')
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', deckName)
      formData.append('description', description)

      const response = await deckApi.createFromFile(formData)
      
      setSuccess(true)
      setDeckId(response.data.id)
      
      toast({
        title: "Deck created successfully!",
        description: "Your flashcards have been created successfully.",
        variant: "default",
      })
    } catch (error: any) {
      console.error('Upload failed:', error)
      if (error.response?.status === 402) {
        setSubscriptionError(true)
        setError(error.response.data?.message || 'Subscription limit reached. Please upgrade your plan.')
      } else if (error.response?.status === 503) {
        setError('AI service is temporarily overloaded. Please try again in a few minutes.')
        toast({
          title: "Service temporarily unavailable",
          description: "AI service is overloaded. Please try again in a few minutes.",
          variant: "destructive",
        })
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to create deck. Please try again.')
        toast({
          title: "Failed to create deck",
          description: error.response?.data?.message || error.message || 'Please try again.',
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTextUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!textContent || !deckName) return

    setLoading(true)
    setError('')
    setSubscriptionError(false)
    setLoadingMessage('Creating your flashcards...')
    
    try {
      const response = await deckApi.createFromText({
        name: deckName,
        description,
        content: textContent
      })
      
      setSuccess(true)
      setDeckId(response.data.id)
      
      toast({
        title: "Deck created successfully!",
        description: "Your flashcards have been created successfully.",
        variant: "default",
      })
    } catch (error: any) {
      console.error('Upload failed:', error)
      if (error.response?.status === 402) {
        setSubscriptionError(true)
        setError(error.response.data?.message || 'Subscription limit reached. Please upgrade your plan.')
      } else if (error.response?.status === 503) {
        setError('AI service is temporarily overloaded. Please try again in a few minutes.')
        toast({
          title: "Service temporarily unavailable",
          description: "AI service is overloaded. Please try again in a few minutes.",
          variant: "destructive",
        })
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to create deck. Please try again.')
        toast({
          title: "Failed to create deck",
          description: error.response?.data?.message || error.message || 'Please try again.',
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (success && deckId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-green-600" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Flashcards Created!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your flashcards have been generated successfully.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button asChild className="w-full">
                    <a href={`/study/${deckId}`}>
                      Start Studying
                    </a>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button asChild variant="outline" className="w-full">
                    <a href="/dashboard">
                      Back to Dashboard
                    </a>
                  </Button>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }


  const LoadingOverlay = () => (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Card className="max-w-sm mx-4">
              <CardContent className="pt-6">
                <div className="text-center">
                  <motion.div
                    className="relative mb-4"
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <Sparkles className="w-12 h-12 text-blue-600 mx-auto" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Creating Your Flashcards
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {loadingMessage}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <LoadingOverlay />
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" asChild>
              <a href="/dashboard" className="inline-flex items-center">
                <ArrowLeft size={20} className="mr-2" />
                Back to Dashboard
              </a>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                Create Flashcards
              </CardTitle>
              <CardDescription>
                Transform your content into smart study cards with AI
              </CardDescription>
            </CardHeader>
            <CardContent>

          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setUploadType('file')}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  uploadType === 'file' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Upload className="mx-auto mb-2" size={24} />
                <p className="font-medium">Upload File</p>
                <p className="text-sm text-gray-600">PDF, Word, Text files</p>
              </button>
              <button
                onClick={() => setUploadType('text')}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  uploadType === 'text' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <FileText className="mx-auto mb-2" size={24} />
                <p className="font-medium">Paste Text</p>
                <p className="text-sm text-gray-600">Copy and paste content</p>
              </button>
            </div>
          </div>

          {uploadType === 'file' ? (
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deck Name
                </label>
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="input"
                  placeholder="Enter deck name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input"
                  placeholder="Enter description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="input"
                  accept=".pdf,.doc,.docx,.txt"
                  required
                />
              </div>
              {error && (
                <div className={`p-4 rounded-lg ${subscriptionError ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`text-sm ${subscriptionError ? 'text-yellow-800' : 'text-red-800'}`}>
                    {error}
                  </p>
                  {subscriptionError && (
                    <div className="mt-2">
                      <a 
                        href="/settings" 
                        className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
                      >
                        Upgrade Plan
                      </a>
                    </div>
                  )}
                </div>
              )}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Flashcards...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Create Flashcards
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          ) : (
            <form onSubmit={handleTextUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deck Name
                </label>
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="input"
                  placeholder="Enter deck name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input"
                  placeholder="Enter description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="textarea h-48"
                  placeholder="Paste your content here..."
                  required
                />
              </div>
              {error && (
                <div className={`p-4 rounded-lg ${subscriptionError ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`text-sm ${subscriptionError ? 'text-yellow-800' : 'text-red-800'}`}>
                    {error}
                  </p>
                  {subscriptionError && (
                    <div className="mt-2">
                      <a 
                        href="/settings" 
                        className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
                      >
                        Upgrade Plan
                      </a>
                    </div>
                  )}
                </div>
              )}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Flashcards...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Create Flashcards
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          )}
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </div>
    </>
  )
}