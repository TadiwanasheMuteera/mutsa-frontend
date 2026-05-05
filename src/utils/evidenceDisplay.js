/**
 * Map API evidence rows (GET /evidence/cases/:id/evidence) to UI-friendly strings.
 */

const EVIDENCE_TYPE_LABELS = {
  DIGITAL_FILE: 'Digital file',
  PHYSICAL: 'Physical',
  SCREENSHOT: 'Screenshot',
  TRANSACTION_LOG: 'Transaction log',
  DEVICE: 'Device',
  DOCUMENT: 'Document',
  IMAGE: 'Image',
  VIDEO: 'Video',
  AUDIO: 'Audio',
  FILE: 'File',
  OTHER: 'Other',
}

export function getEvidenceItemName(item) {
  if (!item) return '—'
  return (
    item.title ||
    item.item_name ||
    item.file_name ||
    item.name ||
    (item.evidence_tag ? String(item.evidence_tag) : null) ||
    '—'
  )
}

export function getEvidenceStatus(item) {
  if (!item) return null
  const s = item.status ?? item.state
  if (s == null || s === '') return null
  return String(s).toUpperCase()
}

export function formatEvidenceTypeLabel(item) {
  if (!item) return '—'
  const raw = item.evidence_type ?? item.evidenceType ?? item.type
  if (raw == null || raw === '') return '—'
  const key = String(raw).toUpperCase().replace(/\s+/g, '_')
  return EVIDENCE_TYPE_LABELS[key] || String(raw).replace(/_/g, ' ')
}
