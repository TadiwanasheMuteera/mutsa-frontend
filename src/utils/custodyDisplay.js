/**
 * Normalize custody / chain-of-custody rows from multiple API shapes
 * (GET /evidence/evidence/:id with custody_history, or GET /custody/custody-log/:id).
 */

export function extractCustodyRecordsFromEvidence(evidence) {
  if (!evidence || typeof evidence !== 'object') return []
  const raw =
    evidence.custody_history ||
    evidence.chain_of_custody ||
    evidence.custody_records ||
    []
  return Array.isArray(raw) ? [...raw] : []
}

/**
 * Merge lists from a custody log API payload.
 */
export function extractCustodyRecordsFromLogPayload(data) {
  if (!data || typeof data !== 'object') return []
  const inner = data.custody_log && typeof data.custody_log === 'object' ? data.custody_log : data
  const raw =
    inner.custody_records ||
    inner.custody_history ||
    inner.chain_of_custody ||
    inner.entries ||
    inner.items ||
    inner.timeline ||
    []
  return Array.isArray(raw) ? raw : []
}

export function getCustodyTimestampRaw(record) {
  if (!record) return null
  return (
    record.timestamp ||
    record.transferred_at ||
    record.transferred_date ||
    record.received_at ||
    record.created_at ||
    record.changed_at ||
    null
  )
}

export function getCustodyTimestampMs(record) {
  const t = getCustodyTimestampRaw(record)
  if (!t) return 0
  const ms = new Date(t).getTime()
  return Number.isNaN(ms) ? 0 : ms
}

/** Human-readable date/time for UI */
export function formatCustodyTimestamp(record) {
  const raw = getCustodyTimestampRaw(record)
  if (!raw) return 'Unknown'
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return String(raw)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getCustodyActionLabel(record) {
  if (!record) return '—'
  const a = record.action || record.status || record.activity
  if (!a) return '—'
  return String(a).toUpperCase()
}

export function getCustodyFromOfficer(record) {
  if (!record) return 'Unknown'
  const name =
    record.from_officer ||
    record.from_user_name ||
    record.from_user?.name ||
    record.from_user?.full_name ||
    record.transferred_from_name
  if (name) return name
  return record.from_user_id ? 'Unknown' : '—'
}

export function getCustodyToOfficer(record) {
  if (!record) return 'Unknown'
  const name =
    record.to_officer ||
    record.to_user_name ||
    record.to_user?.name ||
    record.to_user?.full_name ||
    record.transferred_to_name
  if (name) return name
  return record.to_user_id ? 'Unknown' : '—'
}

export function getCustodyRecordedBy(record) {
  if (!record) return 'Unknown'
  const name =
    record.recorded_by ||
    record.recorded_by_name ||
    record.changed_by_name ||
    record.officer ||
    record.user_name ||
    record.user?.name
  if (name) return name
  return record.recorded_by_user_id ? 'Unknown' : '—'
}

/** One-line summary for timelines: from → to, or recorded-by, or single officer */
export function getCustodyActorSummary(record) {
  const from = getCustodyFromOfficer(record)
  const to = getCustodyToOfficer(record)
  const rb = getCustodyRecordedBy(record)
  const hasFrom = from !== '—' && from !== 'Unknown'
  const hasTo = to !== '—' && to !== 'Unknown'
  if (hasFrom && hasTo) return `${from} → ${to}`
  if (hasFrom) return from
  if (hasTo) return to
  if (rb !== '—' && rb !== 'Unknown') return rb
  return '—'
}

export function sortCustodyRecordsChronological(records) {
  return [...(records || [])].sort(
    (a, b) => getCustodyTimestampMs(a) - getCustodyTimestampMs(b)
  )
}
