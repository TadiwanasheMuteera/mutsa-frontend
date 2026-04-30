/**
 * Typed Authentication API Client
 */

import apiClient from './apiClient'
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  User,
  RegisterRequest,
  ChangePasswordRequest,
} from './types'

export const authApi = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      credentials
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data
  },

  /**
   * Register new user
   */
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/register',
      data
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{ access_token: string }> => {
    const response = await apiClient.post<ApiResponse<{ access_token: string }>>(
      '/auth/refresh',
      {},
      { headers: { Authorization: `Bearer ${refreshToken}` } }
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me')
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    const response = await apiClient.put<ApiResponse<void>>('/auth/change-password', data)
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
  },

  /**
   * Logout (client-side)
   */
  logout: (): void => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },
}
