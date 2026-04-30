import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import {
  Download, ChevronDown, ChevronUp, Flag, ShieldAlert,
  Activity, Users, FileSearch, CheckCircle2, FileText,
  Table2, LogIn, LogOut, Eye, FolderOpen, FilePlus2,
  Hash, ArrowRightLeft, AlertTriangle, Clock, LayoutList,
  Calendar,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useAuthStore } from '../store/authStore'
import { adminAPI } from '../api/admin'
import { isAuditor } from '../utils/rbac'

// ─── constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 50

const ACTION_META = {
  LOGIN:          { label: 'Logged In',           color: 'teal',   Icon: LogIn          },
  LOGOUT:         { label: 'Logged Out',           color: 'slate',  Icon: LogOut         },
  VIEWED:         { label: 'Viewed Evidence',      color: 'blue',   Icon: Eye            },
  OPENED:         { label: 'Opened Record',        color: 'blue',   Icon: FolderOpen     },
  CASE_VIEWED:    { label: 'Viewed Case',          color: 'blue',   Icon: FolderOpen     },
  CASE_CREATED:   { label: 'Created Case',         color: 'cyan',   Icon: FilePlus2      },
  CREATED:        { label: 'Created Evidence',     color: 'cyan',   Icon: FilePlus2      },
  DOWNLOADED:     { label: 'Downloaded Evidence',  color: 'orange', Icon: Download       },
  HASH_VERIFIED:  { label: 'Verified Hash',        color: 'green',  Icon: Hash           },
  TRANSFERRED:    { label: 'Transferred Evidence', color: 'amber',  Icon: ArrowRightLeft },
  STATUS_CHANGED: { label: 'Changed Status',       color: 'purple', Icon: AlertTriangle  },
}

