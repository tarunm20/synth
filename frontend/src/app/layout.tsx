import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Flashcard Generator',
  description: 'AI-powered flashcard generation and study tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <main className="min-h-screen">
              {children}
            </main>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}