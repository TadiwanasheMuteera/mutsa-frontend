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
      if (!err?.response || err?.code === 'ERR_NETWORK' || err?.response?.status >= 500) {
        return { users: [...DEMO_DB], total: DEMO_DB.length }
      }
      const message = err?.response?.data?.message || err?.message || 'Failed to fetch users'
      throw new Error(message)
    }
  },

  /** Delete a user by ID. */
  deleteUser: async (userId) => {
    try {
      const response = await axiosInstance.delete(`/admin/users/${userId}`)
      const { success, message } = response.data
      if (!success) throw new Error(message || 'Failed to delete user')
      const idx = DEMO_DB.findIndex((u) => u.id === userId)
      if (idx !== -1) DEMO_DB.splice(idx, 1)
      return { success: true }
    } catch (err) {
      if (!err?.response || err?.code === 'ERR_NETWORK' || err?.response?.status >= 500) {
        const idx = DEMO_DB.findIndex((u) => u.id === userId)
        if (idx === -1) throw new Error('User not found')
        DEMO_DB.splice(idx, 1)
        return { success: true }
      }
      throw new Error(err?.response?.data?.message || err?.message || 'Failed to delete user')
    }
  },

  /** Update a user's role (promote / demote). */
  updateUserRole: async (userId, newRole) => {
    try {
      const response = await axiosInstance.put(`/admin/users/${userId}/role`, { role: newRole })
      const { success, data, message } = response.data
      if (!success) throw new Error(message || 'Failed to update role')
      const user = DEMO_DB.find((u) => u.id === userId)
      if (user) user.role = newRole
      return data?.user || data || { id: userId, role: newRole }
    } catch (err) {
      if (!err?.response || err?.code === 'ERR_NETWORK' || err?.response?.status >= 500) {
        const user = DEMO_DB.find((u) => u.id === userId)
        if (!user) throw new Error('User not found')
        user.role = newRole
        return { ...user }
      }
      throw new Error(err?.response?.data?.message || err?.message || 'Failed to update role')
    }
  },
}
