import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueries } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import { casesAPI } from '../api/cases'
import { evidenceAPI } from '../api/evidence'
import { useAuthStore } from '../store/authStore'
import { isInvestigator } from '../utils/rbac'
import {
  Plus, FileText, Clock, CheckCircle2, FolderOpen, AlertCircle,
} from 'lucide-react'

export default function InvestigatorPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isInv = isInvestigator(user)

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-cases', user?.id],
    queryFn: async () => {
      const result = await casesAPI.getCases({ assigned_to: user?.id })
      return result.cases || result.data || (Array.isArray(result) ? result : [])
    },
    refetchOnMount: true,
    enabled: isInv && !!user?.id,
  })

  const allCases = isInv ? (data || []) : []

  const myCases = useMemo(() => {
    if (!isInv || !user?.id) return []
    return allCases.filter((c) => {
      const createdBy = c.created_by || c.createdBy || c.creator_id
      const assignedTo = c.assigned_to || c.assignedTo || c.assigned_user_id || c.investigator_id
      return (
        String(createdBy) === String(user.id) || String(assignedTo) === String(user.id)
      )
    })
  }, [allCases, isInv, user?.id])

  const previewCases = useMemo(() => myCases.slice(0, 25), [myCases])

  const evidenceCountQueries = useQueries({
    queries: previewCases.map((c) => ({
      queryKey: ['evidence-count-inv', c.id],
      queryFn: async () => {
        const list = await evidenceAPI.getEvidenceByCaseId(c.id)
        return Array.isArray(list) ? list.length : 0
      },
      enabled: isInv && !!c?.id && previewCases.length > 0,
      staleTime: 120_000,
    })),
  })

  const evidenceCountAt = (idx) => {
    const q = evidenceCountQueries[idx]
    if (!q) return '—'
    if (q.isPending) return '…'
    if (q.isError) return '—'
    return q.data
  }

  if (!isInv) return <Navigate to="/home" replace />

  const pending = myCases.filter((c) =>
    ['PENDING_APPROVAL', 'PENDING', 'AWAITING_APPROVAL'].includes((c.status || '').toUpperCase())
  )
  const open = myCases.filter((c) =>
    ['OPEN', 'ACTIVE', 'UNDER_INVESTIGATION'].includes((c.status || '').toUpperCase())
  )
  const closed = myCases.filter((c) =>
    ['CLOSED', 'RESOLVED', 'REJECTED'].includes((c.status || '').toUpperCase())
  )

  return (
    <Layout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name || user?.full_name || 'Investigator'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Investigator Dashboard — manage your cases and evidence
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm">
            <AlertCircle size={14} />
            <span>Failed to load cases — {error?.message || 'backend unavailable'}.</span>
          </div>
        )}

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-amber-100 p-5">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={15} className="text-amber-500" />
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Approval</p>
            </div>
            <p className="text-3xl font-bold text-amber-700">{pending.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-blue-100 p-5">
            <div className="flex items-center gap-2 mb-1">
              <FolderOpen size={15} className="text-blue-500" />
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Active Cases</p>
            </div>
            <p className="text-3xl font-bold text-blue-700">{open.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-green-100 p-5">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={15} className="text-green-500" />
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Closed</p>
            </div>
            <p className="text-3xl font-bold text-green-700">{closed.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={15} className="text-gray-500" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">My Total Cases</p>
            </div>
            <p className="text-3xl font-bold text-gray-700">{myCases.length}</p>
          </div>
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => navigate('/cases/new')}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-accent/90"
          >
            <Plus size={16} /> Create New Case
          </button>
          <button
            onClick={() => navigate('/cases')}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50"
          >
            <FileText size={16} /> View All My Cases
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-gray-700">My active cases</h2>
            <span className="text-xs text-gray-400">Up to 25 rows · evidence counts load live</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : myCases.length === 0 ? (
            <div className="py-12 text-center">
              <FileText size={28} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">You have no cases yet — create your first case</p>
              <button
                onClick={() => navigate('/cases/new')}
                className="mt-3 text-xs text-accent hover:underline"
              >
                Create case →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Case #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                      Fraud type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Evidence
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previewCases.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-gray-700 whitespace-nowrap">
                        {c.case_number || c.id?.substring(0, 10)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[220px] truncate">{c.title}</td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                        {c.fraud_type ? String(c.fraud_type).replace(/_/g, ' ') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={c.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell whitespace-nowrap">
                        {c.created_at
                          ? new Date(c.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-800">{evidenceCountAt(idx)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/cases/${c.id}`)}
                          className="text-accent hover:text-accent/80 font-semibold"
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
