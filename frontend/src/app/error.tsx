'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">
          An unexpected error occurred while loading this page.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Refresh Page
          </button>
          <a
            href="/dashboard"
            className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Go to Dashboard
          </a>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Development)
            </summary>
            <pre className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}