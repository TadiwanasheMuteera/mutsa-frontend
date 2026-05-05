const CASE_STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-800',
  AWAITING_APPROVAL: 'bg-amber-100 text-amber-800',
  ARCHIVED: 'bg-red-100 text-red-800',
  RELEASED: 'bg-blue-100 text-blue-800',
  OPEN: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-200 text-gray-800',
  REJECTED: 'bg-red-100 text-red-800',
  UNDER_INVESTIGATION: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-slate-100 text-slate-800',
}

/** Evidence item lifecycle (status / state from API) */
const EVIDENCE_STATUS_COLORS = {
  COLLECTED: 'bg-emerald-100 text-emerald-800',
  IN_TRANSIT: 'bg-amber-100 text-amber-800',
  IN_ANALYSIS: 'bg-indigo-100 text-indigo-800',
  ANALYZED: 'bg-indigo-100 text-indigo-800',
  SECURED: 'bg-teal-100 text-teal-800',
  RECEIVED: 'bg-yellow-100 text-yellow-800',
  SUBMITTED_TO_COURT: 'bg-purple-100 text-purple-800',
  STORED: 'bg-sky-100 text-sky-800',
  TRANSFERRED: 'bg-orange-100 text-orange-800',
  RELEASED: 'bg-blue-100 text-blue-800',
  DESTROYED: 'bg-red-100 text-red-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
}

function normalizeStatusKey(status) {
  if (status == null || status === '') return ''
  return String(status).trim().toUpperCase()
}

export default function Badge({ status, variant = 'case', className = '' }) {
  const key = normalizeStatusKey(status)
  const palette = variant === 'evidence' ? EVIDENCE_STATUS_COLORS : CASE_STATUS_COLORS
  const color =
    palette[key] ||
    (variant === 'evidence' ? CASE_STATUS_COLORS[key] : EVIDENCE_STATUS_COLORS[key]) ||
    'bg-gray-100 text-gray-800'

  const label = key || '—'

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color} ${className}`}
    >
      {label.replace(/_/g, ' ')}
    </span>
  )
}
