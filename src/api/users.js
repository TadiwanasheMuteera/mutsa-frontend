import axiosInstance from './axios'

/**
 * Users API — ADMIN only.
 * POST /api/admin/users   — create a new user
 * GET  /api/admin/users   — list all users
 *
 * Falls back to an in-memory demo store when the backend is unreachable,
 * so the admin can still demo user creation without a live server.
 */

// ── In-memory demo store (resets on page refresh, good for prototype demo) ──
const DEMO_DB = [
  { id: 'u-1', full_name: 'Admin User',        email: 'admin@coc.gov',     role: 'ADMIN',        created_at: new Date().toISOString() },
  { id: 'u-2', full_name: 'John Investigator',  email: 'inv@coc.gov',       role: 'INVESTIGATOR', created_at: new Date().toISOString() },
  { id: 'u-3', full_name: 'Sarah Authorizer',   email: 'auth@coc.gov',      role: 'AUTHORIZER',   created_at: new Date().toISOString() },
  { id: 'u-4', full_name: 'Mike Auditor',       email: 'auditor@coc.gov',   role: 'AUDITOR',      created_at: new Date().toISOString() },
]

const isDemoUser = (record) =>
  DEMO_DB.some((d) => d.email === record.email || d.id === record.id)

export const usersAPI = {
  /**
   * Create a new user.
   * Payload: { full_name, email, password, role }
   * role must be one of: ADMIN | AUDITOR | INVESTIGATOR | AUTHORIZER
   */
  createUser: async (userData) => {
    try {
      const response = await axiosInstance.post('/admin/users', userData)
      const { success, data, message } = response.data
      if (!success) throw new Error(message || 'Failed to create user')
      // Also keep local demo list in sync so "Existing Users" panel refreshes
      const newUser = data?.user || data || { ...userData, id: `u-${Date.now()}`, created_at: new Date().toISOString() }
      if (!isDemoUser(newUser)) DEMO_DB.push(newUser)
      return newUser
    } catch (err) {
      // If backend is unreachable, simulate creation locally for demo
      if (!err?.response || err?.code === 'ERR_NETWORK' || err?.response?.status >= 500) {
        if (DEMO_DB.some((u) => u.email === userData.email)) {
          throw new Error('A user with that email already exists.')
        }
        const newUser = {
          id:         `u-${Date.now()}`,
          full_name:  userData.full_name,
          email:      userData.email,
          role:       userData.role,
          created_at: new Date().toISOString(),
        }
        DEMO_DB.push(newUser)
        return newUser
      }
      // Re-throw proper backend errors (400 validation, 409 duplicate, etc.)
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create user'
      throw new Error(message)
    }
  },

  /** List all users (paginated). */
  getUsers: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/admin/users', { params })
      const { success, data, message } = response.data
      if (!success) throw new Error(message || 'Failed to fetch users')
      return {
        users: data?.users || data?.items || (Array.isArray(data) ? data : []),
        total: data?.total || 0,
      }
    } catch (err) {
      // Fall back to local demo store when backend is unavailable
      if (!err?.response || err?.code === 'ERR_NETWORK' || err?.response?.status >= 500) {
        return { users: [...DEMO_DB], total: DEMO_DB.length }
      }
      const message = err?.response?.data?.message || err?.message || 'Failed to fetch users'
      throw new Error(message)
    }
  },
}
