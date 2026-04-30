/**
 * Typed Custody API Client
 */

import apiClient from './apiClient'
import {
  ApiResponse,
  CustodyTransfer,
  TransferEvidenceRequest,
  CustodyStatus,
  UpdateEvidenceStatusRequest,
  CustodyLog,
  ReleaseEvidenceRequest,
  DestroyEvidenceRequest,
  ArchiveEvidenceRequest,
} from './types'

export const custodyApi = {
  /**
   * Transfer evidence to another user
   */
  transferEvidence: async (
    evidenceId: string,
    data: TransferEvidenceRequest
  ): Promise<CustodyTransfer> => {
    const response = await apiClient.post<ApiResponse<{ transfer: CustodyTransfer }>>(
      `/custody/evidence/${evidenceId}/transfer`,
      data
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data.transfer
  },

  /**
   * Update evidence custody status
   */
  updateEvidenceStatus: async (
    evidenceId: string,
    data: UpdateEvidenceStatusRequest
  ): Promise<CustodyStatus> => {
    const response = await apiClient.put<ApiResponse<{ status_update: CustodyStatus }>>(
      `/custody/evidence/${evidenceId}/status`,
      data
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data.status_update
  },

  /**
   * Get custody log for evidence
   */
  getCustodyLog: async (evidenceId: string): Promise<CustodyLog> => {
    const response = await apiClient.get<ApiResponse<{ custody_log: CustodyLog }>>(
      `/custody/custody-log/${evidenceId}`
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data.custody_log
  },

  /**
   * Get current custody status
   */
  getCurrentCustodyStatus: async (evidenceId: string): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/custody/evidence/${evidenceId}/current-status`
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data
  },

  /**
   * Get evidence transfers
   */
  getEvidenceTransfers: async (evidenceId: string): Promise<CustodyTransfer[]> => {
    const response = await apiClient.get<ApiResponse<{ transfers: CustodyTransfer[] }>>(
      `/custody/evidence/${evidenceId}/transfers`
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data.transfers || []
  },

  /**
   * Get status history
   */
  getStatusHistory: async (evidenceId: string): Promise<CustodyStatus[]> => {
    const response = await apiClient.get<ApiResponse<{ status_history: CustodyStatus[] }>>(
      `/custody/evidence/${evidenceId}/status-history`
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data.status_history || []
  },

  /**
   * Release evidence
   */
  releaseEvidence: async (
    evidenceId: string,
    data: ReleaseEvidenceRequest
  ): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/custody/evidence/${evidenceId}/release`,
      data
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data
  },

  /**
   * Destroy evidence
   */
  destroyEvidence: async (
    evidenceId: string,
    data: DestroyEvidenceRequest
  ): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/custody/evidence/${evidenceId}/destroy`,
      data
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data
  },

  /**
   * Archive evidence
   */
  archiveEvidence: async (
    evidenceId: string,
    data: ArchiveEvidenceRequest
  ): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/custody/evidence/${evidenceId}/archive`,
      data
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data
  },

  /**
   * Get custody report
   */
  getCustodyReport: async (evidenceId: string): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/custody/evidence/${evidenceId}/report`
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data
  },

  /**
   * Get custody activity
   */
  getCustodyActivity: async (days?: number): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<{ activity: any[] }>>(
      '/custody/activity',
      { params: { days: days || 30 } }
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data.activity || []
  },
}
