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
  Clock, ChevronDown, ChevronUp, FolderOpen, Gavel,
} from 'lucide-react'

function ActionPanel({ caseItem, onApprove, onReject, isPending }) {
  const [open, setOpen]           = useState(false)
  const [rejectReason, setReason] = useState('')
  const [mode, setMode]           = useState(null)

  const handleApprove = () => {
    onApprove(caseItem.id)
    setOpen(false)
    setMode(null)
  }
  const handleReject = () => {
    if (!rejectReason.trim()) return
    onReject(caseItem.id, rejectReason.trim())
    setOpen(false)
    setMode(null)
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
  const [tab, setTab] = useState('pending')

  // Fetch ALL cases so we can calculate approved/rejected/pending counts
  const { data, isLoading, error } = useQuery({
    queryKey: ['authorizer-all-cases'],
    queryFn: async () => {
      const result = await casesAPI.getCases()
      return result.cases || result.data || (Array.isArray(result) ? result : [])
    },
    refetchOnMount: true,
    refetchInterval: 15000,
    enabled: isAuthorizer(user),
  })

  if (!isAuthorizer(user)) return <Navigate to="/home" replace />

  const allCases = data || []

  const pending  = allCases.filter((c) =>
    ['PENDING_APPROVAL', 'PENDING', 'AWAITING_APPROVAL'].includes((c.status || '').toUpperCase())
  )
  const approved = allCases.filter((c) =>
    ['OPEN', 'ACTIVE', 'UNDER_INVESTIGATION'].includes((c.status || '').toUpperCase())
  )
  const rejected = allCases.filter((c) =>
    ['REJECTED'].includes((c.status || '').toUpperCase())
  )
  const closed = allCases.filter((c) =>
    ['CLOSED', 'RESOLVED'].includes((c.status || '').toUpperCase())
  )

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['authorizer-all-cases'] })
    queryClient.invalidateQueries({ queryKey: ['cases'] })
    queryClient.invalidateQueries({ queryKey: ['pending-cases'] })
  }

  const approveMutation = useMutation({
    mutationFn: (caseId) =>
      casesAPI.updateCaseStatus(caseId, 'OPEN', 'Approved by authorizer'),
    onSuccess: invalidateAll,
  })

  const rejectMutation = useMutation({
    mutationFn: ({ caseId, reason }) =>
      casesAPI.updateCaseStatus(caseId, 'REJECTED', reason),
    onSuccess: invalidateAll,
  })

  const displayCases =
    tab === 'pending'  ? pending  :
    tab === 'approved' ? approved :
    tab === 'rejected' ? rejected :
    allCases

  const tabs = [
    { key: 'pending',  label: 'Pending',  count: pending.length  },
    { key: 'approved', label: 'Approved', count: approved.length },
    { key: 'rejected', label: 'Rejected', count: rejected.length },
    { key: 'all',      label: 'All',      count: allCases.length },
  ]

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-amber-100 p-2.5 rounded-xl">
            <Gavel size={22} className="text-amber-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Case Approvals</h1>
            <p className="text-sm text-gray-500">Review, approve, or reject cases submitted by investigators</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm">
            <AlertCircle size={14} />
            <span>Failed to load cases — {error?.message || 'backend unavailable'}.</span>
          </div>
        )}

        {/* Stat cards — 4 columns: Pending, Approved, Rejected, Closed */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setTab('pending')}
            className={`bg-white rounded-xl border p-4 text-left transition-all ${
              tab === 'pending' ? 'ring-2 ring-amber-400 border-amber-300' : 'border-amber-100 hover:border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock size={15} className="text-amber-500" />
              <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider">Awaiting Review</p>
            </div>
            <p className="text-3xl font-bold text-amber-700">{pending.length}</p>
          </button>

          <button
            type="button"
            onClick={() => setTab('approved')}
            className={`bg-white rounded-xl border p-4 text-left transition-all ${
              tab === 'approved' ? 'ring-2 ring-green-400 border-green-300' : 'border-green-100 hover:border-green-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={15} className="text-green-500" />
              <p className="text-xs text-green-600 font-semibold uppercase tracking-wider">Approved</p>
            </div>
            <p className="text-3xl font-bold text-green-700">{approved.length}</p>
          </button>

          <button
            type="button"
            onClick={() => setTab('rejected')}
            className={`bg-white rounded-xl border p-4 text-left transition-all ${
              tab === 'rejected' ? 'ring-2 ring-red-400 border-red-300' : 'border-red-100 hover:border-red-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <XCircle size={15} className="text-red-500" />
              <p className="text-xs text-red-600 font-semibold uppercase tracking-wider">Rejected</p>
            </div>
            <p className="text-3xl font-bold text-red-700">{rejected.length}</p>
          </button>

          <button
            type="button"
            onClick={() => setTab('all')}
            className={`bg-white rounded-xl border p-4 text-left transition-all ${
              tab === 'all' ? 'ring-2 ring-blue-400 border-blue-300' : 'border-blue-100 hover:border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <FolderOpen size={15} className="text-blue-500" />
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Total Cases</p>
            </div>
            <p className="text-3xl font-bold text-blue-700">{allCases.length}</p>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label} <span className="ml-1 text-xs opacity-60">({t.count})</span>
            </button>
          ))}
        </div>

        {(approveMutation.isError || rejectMutation.isError) && (
          <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <AlertCircle size={16} />
            {approveMutation.error?.message || rejectMutation.error?.message || 'Action failed'}
          </div>
        )}

        {(approveMutation.isSuccess || rejectMutation.isSuccess) && (
          <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            <CheckCircle2 size={16} />
            Case {approveMutation.isSuccess ? 'approved' : 'rejected'} successfully. Cards updated.
          </div>
        )}

        {/* Case list */}
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : displayCases.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
            <ClipboardList size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {tab === 'pending'  && 'No cases pending approval'}
              {tab === 'approved' && 'No approved cases yet'}
              {tab === 'rejected' && 'No rejected cases'}
              {tab === 'all'      && 'No cases found'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {tab === 'pending' && 'New cases submitted by investigators will appear here'}
              {tab === 'approved' && 'Cases you approve will appear here'}
              {tab === 'rejected' && 'Cases you reject will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayCases.map((c) => {
              const status = (c.status || '').toUpperCase()
              const isPendingCase = ['PENDING_APPROVAL', 'PENDING', 'AWAITING_APPROVAL'].includes(status)
              const isRejectedCase = status === 'REJECTED'
              const isApprovedCase = ['OPEN', 'ACTIVE', 'UNDER_INVESTIGATION'].includes(status)

              const borderColor =
                isPendingCase  ? 'border-amber-200' :
                isApprovedCase ? 'border-green-200'  :
                isRejectedCase ? 'border-red-200'    :
                'border-gray-200'

              return (
                <div key={c.id} className={`bg-white rounded-xl border shadow-sm p-5 ${borderColor}`}>
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
                      <div className="mt-2 flex flex-wrap gap-2">
                        {c.fraud_type && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            {c.fraud_type?.replace(/_/g, ' ')}
                          </span>
                        )}
                        {c.created_at && (
                          <span className="text-xs text-gray-400">
                            Submitted: {new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/cases/${c.id}`)}
                      className="text-xs text-accent hover:underline flex-shrink-0"
                    >
                      Full details →
                    </button>
                  </div>

                  {/* Only show approve/reject panel for pending cases */}
                  {isPendingCase && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <ActionPanel
                        caseItem={c}
                        isPending={approveMutation.isPending || rejectMutation.isPending}
                        onApprove={(id) => approveMutation.mutate(id)}
                        onReject={(id, reason) => rejectMutation.mutate({ caseId: id, reason })}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
