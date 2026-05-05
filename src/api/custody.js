import axiosInstance from './axios'

/**
 * Custody API Client
 * All endpoints follow the standard response format: { success, data, message }
 * Manages chain of custody transfers and status updates
 */

export const custodyAPI = {
  /**
   * Transfer evidence to another user
   * POST /api/custody/evidence/:evidenceId/transfer
   * @param {string} evidenceId - Evidence ID
   * @param {Object} transferData - Transfer information
   * @param {string} transferData.transferred_to_user_id - User UUID receiving evidence (required)
   * @param {string} transferData.reason - Reason for transfer (required)
   * @param {string} transferData.location - Current location/destination (required)
   * @param {string} transferData.notes - Additional notes (optional)
   * @returns {Promise<{id, evidence_id, transferred_from_user_id, transferred_to_user_id, reason, location, transferred_at, notes}>}
   */
  transferEvidence: async (evidenceId, transferData) => {
    const response = await axiosInstance.post(
      `/custody/evidence/${evidenceId}/transfer`,
      transferData
    )
    const { success, data, message } = response.data

    if (!success) {
      throw { response: { data: { message } } }
    }

    return data.transfer || data.custody_transfer
  },

  /**
   * Update evidence custody status
   * PUT /api/custody/evidence/:evidenceId/status
   * @param {string} evidenceId - Evidence ID
   * @param {Object} statusData - Status update information
   * @param {string} statusData.new_status - New status (stored, transferred, destroyed, released, archived)
   * @param {string} statusData.reason - Reason for status change (required)
   * @param {string} statusData.notes - Additional notes (optional)
   * @returns {Promise<{id, evidence_id, old_status, new_status, reason, changed_by, changed_at, notes}>}
   */
  updateEvidenceStatus: async (evidenceId, statusData) => {
    const response = await axiosInstance.put(
      `/custody/evidence/${evidenceId}/status`,
      statusData
    )
    const { success, data, message } = response.data

    if (!success) {
      throw { response: { data: { message } } }
    }

    return data.status_update || data.custody_status
  },

  /**
   * Get complete custody log for evidence
   * GET /api/custody/custody-log/:evidenceId
   * @param {string} evidenceId - Evidence ID
   * @returns {Promise<{evidence_id, total_transfers, current_location, current_status, custody_records: Array}>}
   */
  getCustodyLog: async (evidenceId) => {
    const response = await axiosInstance.get(`/custody/custody-log/${evidenceId}`)
    const { success, data, message } = response.data

    if (!success) {
      throw { response: { data: { message } } }
    }

    const payload = data.custody_log && typeof data.custody_log === 'object' ? data.custody_log : data

    let records =
      payload.custody_records ||
      payload.custody_history ||
      payload.chain_of_custody ||
      payload.entries ||
      payload.items ||
      payload.timeline ||
      []
    if (!Array.isArray(records)) {
      records = []
    }

    return {
      ...payload,
      custody_records: records,
    }
  },

  /**
   * Records-only list for one evidence item (used by case aggregate queries).
   * Same shape as items in GET /evidence/evidence/:id → custody_history.
   */
  getCustodyByEvidenceId: async (evidenceId) => {
    const log = await custodyAPI.getCustodyLog(evidenceId)
    return log.custody_records || []
  },

  /**
   * Get current custody status of evidence
   * GET /api/custody/evidence/:evidenceId/current-status
   * @param {string} evidenceId - Evidence ID
   * @returns {Promise<{evidence_id, current_status, current_location, current_holder_id, current_holder_name, last_transfer_at}>}
   */
  getCurrentCustodyStatus: async (evidenceId) => {
    const response = await axiosInstance.get(
      `/custody/evidence/${evidenceId}/current-status`
    )
    const { success, data, message } = response.data

    if (!success) {
      throw { response: { data: { message } } }
    }

    return data.custody_status || data
  },

  /**
   * Get custody transfers for evidence
   * GET /api/custody/evidence/:evidenceId/transfers
   * @param {string} evidenceId - Evidence ID
   * @returns {Promise<Array<{id, transferred_from_user_id, transferred_to_user_id, reason, location, transferred_at}>>}
   */
  getEvidenceTransfers: async (evidenceId) => {
    const response = await axiosInstance.get(
      `/custody/evidence/${evidenceId}/transfers`
    )
    const { success, data, message } = response.data

    if (!success) {
      throw { response: { data: { message } } }
    }

    return data.transfers || []
  },

  /**
   * Get custody status history for evidence
   * GET /api/custody/evidence/:evidenceId/status-history
   * @param {string} evidenceId - Evidence ID
   * @returns {Promise<Array<{id, old_status, new_status, reason, changed_by, changed_at}>>}
   */
  getStatusHistory: async (evidenceId) => {
    const response = await axiosInstance.get(
      `/custody/evidence/${evidenceId}/status-history`
    )
    const { success, data, message } = response.data

    if (!success) {
      throw { response: { data: { message } } }
    }

    return data.status_history || []
  },

  /**
   * Release evidence (change status to released)
   * POST /api/custody/evidence/:evidenceId/release
   * @param {string} evidenceId - Evidence ID
   * @param {Object} releaseData - Release information
   * @param {string} releaseData.released_to - Person/entity evidence released to
   * @param {string} releaseData.reason - Reason for release (required)
   * @param {string} releaseData.notes - Additional notes (optional)
   * @returns {Promise<{id, evidence_id, released_to, released_at, released_by, reason}>}
   */
  releaseEvidence: async (evidenceId, releaseData) => {
    const response = await axiosInstance.post(
      `/custody/evidence/${evidenceId}/release`,
      releaseData
    )
    const { success, data, message } = response.data

    if (!success) {
      throw { response: { data: { message } } }
    }

    return data.release || data.custody_release
  },

  /**
   * Destroy evidence (change status to destroyed)
   * POST /api/custody/evidence/:evidenceId/destroy
   * @param {string} evidenceId - Evidence ID
   * @param {Object} destroyData - Destruction information
   * @param {string} destroyData.destruction_method - How evidence was destroyed
   * @param {string} destroyData.reason - Reason for destruction (required)
   * @param {string} destroyData.witness_id - Witness user ID (optional)
   * @param {string} destroyData.notes - Additional notes (optional)
   * @returns {Promise<{id, evidence_id, destruction_method, destroyed_at, destroyed_by, reason, witness_id}>}
   */
  destroyEvidence: async (evidenceId, destroyData) => {
    const response = await axiosInstance.post(
      `/custody/evidence/${evidenceId}/destroy`,
      destroyData
    )
    const { success, data, message } = response.data

    if (!success) {
      throw { response: { data: { message } } }
    }

    return data.destruction || data.custody_destruction
  },

  /**
   * Archive evidence (change status to archived)
   * POST /api/custody/evidence/:evidenceId/archive
   * @param {string} evidenceId - Evidence ID
   * @param {Object} archiveData - Archive information
   * @param {string} archiveData.archive_location - Where evidence is archived
   * @param {string} archiveData.reason - Reason for archival (required)
   * @param {string} archiveData.notes - Additional notes (optional)
   * @returns {Promise<{id, evidence_id, archive_location, archived_at, archived_by, reason}>}
   */
  archiveEvidence: async (evidenceId, archiveData) => {
    const response = await axiosInstance.post(
      `/custody/evidence/${evidenceId}/archive`,
      archiveData
    )
    const { success, data, message } = response.data

    if (!success) {
      throw { response: { data: { message } } }
    }

    return data.archive || data.custody_archive
  },

  /**
   * Get custody report for evidence (summary)
   * GET /api/custody/evidence/:evidenceId/report
   * @param {string} evidenceId - Evidence ID
   * @returns {Promise<{evidence_id, current_status, total_transfers, total_status_changes, first_custody_at, last_custody_at, custody_timeline: Array}>}
   */
  getCustodyReport: async (evidenceId) => {
    const response = await axiosInstance.get(
      `/custody/evidence/${evidenceId}/report`
    )
    const { success, data, message } = response.data

    if (!success) {
      throw { response: { data: { message } } }
    }

    return data.report || data
  },

  /**
   * Get all cases with custody activity (optional dashboard method)
   * GET /api/custody/activity?days=30
   * @param {number} days - Number of days to look back (optional)
   * @returns {Promise<Array<{evidence_id, activity_type, user_id, user_name, activity_date}>>}
   */
  getCustodyActivity: async (days = 30) => {
    const response = await axiosInstance.get('/custody/activity', {
      params: { days }
    })
    const { success, data, message } = response.data

    if (!success) {
      throw { response: { data: { message } } }
    }

    return data.activity || []
  },
}
