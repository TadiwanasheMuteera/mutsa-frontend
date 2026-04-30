import axiosInstance from './axios'

/**
 * Cases API Client
 * All endpoints follow the standard response format: { success, data, message }
 * All protected endpoints require Authorization: Bearer <access_token>
 */

export const casesAPI = {
  /**
   * Get paginated list of cases with optional filters
   * GET /api/cases?page=1&per_page=10&status=<optional>&fraud_type=<optional>
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.per_page - Items per page (default: 10)
   * @param {string} options.status - Filter by status (optional)
   * @param {string} options.fraud_type - Filter by fraud type (optional)
   * @returns {Promise<{cases: Array, total: number, page: number, per_page: number}>}
   */
  getCases: async (options = {}) => {
    const { page, per_page, status, fraud_type } = options || {}
    const params = {
      ...(page !== undefined ? { page } : {}),
      ...(per_page !== undefined ? { per_page } : {}),
      ...(status ? { status } : {}),
      ...(fraud_type ? { fraud_type } : {}),
    }
    
    const requestConfig = Object.keys(params).length > 0 ? { params } : undefined
    const response = await axiosInstance.get('/cases', requestConfig)
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    // Handle different response formats
    const cases = Array.isArray(data) ? data : (data.cases || [])
    
    return {
      cases: cases,
      total: data.total || cases.length,
      page: data.page || page || 1,
      per_page: data.per_page || per_page || cases.length,
    }
  },

  /**
   * Create a new case
   * POST /api/cases
   * @param {Object} caseData - Case data
   * @param {string} caseData.title - Case title (required)
   * @param {string} caseData.fraud_type - Fraud type (required)
   * @param {string} caseData.description - Case description (optional)
   * @param {string} caseData.suspect_info - Suspect information (optional)
   * @param {string} caseData.assigned_to - User ID assigned to (optional)
   * @returns {Promise<{id, case_number}>}
   */
  createCase: async (caseData) => {
    // Backend now auto-generates case_number. Never send any case/reference fields.
    const {
      case_number,
      caseNumber,
      reference_number,
      referenceNumber,
      referenceNo,
      reference_no,
      fraud_type,
      fraudType,
      suspect_info,
      suspectInfo,
      assigned_to,
      assignedTo,
      title,
      description,
    } = caseData || {}

    const payload = {
      title,
      fraud_type: fraud_type || fraudType,
      ...(description !== undefined ? { description } : {}),
      ...((suspect_info || suspectInfo) ? { suspect_info: suspect_info || suspectInfo } : {}),
      ...((assigned_to || assignedTo) ? { assigned_to: assigned_to || assignedTo } : {}),
    }

    const response = await axiosInstance.post('/cases', payload)
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    // Support both old and new response shapes:
    // - old: { data: { case: {...} } }
    // - new: { data: { id, case_number } }
    return data.case || data
  },

  /**
   * Get case details by ID
   * GET /api/cases/:caseId
   * @param {string} caseId - Case ID
   * @returns {Promise<{id, case_number, title, fraud_type, description, suspect_info, assigned_to, status, created_at, updated_at}>}
   */
  getCaseById: async (caseId) => {
    const response = await axiosInstance.get(`/cases/${caseId}`)
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    // Handle multiple response format variations from backend
    const caseData = data.case || data.data || data
    if (!caseData) {
      throw { response: { data: { message: 'Case data not found in response' } } }
    }
    return caseData
  },

  /**
   * Update case information
   * PUT /api/cases/:caseId
   * @param {string} caseId - Case ID
   * @param {Object} updates - Fields to update
   * @param {string} updates.title - Case title (optional)
   * @param {string} updates.description - Case description (optional)
   * @param {string} updates.suspect_info - Suspect information (optional)
   * @param {string} updates.assigned_to - User ID assigned to (optional)
   * @param {string} updates.fraud_type - Fraud type (optional)
   * @returns {Promise<{id, case_number, title, fraud_type, status, updated_at}>}
   */
  updateCase: async (caseId, updates) => {
    const response = await axiosInstance.put(`/cases/${caseId}`, updates)
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    return data.case
  },

  /**
   * Update case status
   * PUT /api/cases/:caseId/status
   * @param {string} caseId - Case ID
   * @param {string} status - New status
   * @param {string} reason - Reason for status change
   * @returns {Promise<{id, status, updated_at, reason}>}
   */
  updateCaseStatus: async (caseId, status, reason) => {
    const response = await axiosInstance.put(`/cases/${caseId}/status`, {
      status,
      reason,
    })
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    return data.status_update
  },

  /**
   * Get case timeline/history
   * GET /api/cases/:caseId/timeline
   * @param {string} caseId - Case ID
   * @returns {Promise<Array<{timestamp, action, user, description}>>}
   */
  getCaseTimeline: async (caseId) => {
    const response = await axiosInstance.get(`/cases/${caseId}/timeline`)
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    return data.timeline
  },

  /**
   * Delete a case (if permitted)
   * DELETE /api/cases/:caseId
   * @param {string} caseId - Case ID
   * @returns {Promise<{success, message}>}
   */
  deleteCase: async (caseId) => {
    const response = await axiosInstance.delete(`/cases/${caseId}`)
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
   * Get case statistics
   * GET /api/cases/:caseId/statistics
   * @param {string} caseId - Case ID
   * @returns {Promise<{total_evidence, total_custody_records, case_status, fraud_type}>}
   */
  getCaseStatistics: async (caseId) => {
    const response = await axiosInstance.get(`/cases/${caseId}/statistics`)
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    return data.statistics
  },

  /**
   * Search cases
   * GET /api/cases/search?q=<query>
   * @param {string} query - Search query
   * @returns {Promise<Array>}
   */
  searchCases: async (query) => {
    const response = await axiosInstance.get('/cases/search', {
      params: { q: query }
    })
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    return data.cases
  },
}
