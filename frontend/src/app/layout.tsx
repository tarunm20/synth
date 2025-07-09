import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Synth - AI-Powered Flashcard Generator | Transform Content into Smart Study Cards',
  description: 'Create comprehensive flashcards instantly from any content with AI. Upload PDFs, paste text, get intelligent grading, and track progress with spaced repetition.',
  keywords: 'flashcards, AI learning, study tool, spaced repetition, flashcard generator, education technology, smart studying',
  openGraph: {
    title: 'Synth - AI-Powered Flashcard Generator',
    description: 'Transform any content into smart flashcards with AI. Upload documents, get instant flashcards, and study with intelligent feedback.',
    url: 'https://synth-flashcards.com',
    siteName: 'Synth',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Synth AI Flashcard Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Synth - AI-Powered Flashcard Generator',
    description: 'Transform any content into smart flashcards with AI. Start learning faster today.',
    images: ['/twitter-image.png'],
    creator: '@synthflashcards',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Synth",
              "applicationCategory": "EducationalApplication",
              "description": "AI-powered flashcard generator that transforms any content into smart study cards with intelligent grading and progress tracking.",
              "url": "https://synth-flashcards.com",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              },
              "creator": {
                "@type": "Organization",
                "name": "Synth",
                "url": "https://synth-flashcards.com"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <main className="min-h-screen">
              {children}
            </main>
            <Toaster />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}