import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import { casesAPI } from '../api/cases'
import { useAuthStore } from '../store/authStore'
import { isInvestigator } from '../utils/rbac'
import {
  Plus, FileText, Clock, CheckCircle2, XCircle, FolderOpen,
} from 'lucide-react'

export default function InvestigatorPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // ── hooks must come before any conditional return ──
  const { data, isLoading } = useQuery({
    queryKey: ['my-cases', user?.id],
    queryFn: async () => {
      const result = await casesAPI.getCases()
      return result.cases || result.data || (Array.isArray(result) ? result : [])
    },
    refetchOnMount: true,
    enabled: isInvestigator(user),
  })

  if (!isInvestigator(user)) return <Navigate to="/home" replace />

  const cases   = data || []
  const pending = cases.filter((c) => ['PENDING_APPROVAL','PENDING','AWAITING_APPROVAL'].includes((c.status||'').toUpperCase()))
  const open    = cases.filter((c) => ['OPEN','ACTIVE','UNDER_INVESTIGATION'].includes((c.status||'').toUpperCase()))
  const closed  = cases.filter((c) => ['CLOSED','RESOLVED','REJECTED'].includes((c.status||'').toUpperCase()))

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name || user?.full_name || 'Investigator'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Investigator Dashboard — manage your cases and evidence
          </p>
        </div>

        {/* Stat cards */}
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
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Cases</p>
            </div>
            <p className="text-3xl font-bold text-gray-700">{cases.length}</p>
          </div>
        </div>

        {/* Quick actions */}
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
            <FileText size={16} /> View All Cases
          </button>
        </div>

        {/* Recent cases */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-700">Recent Cases</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : cases.length === 0 ? (
            <div className="py-12 text-center">
              <FileText size={28} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No cases yet — create your first case</p>
              <button onClick={() => navigate('/cases/new')}
                className="mt-3 text-xs text-accent hover:underline">
                Create case →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {cases.slice(0, 8).map((c) => (
                <div key={c.id}
                  onClick={() => navigate(`/cases/${c.id}`)}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <FolderOpen size={15} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                    <p className="text-xs text-gray-400 font-mono">{c.case_number || c.id?.substring(0,10)}</p>
                  </div>
                  <Badge status={c.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
