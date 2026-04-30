/**
 * TypeScript API Services Index
 * Re-exports all services and types for easy importing
 */

// ============================================================================
// Types
// ============================================================================
export type {
  ApiResponse,
  ApiError,
  LoginRequest,
  LoginResponse,
  User,
  RegisterRequest,
  ChangePasswordRequest,
  Case,
  CreateCaseRequest,
  CreateCaseResponse,
  UpdateCaseRequest,
  UpdateCaseStatusRequest,
  CasesListResponse,
  CaseTimeline,
  Evidence,
  CreateEvidenceRequest,
  CreateEvidenceResponse,
  EvidenceVerification,
  EvidenceHashMetadata,
  VerifyEvidenceHashResponse,
  IntegrityStatus,
  EvidenceChainRecord,
  CustodyTransfer,
  TransferEvidenceRequest,
  CustodyStatus,
  UpdateEvidenceStatusRequest,
  CustodyLog,
  CustodyLogRecord,
  ReleaseEvidenceRequest,
  DestroyEvidenceRequest,
  ArchiveEvidenceRequest,
  PaginationParams,
  CaseQueryParams,
} from './types'

// ============================================================================
// API Services
// ============================================================================
export { authApi } from './authApi'
export { casesApi } from './casesApi'
export { evidenceApi } from './evidenceApi'
export { custodyApi } from './custodyApi'

// ============================================================================
// API Client
// ============================================================================
export { default as apiClient } from './apiClient'

// ============================================================================
// Examples
// ============================================================================
export {
  handleLogin,
  getCurrentUserFromStorage,
  handleLogout,
  isAuthenticated,
  fetchCasesList,
  searchCases,
  createNewCase,
  getCaseDetails,
  getCaseTimelineData,
  uploadEvidence,
  verifyEvidenceHash,
  getEvidenceDetails,
  getEvidenceCustodyChain,
  getCaseEvidence,
  downloadEvidenceFile,
  transferEvidenceToUser,
  updateEvidenceStatus,
  getCustodyLogData,
  releaseEvidence,
  archiveEvidence,
  destroyEvidence,
  getCustodyHistory,
  getCustodyReportData,
} from './examples'
