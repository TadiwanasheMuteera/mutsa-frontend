import axiosInstance from './axios'

/**
 * Audit API — used exclusively by the AUDITOR role.
 *
 * Backend endpoints (Flask):
 *   GET  /api/audit/logs          — paginated flat list of all audit events
 *   GET  /api/audit/stats         — summary stats (actions today, active users, etc.)
 *   GET  /api/audit/logs/export   — CSV download of audit events
 *
 * These endpoints must be accessible to users with role AUDITOR (or ADMIN).
 * They are separate from /api/admin/evidence-access-log which is ADMIN-only.
 */

const AUDIT_BASE = '/audit'

export const auditAPI = {
  /**
   * GET /api/audit/logs
   * Returns paginated audit log entries visible to the auditor.
   * Query params: page, per_page, action, user_id, date_from, date_to
   *
   * Expected response shape:
   * {
   *   success: true,
   *   data: {
   *     logs: [
   *       {
   *         id, user_id, user_name, user_role, action,
   *         evidence_ref, case_number, hash_at_time,
   *         hash_status,   // "OK" | "TAMPERED" | "MISMATCH"
   *         timestamp,     // ISO 8601 string e.g. "2026-04-30T14:35:22Z"
   *         created_at
   *       },
   *       ...
   *     ],
   *     total: 150,
   *     page: 1,
   *     per_page: 50
   *   }
   * }
   */
  getLogs: async (params = {}) => {
    const response = await axiosInstance.get(`${AUDIT_BASE}/logs`, { params })
    const { success, data, message } = response.data
    if (!success) throw { response: { data: { message } } }
    return data || {}
  },

  /**
   * GET /api/audit/stats
   * Returns summary statistics for the audit dashboard cards.
   *
   * Expected response shape:
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
    if (!success) throw { response: { data: { message } } }
    return data || {}
  },

  /**
   * GET /api/audit/logs/export
   * Triggers a CSV download of the current filtered audit log.
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
