import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { normalizeRole } from '../utils/rbac'

const normalizeUser = (user) => {
  if (!user) return null

  return {
    ...user,
    name: user.name || user.full_name || user.fullName || user.email || 'User',
    role: normalizeRole(user.role) || null,
  }
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isInitialized: false,

      setAuth: (accessToken, refreshToken, user) => {
        set({ 
          accessToken, 
          refreshToken, 
          user: normalizeUser(user), 
          isAuthenticated: !!accessToken 
        })
      },

      setAccessToken: (accessToken) => {
        set({ 
          accessToken, 
          isAuthenticated: !!accessToken 
        })
      },

      logout: () => {
        set({ 
          accessToken: null, 
          refreshToken: null, 
          user: null, 
          isAuthenticated: false 
        })
      },

      // Alias used by components that follow the simpler clearAuth() convention
      clearAuth: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        })
      },

      updateUser: (user) => set({ user: normalizeUser(user) }),

      setInitialized: (isInitialized) => set({ isInitialized }),

      // Convenience getters
      getToken:        () => get().accessToken,
      getRefreshToken: () => get().refreshToken,
      getRole:         () => get().user?.role ?? null,
      isLoggedIn:      () => get().isAuthenticated,
    }),
    {
      name: 'auth-storage',
    }
  )
)
