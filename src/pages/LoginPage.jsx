import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { authAPI } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import Spinner from '../components/ui/Spinner'
import { normalizeRole } from '../utils/rbac'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      roleOverride: 'AUDITOR',
    },
  })
  const [generalError, setGeneralError] = useState('')

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => authAPI.login(email, password),
    onSuccess: (data, variables) => {
      const selectedRole = normalizeRole(variables?.roleOverride)
      const backendRole = normalizeRole(data?.user?.role)
      const role = import.meta.env.DEV ? (selectedRole || backendRole) : backendRole
      const user = {
        ...(data.user || {}),
        role: role || null,
      }

      setAuth(data.accessToken, data.refreshToken, user)
      navigate('/home')
    },
    onError: (error) => {
      let errorMessage = 'Login failed. Please try again.'

      // Axios interceptor already normalizes auth-endpoint errors to { message, status }
      if (error?.status === 401 || error?.response?.status === 401) {
        errorMessage =
          error?.message ||
          error?.response?.data?.message ||
          'Incorrect email or password. Please check your credentials and try again.'
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (!error?.response) {
        errorMessage = `Backend unreachable at ${import.meta.env.VITE_API_BASE_URL || 'http://172.16.14.54:5000'}. Please check if the server is running.`
      }

      setGeneralError(errorMessage)
    },
  })

  const onSubmit = (data) => {
    setGeneralError('')
    loginMutation.mutate(data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">COC Tracker</h1>
          <p className="text-gray-600 text-sm mt-2">Chain of Custody Evidence Management</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {generalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {generalError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Login as role (prototype)
            </label>
            <select
              {...register('roleOverride')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="AUDITOR">AUDITOR</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              For prototype testing only. Backend-assigned role should be used in production.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-accent text-white py-2 rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loginMutation.isPending ? (
              <>
                <Spinner size="sm" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-2">
            Access Levels
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
              ADMIN
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              AUDITOR
            </span>
          </div>
          <p className="text-xs text-amber-800 mt-2">
            Your permissions are determined by the role assigned to your account.
          </p>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Connected to backend at: {import.meta.env.VITE_API_BASE_URL || 'http://172.16.14.54:5000'}
        </p>
      </div>
    </div>
  )
}

