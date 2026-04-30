/**
 * Typed Axios Instance
 * Central configuration with interceptors
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'
import { ApiResponse, ApiError } from './types'

interface TokenRefreshQueue {
  resolve: (token: string) => void
  reject: (error: Error) => void
}

let isRefreshing = false
let failedQueue: TokenRefreshQueue[] = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await axios.post(
          `${import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        )

        const newAccessToken = response.data.data.access_token
        localStorage.setItem('accessToken', newAccessToken)
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        processQueue(null, newAccessToken)

        return apiClient(originalRequest)
      } catch (err) {
        processQueue(err as Error, null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    const apiError: ApiError = {
      message: (error.response?.data as any)?.message || error.message || 'Error',
      statusCode: error.response?.status,
      error: (error.response?.data as any)?.error,
    }

    return Promise.reject(apiError)
  }
)

export default apiClient
