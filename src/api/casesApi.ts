/**
 * Typed Cases API Client
 */

import apiClient from './apiClient'
import {
  ApiResponse,
  Case,
  CreateCaseRequest,
  CreateCaseResponse,
  UpdateCaseRequest,
  UpdateCaseStatusRequest,
  CasesListResponse,
  CaseTimeline,
  CaseQueryParams,
} from './types'

type LegacyCreateCaseInput = CreateCaseRequest & {
  case_number?: string
  caseNumber?: string
  reference_number?: string
  referenceNumber?: string
  referenceNo?: string
  reference_no?: string
  fraudType?: string
  suspectInfo?: string
  assignedTo?: string
}

type CreateCaseApiData = { case: Case } | CreateCaseResponse

export const casesApi = {
  /**
   * Get list of cases with pagination and filtering
   */
  getCases: async (params?: CaseQueryParams): Promise<CasesListResponse> => {
    const sanitizedParams = {
      ...(params?.page !== undefined ? { page: params.page } : {}),
      ...(params?.per_page !== undefined ? { per_page: params.per_page } : {}),
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.fraud_type ? { fraud_type: params.fraud_type } : {}),
    }

    const response = await apiClient.get<ApiResponse<CasesListResponse>>(
      '/cases',
      Object.keys(sanitizedParams).length > 0 ? { params: sanitizedParams } : undefined
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data
  },

  /**
   * Create new case
   */
  createCase: async (data: CreateCaseRequest): Promise<CreateCaseResponse> => {
    const input = data as LegacyCreateCaseInput
    const fraudTypeValue = input.fraud_type || input.fraudType
    if (!fraudTypeValue) {
      throw new Error('Fraud type is required')
    }

    const payload: CreateCaseRequest = {
      title: input.title,
      fraud_type: fraudTypeValue,
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.suspect_info || input.suspectInfo
        ? { suspect_info: input.suspect_info || input.suspectInfo }
        : {}),
      ...(input.assigned_to || input.assignedTo
        ? { assigned_to: input.assigned_to || input.assignedTo }
        : {}),
    }

    const response = await apiClient.post<ApiResponse<CreateCaseApiData>>('/cases', payload)
    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    const createdPayload = response.data.data
    const created = 'case' in createdPayload ? createdPayload.case : createdPayload
    return {
      id: created.id,
      case_number: created.case_number,
    }
  },

  /**
   * Get case by ID
   */
  getCaseById: async (caseId: string): Promise<Case> => {
    const response = await apiClient.get<ApiResponse<{ case: Case }>>(
      `/cases/${caseId}`
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data.case
  },

  /**
   * Update case
   */
  updateCase: async (caseId: string, data: UpdateCaseRequest): Promise<Case> => {
    const response = await apiClient.put<ApiResponse<{ case: Case }>>(
      `/cases/${caseId}`,
      data
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data.case
  },

  /**
   * Update case status
   */
  updateCaseStatus: async (
    caseId: string,
    data: UpdateCaseStatusRequest
  ): Promise<Case> => {
    const response = await apiClient.put<ApiResponse<{ case: Case }>>(
      `/cases/${caseId}/status`,
      data
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data.case
  },

  /**
   * Get case timeline
   */
  getCaseTimeline: async (caseId: string): Promise<CaseTimeline[]> => {
    const response = await apiClient.get<ApiResponse<{ timeline: CaseTimeline[] }>>(
      `/cases/${caseId}/timeline`
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data.timeline
  },

  /**
   * Delete case
   */
  deleteCase: async (caseId: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/cases/${caseId}`
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
  },

  /**
   * Search cases
   */
  searchCases: async (query: string): Promise<Case[]> => {
    const response = await apiClient.get<ApiResponse<{ cases: Case[] }>>('/cases/search', {
      params: { q: query },
    })
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data.cases
  },

  /**
   * Get case statistics
   */
  getCaseStatistics: async (caseId: string): Promise<Record<string, any>> => {
    const response = await apiClient.get<ApiResponse<Record<string, any>>>(
      `/cases/${caseId}/statistics`
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data
  },
}
