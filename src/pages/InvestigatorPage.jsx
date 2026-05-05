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
  Plus, FileText, Clock, CheckCircle2, FolderOpen, AlertCircle,
} from 'lucide-react'

export default function InvestigatorPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-cases', user?.id],
    queryFn: async () => {
      const result = await casesAPI.getCases({ assigned_to: user?.id })
      return result.cases || result.data || (Array.isArray(result) ? result : [])
    },
    refetchOnMount: true,
    enabled: isInvestigator(user),
  })

  if (!isInvestigator(user)) return <Navigate to="/home" replace />

  const allCases = data || []

  // Client-side safety filter: only show cases belonging to the logged-in investigator
  const myCases = allCases.filter((c) => {
    const createdBy  = c.created_by  || c.createdBy  || c.creator_id
    const assignedTo = c.assigned_to || c.assignedTo || c.assigned_user_id || c.investigator_id
    const userId     = user?.id

    if (!userId) return true // no user id to compare, show all (backend should filter)
    return (
      String(createdBy) === String(userId) ||
      String(assignedTo) === String(userId)
    )
  })

  const pending = myCases.filter((c) => ['PENDING_APPROVAL','PENDING','AWAITING_APPROVAL'].includes((c.status||'').toUpperCase()))
  const open    = myCases.filter((c) => ['OPEN','ACTIVE','UNDER_INVESTIGATION'].includes((c.status||'').toUpperCase()))
  const closed  = myCases.filter((c) => ['CLOSED','RESOLVED','REJECTED'].includes((c.status||'').toUpperCase()))

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
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">My Total Cases</p>
            </div>
            <p className="text-3xl font-bold text-gray-700">{myCases.length}</p>
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
            <FileText size={16} /> View All My Cases
          </button>
        </div>

        {/* My recent cases */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-700">My Recent Cases</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : myCases.length === 0 ? (
            <div className="py-12 text-center">
              <FileText size={28} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">You have no cases yet — create your first case</p>
              <button onClick={() => navigate('/cases/new')}
                className="mt-3 text-xs text-accent hover:underline">
                Create case →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {myCases.slice(0, 10).map((c) => (
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
