import axiosInstance from './axios'

/**
 * Audit API — used by the AUDITOR role.
 *
 * Backend endpoints (Flask):
 *   GET  /api/audit/logs          — paginated list of ALL system activity
 *   GET  /api/audit/stats         — summary stats for dashboard cards
 *   GET  /api/audit/logs/export   — CSV download
 *
 * Every action in the system must be logged by the backend:
 *   - CASE_CREATED, CASE_APPROVED, CASE_REJECTED, CASE_UPDATED, CASE_VIEWED
 *   - EVIDENCE_ADDED, EVIDENCE_VIEWED, DOWNLOADED, HASH_VERIFIED
 *   - TRANSFERRED, STATUS_CHANGED
 *   - LOGIN, LOGOUT
 *   - USER_CREATED, USER_DELETED, ROLE_CHANGED
 *
 * Each log entry must include:
 *   - user_name, user_role   (who performed the action)
 *   - action                 (what they did)
 *   - case_number            (which case, if applicable)
 *   - evidence_ref           (which evidence, if applicable)
 *   - details / reason       (why — e.g. rejection reason)
 *   - timestamp              (ISO 8601 — when it happened)
 */

const AUDIT_BASE = '/audit'

export const auditAPI = {
  /**
   * GET /api/audit/logs
   * Query params: page, per_page, action, user_id, date_from, date_to
   *
   * Expected response:
   * {
   *   success: true,
   *   data: {
   *     logs: [ { id, user_name, user_role, action, case_number,
   *               evidence_ref, details, timestamp, hash_at_time,
   *               hash_status } ],
   *     total: 150,
   *     page: 1,
   *     per_page: 50
   *   }
   * }
   */
  getLogs: async (params = {}) => {
    const response = await axiosInstance.get(`${AUDIT_BASE}/logs`, { params })
    const { success, data, message } = response.data
    if (!success) throw new Error(message || 'Failed to fetch audit logs')
    return data || {}
  },

  /**
   * GET /api/audit/stats
   * Expected response:
   * {
   *   success: true,
   *   data: {
   *     total_actions_today: 48,
   *     active_users_today: 5,
   *     evidence_items_touched: 14,
   *     hash_verifications: 9
   *   }
   * }
   */
  getStats: async () => {
    const response = await axiosInstance.get(`${AUDIT_BASE}/stats`)
    const { success, data, message } = response.data
    if (!success) throw new Error(message || 'Failed to fetch audit stats')
    return data || {}
  },

  /**
   * GET /api/audit/logs/export — triggers CSV download.
   */
  exportLogs: async (params = {}) => {
    const response = await axiosInstance.get(`${AUDIT_BASE}/logs/export`, {
      params,
      responseType: 'blob',
    })
    const blob = response.data
    const url  = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href     = url
    link.download = 'audit_trail.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    return blob
  },
}
