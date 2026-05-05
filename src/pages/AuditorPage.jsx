import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import {
  Download, ChevronDown, Flag, ShieldAlert,
  Activity, Users, FileSearch, CheckCircle2, FileText,
  Table2, LogIn, LogOut, Eye, FolderOpen, FilePlus2,
  Hash, ArrowRightLeft, AlertTriangle, Clock,
  Calendar, XCircle, Gavel, RefreshCw, AlertCircle,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'
import { useAuthStore } from '../store/authStore'
import { auditAPI } from '../api/audit'
import { isAuditor } from '../utils/rbac'

const PAGE_SIZE = 50

const ACTION_META = {
  LOGIN:            { label: 'Logged In',             color: 'teal',   Icon: LogIn          },
  LOGOUT:           { label: 'Logged Out',            color: 'slate',  Icon: LogOut         },
  CASE_CREATED:     { label: 'Created Case',          color: 'cyan',   Icon: FilePlus2      },
  CASE_APPROVED:    { label: 'Approved Case',         color: 'green',  Icon: CheckCircle2   },
  CASE_REJECTED:    { label: 'Rejected Case',         color: 'red',    Icon: XCircle        },
  CASE_UPDATED:     { label: 'Updated Case',          color: 'blue',   Icon: FolderOpen     },
  CASE_VIEWED:      { label: 'Viewed Case',           color: 'blue',   Icon: Eye            },
  EVIDENCE_ADDED:   { label: 'Added Evidence',        color: 'cyan',   Icon: FilePlus2      },
  EVIDENCE_VIEWED:  { label: 'Viewed Evidence',       color: 'blue',   Icon: Eye            },
  CREATED:          { label: 'Created Evidence',      color: 'cyan',   Icon: FilePlus2      },
  VIEWED:           { label: 'Viewed Evidence',       color: 'blue',   Icon: Eye            },
  OPENED:           { label: 'Opened Record',         color: 'blue',   Icon: FolderOpen     },
  DOWNLOADED:       { label: 'Downloaded Evidence',   color: 'orange', Icon: Download       },
  HASH_VERIFIED:    { label: 'Verified Hash',         color: 'green',  Icon: Hash           },
  TRANSFERRED:      { label: 'Transferred Evidence',  color: 'amber',  Icon: ArrowRightLeft },
  STATUS_CHANGED:   { label: 'Changed Status',        color: 'purple', Icon: AlertTriangle  },
  CASE_STATUS_CHANGED: { label: 'Changed Case Status', color: 'purple', Icon: Gavel       },
  USER_CREATED:     { label: 'Created User',          color: 'cyan',   Icon: Users          },
  USER_DELETED:     { label: 'Deleted User',          color: 'red',    Icon: XCircle        },
  ROLE_CHANGED:     { label: 'Changed User Role',     color: 'purple', Icon: ArrowRightLeft },
}

const BADGE_COLORS = {
  teal:   'bg-teal-100 text-teal-800 border-teal-300',
  slate:  'bg-slate-100 text-slate-700 border-slate-300',
  blue:   'bg-blue-100 text-blue-800 border-blue-300',
  cyan:   'bg-cyan-100 text-cyan-800 border-cyan-300',
  orange: 'bg-orange-100 text-orange-800 border-orange-300',
  green:  'bg-green-100 text-green-800 border-green-300',
  amber:  'bg-amber-100 text-amber-800 border-amber-300',
  purple: 'bg-purple-100 text-purple-800 border-purple-300',
  red:    'bg-red-100 text-red-800 border-red-300',
}

const ROLE_AVATAR = {
  ADMIN:        'bg-purple-100 text-purple-800',
  INVESTIGATOR: 'bg-blue-100 text-blue-800',
  AUTHORIZER:   'bg-amber-100 text-amber-800',
  AUDITOR:      'bg-green-100 text-green-800',
}

const ROLE_BADGE = {
  ADMIN:        'bg-purple-50 text-purple-700 border-purple-200',
  INVESTIGATOR: 'bg-blue-50 text-blue-700 border-blue-200',
  AUTHORIZER:   'bg-amber-50 text-amber-700 border-amber-200',
  AUDITOR:      'bg-green-50 text-green-700 border-green-200',
}

function fmtFull(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return String(ts)
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  })
}

