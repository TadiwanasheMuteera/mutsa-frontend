import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Download, ChevronLeft, ChevronRight } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useAuthStore } from '../store/authStore'
import { adminAPI } from '../api/admin'
import { isAdmin, normalizeRole, ROLES } from '../utils/rbac'

const PAGE_SIZE = 50

const ACTION_OPTIONS = [
  { value: '', label: 'All actions' },
  { value: 'VIEWED', label: 'VIEWED' },
  { value: 'DOWNLOADED', label: 'DOWNLOADED' },
  { value: 'HASH_VERIFIED', label: 'HASH_VERIFIED' },
  { value: 'LOGIN', label: 'LOGIN' },
  { value: 'LOGOUT', label: 'LOGOUT' },
  { value: 'TRANSFERRED', label: 'TRANSFERRED' },
  { value: 'STATUS_CHANGED', label: 'STATUS_CHANGED' },
]

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse">
      <div className="h-3 w-32 bg-gray-200 rounded mb-3" />
      <div className="h-8 w-20 bg-gray-200 rounded" />
    </div>
  )
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-200">
      <td className="px-4 py-4">
        <div className="h-9 w-44 bg-gray-200 rounded animate-pulse" />
      </td>
      <td className="px-4 py-4">
        <div className="h-6 w-28 bg-gray-200 rounded-full animate-pulse" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </td>
    </tr>
  )
}

function getActionBadgeClasses(action) {
  const classes = {
    VIEWED: 'bg-blue-100 text-blue-800 border border-blue-200',
    DOWNLOADED: 'bg-orange-100 text-orange-800 border border-orange-200',
    HASH_VERIFIED: 'bg-green-100 text-green-800 border border-green-200',
    TRANSFERRED: 'bg-amber-100 text-amber-800 border border-amber-200',
    STATUS_CHANGED: 'bg-purple-100 text-purple-800 border border-purple-200',
    CREATED: 'bg-teal-100 text-teal-800 border border-teal-200',
  }

  return classes[action] || 'bg-gray-100 text-gray-700 border border-gray-200'
}

function getRoleAvatarClasses(role) {
  const classes = {
    ADMIN: 'bg-purple-100 text-purple-800',
    AUDITOR: 'bg-blue-100 text-blue-800',
  }

  return classes[role] || 'bg-gray-100 text-gray-700'
}

function getRoleBadgeClasses(role) {
  const classes = {
    ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
    AUDITOR: 'bg-blue-50 text-blue-700 border-blue-200',
  }

  return classes[role] || 'bg-gray-50 text-gray-700 border-gray-200'
}

function getInitials(name) {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() || '').join('') || 'U'
}

function getLogRows(payload) {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []
  return (
    payload.logs ||
    payload.access_log ||
    payload.items ||
    payload.results ||
    payload.entries ||
    []
  )
}

function formatTimestamp(timestamp) {
  if (!timestamp) return '—'
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString()
}

function truncateHash(hash) {
  if (!hash) return '—'
  if (hash.length <= 12) return hash
  return `${hash.slice(0, 12)}...`
}

