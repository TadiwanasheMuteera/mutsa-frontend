import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { getNavigate } from '../store/navigation'

// VITE_API_URL  — preferred: backend URL with or without trailing /api
//   e.g. https://web-production-xxx.up.railway.app/api
//   e.g. https://web-production-xxx.up.railway.app      (also works — /api appended below)
// VITE_API_BASE_URL — legacy: server root, /api appended automatically
// In development Vite proxies /api → the backend, so we use a relative base URL.
const VITE_API_URL      = import.meta.env.VITE_API_URL
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Normalise: strip trailing slashes, then ensure the URL always ends with /api.
// This means both  https://host.railway.app  and  https://host.railway.app/api  work.
const normaliseUrl = (url) => {
  if (!url) return null
  const stripped = url.replace(/\/+$/, '')            // remove trailing slashes
  return stripped.endsWith('/api') ? stripped : `${stripped}/api`
}

const CONFIGURED_API_BASE_URL =
  normaliseUrl(VITE_API_URL) ??
  (VITE_API_BASE_URL ? `${VITE_API_BASE_URL.replace(/\/+$/, '')}/api` : 'http://localhost:5000/api')

// Dev: empty string so Vite proxy handles /api/* without CORS issues.
// Prod (Vercel): use the configured backend URL directly.
const BASE_URL = import.meta.env.DEV ? '' : CONFIGURED_API_BASE_URL

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  isRefreshing = false
  failedQueue = []
}

// Demo tokens are issued by the local mock-auth and will always be rejected
// by the real backend. Detect them so we can skip the refresh/logout cycle.
const isDemoToken = (token) =>
  typeof token === 'string' && token.startsWith('demo_')

// Request interceptor to add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    // GET and DELETE requests carry no body — remove Content-Type so the
    // backend does not interpret them as malformed JSON requests (400).
    const method = config.method?.toLowerCase()
    if (method === 'get' || method === 'delete') {
      delete config.headers['Content-Type']
    }

    // Multipart uploads need the boundary auto-set by the browser.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling and token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config

    // Auth endpoints (login, register, refresh) must never trigger the
    // token-refresh / logout cycle — pass their errors straight through
    // so the calling page can show the real backend message.
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh')

    if (error.response?.status === 401 && isAuthEndpoint) {
      isRefreshing = false
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Invalid email or password.'
      return Promise.reject({ message: backendMessage, status: 401 })
    }

    // Handle 401 on protected endpoints — Try to refresh token once
    if (error.response?.status === 401 && !originalRequest._retry) {
      const currentToken = useAuthStore.getState().accessToken

      // Demo tokens will always be rejected by a real backend.
      // Never attempt a refresh or force a logout — just let the
      // calling page show its empty/mock state.
      if (isDemoToken(currentToken)) {
        return Promise.reject({
          message: 'Demo mode: live backend not connected.',
          status: 401,
          isDemo: true,
        })
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosInstance(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = useAuthStore.getState().refreshToken
      
      if (refreshToken && !isDemoToken(refreshToken)) {
        return axiosInstance
          .post('/auth/refresh', { refresh_token: refreshToken })
          .then(res => {
            const { success, data } = res.data
            if (success && data.access_token) {
              useAuthStore.getState().setAccessToken(data.access_token)
              originalRequest.headers.Authorization = `Bearer ${data.access_token}`
              processQueue(null, data.access_token)
              return axiosInstance(originalRequest)
            }
          })
          .catch(err => {
            processQueue(err, null)
            console.log('Token refresh failed, logging out')
            useAuthStore.getState().logout()
            const nav = getNavigate()
            if (nav) {
              nav('/login')
            } else {
              window.location.href = '/login'
            }
            return Promise.reject(err)
          })
      } else {
        // No real refresh token — clear auth and redirect to login
        console.log('No refresh token available, logging out')
        useAuthStore.getState().logout()
        const nav = getNavigate()
        if (nav) {
          nav('/login')
        } else {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    }

    // Handle 400, 403, 404, 409 — surface the full backend error message.
    if ([400, 403, 404, 409].includes(error.response?.status)) {
      const responseData = error.response?.data || {}
      // Backends vary: message / error / detail / errors[0].msg
      const backendMessage =
        responseData.message ||
        responseData.error ||
        responseData.detail ||
        (Array.isArray(responseData.errors) && responseData.errors[0]?.msg) ||
        error.message ||
        `Request failed with status ${error.response.status}`

      console.error(
        `[API ${error.response.status}] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`,
        responseData
      )

      return Promise.reject({
        message: backendMessage,
        status: error.response.status,
        data: responseData,
      })
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: `Backend unreachable at ${BASE_URL || CONFIGURED_API_BASE_URL}. Please check if the server is running.`,
        status: 'NETWORK_ERROR',
      })
    }

    // Return other errors as-is
    return Promise.reject(error)
  }
)

export default axiosInstance
