/**
 * TypeScript Usage Examples
 * Complete examples for common workflows
 */

// ============================================================================
// Example 1: Login + Token Storage
// ============================================================================

import { authApi } from '@/api/authApi'
import { LoginRequest } from '@/api/types'

/**
 * Login handler with token storage
 */
export async function handleLogin(email: string, password: string) {
  try {
    const credentials: LoginRequest = { email, password }
    const response = await authApi.login(credentials)

    // Store tokens
    localStorage.setItem('accessToken', response.access_token)
    localStorage.setItem('refreshToken', response.refresh_token)

    // Store user info
    localStorage.setItem('user', JSON.stringify(response.user))

    // Navigate to dashboard
    window.location.href = '/dashboard'

    return response
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}

/**
 * Get current user from storage
 */
export function getCurrentUserFromStorage() {
  const userJson = localStorage.getItem('user')
  if (!userJson) return null
  try {
    return JSON.parse(userJson)
  } catch {
    return null
  }
}

/**
 * Logout handler
 */
export function handleLogout() {
  authApi.logout()
  window.location.href = '/login'
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('accessToken')
}

// ============================================================================
// Example 2: Load Cases List
// ============================================================================

import { casesApi } from '@/api/casesApi'
import { CaseQueryParams } from '@/api/types'

/**
 * Fetch cases with pagination
 */
export async function fetchCasesList(
  page: number = 1,
  per_page: number = 10,
  status?: string
) {
  try {
    const params: CaseQueryParams = {
      page,
      per_page,
      status,
    }

    const result = await casesApi.getCases(params)

    return {
      cases: result.cases,
      total: result.total,
      page: result.page,
      per_page: result.per_page,
    }
  } catch (error) {
    console.error('Failed to fetch cases:', error)
    throw error
  }
}

/**
 * Search cases
 */
export async function searchCases(query: string) {
  try {
    return await casesApi.searchCases(query)
  } catch (error) {
    console.error('Search failed:', error)
    throw error
  }
}

/**
 * Create new case
 */
export async function createNewCase(
  title: string,
  fraudType: string,
  description?: string
) {
  try {
    return await casesApi.createCase({
      title,
      fraud_type: fraudType,
      description,
    })
  } catch (error) {
    console.error('Case creation failed:', error)
    throw error
  }
}

/**
 * Get case details
 */
export async function getCaseDetails(caseId: string) {
  try {
    return await casesApi.getCaseById(caseId)
  } catch (error) {
    console.error('Failed to fetch case:', error)
    throw error
  }
}

/**
 * Get case timeline
 */
export async function getCaseTimelineData(caseId: string) {
  try {
    return await casesApi.getCaseTimeline(caseId)
  } catch (error) {
    console.error('Failed to fetch timeline:', error)
    throw error
  }
}

// ============================================================================
// Example 3: Upload Evidence File
// ============================================================================

import { evidenceApi } from '@/api/evidenceApi'
import { CreateEvidenceRequest } from '@/api/types'

/**
 * Upload evidence with file
 */
export async function uploadEvidence(
  caseId: string,
  file: File,
  evidenceType: string,
  collectedById: string,
  description?: string,
  source?: string,
  notes?: string
) {
  try {
    // Validate file
    if (!file) {
      throw new Error('File is required')
    }

    if (file.size > 1024 * 1024 * 500) {
      throw new Error('File size exceeds 500MB limit')
    }

    // Prepare evidence data
    const evidenceData: CreateEvidenceRequest = {
      file,
      evidence_type: evidenceType,
      collected_by: collectedById,
      description,
      source,
      collection_date: new Date().toISOString(),
      notes,
    }

    // Upload
    const result = await evidenceApi.createEvidence(caseId, evidenceData)

    console.log('Evidence uploaded successfully:', result)
    return result
  } catch (error) {
    console.error('Evidence upload failed:', error)
    throw error
  }
}

/**
 * Verify evidence hash integrity
 */
export async function verifyEvidenceHash(evidenceId: string, file: File) {
  try {
    const verification = await evidenceApi.verifyHash(evidenceId, file)

    if (verification.match) {
      console.log('✅ Hash verification passed - Evidence is intact')
    } else {
      console.warn('⚠️ Hash mismatch detected - Evidence may be compromised')
    }

    return {
      isMatching: verification.match,
      originalHash: verification.original_hash,
      computedHash: verification.computed_hash,
      verifiedAt: verification.verified_at,
    }
  } catch (error) {
    console.error('Hash verification failed:', error)
    throw error
  }
}

/**
 * Get evidence details
 */
export async function getEvidenceDetails(evidenceId: string) {
  try {
    return await evidenceApi.getEvidenceById(evidenceId)
  } catch (error) {
    console.error('Failed to fetch evidence:', error)
    throw error
  }
}

/**
 * Get evidence chain of custody
 */
export async function getEvidenceCustodyChain(evidenceId: string) {
  try {
    return await evidenceApi.getEvidenceChain(evidenceId)
  } catch (error) {
    console.error('Failed to fetch custody chain:', error)
    throw error
  }
}

/**
 * Get all evidence for a case
 */
export async function getCaseEvidence(caseId: string) {
  try {
    return await evidenceApi.getEvidenceByCaseId(caseId)
  } catch (error) {
    console.error('Failed to fetch case evidence:', error)
    throw error
  }
}

/**
 * Download evidence file
 */
export async function downloadEvidenceFile(
  evidenceId: string,
  fileName: string
) {
  try {
    const blob = await evidenceApi.downloadEvidence(evidenceId)

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()

    // Cleanup
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download failed:', error)
    throw error
  }
}

// ============================================================================
// Example 4: Transfer Custody
// ============================================================================

import { custodyApi } from '@/api/custodyApi'
import { TransferEvidenceRequest } from '@/api/types'

/**
 * Transfer evidence to another user
 */
export async function transferEvidenceToUser(
  evidenceId: string,
  recipientUserId: string,
  location: string,
  reason: string,
  notes?: string
) {
  try {
    // Validate inputs
    if (!recipientUserId) {
      throw new Error('Recipient user ID is required')
    }

    if (!location) {
      throw new Error('Location is required')
    }

    // Prepare transfer data
    const transferData: TransferEvidenceRequest = {
      transferred_to_user_id: recipientUserId,
      reason,
      location,
      notes,
    }

    // Perform transfer
    const result = await custodyApi.transferEvidence(evidenceId, transferData)

    console.log('Evidence transferred successfully:', result)
    return result
  } catch (error) {
    console.error('Transfer failed:', error)
    throw error
  }
}

/**
 * Update evidence status
 */
export async function updateEvidenceStatus(
  evidenceId: string,
  newStatus: 'stored' | 'transferred' | 'destroyed' | 'released' | 'archived',
  reason: string,
  notes?: string
) {
  try {
    const result = await custodyApi.updateEvidenceStatus(evidenceId, {
      new_status: newStatus,
      reason,
      notes,
    })

    console.log(`Evidence status updated to: ${newStatus}`)
    return result
  } catch (error) {
    console.error('Status update failed:', error)
    throw error
  }
}

/**
 * Get custody log for evidence
 */
export async function getCustodyLogData(evidenceId: string) {
  try {
    const log = await custodyApi.getCustodyLog(evidenceId)

    return {
      currentStatus: log.current_status,
      currentLocation: log.current_location,
      totalTransfers: log.total_transfers,
      records: log.custody_records,
    }
  } catch (error) {
    console.error('Failed to fetch custody log:', error)
    throw error
  }
}

/**
 * Release evidence
 */
export async function releaseEvidence(
  evidenceId: string,
  releasedTo: string,
  reason: string,
  notes?: string
) {
  try {
    return await custodyApi.releaseEvidence(evidenceId, {
      released_to: releasedTo,
      reason,
      notes,
    })
  } catch (error) {
    console.error('Release failed:', error)
    throw error
  }
}

/**
 * Archive evidence
 */
export async function archiveEvidence(
  evidenceId: string,
  archiveLocation: string,
  reason: string,
  notes?: string
) {
  try {
    return await custodyApi.archiveEvidence(evidenceId, {
      archive_location: archiveLocation,
      reason,
      notes,
    })
  } catch (error) {
    console.error('Archive failed:', error)
    throw error
  }
}

/**
 * Destroy evidence
 */
export async function destroyEvidence(
  evidenceId: string,
  destructionMethod: string,
  reason: string,
  witnessId?: string,
  notes?: string
) {
  try {
    return await custodyApi.destroyEvidence(evidenceId, {
      destruction_method: destructionMethod,
      reason,
      witness_id: witnessId,
      notes,
    })
  } catch (error) {
    console.error('Destruction failed:', error)
    throw error
  }
}

/**
 * Get custody history
 */
export async function getCustodyHistory(evidenceId: string) {
  try {
    return await custodyApi.getStatusHistory(evidenceId)
  } catch (error) {
    console.error('Failed to fetch custody history:', error)
    throw error
  }
}

/**
 * Get custody report
 */
export async function getCustodyReportData(evidenceId: string) {
  try {
    return await custodyApi.getCustodyReport(evidenceId)
  } catch (error) {
    console.error('Failed to generate report:', error)
    throw error
  }
}