function fmtRelative(ts) {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  if (diff < 0) return ''
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getInitials(name) {
  if (!name) return 'U'
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || 'U'
}

function getMeta(action) {
  return ACTION_META[action] || { label: action, color: 'blue', Icon: Activity }
}

function extractRows(payload) {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []
  if (Array.isArray(payload.data)) return payload.data
  return payload.logs || payload.access_log || payload.items || payload.results || payload.entries || []
}

function buildExportRows(rows, flagged) {
  return rows.map((row, idx) => {
    const ts = row.timestamp || row.created_at || row.accessed_at
    const meta = getMeta((row.action || '').toUpperCase())
    return {
      '#':            idx + 1,
      User:           row.user_name || row.user?.name || row.user?.full_name || 'Unknown',
      Role:           (row.user_role || row.user?.role || '').toUpperCase(),
      Action:         row.action || 'UNKNOWN',
      Description:    meta.label,
      'Case No.':     row.case_number || row.case_ref || row.case_id || '—',
      'Evidence Ref': row.evidence_ref || row.evidence_reference || row.evidence_id || '—',
      Details:        row.details || row.reason || row.description || '—',
      Timestamp:      fmtFull(ts),
      'Hash at Time': row.hash_at_time || row.file_hash || row.hash || '—',
      'Hash Status':  ['TAMPERED', 'MISMATCH'].includes(String(row.hash_status || '').toUpperCase()) ? 'MISMATCH' : 'OK',
      Flagged:        flagged[row.id || `r-${idx}`] ? 'YES' : '',
    }
  })
}

function exportPDF(rows, flagged) {
  const doc = new jsPDF({ orientation: 'landscape' })
  const data = buildExportRows(rows, flagged)
  doc.setFontSize(16)
  doc.text('Audit Trail — Activity Report', 14, 15)
  doc.setFontSize(9)
  doc.text(`Generated: ${fmtFull(new Date().toISOString())}   Total events: ${data.length}`, 14, 22)
  autoTable(doc, {
    startY: 28,
    head: [Object.keys(data[0] || {})],
    body: data.map(Object.values),
    styles: { fontSize: 6, cellPadding: 1.5 },
    headStyles: { fillColor: [15, 52, 130], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    didParseCell(h) {
      const v = h.cell.raw
      if (typeof v === 'string' && v.includes('YES'))      { h.cell.styles.textColor = [180, 20, 20]; h.cell.styles.fontStyle = 'bold' }
      if (typeof v === 'string' && v.includes('MISMATCH')) { h.cell.styles.textColor = [160, 60,  0]; h.cell.styles.fontStyle = 'bold' }
    },
  })
  doc.save('audit_trail.pdf')
}

function exportExcel(rows, flagged) {
  const data = buildExportRows(rows, flagged)
  const ws = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = [6, 20, 14, 18, 24, 16, 16, 30, 22, 24, 12, 10].map((wch) => ({ wch }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Audit Trail')
  XLSX.writeFile(wb, 'audit_trail.xlsx')
}

function StatSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="h-3 w-28 bg-gray-200 rounded mb-3" />
      <div className="h-8 w-14 bg-gray-200 rounded" />
    </div>
  )
}

export default function AuditorPage() {
  const { user } = useAuthStore()

  const [page, setPage]               = useState(1)
  const [filterUser, setFilterUser]   = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [dateFrom, setDateFrom]       = useState('')
  const [dateTo, setDateTo]           = useState('')
  const [flagged, setFlagged]         = useState({})
  const [exportOpen, setExportOpen]   = useState(false)

  const queryParams = useMemo(() => ({
    page,
    per_page: PAGE_SIZE,
    ...(filterAction ? { action: filterAction }   : {}),
    ...(filterUser   ? { user_id: filterUser }     : {}),
    ...(dateFrom     ? { date_from: dateFrom }     : {}),
    ...(dateTo       ? { date_to: dateTo }         : {}),
  }), [page, filterAction, filterUser, dateFrom, dateTo])

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['auditor-stats'],
    queryFn: auditAPI.getStats,
    refetchInterval: 30000,
    retry: 2,
  })

  const { data: logData, isLoading: logLoading, isFetching, error: logError, refetch } = useQuery({
    queryKey: ['auditor-log', queryParams],
    queryFn: () => auditAPI.getLogs(queryParams),
    placeholderData: (prev) => prev,
    retry: 2,
    refetchInterval: 15000,
  })

  const rawRows = extractRows(logData)

  const insights = useMemo(() => {
    const byRole = {}
    const byAction = {}
    rawRows.forEach((r) => {
      const role = (r.user_role || r.user?.role || 'UNKNOWN').toUpperCase()
      const act = (r.action || 'UNKNOWN').toUpperCase()
      byRole[role] = (byRole[role] || 0) + 1
      byAction[act] = (byAction[act] || 0) + 1
    })
    const topActions = Object.entries(byAction)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
    return { byRole, topActions, totalPage: rawRows.length }
  }, [rawRows])

  const uniqueUsers = useMemo(() => {
    const map = new Map()
    rawRows.forEach((r) => {
      const n = r.user_name || r.user?.name || r.user?.full_name
      if (n && !map.has(n)) map.set(n, { id: r.user_id || n, name: n })
    })
    return Array.from(map.values())
  }, [rawRows])

  if (!isAuditor(user)) return <Navigate to="/home" replace />

  const stats = {
    actionsToday:    statsData?.total_actions_today   ?? statsData?.total_actions  ?? 0,
    activeUsers:     statsData?.active_users_today    ?? statsData?.active_users   ?? 0,
    evidenceTouched: statsData?.evidence_items_touched ?? statsData?.evidence_items ?? 0,
    hashChecks:      statsData?.hash_verifications    ?? 0,
  }

  const flagCount    = Object.values(flagged).filter(Boolean).length
  const toggleFlag   = (id) => setFlagged((p) => ({ ...p, [id]: !p[id] }))
  const resetFilters = () => { setPage(1); setFilterUser(''); setFilterAction(''); setDateFrom(''); setDateTo('') }

  const totalResults = Number(logData?.total || logData?.total_count || rawRows.length)
  const canGoPrev    = page > 1
  const canGoNext    = page * PAGE_SIZE < totalResults

  const handlePDF   = () => { exportPDF(rawRows, flagged); setExportOpen(false) }
  const handleExcel = () => { exportExcel(rawRows, flagged); setExportOpen(false) }
  const handleCSV   = () => { auditAPI.exportLogs(queryParams); setExportOpen(false) }

  return (
    <Layout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert size={24} className="text-blue-600" />
              Audit Monitor
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Complete activity trail — who did what, to which case, and when.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {flagCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-700 border border-red-200">
                <Flag size={13} /> {flagCount} flagged
              </span>
            )}

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              Refresh
            </button>

            {/* Export dropdown */}
            <div className="relative">
              <button type="button" onClick={() => setExportOpen((o) => !o)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                <Download size={14} /> Download Report <ChevronDown size={13} />
              </button>
              {exportOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden">
                  <button type="button" onClick={handlePDF}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700">
                    <FileText size={14} className="text-red-500" /> PDF Report
                  </button>
                  <button type="button" onClick={handleExcel}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 border-t border-gray-100">
                    <Table2 size={14} className="text-green-600" /> Excel Spreadsheet
                  </button>
                  <button type="button" onClick={handleCSV}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-t border-gray-100">
                    <Download size={14} className="text-blue-500" /> CSV Export
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {statsLoading ? (
            [...Array(4)].map((_, i) => <StatSkeleton key={i} />)
          ) : (
            <>
              <div className="bg-white rounded-xl border border-blue-100 p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Activity size={15} className="text-blue-500" />
                  <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold">Total actions today</p>
                </div>
                <p className="text-3xl font-bold text-blue-700">{stats.actionsToday}</p>
              </div>
              <div className="bg-white rounded-xl border border-teal-100 p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Users size={15} className="text-teal-500" />
                  <p className="text-xs uppercase tracking-wider text-teal-600 font-semibold">Active users today</p>
                </div>
                <p className="text-3xl font-bold text-teal-700">{stats.activeUsers}</p>
              </div>
              <div className="bg-white rounded-xl border border-amber-100 p-5">
                <div className="flex items-center gap-2 mb-1">
                  <FileSearch size={15} className="text-amber-500" />
                  <p className="text-xs uppercase tracking-wider text-amber-600 font-semibold">Evidence accessed</p>
                </div>
                <p className="text-3xl font-bold text-amber-700">{stats.evidenceTouched}</p>
              </div>
              <div className="bg-white rounded-xl border border-green-100 p-5">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 size={15} className="text-green-500" />
                  <p className="text-xs uppercase tracking-wider text-green-600 font-semibold">Hash verifications</p>
                </div>
                <p className="text-3xl font-bold text-green-700">{stats.hashChecks}</p>
              </div>
            </>
          )}
        </div>

        {/* Activity breakdown (current page) */}
        {rawRows.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Events by role (this page)</p>
              <div className="space-y-2">
                {Object.entries(insights.byRole)
                  .sort((a, b) => b[1] - a[1])
                  .map(([role, n]) => (
                    <div key={role} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-800">{role}</span>
                      <span className="text-gray-500">{n}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Top actions (this page)</p>
              <div className="space-y-2">
                {insights.topActions.map(([action, n]) => (
                  <div key={action} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs text-gray-800">{action}</span>
                    <span className="text-gray-500">{n}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Filter activity</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
            <select value={filterUser} onChange={(e) => { setPage(1); setFilterUser(e.target.value) }}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-200">
              <option value="">All users</option>
              {uniqueUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select value={filterAction} onChange={(e) => { setPage(1); setFilterAction(e.target.value) }}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-200">
              <option value="">All actions</option>
              {Object.entries(ACTION_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400 flex-shrink-0" />
              <input type="date" value={dateFrom} onChange={(e) => { setPage(1); setDateFrom(e.target.value) }}
                className="flex-1 px-2 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400 flex-shrink-0" />
              <input type="date" value={dateTo} onChange={(e) => { setPage(1); setDateTo(e.target.value) }}
                className="flex-1 px-2 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <button type="button" onClick={resetFilters}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">
              Clear filters
            </button>
          </div>
        </div>

        {/* Error banner */}
        {logError && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span className="flex-1">
              Failed to load audit data — {logError?.message || 'backend unavailable'}. Make sure the backend is running and the <code className="font-mono bg-red-100 px-1 rounded">GET /api/audit/logs</code> endpoint exists.
            </span>
            <button type="button" onClick={() => refetch()} className="text-xs font-semibold underline flex-shrink-0">
              Retry
            </button>
          </div>
        )}

        {/* Summary bar */}
        <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
          <span className="font-semibold text-gray-800">{rawRows.length} event{rawRows.length !== 1 ? 's' : ''}</span>
          {totalResults > rawRows.length && (
            <>
              <span className="text-gray-300">|</span>
              <span>{totalResults} total</span>
            </>
          )}
          {isFetching && <span className="text-gray-400 flex items-center gap-1"><RefreshCw size={12} className="animate-spin" /> refreshing…</span>}
          {flagCount > 0 && (
            <>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1 text-red-600 font-semibold">
                <ShieldAlert size={13} /> {flagCount} flagged
              </span>
            </>
          )}
        </div>

        {/* Activity table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">User</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Case No.</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Evidence Ref</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Hash status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logLoading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Spinner />
                        <p className="text-sm text-gray-400">Loading audit trail from database…</p>
                      </div>
                    </td>
                  </tr>
                ) : rawRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Activity size={32} className="text-gray-300" />
                        <p className="text-sm font-medium text-gray-500">No audit events recorded yet</p>
                        <p className="text-xs text-gray-400 max-w-md">
                          Activity will appear here when investigators create cases, add evidence, and authorizers approve or reject cases. All actions are logged with timestamps.
                        </p>
                        {logError && (
                          <button type="button" onClick={() => refetch()} className="mt-2 text-xs text-blue-600 hover:underline">
                            Retry connection
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  rawRows.map((row, idx) => {
                    const action   = (row.action || 'UNKNOWN').toUpperCase()
                    const meta     = getMeta(action)
                    const name     = row.user_name || row.user?.name || row.user?.full_name || 'Unknown'
                    const role     = (row.user_role || row.user?.role || '').toUpperCase()
                    const ts       = row.timestamp || row.created_at || row.accessed_at
                    const caseNo   = row.case_number || row.case_ref || row.case_id || row.case?.case_number || null
                    const evidRef  = row.evidence_ref || row.evidence_reference || row.evidence_id || row.evidence?.id || null
                    const details  = row.details || row.reason || row.description || row.notes || null
                    const hashVal  = row.hash_at_time || row.file_hash || row.hash || row.evidence?.file_hash || null
                    const mismatch = ['TAMPERED', 'MISMATCH'].includes(String(row.hash_status || row.integrity_status || '').toUpperCase())
                    const hashStatus =
                      row.hash_status ||
                      row.integrity_status ||
                      (mismatch ? 'MISMATCH' : hashVal ? 'OK' : null)
                    const rowId    = row.id || `r-${idx}`
                    const isFlagged = Boolean(flagged[rowId])

                    const avatarCls = ROLE_AVATAR[role] || 'bg-gray-100 text-gray-700'
                    const roleCls   = ROLE_BADGE[role]  || 'bg-gray-50 text-gray-600 border-gray-200'
                    const badgeCls  = mismatch ? BADGE_COLORS.red : (BADGE_COLORS[meta.color] || BADGE_COLORS.blue)

                    return (
                      <tr
                        key={rowId}
                        className={`transition-colors ${
                          isFlagged ? 'bg-red-50' :
                          mismatch  ? 'bg-red-50/50' :
                          'hover:bg-gray-50'
                        }`}
                      >
                        {/* Timestamp — most important column */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs font-bold text-gray-900">
                              {fmtFull(ts)}
                            </span>
                            <span className="text-[10px] text-gray-400 mt-0.5">
                              {fmtRelative(ts)}
                            </span>
                          </div>
                        </td>

                        {/* User */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarCls}`}>
                              {getInitials(name)}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-900">{name}</p>
                              <span className={`inline-flex items-center px-1.5 py-0 rounded-full text-[10px] font-semibold border ${roleCls}`}>
                                {role || 'USER'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeCls}`}>
                            <meta.Icon size={11} />
                            {meta.label}
                          </span>
                          {mismatch && (
                            <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-bold text-red-700">
                              <AlertTriangle size={9} /> TAMPERED
                            </span>
                          )}
                        </td>

                        {/* Case */}
                        <td className="px-4 py-3 text-xs">
                          {caseNo ? (
                            <span className="font-mono font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                              {caseNo}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        {/* Evidence */}
                        <td className="px-4 py-3 text-xs">
                          {evidRef ? (
                            <span className="font-mono text-gray-700">{evidRef}</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                          {hashVal && (
                            <div className={`mt-0.5 text-[10px] font-mono ${mismatch ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                              {hashVal.length > 16 ? `${hashVal.slice(0, 16)}…` : hashVal}
                            </div>
                          )}
                        </td>

                        {/* Details / Reason */}
                        <td className="px-4 py-3 text-xs text-gray-600 max-w-xs">
                          {details ? (
                            <span className="line-clamp-2">{details}</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap">
                          {hashStatus ? (
                            <span
                              className={
                                String(hashStatus).toUpperCase() === 'OK'
                                  ? 'text-green-700'
                                  : ['TAMPERED', 'MISMATCH', 'FAIL'].includes(String(hashStatus).toUpperCase())
                                    ? 'text-red-700'
                                    : 'text-gray-700'
                              }
                            >
                              {hashStatus}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        {/* Flag */}
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => toggleFlag(rowId)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                              isFlagged
                                ? 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                                : mismatch
                                  ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                                  : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100 hover:text-gray-600'
                            }`}
                          >
                            <Flag size={9} /> {isFlagged ? 'Flagged' : 'Flag'}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {rawRows.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {rawRows.length} of {totalResults} events
              </p>
              <div className="flex items-center gap-2">
                <button type="button" disabled={!canGoPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 disabled:opacity-40 hover:bg-gray-100">
                  ← Prev
                </button>
                <span className="text-sm text-gray-600">Page {page}</span>
                <button type="button" disabled={!canGoNext} onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 disabled:opacity-40 hover:bg-gray-100">
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </Layout>
  )
}
