'use client'

import { useSession as useNextAuthSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export function useSession() {
  const nextAuthSession = useNextAuthSession()
  const [mockSession, setMockSession] = useState<any>(null)

  useEffect(() => {
    // Only check for mock session in development
    if (process.env.NODE_ENV === 'development') {
      const checkMockSession = () => {
        const stored = localStorage.getItem('mock-session')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            // Check if session is expired
            if (new Date(parsed.expires) > new Date()) {
              setMockSession(parsed)
              return
            } else {
              // Session expired, remove it
              localStorage.removeItem('mock-session')
            }
          } catch (e) {
            // Invalid session, remove it
            localStorage.removeItem('mock-session')
          }
        }
        setMockSession(null)
      }

      checkMockSession()

      // Listen for storage changes (for cross-tab sync)
      window.addEventListener('storage', checkMockSession)
      return () => window.removeEventListener('storage', checkMockSession)
    }
  }, [])

  // In development, return mock session if available
  if (process.env.NODE_ENV === 'development' && mockSession) {
    return {
      data: mockSession,
      status: 'authenticated' as const,
      update: nextAuthSession.update
    }
  }

  // Otherwise return normal NextAuth session
  return nextAuthSession
}
