'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { deckApi } from '@/lib/api'
import { Upload, FileText, ArrowLeft } from 'lucide-react'

export default function UploadPage() {
  const { user, loading: authLoading } = useAuth()
  const [uploadType, setUploadType] = useState<'file' | 'text'>('file')
  const [file, setFile] = useState<File | null>(null)
  const [textContent, setTextContent] = useState('')
  const [deckName, setDeckName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [deckId, setDeckId] = useState<number | null>(null)

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
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', deckName)
      formData.append('description', description)

      const response = await deckApi.createFromFile(formData)
      setSuccess(true)
      setDeckId(response.data.id)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTextUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!textContent || !deckName) return

    setLoading(true)
    try {
      const response = await deckApi.createFromText({
        name: deckName,
        description,
        content: textContent
      })
      setSuccess(true)
      setDeckId(response.data.id)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (success && deckId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md mx-auto text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Flashcards Created!
            </h2>
            <p className="text-gray-600">
              Your flashcards have been generated successfully.
            </p>
          </div>
          <div className="space-y-3">
            <a
              href={`/study/${deckId}`}
              className="btn-primary w-full inline-block"
            >
              Start Studying
            </a>
            <a
              href="/dashboard"
              className="btn-secondary w-full inline-block"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <a href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </a>
        </div>

        <div className="card">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Create Flashcards
          </h1>

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
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Creating Flashcards...' : 'Create Flashcards'}
              </button>
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
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Creating Flashcards...' : 'Create Flashcards'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}