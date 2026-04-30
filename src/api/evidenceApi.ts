/**
 * Typed Evidence API Client
 */

import apiClient from './apiClient'
import {
  ApiResponse,
  Evidence,
  CreateEvidenceRequest,
  CreateEvidenceResponse,
  EvidenceHashMetadata,
  VerifyEvidenceHashResponse,
  EvidenceChainRecord,
} from './types'

export const evidenceApi = {
  /**
   * Get evidence by case ID
   */
  getEvidenceByCaseId: async (caseId: string): Promise<Evidence[]> => {
    const response = await apiClient.get<
      ApiResponse<{ evidence?: Evidence[]; evidences?: Evidence[]; items?: Evidence[] } | Evidence[]>
    >(
      `/evidence/cases/${caseId}/evidence`
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    const payload = response.data.data
    if (Array.isArray(payload)) {
      return payload
    }
    return payload.evidence || payload.evidences || payload.items || []
  },

  /**
   * Create new evidence with file upload
   */
  createEvidence: async (
    caseId: string,
    data: CreateEvidenceRequest
  ): Promise<CreateEvidenceResponse> => {
    const formData = new FormData()
    formData.append('file', data.file)
    if (data.evidence_type) formData.append('evidence_type', data.evidence_type)
    if (data.collected_by) formData.append('collected_by', data.collected_by)

    if (data.description) formData.append('description', data.description)
    if (data.source) formData.append('source', data.source)
    if (data.collection_date) formData.append('collection_date', data.collection_date)
    if (data.notes) formData.append('notes', data.notes)

    const response = await apiClient.post<
      ApiResponse<CreateEvidenceResponse | { evidence: Evidence }>
    >(
      `/evidence/cases/${caseId}/evidence`,
      formData
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    const payload = response.data.data
    if ('evidence' in payload) {
      return {
        id: payload.evidence.id,
        case_id: payload.evidence.case_id,
        evidence_tag: payload.evidence.evidence_tag || payload.evidence.id,
        file_name: payload.evidence.file_name,
        sha256_hash: payload.evidence.sha256_hash || payload.evidence.file_hash || '',
        stored_path: payload.evidence.stored_path || '',
      }
    }
    if (!payload.evidence_tag && !payload.id) {
      throw new Error(response.data.message || 'Evidence creation response is missing evidence_tag')
    }
    return {
      ...payload,
      evidence_tag: payload.evidence_tag || payload.id,
    }
  },

  /**
   * Get evidence by ID
   */
  getEvidenceById: async (evidenceId: string): Promise<Evidence> => {
    const response = await apiClient.get<ApiResponse<{ evidence: Evidence }>>(
      `/evidence/evidence/${evidenceId}`
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data.evidence
  },

  /**
   * Get evidence chain of custody
   */
  getEvidenceChain: async (evidenceId: string): Promise<EvidenceChainRecord[]> => {
    const response = await apiClient.get<ApiResponse<{ chain: EvidenceChainRecord[] }>>(
      `/evidence/evidence/${evidenceId}/chain`
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data.chain || []
  },

  /**
   * Get original/current hash metadata for evidence
   */
  getHashMetadata: async (evidenceId: string): Promise<EvidenceHashMetadata> => {
    const response = await apiClient.get<ApiResponse<EvidenceHashMetadata>>(
      `/evidence/evidence/${evidenceId}/verify-hash`
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data
  },

  /**
   * Verify evidence file hash
   */
  verifyHash: async (evidenceId: string, file: File): Promise<VerifyEvidenceHashResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<ApiResponse<VerifyEvidenceHashResponse>>(
      `/evidence/evidence/${evidenceId}/verify-hash`,
      formData
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    const result = response.data.data
    return {
      ...result,
      integrity_status:
        result.integrity_status || (result.match || result.is_valid ? 'INTACT' : 'TAMPERED'),
    }
  },

  /**
   * Update evidence information
   */
  updateEvidence: async (
    evidenceId: string,
    data: Partial<Evidence>
  ): Promise<Evidence> => {
    const response = await apiClient.put<ApiResponse<{ evidence: Evidence }>>(
      `/evidence/evidence/${evidenceId}`,
      data
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data.evidence
  },

  /**
   * Delete evidence
   */
  deleteEvidence: async (evidenceId: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/evidence/evidence/${evidenceId}`
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
  },

  /**
   * Download evidence file
   */
  downloadEvidence: async (evidenceId: string): Promise<Blob> => {
    const response = await apiClient.get<Blob>(
      `/evidence/evidence/${evidenceId}/download`,
      { responseType: 'blob' }
    )
    return response.data
  },

  /**
   * Add chain of custody record
   */
  addChainRecord: async (
    evidenceId: string,
    data: {
      action: string
      user_id: string
      location?: string
      notes?: string
    }
  ): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/evidence/evidence/${evidenceId}/chain`,
      data
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data
  },

  /**
   * Search evidence
   */
  searchEvidence: async (query: string): Promise<Evidence[]> => {
    const response = await apiClient.get<ApiResponse<{ evidence: Evidence[] }>>(
      '/evidence/search',
      { params: { q: query } }
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data.evidence || []
  },
}
