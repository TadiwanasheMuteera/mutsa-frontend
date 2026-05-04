import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { authAPI } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { DEMO_USERS, ROLE_CARDS } from '../api/mockAuth'
import Spinner from '../components/ui/Spinner'
import { normalizeRole } from '../utils/rbac'
import { CheckCircle2, Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react'

// ── helper ──────────────────────────────────────────────────────────────────
// Try live backend first; fall back to demo users if backend is unreachable
async function doLogin(identifier, password) {
  // Check demo credentials first (username or email)
  const demo = DEMO_USERS[identifier] || DEMO_USERS[identifier.toLowerCase()]
  if (demo && demo.password === password) {
    return {
      accessToken:  demo.accessToken,
      refreshToken: demo.refreshToken,
      user:         demo.user,
      _demo:        true,
    }
  }

  // Otherwise hit the real backend
  return authAPI.login(identifier, password)
}

// ── Role card component ──────────────────────────────────────────────────────
function RoleCard({ card, onQuickLogin, loading }) {
  const [open, setOpen] = useState(false)
  return (
    <button
      type="button"
      onClick={() => { setOpen((v) => !v); onQuickLogin(card.username, card.password) }}
      disabled={loading}
      className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all disabled:opacity-50 ${card.bg}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${card.badge}`}>
            {card.label}
          </span>
          {loading && <Spinner size="sm" />}
        </div>
        <Zap size={13} className="text-gray-400" />
      </div>
      <p className="text-xs text-gray-500 mt-1 leading-snug">{card.desc}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {card.can.map((item) => (
          <span key={item} className="flex items-center gap-1 text-[10px] text-gray-500">
            <CheckCircle2 size={9} className="text-gray-400" /> {item}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[10px] font-mono text-gray-400">
        Click to log in as {card.label}
      </p>
    </button>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate       = useNavigate()
  const { setAuth }    = useAuthStore()
  const [showPwd, setShowPwd]       = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [quickLoading, setQuickLoading] = useState(null) // role being quick-logged

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { identifier: '', password: '' },
  })

  const loginMutation = useMutation({
    mutationFn: ({ identifier, password }) => doLogin(identifier, password),
    onSuccess: (data) => {
      const role = normalizeRole(data?.user?.role)
      setAuth(data.accessToken, data.refreshToken, { ...data.user, role })
      setQuickLoading(null)
      navigate('/home')
    },
    onError: (error) => {
      setQuickLoading(null)
      const msg =
        error?.message ||
        error?.response?.data?.message ||
        'Login failed. Please check your credentials.'
      setGeneralError(msg)
    },
  })

  const onSubmit = (data) => {
    setGeneralError('')
    loginMutation.mutate({ identifier: data.identifier, password: data.password })
  }

  const handleQuickLogin = (username, password) => {
    setGeneralError('')
    setQuickLoading(username)
    setValue('identifier', username)
    setValue('password', password)
    loginMutation.mutate({ identifier: username, password })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── Left: Login form ── */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo / title */}
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary p-2.5 rounded-xl">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">COC Tracker</h1>
              <p className="text-xs text-gray-400">Chain of Custody Evidence System</p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6 mt-3">
            Sign in to access the system. Your role determines what you can see and do.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {generalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {generalError}
              </div>
            )}

            {/* Username / email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Username or Email
              </label>
              <input
                type="text"
                autoComplete="username"
                {...register('identifier', { required: 'Username or email is required' })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                placeholder="admin  or  user@example.com"
              />
              {errors.identifier && (
                <p className="text-red-500 text-xs mt-1">{errors.identifier.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password', { required: 'Password is required' })}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginMutation.isPending && !quickLoading
                ? <><Spinner size="sm" /> Signing in…</>
                : 'Sign In'
              }
            </button>
          </form>

          {/* Quick credentials reference */}
          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_CARDS.map((c) => (
                <div key={c.role} className="text-xs">
                  <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full mb-0.5 ${c.badge}`}>
                    {c.label}
                  </span>
                  <p className="font-mono text-gray-500">
                    {c.username} / {c.password}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Role cards (quick login) ── */}
        <div className="space-y-3">
          <div className="mb-4">
            <h2 className="text-white font-bold text-lg">Quick Login</h2>
            <p className="text-white/60 text-sm">Click any role to log in instantly</p>
          </div>

          {ROLE_CARDS.map((card) => (
            <RoleCard
              key={card.role}
              card={card}
              loading={quickLoading === card.username && loginMutation.isPending}
              onQuickLogin={handleQuickLogin}
            />
          ))}

          <p className="text-white/40 text-xs text-center pt-2">
            {import.meta.env.VITE_API_URL
              ? `Backend: ${import.meta.env.VITE_API_URL}`
              : 'Running in demo mode'}
          </p>
        </div>

      </div>
    </div>
  )
}
