import axiosInstance from './axios'

/**
 * Auth API Client
 * All endpoints follow the standard response format: { success, data, message }
 * All protected endpoints require Authorization: Bearer <access_token>
 */

export const authAPI = {
  /**
   * Login with email and password
   * POST /api/auth/login
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{accessToken, refreshToken, user}>}
   */
  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { 
      email, 
      password 
    })
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      user: data.user,
    }
  },

  /**
   * Register new user
   * POST /api/auth/register
   * @param {Object} userData - User registration data
   * @param {string} userData.employee_number - Employee number
   * @param {string} userData.full_name - Full name
   * @param {string} userData.email - Email address
   * @param {string} userData.phone - Phone number (optional)
   * @param {string} userData.role - User role (optional)
   * @param {string} userData.password - Password
   * @returns {Promise<{accessToken, refreshToken, user}>}
   */
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData)
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      user: data.user,
    }
  },

  /**
   * Refresh access token using refresh token
   * POST /api/auth/refresh
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<{accessToken}>}
   */
  refreshToken: async (refreshToken) => {
    const response = await axiosInstance.post('/auth/refresh', { 
      refresh_token: refreshToken 
    })
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    return {
      accessToken: data.access_token,
    }
  },

  /**
   * Get current user profile
   * GET /api/auth/me
   * @returns {Promise<{id, employee_number, full_name, email, phone, role, is_active}>}
   */
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me')
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    return data.user
  },

  /**
   * Change password
   * PUT /api/auth/change-password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<{success, message}>}
   */
  changePassword: async (currentPassword, newPassword) => {
    const response = await axiosInstance.put('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    return {
      success,
      message,
    }
  },

  /**
   * Logout
   * POST /api/auth/logout
   * @returns {Promise<{success, message}>}
   */
  logout: async () => {
    try {
      const response = await axiosInstance.post('/auth/logout')
      const { success, message } = response.data
      return { success, message }
    } catch (error) {
      // Still logout locally even if API fails
      return { success: true, message: 'Logged out' }
    }
  },
}
