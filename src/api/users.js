import axiosInstance from './axios'

/**
 * Users API — ADMIN only.
 * POST /api/users          — create a new user
 * GET  /api/users          — list all users
 * GET  /api/users/:id      — get a single user
 */
export const usersAPI = {
  /**
   * Create a new user.
   * Payload: { full_name, email, password, role }
   * role must be one of: ADMIN | AUDITOR | INVESTIGATOR | AUTHORIZER
   */
  createUser: async (userData) => {
    const response = await axiosInstance.post('/users', userData)
    const { success, data, message } = response.data
    if (!success) throw { response: { data: { message } } }
    return data
  },

  /** List all users (paginated). */
  getUsers: async (params = {}) => {
    const response = await axiosInstance.get('/users', { params })
    const { success, data, message } = response.data
    if (!success) throw { response: { data: { message } } }
    return data
  },
}
