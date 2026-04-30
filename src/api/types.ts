/**
 * Shared TypeScript Types and Interfaces
 */

// API Response format
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
}

export interface ApiError {
  message: string
  statusCode?: number
  error?: string
}

// Auth Types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface User {
  id: string
  employee_number: string
  full_name: string
  email: string
  phone?: string
  role: 'auditor' | 'admin'
  is_active: boolean
}

export interface RegisterRequest {
  employee_number: string
  full_name: string
  email: string
  phone?: string
  role?: string
  password: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

// Case Types
export interface Case {
  id: string
  case_number: string
  title: string
  description?: string
  fraud_type: string
  status: 'open' | 'in_progress' | 'closed' | 'archived'
  suspect_info?: string
  assigned_to?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface CreateCaseRequest {
  title: string
  fraud_type: string
  description?: string
  suspect_info?: string
  assigned_to?: string
}

// Backend now auto-generates case_number on create
export interface CreateCaseResponse {
  id: string
  case_number: string
}

export interface UpdateCaseRequest {
  title?: string
  description?: string
  suspect_info?: string
  assigned_to?: string
  fraud_type?: string
}

export interface UpdateCaseStatusRequest {
  status: 'open' | 'in_progress' | 'closed' | 'archived'
  reason: string
}

export interface CasesListResponse {
  cases: Case[]
  total: number
  page: number
  per_page: number
}

export interface CaseTimeline {
  id: string
  case_id: string
  event_type: string
  description: string
  timestamp: string
  created_by: string
}

// Evidence Types
export interface Evidence {
  id: string
  case_id: string
  evidence_tag?: string
  evidence_type: string
  file_name: string
  file_hash?: string
  sha256_hash?: string
  stored_path?: string
  file_size?: number
  description?: string
  source?: string
  collected_by: string
  collection_date: string
  notes?: string
  status: string
  created_at: string
  updated_at: string
}

export interface CreateEvidenceRequest {
  file: File
  evidence_type?: string
  collected_by?: string
  description?: string
  source?: string
  collection_date?: string
  notes?: string
}

export interface CreateEvidenceResponse {
  id: string
  case_id: string
  evidence_tag: string
  file_name: string
  sha256_hash: string
  stored_path: string
}

export interface EvidenceVerification {
  original_hash: string
  computed_hash: string
  match: boolean
  verified_at: string
  verified_by: string
}

export type IntegrityStatus = 'INTACT' | 'TAMPERED'

export interface EvidenceHashMetadata {
  evidence_id: string
  algorithm: string
  original_hash: string
  sha256_hash: string
  file_name: string
  file_size_bytes: number
  hashed_at: string
}

export interface VerifyEvidenceHashResponse {
  match: boolean
  is_valid: boolean
  original_hash: string
  computed_hash: string
  integrity_status: IntegrityStatus
}

export interface EvidenceChainRecord {
  timestamp: string
  action: string
  user_id: string
  user_name: string
  location?: string
  notes?: string
}

// Custody Types
export interface CustodyTransfer {
  id: string
  evidence_id: string
  transferred_from_user_id: string
  transferred_to_user_id: string
  reason: string
  location: string
  transferred_at: string
  notes?: string
}

export interface TransferEvidenceRequest {
  transferred_to_user_id: string
  reason: string
  location: string
  notes?: string
}

export interface CustodyStatus {
  id: string
  evidence_id: string
  old_status: string
  new_status: string
  reason: string
  changed_by: string
  changed_at: string
  notes?: string
}

export interface UpdateEvidenceStatusRequest {
  new_status: string
  reason: string
  notes?: string
}

export interface CustodyLog {
  evidence_id: string
  total_transfers: number
  current_location: string
  current_status: string
  custody_records: CustodyLogRecord[]
}

export interface CustodyLogRecord {
  timestamp: string
  action: string
  user_id: string
  user_name: string
  location?: string
  details?: string
}

export interface ReleaseEvidenceRequest {
  released_to: string
  reason: string
  notes?: string
}

export interface DestroyEvidenceRequest {
  destruction_method: string
  reason: string
  witness_id?: string
  notes?: string
}

export interface ArchiveEvidenceRequest {
  archive_location: string
  reason: string
  notes?: string
}

// Pagination
export interface PaginationParams {
  page?: number
  per_page?: number
}

// Query params for cases
export interface CaseQueryParams extends PaginationParams {
  status?: string
  fraud_type?: string
}
