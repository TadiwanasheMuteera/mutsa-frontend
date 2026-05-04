import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import { casesAPI } from '../api/cases'
import { useAuthStore } from '../store/authStore'
import { isAuthorizer } from '../utils/rbac'
import { Navigate } from 'react-router-dom'
import {
  CheckCircle2, XCircle, AlertCircle, ClipboardList,
  Clock, ChevronDown, ChevronUp, WifiOff,
} from 'lucide-react'

const MOCK_PENDING = [
  { id: 'p1', case_number: 'COC-2026-003', title: 'SIM Swap Fraud Investigation', status: 'PENDING_APPROVAL', fraud_type: 'SIM_SWAP',      description: 'Suspect allegedly swapped SIM cards to gain access to victim bank accounts.', created_at: new Date().toISOString() },
  { id: 'p2', case_number: 'COC-2026-007', title: 'Business Email Compromise',     status: 'PENDING_APPROVAL', fraud_type: 'BEC',           description: 'Company CFO email was spoofed to authorise fraudulent wire transfers.', created_at: new Date().toISOString() },
  { id: 'p3', case_number: 'COC-2026-009', title: 'Insider Trading Evidence',      status: 'PENDING_APPROVAL', fraud_type: 'INSIDER_FRAUD', description: 'Employee leaked confidential merger data to external investors.', created_at: new Date().toISOString() },
]

// Inline approve/reject action panel
function ActionPanel({ caseItem, onApprove, onReject, isPending }) {
  const [open, setOpen]         = useState(false)
  const [rejectReason, setReason] = useState('')
  const [mode, setMode]         = useState(null) // 'approve' | 'reject'

  const handleApprove = () => {
    onApprove(caseItem.id)
    setOpen(false)
  }
  const handleReject = () => {
    if (!rejectReason.trim()) return
    onReject(caseItem.id, rejectReason.trim())
    setOpen(false)
    setReason('')
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent/80"
      >
        Review {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {open && (
        <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
          <p className="text-xs font-semibold text-gray-600">
            Case: <span className="font-mono text-gray-900">{caseItem.case_number || caseItem.id?.substring(0,10)}</span>
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setMode(mode === 'approve' ? null : 'approve')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                mode === 'approve'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'border-green-300 text-green-700 hover:bg-green-50'
              }`}
            >
              <CheckCircle2 size={14} /> Approve
            </button>
            <button
              onClick={() => setMode(mode === 'reject' ? null : 'reject')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                mode === 'reject'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'border-red-300 text-red-700 hover:bg-red-50'
              }`}
            >
              <XCircle size={14} /> Reject
            </button>
          </div>

          {mode === 'approve' && (
            <div className="pt-1">
              <p className="text-xs text-gray-500 mb-2">
                Approving this case will set its status to <strong>OPEN</strong> and notify the investigator.
              </p>
              <button
                onClick={handleApprove}
                disabled={isPending}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? <Spinner size="sm" /> : <CheckCircle2 size={14} />}
                Confirm Approval
              </button>
            </div>
          )}

          {mode === 'reject' && (
            <div className="pt-1 space-y-2">
              <label className="block text-xs font-semibold text-gray-600">
                Reason for rejection *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Explain why the case is being rejected…"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              />
              <button
                onClick={handleReject}
                disabled={isPending || !rejectReason.trim()}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? <Spinner size="sm" /> : <XCircle size={14} />}
                Confirm Rejection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AuthorizerPage() {
  const { user }    = useAuthStore()
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  // ── hooks must come before any conditional return ──
  const { data, isLoading, error } = useQuery({
    queryKey: ['pending-cases'],
    queryFn:  async () => {
      try {
        const result = await casesAPI.getCases({ status: 'PENDING_APPROVAL' })
        return result.cases || result.data || (Array.isArray(result) ? result : [])
      } catch {
        return MOCK_PENDING
      }
    },
    refetchOnMount: true,
    refetchInterval: 30000,
    enabled: isAuthorizer(user),
  })

  if (!isAuthorizer(user)) return <Navigate to="/home" replace />

  const usingMock = data?.length > 0 && data[0]?.id === 'p1'
  // Backend may already filter by status=PENDING_APPROVAL; keep client-side filter as safety net
  const allCases = data || []
  const pending = allCases.filter((c) =>
    ['PENDING_APPROVAL', 'PENDING', 'AWAITING_APPROVAL'].includes((c.status || '').toUpperCase())
  )

  const approveMutation = useMutation({
    mutationFn: (caseId) =>
      casesAPI.updateCaseStatus(caseId, 'OPEN', 'Approved by authorizer'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases'] }),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ caseId, reason }) =>
      casesAPI.updateCaseStatus(caseId, 'REJECTED', reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases'] }),
  })

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-amber-100 p-2.5 rounded-xl">
            <ClipboardList size={22} className="text-amber-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
            <p className="text-sm text-gray-500">Review and approve or reject submitted cases</p>
          </div>
        </div>

        {usingMock && (
          <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-xl text-sm">
            <WifiOff size={14} /> <strong>Demo mode</strong> — sample pending cases shown. Connect backend for live data.
          </div>
        )}

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-amber-100 p-4">
            <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-1">Awaiting Review</p>
            <p className="text-3xl font-bold text-amber-700">{pending.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-green-100 p-4">
            <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">Total Cases</p>
            <p className="text-3xl font-bold text-green-700">{allCases.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-blue-100 p-4 hidden sm:block">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Approved / Active</p>
            <p className="text-3xl font-bold text-blue-700">
              {allCases.filter((c) => ['OPEN','ACTIVE','UNDER_INVESTIGATION'].includes((c.status||'').toUpperCase())).length}
            </p>
          </div>
        </div>

        {(approveMutation.isError || rejectMutation.isError) && (
          <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <AlertCircle size={16} />
            {approveMutation.error?.response?.data?.message || rejectMutation.error?.response?.data?.message || 'Action failed'}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-3">
            <AlertCircle size={16} /> {error.message}
          </div>
        ) : pending.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
            <Clock size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No cases pending approval</p>
            <p className="text-xs text-gray-400 mt-1">New cases submitted by investigators will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-amber-200 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-sm text-gray-500">{c.case_number || c.id?.substring(0,10)}</span>
                      <Badge status={c.status} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">{c.title}</h3>
                    {c.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{c.description}</p>
                    )}
                    {c.fraud_type && (
                      <span className="mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {c.fraud_type}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/cases/${c.id}`)}
                    className="text-xs text-accent hover:underline flex-shrink-0"
                  >
                    Full details →
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <ActionPanel
                    caseItem={c}
                    isPending={approveMutation.isPending || rejectMutation.isPending}
                    onApprove={(id) => approveMutation.mutate(id)}
                    onReject={(id, reason) => rejectMutation.mutate({ caseId: id, reason })}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