const BADGE = {
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

const DOT = {
  teal:   'bg-teal-500',
  slate:  'bg-slate-400',
  blue:   'bg-blue-500',
  cyan:   'bg-cyan-500',
  orange: 'bg-orange-500',
  green:  'bg-green-500',
  amber:  'bg-amber-500',
  purple: 'bg-purple-500',
  red:    'bg-red-500',
}

// ─── mock data ────────────────────────────────────────────────────────────────

const now = Date.now()
const T = (m) => new Date(now - m * 60000).toISOString()

const MOCK_ROWS = [
  { id: 'm-01', user_name: 'John Doe',      user_role: 'ADMIN',   action: 'LOGIN',          evidence_ref: null,           case_number: null,            hash_at_time: null,                    timestamp: T(145) },
  { id: 'm-02', user_name: 'John Doe',      user_role: 'ADMIN',   action: 'CASE_VIEWED',    evidence_ref: null,           case_number: 'CASE-2024-031', hash_at_time: null,                    timestamp: T(143) },
  { id: 'm-03', user_name: 'John Doe',      user_role: 'ADMIN',   action: 'VIEWED',         evidence_ref: 'EVD-2024-009', case_number: 'CASE-2024-031', hash_at_time: 'a3f8c1e29b4d7f0e5a12', timestamp: T(141) },
  { id: 'm-04', user_name: 'John Doe',      user_role: 'ADMIN',   action: 'HASH_VERIFIED',  evidence_ref: 'EVD-2024-009', case_number: 'CASE-2024-031', hash_at_time: 'a3f8c1e29b4d7f0e5a12', hash_status: 'TAMPERED', timestamp: T(139) },
  { id: 'm-05', user_name: 'John Doe',      user_role: 'ADMIN',   action: 'CASE_CREATED',   evidence_ref: null,           case_number: 'CASE-2024-055', hash_at_time: null,                    timestamp: T(130) },
  { id: 'm-06', user_name: 'John Doe',      user_role: 'ADMIN',   action: 'CREATED',        evidence_ref: 'EVD-2024-021', case_number: 'CASE-2024-055', hash_at_time: 'b7d2e4f1a9c3e8b5d0f2', timestamp: T(127) },
  { id: 'm-07', user_name: 'John Doe',      user_role: 'ADMIN',   action: 'TRANSFERRED',    evidence_ref: 'EVD-2024-021', case_number: 'CASE-2024-055', hash_at_time: 'b7d2e4f1a9c3e8b5d0f2', timestamp: T(120) },
  { id: 'm-08', user_name: 'John Doe',      user_role: 'ADMIN',   action: 'LOGOUT',         evidence_ref: null,           case_number: null,            hash_at_time: null,                    timestamp: T(115) },
  { id: 'm-09', user_name: 'Alice Moyo',    user_role: 'ADMIN',   action: 'LOGIN',          evidence_ref: null,           case_number: null,            hash_at_time: null,                    timestamp: T(100) },
  { id: 'm-10', user_name: 'Alice Moyo',    user_role: 'ADMIN',   action: 'CASE_VIEWED',    evidence_ref: null,           case_number: 'CASE-2024-042', hash_at_time: null,                    timestamp: T(98)  },
  { id: 'm-11', user_name: 'Alice Moyo',    user_role: 'ADMIN',   action: 'DOWNLOADED',     evidence_ref: 'EVD-2024-017', case_number: 'CASE-2024-042', hash_at_time: 'c1d3e5f7a9b2d4e6f8a0', timestamp: T(95)  },
  { id: 'm-12', user_name: 'Alice Moyo',    user_role: 'ADMIN',   action: 'STATUS_CHANGED', evidence_ref: 'EVD-2024-017', case_number: 'CASE-2024-042', hash_at_time: 'c1d3e5f7a9b2d4e6f8a0', timestamp: T(90)  },
  { id: 'm-13', user_name: 'Alice Moyo',    user_role: 'ADMIN',   action: 'LOGOUT',         evidence_ref: null,           case_number: null,            hash_at_time: null,                    timestamp: T(85)  },
  { id: 'm-14', user_name: 'Bob Chikwanda', user_role: 'ADMIN',   action: 'LOGIN',          evidence_ref: null,           case_number: null,            hash_at_time: null,                    timestamp: T(40)  },
  { id: 'm-15', user_name: 'Bob Chikwanda', user_role: 'ADMIN',   action: 'CASE_VIEWED',    evidence_ref: null,           case_number: 'CASE-2024-039', hash_at_time: null,                    timestamp: T(38)  },
  { id: 'm-16', user_name: 'Bob Chikwanda', user_role: 'ADMIN',   action: 'VIEWED',         evidence_ref: 'EVD-2024-003', case_number: 'CASE-2024-039', hash_at_time: 'd2e4f6a8b0c2d4e6f8a0', timestamp: T(35)  },
  { id: 'm-17', user_name: 'Bob Chikwanda', user_role: 'ADMIN',   action: 'HASH_VERIFIED',  evidence_ref: 'EVD-2024-003', case_number: 'CASE-2024-039', hash_at_time: 'd2e4f6a8b0c2d4e6f8a0', timestamp: T(33)  },
  { id: 'm-18', user_name: 'Bob Chikwanda', user_role: 'ADMIN',   action: 'TRANSFERRED',    evidence_ref: 'EVD-2024-003', case_number: 'CASE-2024-039', hash_at_time: 'd2e4f6a8b0c2d4e6f8a0', timestamp: T(20)  },
]

const MOCK_STATS = {
  total_actions_today: 48,
  active_investigators_today: 5,
  evidence_items_touched: 14,
  hash_verifications: 9,
}

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Format a timestamp — always shows full date + time to the second */
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

/** Format only the time portion HH:MM:SS */
function fmtTime(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

/** Format only the date portion "22 Apr 2026" */
function fmtDate(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function duration(start, end) {
  if (!start || !end) return null
  const ms = new Date(end) - new Date(start)
  if (ms < 0) return null
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
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
  return payload.logs || payload.access_log || payload.items || payload.results || payload.entries || []
}

/**
 * Groups flat log rows into sessions (LOGIN → LOGOUT).
 * Rows without a preceding LOGIN are grouped as orphan sessions.
 */
function buildSessions(rows) {
  const sorted = [...rows].sort((a, b) =>
    new Date(a.timestamp || a.created_at || 0) - new Date(b.timestamp || b.created_at || 0)
  )

  const sessions = []
  const open = {}

  sorted.forEach((row, idx) => {
    const userName = row.user_name || row.user?.name || row.user?.full_name || 'Unknown'
    const userRole = (row.user_role || row.user?.role || '').toUpperCase()
    const action   = (row.action || 'UNKNOWN').toUpperCase()
    const ts       = row.timestamp || row.created_at || row.accessed_at || null
    const key      = row.user_id   || userName

    const entry = {
      id:      row.id || `e-${idx}`,
      action,
      ts,
      evidRef: row.evidence_ref  || row.evidence_reference || row.evidence_id  || row.evidence?.id        || null,
      caseNo:  row.case_number   || row.case_ref           || row.case_id      || row.case?.id             || null,
      hash:    row.hash_at_time  || row.file_hash          || row.hash         || row.evidence?.file_hash  || null,
      mismatch: ['TAMPERED', 'MISMATCH'].includes(
        String(row.hash_status || row.integrity_status || row.verification_result || '').toUpperCase()
      ),
    }

    if (action === 'LOGIN') {
      open[key] = { id: `s-${key}-${ts || idx}`, userName, userRole, loginTime: ts, logoutTime: null, active: true, entries: [entry] }
    } else if (action === 'LOGOUT' && open[key]) {
      open[key].logoutTime = ts
      open[key].active     = false
      open[key].entries.push(entry)
      sessions.push({ ...open[key] })
      delete open[key]
    } else if (open[key]) {
      open[key].entries.push(entry)
    } else {
      // orphan — no preceding LOGIN
      const ok = `orphan-${key}`
      if (!open[ok]) open[ok] = { id: `s-orphan-${key}`, userName, userRole, loginTime: null, logoutTime: null, active: true, entries: [] }
      open[ok].entries.push(entry)
    }
  })

  Object.values(open).forEach((s) => { if (s.entries.length > 0) sessions.push({ ...s }) })

  return sessions.sort((a, b) =>
    new Date(b.loginTime || b.entries[0]?.ts || 0) - new Date(a.loginTime || a.entries[0]?.ts || 0)
  )
}

// ─── export helpers ───────────────────────────────────────────────────────────

function buildExportRows(sessions, flagged) {
  const rows = []
  sessions.forEach((s) => {
    s.entries.forEach((e) => {
      rows.push({
        User:            s.userName,
        Role:            s.userRole,
        'Session Date':  fmtDate(s.loginTime),
        'Login Time':    fmtFull(s.loginTime),
        'Logout Time':   s.active ? 'Still active' : fmtFull(s.logoutTime),
        'Session Duration': s.active ? '—' : (duration(s.loginTime, s.logoutTime) || '—'),
        Action:          e.action,
        Description:     getMeta(e.action).label,
        Timestamp:       fmtFull(e.ts),
        'Evidence Ref':  e.evidRef  || '—',
        'Case No.':      e.caseNo   || '—',
        'Hash at Time':  e.hash     || '—',
        'Hash Status':   e.mismatch ? 'MISMATCH ⚠' : 'OK',
        Flagged:         flagged[e.id] ? 'YES ⚑' : '',
      })
    })
  })
  return rows
}

function exportPDF(sessions, flagged) {
  const doc  = new jsPDF({ orientation: 'landscape' })
  const data = buildExportRows(sessions, flagged)
  doc.setFontSize(16)
  doc.text('Evidence Audit Trail — Full Session Report', 14, 15)
  doc.setFontSize(9)
  doc.text(
    `Generated: ${fmtFull(new Date().toISOString())}   Sessions: ${sessions.length}   Total events: ${data.length}`,
    14, 22
  )
  autoTable(doc, {
    startY: 28,
    head: [Object.keys(data[0] || {})],
    body: data.map(Object.values),
    styles: { fontSize: 6, cellPadding: 1.5 },
    headStyles: { fillColor: [15, 52, 130], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    didParseCell(h) {
      const v = h.cell.raw
      if (typeof v === 'string' && v.includes('YES'))      { h.cell.styles.textColor = [180, 20, 20];  h.cell.styles.fontStyle = 'bold' }
      if (typeof v === 'string' && v.includes('MISMATCH')) { h.cell.styles.textColor = [160, 60,  0];  h.cell.styles.fontStyle = 'bold' }
    },
  })
  doc.save('evidence_audit_trail.pdf')
}

function exportExcel(sessions, flagged) {
  const data = buildExportRows(sessions, flagged)
  const ws   = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = [20, 12, 14, 22, 22, 16, 18, 24, 22, 16, 16, 24, 12, 10].map((wch) => ({ wch }))
  const wb   = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Audit Trail')
  XLSX.writeFile(wb, 'evidence_audit_trail.xlsx')
}

// ─── sub-components ───────────────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="h-3 w-28 bg-gray-200 rounded mb-3" />
      <div className="h-8 w-14 bg-gray-200 rounded" />
    </div>
  )
}

/**
 * One session card.
 * Layout per entry:
 *   [ time column (fixed 130 px) ] | [ action + details ]
 */
function SessionCard({ session, flagged, onToggleFlag }) {
  const [expanded, setExpanded] = useState(true)
  const flagCount   = session.entries.filter((e) => flagged[e.id]).length
  const hasMismatch = session.entries.some((e) => e.mismatch)
  const dur         = duration(session.loginTime, session.logoutTime)

  return (
    <div className={`rounded-xl border overflow-hidden shadow-sm ${hasMismatch ? 'border-red-300' : 'border-gray-200'}`}>

      {/* ── Session header ── */}
      <div
        onClick={() => setExpanded((v) => !v)}
        className={`px-5 py-4 flex items-start justify-between cursor-pointer select-none gap-4 ${
          hasMismatch ? 'bg-red-50' : 'bg-slate-50'
        }`}
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Avatar */}
          <div className={`h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 ${
            session.userRole === 'ADMIN' ? 'bg-purple-200 text-purple-900' : 'bg-blue-200 text-blue-900'
          }`}>
            {getInitials(session.userName)}
          </div>

          <div className="min-w-0 flex-1">
            {/* Name + role */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-gray-900">{session.userName}</span>
              <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                session.userRole === 'ADMIN'
                  ? 'bg-purple-100 text-purple-700 border-purple-300'
                  : 'bg-blue-100 text-blue-700 border-blue-300'
              }`}>{session.userRole || 'USER'}</span>
              {session.active && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  Active now
                </span>
              )}
              {hasMismatch && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
                  <AlertTriangle size={10} /> Hash Mismatch Detected
                </span>
              )}
            </div>

            {/* Login / Logout times — large and prominent */}
            <div className="mt-2 flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-teal-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                <LogIn size={13} />
                <span>LOGIN</span>
                <span className="ml-1 font-mono tracking-wide">
                  {session.loginTime ? fmtFull(session.loginTime) : 'Unknown'}
                </span>
              </div>

              {!session.active && session.logoutTime ? (
                <div className="flex items-center gap-1.5 bg-gray-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                  <LogOut size={13} />
                  <span>LOGOUT</span>
                  <span className="ml-1 font-mono tracking-wide">{fmtFull(session.logoutTime)}</span>
                </div>
              ) : session.active ? (
                <div className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                  <LogOut size={13} />
                  <span>Session still ongoing</span>
                </div>
              ) : null}

              {dur && (
                <div className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-lg">
                  <Clock size={12} />
                  Duration: {dur}
                </div>
              )}

              <div className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-500 text-xs px-3 py-1.5 rounded-lg">
                {session.entries.length} event{session.entries.length !== 1 ? 's' : ''}
              </div>

              {flagCount > 0 && (
                <div className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                  <Flag size={11} /> {flagCount} flagged
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 mt-1">
          {expanded
            ? <ChevronUp size={18} className="text-gray-400" />
            : <ChevronDown size={18} className="text-gray-400" />}
        </div>
      </div>

      {/* ── Timeline body ── */}
      {expanded && (
        <div className="bg-white divide-y divide-gray-100">
          {/* Table header */}
          <div className="grid grid-cols-[150px_1fr] gap-0 bg-gray-50 border-b border-gray-200">
            <div className="px-4 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={11} /> Timestamp
            </div>
            <div className="px-4 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Action / Details
            </div>
          </div>

          {session.entries.map((entry, idx) => {
            const meta      = getMeta(entry.action)
            const badgeCls  = entry.mismatch ? BADGE.red   : (BADGE[meta.color] || BADGE.blue)
            const dotCls    = entry.mismatch ? DOT.red     : (DOT[meta.color]   || DOT.blue)
            const isFlagged = Boolean(flagged[entry.id])
            const isLogin   = entry.action === 'LOGIN'
            const isLogout  = entry.action === 'LOGOUT'

            return (
              <div
                key={entry.id}
                className={`grid grid-cols-[150px_1fr] gap-0 ${
                  isFlagged    ? 'bg-red-50' :
                  isLogin      ? 'bg-teal-50' :
                  isLogout     ? 'bg-slate-50' :
                  entry.mismatch ? 'bg-red-50' :
                  idx % 2 === 0  ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                {/* ── Time column ── */}
                <div className={`px-4 py-3 border-r border-gray-200 flex flex-col justify-center ${
                  isLogin  ? 'border-r-teal-300' :
                  isLogout ? 'border-r-slate-300' : ''
                }`}>
                  <span className={`text-xs font-mono font-bold leading-tight ${
                    isLogin  ? 'text-teal-700' :
                    isLogout ? 'text-slate-600' :
                    entry.mismatch ? 'text-red-700' :
                    'text-gray-800'
                  }`}>
                    {entry.ts ? fmtTime(entry.ts) : '—'}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                    {entry.ts ? fmtDate(entry.ts) : ''}
                  </span>
                </div>

                {/* ── Action column ── */}
                <div className="px-4 py-3 flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Colored dot */}
                    <div className={`mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0 ${dotCls}`} />

                    <div className="min-w-0 flex-1">
                      {/* Action badge */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeCls}`}>
                        <meta.Icon size={11} />
                        {meta.label}
                      </span>

                      {/* Mismatch warning */}
                      {entry.mismatch && (
                        <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-300 uppercase">
                          <AlertTriangle size={9} /> Hash tampered — mismatch detected
                        </span>
                      )}

                      {/* Details line */}
                      {(entry.caseNo || entry.evidRef || entry.hash) && (
                        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                          {entry.caseNo && (
                            <span className="flex items-center gap-1">
                              <FolderOpen size={10} className="text-gray-400" />
                              Case: <span className="font-mono font-semibold text-gray-700 ml-1">{entry.caseNo}</span>
                            </span>
                          )}
                          {entry.evidRef && (
                            <span className="flex items-center gap-1">
                              <FileText size={10} className="text-gray-400" />
                              Evidence: <span className="font-mono font-semibold text-gray-700 ml-1">{entry.evidRef}</span>
                            </span>
                          )}
                          {entry.hash && (
                            <span className="flex items-center gap-1">
                              <Hash size={10} className="text-gray-400" />
                              Hash: <span className={`font-mono ml-1 ${entry.mismatch ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                                {entry.hash.length > 20 ? `${entry.hash.slice(0, 20)}…` : entry.hash}
                              </span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Flag button */}
                  <button
                    type="button"
                    onClick={() => onToggleFlag(entry.id)}
                    title={isFlagged ? 'Remove flag' : 'Flag as suspicious'}
                    className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                      isFlagged
                        ? 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                        : entry.mismatch
                          ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                          : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100 hover:text-gray-600'
                    }`}
                  >
                    <Flag size={10} />
                    {isFlagged ? 'Flagged' : 'Flag'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function AuditorPage() {
  const { user } = useAuthStore()

  // all hooks — must be unconditional
  const [page,         setPage]        = useState(1)
  const [filterUser,   setFilterUser]  = useState('')
  const [filterAction, setFilterAction]= useState('')
  const [dateFrom,     setDateFrom]    = useState('')
  const [dateTo,       setDateTo]      = useState('')
  const [flagged,      setFlagged]     = useState({})
  const [exportOpen,   setExportOpen]  = useState(false)
  const [view,         setView]        = useState('timeline')
  const [useMock,      setUseMock]     = useState(false)

  const queryParams = useMemo(() => ({
    page,
    per_page: PAGE_SIZE,
    ...(filterAction ? { action:    filterAction } : {}),
    ...(filterUser   ? { user_id:   filterUser   } : {}),
    ...(dateFrom     ? { date_from: dateFrom     } : {}),
    ...(dateTo       ? { date_to:   dateTo       } : {}),
  }), [page, filterAction, filterUser, dateFrom, dateTo])

  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['auditor-stats'],
    queryFn:  adminAPI.getAccessLogStats,
    refetchInterval: 30000,
    retry: 1,
  })

  const { data: logData, isLoading: logLoading, isFetching, error: logError } = useQuery({
    queryKey: ['auditor-log', queryParams],
    queryFn:  () => adminAPI.getAccessLog(queryParams),
    placeholderData: (prev) => prev,
    retry: 1,
  })

  // derive rows — must be before early return so useMemo hooks below run unconditionally
  const apiRows  = extractRows(logData)
  const showMock = useMock || (!logLoading && (!!logError || apiRows.length === 0))
  const rawRows  = showMock ? MOCK_ROWS : apiRows

  const sessions = useMemo(() => buildSessions(rawRows), [rawRows])

  const uniqueUsers = useMemo(() => {
    const map = new Map()
    rawRows.forEach((r) => {
      const n = r.user_name || r.user?.name || r.user?.full_name
      if (n && !map.has(n)) map.set(n, { id: r.user_id || n, name: n })
    })
    return Array.from(map.values())
  }, [rawRows])

  // role guard — after all hooks
  if (!isAuditor(user)) return <Navigate to="/dashboard" replace />

  // stats with mock fallback
  const rs = (statsError || !statsData) ? MOCK_STATS : statsData
  const stats = {
    actionsToday:     rs.total_actions_today        ?? rs.total_actions   ?? 0,
    activeUsers:      rs.active_investigators_today ?? rs.active_users    ?? 0,
    evidenceTouched:  rs.evidence_items_touched     ?? rs.evidence_items  ?? 0,
    hashChecks:       rs.hash_verifications         ?? rs.hash_verifications_today ?? 0,
  }

  const flagCount  = Object.values(flagged).filter(Boolean).length
  const toggleFlag = (id) => setFlagged((p) => ({ ...p, [id]: !p[id] }))
  const resetFilters = () => { setPage(1); setFilterUser(''); setFilterAction(''); setDateFrom(''); setDateTo('') }

  const totalResults = showMock ? MOCK_ROWS.length : Number(logData?.total || logData?.total_count || rawRows.length)
  const canGoPrev    = page > 1
  const canGoNext    = page * PAGE_SIZE < totalResults

  const handlePDF   = () => { exportPDF(sessions, flagged);   setExportOpen(false) }
  const handleExcel = () => { exportExcel(sessions, flagged); setExportOpen(false) }
  const handleCSV   = () => { adminAPI.exportAccessLog(queryParams); setExportOpen(false) }

  return (
    <Layout>
      <div className="space-y-5">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert size={24} className="text-blue-600" />
              Audit Monitor
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Full session trail — every login, action, and logout with exact timestamps.
            </p>
            {showMock && (
              <span className="mt-2 inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Demo data — connect backend to see live sessions
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {flagCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-700 border border-red-200">
                <Flag size={13} /> {flagCount} flagged
              </span>
            )}

            {/* View toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
              <button type="button" onClick={() => setView('timeline')}
                className={`flex items-center gap-1.5 px-3 py-2 ${view === 'timeline' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                <LayoutList size={14} /> Timeline
              </button>
              <button type="button" onClick={() => setView('table')}
                className={`flex items-center gap-1.5 px-3 py-2 ${view === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                <Table2 size={14} /> Table
              </button>
            </div>

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

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {statsLoading ? (
            [...Array(4)].map((_, i) => <StatSkeleton key={i} />)
          ) : (<>
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
          </>)}
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Filter sessions</p>
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

        {/* ── Error banner ── */}
        {logError && !showMock && (
          <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-center justify-between">
            <span>Could not load live data — {logError?.message || 'backend unavailable'}.</span>
            <button type="button" onClick={() => setUseMock(true)} className="ml-4 text-xs font-semibold underline">
              Show demo data
            </button>
          </div>
        )}

        {/* ── Summary bar ── */}
        <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
          <span className="font-semibold text-gray-800">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</span>
          <span className="text-gray-300">|</span>
          <span>{rawRows.length} total events {showMock ? '(demo)' : ''}</span>
          {sessions.filter((s) => s.active).length > 0 && (
            <>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1.5 text-green-700 font-medium">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                {sessions.filter((s) => s.active).length} user{sessions.filter((s) => s.active).length > 1 ? 's' : ''} active now
              </span>
            </>
          )}
          {isFetching && !showMock && <span className="text-gray-400">(refreshing…)</span>}
          {showMock && (
            <button type="button" onClick={() => setUseMock(false)} className="text-xs text-blue-600 hover:underline">
              Retry live data
            </button>
          )}
          {flagCount > 0 && (
            <>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1 text-red-600 font-semibold">
                <ShieldAlert size={13} /> {flagCount} event{flagCount > 1 ? 's' : ''} flagged
              </span>
            </>
          )}
        </div>

        {/* ── Timeline view ── */}
        {view === 'timeline' && (
          <div className="space-y-4">
            {logLoading && !showMock ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-36" />
              ))
            ) : sessions.length > 0 ? (
              sessions.map((session) => (
                <SessionCard key={session.id} session={session} flagged={flagged} onToggleFlag={toggleFlag} />
              ))
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
                <p className="text-sm text-gray-400">No sessions found for the current filters.</p>
                <button type="button" onClick={resetFilters} className="mt-2 text-xs text-blue-600 hover:underline">
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Table view ── */}
        {view === 'table' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['User', 'Action', 'Timestamp', 'Evidence Ref', 'Case No.', 'Hash at Time', 'Flag'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logLoading && !showMock
                    ? [...Array(8)].map((_, i) => (
                        <tr key={i}>
                          {[...Array(7)].map((__, j) => (
                            <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
                          ))}
                        </tr>
                      ))
                    : rawRows.length > 0
                      ? rawRows.map((row, idx) => {
                          const meta     = getMeta(row.action)
                          const mismatch = ['TAMPERED', 'MISMATCH'].includes(String(row.hash_status || row.integrity_status || '').toUpperCase())
                          const rowId    = row.id || `t-${idx}`
                          const isFlagged= Boolean(flagged[rowId])
                          const ts       = row.timestamp || row.created_at
                          return (
                            <tr key={rowId} className={isFlagged ? 'bg-red-50' : 'hover:bg-gray-50'}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${row.user_role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {getInitials(row.user_name || row.user?.name)}
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-gray-900">{row.user_name || row.user?.name || 'Unknown'}</p>
                                    <p className="text-[10px] text-gray-400 uppercase">{row.user_role || ''}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${BADGE[meta.color] || BADGE.blue}`}>
                                  <meta.Icon size={10} /> {meta.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="font-mono text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded">
                                  {fmtFull(ts)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs font-mono text-gray-700">{row.evidence_ref || row.evidence_id || '—'}</td>
                              <td className="px-4 py-3 text-xs text-gray-700">{row.case_number || row.case_id || '—'}</td>
                              <td className="px-4 py-3 text-xs font-mono">
                                <span className={mismatch ? 'text-red-600 font-bold' : 'text-gray-600'}>
                                  {(row.hash_at_time || row.hash || '—').slice(0, 18)}{(row.hash_at_time || row.hash || '').length > 18 ? '…' : ''}
                                </span>
                                {mismatch && <span className="ml-1 text-[9px] text-red-600 font-bold">⚠</span>}
                              </td>
                              <td className="px-4 py-3">
                                <button type="button" onClick={() => toggleFlag(rowId)}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold border ${
                                    isFlagged ? 'bg-red-100 text-red-700 border-red-300' : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                                  }`}>
                                  <Flag size={9} /> {isFlagged ? 'Flagged' : 'Flag'}
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      : (
                          <tr>
                            <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                              No entries match the current filters.
                            </td>
                          </tr>
                        )
                  }
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <p className="text-sm text-gray-500">Showing {rawRows.length} of {totalResults} entries</p>
              <div className="flex items-center gap-2">
                <button type="button" disabled={!canGoPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 disabled:opacity-40 hover:bg-gray-100">← Prev</button>
                <span className="text-sm text-gray-600">Page {page}</span>
                <button type="button" disabled={!canGoNext} onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 disabled:opacity-40 hover:bg-gray-100">Next →</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
