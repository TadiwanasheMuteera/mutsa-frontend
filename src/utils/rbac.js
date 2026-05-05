export const ROLES = {
  ADMIN:        'ADMIN',
  AUDITOR:      'AUDITOR',
  INVESTIGATOR: 'INVESTIGATOR',
  AUTHORIZER:   'AUTHORIZER',
}

export function normalizeRole(role) {
  if (!role || typeof role !== 'string') return null
  const normalized = role.trim().toUpperCase()
  // Legacy mapping: SUPERVISOR → AUDITOR
  if (normalized === 'SUPERVISOR') return ROLES.AUDITOR
  return normalized
}

export function hasRole(user, allowedRoles = []) {
  const userRole = normalizeRole(user?.role)
  if (!userRole) return false
  return allowedRoles.map(normalizeRole).includes(userRole)
}

export const isAdmin        = (user) => hasRole(user, [ROLES.ADMIN])
export const isAuditor      = (user) => hasRole(user, [ROLES.AUDITOR])
export const isInvestigator = (user) => hasRole(user, [ROLES.INVESTIGATOR])
export const isAuthorizer   = (user) => hasRole(user, [ROLES.AUTHORIZER])

export const canAuditLogs   = (user) => hasRole(user, [ROLES.ADMIN, ROLES.AUDITOR])
export const canManageUsers = (user) => hasRole(user, [ROLES.ADMIN])
export const canManageCases = (user) => hasRole(user, [ROLES.INVESTIGATOR, ROLES.AUTHORIZER])
