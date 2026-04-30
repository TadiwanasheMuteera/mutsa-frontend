export const ROLES = {
  ADMIN: 'ADMIN',
  AUDITOR: 'AUDITOR',
}

export function normalizeRole(role) {
  if (!role || typeof role !== 'string') return null
  const normalized = role.trim().toUpperCase()

  // Backward-compatibility mapping while backend transitions to AUDITOR.
  if (normalized === 'INVESTIGATOR' || normalized === 'SUPERVISOR') {
    return ROLES.AUDITOR
  }

  return normalized
}

export function hasRole(user, allowedRoles = []) {
  const userRole = normalizeRole(user?.role)
  if (!userRole) return false
  return allowedRoles.map(normalizeRole).includes(userRole)
}

export function isAdmin(user) {
  return hasRole(user, [ROLES.ADMIN])
}

export function isAuditor(user) {
  return hasRole(user, [ROLES.AUDITOR])
}

export function canAuditLogs(user) {
  return hasRole(user, [ROLES.ADMIN, ROLES.AUDITOR])
}
