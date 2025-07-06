export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="text-6xl font-bold text-blue-600 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-3">
          <a
            href="/dashboard"
            className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Dashboard
          </a>
          <a
            href="/"
            className="block w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  )
}