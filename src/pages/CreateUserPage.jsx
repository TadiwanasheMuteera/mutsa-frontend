import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'
import { usersAPI } from '../api/users'
import {
  ArrowLeft, UserPlus, CheckCircle2, AlertCircle,
  Eye, EyeOff, Users, ShieldCheck,
} from 'lucide-react'

const ROLE_OPTIONS = [
  { value: 'INVESTIGATOR', label: 'Investigator',  desc: 'Creates and manages cases',        color: 'bg-blue-100 text-blue-800'   },
  { value: 'AUTHORIZER',   label: 'Authorizer',    desc: 'Approves or rejects cases',        color: 'bg-amber-100 text-amber-800'  },
  { value: 'AUDITOR',      label: 'Auditor',       desc: 'Monitors system activity logs',    color: 'bg-green-100 text-green-800'  },
  { value: 'ADMIN',        label: 'Administrator', desc: 'Full system access and management',color: 'bg-purple-100 text-purple-800' },
]

export default function CreateUserPage() {
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()
  const [showPwd, setShowPwd]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess]       = useState(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { role: 'INVESTIGATOR' } })

  const selectedRole = watch('role')
  const password     = watch('password')

  // Existing users list
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn:  () => usersAPI.getUsers(),
    retry: 1,
  })
  const users = usersData?.users || usersData?.data || (Array.isArray(usersData) ? usersData : [])

  const createMutation = useMutation({
    mutationFn: (data) => usersAPI.createUser({
      full_name: data.full_name,
      email:     data.email,
      password:  data.password,
      role:      data.role,
    }),
    onSuccess: (data) => {
      setSuccess(data?.email || 'User')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      reset()
    },
  })

  const onSubmit = (data) => {
    setSuccess(null)
    createMutation.mutate(data)
  }

  const roleMeta = ROLE_OPTIONS.find((r) => r.value === selectedRole)

  return (
    <Layout>
      <div className="max-w-5xl">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-accent hover:text-accent/80 font-medium mb-6"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="bg-purple-100 p-2.5 rounded-xl">
            <UserPlus size={22} className="text-purple-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create User</h1>
            <p className="text-sm text-gray-500">Add a new system user and assign their role</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Form ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

              {success && (
                <div className="mb-5 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                  <CheckCircle2 size={18} className="flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">User created successfully</p>
                    <p className="text-xs">{success} can now log in.</p>
                  </div>
                </div>
              )}

              {createMutation.isError && (
                <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <p className="text-sm">{createMutation.error?.response?.data?.message || 'Failed to create user'}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* Full name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    {...register('full_name', { required: 'Full name is required' })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                    placeholder="e.g. John Doe"
                  />
                  {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                    placeholder="user@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
                  <select
                    {...register('role', { required: 'Role is required' })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm bg-white"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  {roleMeta && (
                    <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${roleMeta.color}`}>
                        {roleMeta.label}
                      </span>
                      {roleMeta.desc}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Minimum 8 characters' },
                      })}
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                      placeholder="Min 8 characters"
                    />
                    <button type="button" onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      {...register('confirm_password', {
                        required: 'Please confirm the password',
                        validate: (v) => v === password || 'Passwords do not match',
                      })}
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                      placeholder="Re-enter password"
                    />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
                </div>

                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 bg-accent text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {createMutation.isPending ? <><Spinner size="sm" /> Creating…</> : <><UserPlus size={16} /> Create User</>}
                  </button>
                  <button type="button" onClick={() => reset()}
                    className="px-5 border border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50">
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── Role reference + existing users ── */}
          <div className="space-y-4">
            {/* Role reference card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <ShieldCheck size={15} className="text-gray-400" /> Role Permissions
              </h3>
              <div className="space-y-3">
                {ROLE_OPTIONS.map((r) => (
                  <div key={r.value} className={`px-3 py-2 rounded-lg ${selectedRole === r.value ? 'ring-2 ring-accent' : ''}`}>
                    <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mb-1 ${r.color}`}>
                      {r.label}
                    </span>
                    <p className="text-xs text-gray-500">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Existing users */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Users size={15} className="text-gray-400" /> Existing Users
              </h3>
              {usersLoading ? (
                <div className="flex justify-center py-4"><Spinner /></div>
              ) : users.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">No users yet</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {users.map((u, i) => (
                    <div key={u.id || i} className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
                        {(u.full_name || u.name || u.email || '?')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-800 truncate">{u.full_name || u.name || u.email}</p>
                        <p className="text-[10px] text-gray-400 uppercase">{u.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}
