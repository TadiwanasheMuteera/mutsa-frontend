import { useEffect } from 'react'
import { useAuthStore } from './authStore'
import { authAPI } from '../api/auth'

/**
 * Initialize auth on app startup
 * - Rehydrate tokens from localStorage (Zustand persist does this)
 * - Verify token is still valid by calling /api/auth/me
 * - If token invalid, clear it and keep user on login
 * - If token valid, keep user logged in
 */
export function useAuthInit() {
  const { accessToken, isInitialized, setInitialized, logout } = useAuthStore()

  useEffect(() => {
    const initializeAuth = async () => {
      // Tokens will be rehydrated from localStorage automatically by Zustand persist
      // Check if we have a token and verify it's still valid
      if (accessToken) {
        try {
          // Call /api/auth/me to verify token
          await authAPI.getCurrentUser()
          // Token is valid, we're logged in
        } catch (error) {
          // Token is invalid or expired, clear it
          console.log('Auth token invalid, clearing auth state')
          logout()
        }
      }

      setInitialized(true)
    }

    if (!isInitialized) {
      initializeAuth()
    }
  }, [isInitialized, setInitialized, logout])

  return isInitialized
}
