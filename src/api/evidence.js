import axiosInstance from './axios'

/**
 * Evidence API Client
 * All endpoints follow the standard response format: { success, data, message }
 * File uploads use multipart/form-data
 */

export const evidenceAPI = {
  /**
   * Get all evidence across all cases
   * GET /api/evidence
   * @returns {Promise<Array<{id, evidence_type, file_name, collected_by, collection_date, status}>>}
   */
  getAllEvidence: async () => {
    const response = await axiosInstance.get('/evidence')
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    // Handle multiple response format variations from backend
    const evidence = data.evidence || data.evidences || data.items || []
    return Array.isArray(evidence) ? evidence : []
  },

  /**
   * Get all evidence for a case
   * GET /api/evidence/cases/:caseId/evidence
   * @param {string} caseId - Case ID
   * @returns {Promise<Array<{id, evidence_type, file_name, collected_by, collection_date, status}>>}
   */
  getEvidenceByCaseId: async (caseId) => {
    const response = await axiosInstance.get(`/evidence/cases/${caseId}/evidence`)
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    // Handle multiple response format variations from backend
    const evidence = data.evidence || data.evidences || data.items || []
    return Array.isArray(evidence) ? evidence : []
  },

  /**
   * Create new evidence with file upload
   * POST /api/evidence/cases/:caseId/evidence
   * Content-Type: multipart/form-data
   * @param {string} caseId - Case ID
   * @param {Object} evidenceData - Evidence data
   * @param {File} evidenceData.file - File to upload (required)
   * @param {string} evidenceData.evidence_type - Type of evidence (optional)
   * @param {string} evidenceData.collected_by - User UUID who collected (optional)
   * @param {string} evidenceData.description - Description (optional)
   * @param {string} evidenceData.source - Source/location (optional)
   * @param {string} evidenceData.collection_date - ISO date string (optional)
   * @param {string} evidenceData.notes - Additional notes (optional)
   * @returns {Promise<{id, evidence_type, file_name, file_hash, collected_by, collection_date, created_at}>}
   */
  createEvidence: async (caseId, evidenceData) => {
    const formData = new FormData()
    
    // Add file
    formData.append('file', evidenceData.file)
    
    // Add optional metadata fields if provided
    if (evidenceData.evidence_type) {
      formData.append('evidence_type', evidenceData.evidence_type)
    }
    if (evidenceData.collected_by) {
      formData.append('collected_by', evidenceData.collected_by)
    }
    
    // Add optional fields if provided
    if (evidenceData.description) {
      formData.append('description', evidenceData.description)
    }
    if (evidenceData.source) {
      formData.append('source', evidenceData.source)
    }
    if (evidenceData.collection_date) {
      formData.append('collection_date', evidenceData.collection_date)
    }
    if (evidenceData.notes) {
      formData.append('notes', evidenceData.notes)
    }
    
    const response = await axiosInstance.post(
      `/evidence/cases/${caseId}/evidence`,
      formData
    )
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    return data.evidence || data
  },

  /**
   * Get evidence details by ID
   * GET /api/evidence/evidence/:evidenceId
   * @param {string} evidenceId - Evidence ID
   * @returns {Promise<{id, evidence_type, file_name, file_hash, description, source, collected_by, collection_date, notes, status, created_at, updated_at}>}
   */
  getEvidenceById: async (evidenceId) => {
    const response = await axiosInstance.get(`/evidence/evidence/${evidenceId}`)
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    // Handle multiple response format variations from backend
    const evidence = data.evidence || data.data || data
    return evidence || {}
  },

  /**
   * Get chain of custody for evidence
   * GET /api/evidence/evidence/:evidenceId/chain
   * @param {string} evidenceId - Evidence ID
   * @returns {Promise<Array<{timestamp, action, user_id, user_name, location, notes}>>}
   */
  getEvidenceChain: async (evidenceId) => {
    const response = await axiosInstance.get(`/evidence/evidence/${evidenceId}/chain`)
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    // Handle multiple response format variations from backend
    const chain = data.chain || data.chain_of_custody || data.entries || data.custody_history || []
    return Array.isArray(chain) ? chain : []
  },

  /**
   * Get evidence hash metadata
   * GET /api/evidence/evidence/:evidenceId/verify-hash
   * @param {string} evidenceId - Evidence ID
   * @returns {Promise<{evidence_id, algorithm, original_hash, sha256_hash, file_name, file_size_bytes, hashed_at}>}
   */
  getHashMetadata: async (evidenceId) => {
    const response = await axiosInstance.get(`/evidence/evidence/${evidenceId}/verify-hash`)
    const { success, data, message } = response.data

    if (!success) {
      throw { response: { data: { message } } }
    }

    return data
  },

  /**
   * Verify evidence hash integrity
   * POST /api/evidence/evidence/:evidenceId/verify-hash
   * Content-Type: multipart/form-data
   * @param {string} evidenceId - Evidence ID
   * @param {File} file - File to verify (required)
   * @returns {Promise<{original_hash, computed_hash, match: boolean, verified_at, verified_by}>}
   */
  verifyHash: async (evidenceId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await axiosInstance.post(`/evidence/evidence/${evidenceId}/verify-hash`, formData)
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    return {
      ...data,
      integrity_status: data.integrity_status || (data.match || data.is_valid ? 'INTACT' : 'TAMPERED'),
    }
  },

  /**
   * Update evidence information
   * PUT /api/evidence/evidence/:evidenceId
   * @param {string} evidenceId - Evidence ID
   * @param {Object} updates - Fields to update
   * @param {string} updates.description - Description (optional)
   * @param {string} updates.notes - Notes (optional)
   * @param {string} updates.source - Source (optional)
   * @returns {Promise<{id, evidence_type, updated_at}>}
   */
  updateEvidence: async (evidenceId, updates) => {
    const response = await axiosInstance.put(
      `/evidence/evidence/${evidenceId}`,
      updates
    )
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    return data.evidence
  },

  /**
   * Delete evidence
   * DELETE /api/evidence/evidence/:evidenceId
   * @param {string} evidenceId - Evidence ID
   * @returns {Promise<{success, message}>}
   */
  deleteEvidence: async (evidenceId) => {
    const response = await axiosInstance.delete(`/evidence/evidence/${evidenceId}`)
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
   * Download evidence file
   * GET /api/evidence/evidence/:evidenceId/download
   * @param {string} evidenceId - Evidence ID
   * @returns {Promise<Blob>} - File blob
   */
  downloadEvidence: async (evidenceId) => {
    const response = await axiosInstance.get(
      `/evidence/evidence/${evidenceId}/download`,
      {
        responseType: 'blob',
      }
    )
    return response.data
  },

  /**
   * Add chain of custody record
   * POST /api/evidence/evidence/:evidenceId/chain
   * @param {string} evidenceId - Evidence ID
   * @param {Object} chainData - Chain data
   * @param {string} chainData.action - Action (e.g., 'transferred', 'received', 'stored')
   * @param {string} chainData.user_id - User UUID performing action
   * @param {string} chainData.location - Location (optional)
   * @param {string} chainData.notes - Notes (optional)
   * @returns {Promise<{id, evidence_id, action, user_id, timestamp}>}
   */
  addChainRecord: async (evidenceId, chainData) => {
    const response = await axiosInstance.post(
      `/evidence/evidence/${evidenceId}/chain`,
      chainData
    )
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    return data.chain_record
  },

  /**
   * Search evidence
   * GET /api/evidence/search?q=<query>
   * @param {string} query - Search query
   * @returns {Promise<Array>}
   */
  searchEvidence: async (query) => {
    const response = await axiosInstance.get('/evidence/search', {
      params: { q: query }
    })
    const { success, data, message } = response.data
    
    if (!success) {
      throw { response: { data: { message } } }
    }
    
    return data.evidence || []
  },
}
