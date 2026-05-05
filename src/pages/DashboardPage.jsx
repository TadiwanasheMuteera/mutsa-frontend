import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import { useAuthStore } from '../store/authStore'
import { usersAPI } from '../api/users'
import {
  Users, UserPlus, ShieldCheck, Trash2, ArrowUpDown,
  AlertCircle, CheckCircle2, Search, WifiOff,
} from 'lucide-react'

const ROLE_OPTIONS = ['ADMIN', 'INVESTIGATOR', 'AUTHORIZER', 'AUDITOR']

const ROLE_STYLES = {
  ADMIN:        { bg: 'bg-purple-100 text-purple-800 border-purple-300', dot: 'bg-purple-500' },
  INVESTIGATOR: { bg: 'bg-blue-100 text-blue-800 border-blue-300',     dot: 'bg-blue-500'   },
  AUTHORIZER:   { bg: 'bg-amber-100 text-amber-800 border-amber-300',  dot: 'bg-amber-500'  },
  AUDITOR:      { bg: 'bg-green-100 text-green-800 border-green-300',  dot: 'bg-green-500'  },
}

function RoleBadge({ role }) {
  const style = ROLE_STYLES[role] || ROLE_STYLES.AUDITOR
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {role}
    </span>
  )
}

function getInitials(name) {
  if (!name) return 'U'
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || 'U'
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [promoteTarget, setPromoteTarget] = useState(null)
  const [newRole, setNewRole] = useState('')

  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getUsers(),
    retry: 1,
  })

  const allUsers = usersData?.users || usersData?.data || (Array.isArray(usersData) ? usersData : [])
  const usingMock = allUsers.length > 0 && allUsers[0]?.id?.startsWith?.('u-')

  const deleteMutation = useMutation({
    mutationFn: (userId) => usersAPI.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setDeleteTarget(null)
    },
  })

  const promoteMutation = useMutation({
    mutationFn: ({ userId, role }) => usersAPI.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setPromoteTarget(null)
      setNewRole('')
    },
  })

  const filtered = allUsers.filter((u) => {
    const matchesSearch =
      !searchTerm ||
      (u.full_name || u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !roleFilter || (u.role || '').toUpperCase() === roleFilter
    return matchesSearch && matchesRole
  })

  const roleCounts = ROLE_OPTIONS.reduce((acc, role) => {
    acc[role] = allUsers.filter((u) => (u.role || '').toUpperCase() === role).length
    return acc
  }, {})

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck size={24} className="text-purple-600" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage system users — create, delete, and assign roles
          </p>
        </div>

        {(usingMock || error) && (
          <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-xl text-sm">
            <WifiOff size={14} />
            <span>
              <strong>Demo mode</strong> — backend not connected. Changes are local only.
            </span>
          </div>
        )}

        {/* Role stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {ROLE_OPTIONS.map((role) => {
            const style = ROLE_STYLES[role]
            return (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(roleFilter === role ? '' : role)}
                className={`bg-white rounded-xl border p-5 text-left transition-all ${
                  roleFilter === role ? 'ring-2 ring-accent border-accent' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{role}</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">{roleCounts[role]}</p>
              </button>
            )
          })}
        </div>

        {/* Actions bar */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <button
            onClick={() => navigate('/users/new')}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-accent/90"
          >
            <UserPlus size={16} /> Create New User
          </button>
          <button
            onClick={() => navigate('/admin/access-log')}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50"
          >
            <ShieldCheck size={16} /> View Access Log
          </button>

          <div className="flex-1" />

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email…"
              className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent w-64"
            />
          </div>

          {roleFilter && (
            <button
              onClick={() => setRoleFilter('')}
              className="text-xs text-accent hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Users table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Users size={18} className="text-gray-500" />
              System Users
              <span className="text-sm font-normal text-gray-400">({filtered.length})</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Spinner />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-sm text-gray-400">
                      {searchTerm || roleFilter ? 'No users match the current filters.' : 'No users found.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => {
                    const name = u.full_name || u.name || u.email || 'Unknown'
                    const role = (u.role || 'UNKNOWN').toUpperCase()
                    const avatarStyle = ROLE_STYLES[role] || ROLE_STYLES.AUDITOR
                    const isSelf = u.id === user?.id

                    return (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold ${avatarStyle.bg}`}>
                              {getInitials(name)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{name}</p>
                              {isSelf && (
                                <span className="text-[10px] text-gray-400 font-medium">(You)</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{u.email || '—'}</td>
                        <td className="px-6 py-4">
                          <RoleBadge role={role} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {u.created_at
                            ? new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => { setPromoteTarget(u); setNewRole(role) }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                              title="Change role"
                            >
                              <ArrowUpDown size={12} /> Role
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(u)}
                              disabled={isSelf}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title={isSelf ? 'Cannot delete yourself' : 'Delete user'}
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete confirmation modal */}
        {deleteTarget && (
          <Modal onClose={() => { setDeleteTarget(null); deleteMutation.reset() }}>
            <div className="p-6 max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-2.5 rounded-xl">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Delete User</h3>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                Are you sure you want to delete <strong>{deleteTarget.full_name || deleteTarget.name || deleteTarget.email}</strong>?
              </p>
              <p className="text-xs text-gray-400 mb-5">
                This action cannot be undone. The user will lose all access to the system.
              </p>

              {deleteMutation.isError && (
                <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  <AlertCircle size={14} />
                  {deleteMutation.error?.message || 'Failed to delete user'}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(deleteTarget.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteMutation.isPending ? <Spinner size="sm" /> : <Trash2 size={14} />}
                  Delete User
                </button>
                <button
                  type="button"
                  onClick={() => { setDeleteTarget(null); deleteMutation.reset() }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Change role modal */}
        {promoteTarget && (
          <Modal onClose={() => { setPromoteTarget(null); setNewRole(''); promoteMutation.reset() }}>
            <div className="p-6 max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2.5 rounded-xl">
                  <ArrowUpDown size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Change Role</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Update the role for <strong>{promoteTarget.full_name || promoteTarget.name || promoteTarget.email}</strong>
              </p>

              <div className="space-y-2 mb-5">
                {ROLE_OPTIONS.map((role) => {
                  const style = ROLE_STYLES[role]
                  const isCurrentRole = (promoteTarget.role || '').toUpperCase() === role
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setNewRole(role)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all ${
                        newRole === role
                          ? 'ring-2 ring-accent border-accent bg-accent/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`h-3 w-3 rounded-full ${style.dot}`} />
                      <span className="text-sm font-semibold text-gray-900">{role}</span>
                      {isCurrentRole && (
                        <span className="ml-auto text-[10px] text-gray-400 font-medium">Current</span>
                      )}
                    </button>
                  )
                })}
              </div>

              {promoteMutation.isSuccess && (
                <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
                  <CheckCircle2 size={14} /> Role updated successfully
                </div>
              )}
              {promoteMutation.isError && (
                <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  <AlertCircle size={14} />
                  {promoteMutation.error?.message || 'Failed to update role'}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => promoteMutation.mutate({ userId: promoteTarget.id, role: newRole })}
                  disabled={promoteMutation.isPending || newRole === (promoteTarget.role || '').toUpperCase()}
                  className="flex-1 bg-accent text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-accent/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {promoteMutation.isPending ? <Spinner size="sm" /> : <ArrowUpDown size={14} />}
                  Update Role
                </button>
                <button
                  type="button"
                  onClick={() => { setPromoteTarget(null); setNewRole(''); promoteMutation.reset() }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  )
}