export default function AdminAccessLogPage() {
  const { user } = useAuthStore()
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')
  const [userId, setUserId] = useState('')
  const [evidenceRef, setEvidenceRef] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [flaggedRows, setFlaggedRows] = useState({})

  const canViewAuditLog = isAdmin(user)

  const queryParams = useMemo(
    () => ({
      page,
      per_page: PAGE_SIZE,
      ...(action ? { action } : {}),
      ...(userId ? { user_id: userId } : {}),
      ...(evidenceRef ? { evidence_id: evidenceRef } : {}),
      ...(dateFrom ? { date_from: dateFrom } : {}),
      ...(dateTo ? { date_to: dateTo } : {}),
    }),
    [page, action, userId, evidenceRef, dateFrom, dateTo]
  )

  const {
    data: statsData,
    isLoading: statsLoading,
    isFetching: statsFetching,
  } = useQuery({
    queryKey: ['admin-access-log-stats'],
    queryFn: adminAPI.getAccessLogStats,
    enabled: canViewAuditLog,
    refetchInterval: 30000,
  })

  const {
    data: logData,
    isLoading: logLoading,
    isFetching: logFetching,
  } = useQuery({
    queryKey: ['admin-access-log', queryParams],
    queryFn: () => adminAPI.getAccessLog(queryParams),
    enabled: canViewAuditLog,
    placeholderData: (previousData) => previousData,
  })

  if (!canViewAuditLog) {
    return <Navigate to="/dashboard" replace />
  }

  const rows = getLogRows(logData)
  const totalResults = Number(
    logData?.total ||
      logData?.total_count ||
      logData?.count ||
      rows.length
  )
  const canGoPrev = page > 1
  const canGoNext = page * PAGE_SIZE < totalResults
  const showingCount = rows.length

  const uniqueUsers = useMemo(() => {
    const usersById = new Map()

    rows.forEach((row) => {
      const id = row.user_id || row.user?.id
      if (!id || usersById.has(id)) return
      usersById.set(id, {
        id,
        name: row.user_name || row.user?.name || row.user?.full_name || 'Unknown User',
      })
    })

    return Array.from(usersById.values())
  }, [rows])

  const stats = {
    totalActionsToday:
      statsData?.total_actions_today ??
      statsData?.actions_today ??
      statsData?.total_actions ??
      0,
    activeInvestigatorsToday:
      statsData?.active_investigators_today ??
      statsData?.investigators_today ??
      statsData?.active_investigators ??
      0,
    evidenceTouched:
      statsData?.evidence_items_touched ??
      statsData?.evidence_touched ??
      statsData?.evidence_items ??
      0,
    hashVerifications:
      statsData?.hash_verifications ??
      statsData?.hash_verifications_today ??
      0,
  }

  const isBusy = logFetching || statsFetching

  const toggleFlag = (rowKey) => {
    setFlaggedRows((current) => ({
      ...current,
      [rowKey]: !current[rowKey],
    }))
  }

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Evidence Audit Log</h1>
          <p className="text-sm text-gray-600 mt-1">
            Monitor who accessed evidence, what actions they performed, and when activity occurred.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {statsLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5">
                <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold">
                  Total actions today
                </p>
                <p className="text-3xl font-bold text-blue-700 mt-2">{stats.totalActionsToday}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-green-100 p-5">
                <p className="text-xs uppercase tracking-wider text-green-600 font-semibold">
                  Active auditors today
                </p>
                <p className="text-3xl font-bold text-green-700 mt-2">{stats.activeInvestigatorsToday}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-5">
                <p className="text-xs uppercase tracking-wider text-amber-600 font-semibold">
                  Evidence items touched
                </p>
                <p className="text-3xl font-bold text-amber-700 mt-2">{stats.evidenceTouched}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-5">
                <p className="text-xs uppercase tracking-wider text-purple-600 font-semibold">
                  Hash verifications
                </p>
                <p className="text-3xl font-bold text-purple-700 mt-2">{stats.hashVerifications}</p>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
            <select
              value={action}
              onChange={(e) => {
                setPage(1)
                setAction(e.target.value)
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
            >
              {ACTION_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={userId}
              onChange={(e) => {
                setPage(1)
                setUserId(e.target.value)
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
            >
              <option value="">All users</option>
              {uniqueUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={evidenceRef}
              onChange={(e) => {
                setPage(1)
                setEvidenceRef(e.target.value)
              }}
              placeholder="Evidence ref search"
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
            />

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setPage(1)
                setDateFrom(e.target.value)
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
            />

            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setPage(1)
                setDateTo(e.target.value)
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
            />

            <button
              type="button"
              onClick={() => adminAPI.exportAccessLog(queryParams)}
              className="inline-flex items-center justify-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Evidence Ref</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Case Number</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hash at time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Flag</th>
                </tr>
              </thead>
              <tbody>
                {logLoading ? (
                  <>
                    {[...Array(8)].map((_, idx) => (
                      <TableRowSkeleton key={idx} />
                    ))}
                  </>
                ) : rows.length > 0 ? (
                  rows.map((row, index) => {
                    const name =
                      row.user_name ||
                      row.user?.name ||
                      row.user?.full_name ||
                      'Unknown User'
                    const role = normalizeRole(row.user_role || row.user?.role) || ROLES.AUDITOR
                    const actionValue = row.action || 'UNKNOWN'
                    const evidenceRefValue =
                      row.evidence_ref ||
                      row.evidence_reference ||
                      row.evidence_id ||
                      row.evidence?.id ||
                      '—'
                    const caseNumber =
                      row.case_number ||
                      row.case_ref ||
                      row.case_id ||
                      row.case?.id ||
                      '—'
                    const hashValue =
                      row.hash_at_time ||
                      row.file_hash ||
                      row.hash ||
                      row.evidence?.file_hash ||
                      null
                    const timestamp =
                      row.timestamp ||
                      row.created_at ||
                      row.accessed_at
                    const rowKey = row.id || `${row.user_id || 'u'}-${timestamp || ''}-${index}`
                    const isFlagged = Boolean(flaggedRows[rowKey])
                    const hasHashMismatch =
                      String(row.hash_status || row.integrity_status || '').toUpperCase() === 'TAMPERED' ||
                      String(row.verification_result || row.hash_result || '').toUpperCase() === 'MISMATCH'

                    return (
                      <tr key={rowKey} className={`border-b border-gray-200 hover:bg-gray-50 ${isFlagged ? 'bg-red-50/50' : ''}`}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold ${getRoleAvatarClasses(role)}`}>
                              {getInitials(name)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{name}</p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${getRoleBadgeClasses(role)}`}>
                                {role}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getActionBadgeClasses(actionValue)}`}>
                            {actionValue}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-mono text-gray-800">{evidenceRefValue}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{caseNumber}</td>
                        <td className="px-4 py-4 text-sm font-mono text-gray-700">{truncateHash(hashValue)}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{formatTimestamp(timestamp)}</td>
                        <td className="px-4 py-4 text-sm">
                          <button
                            type="button"
                            onClick={() => toggleFlag(rowKey)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                              isFlagged
                                ? 'bg-red-100 text-red-700 border-red-200'
                                : hasHashMismatch
                                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                                  : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            {isFlagged ? 'Flagged' : hasHashMismatch ? 'Flag mismatch' : 'Flag'}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      No access log entries found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {showingCount} of {totalResults} results
              {isBusy ? ' (updating...)' : ''}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!canGoPrev}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={16} />
                Prev
              </button>
              <span className="text-sm text-gray-700">Page {page}</span>
              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => setPage((prev) => prev + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
