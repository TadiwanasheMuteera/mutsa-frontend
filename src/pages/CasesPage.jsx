import { useEffect, useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import { casesAPI } from '../api/cases'
import { useAuthStore } from '../store/authStore'
import { isInvestigator, isAuthorizer } from '../utils/rbac'
import { Plus, AlertCircle, Search, X } from 'lucide-react'

export default function CasesPage() {
  const navigate    = useNavigate()
  const location    = useLocation()
  const { user }    = useAuthStore()
  const [search, setSearch] = useState('')

  const createdReferenceNumber = location.state?.createdReferenceNumber
  useEffect(() => {
    if (createdReferenceNumber) navigate(location.pathname, { replace: true, state: null })
  }, [createdReferenceNumber, location.pathname, navigate])

  const { data, isLoading, error } = useQuery({
    queryKey: ['cases', isInvestigator(user) ? user?.id : 'all'],
    queryFn: async () => {
      const result = await casesAPI.getCases({ page: 1, per_page: 100 })
      return result.cases || result.data || []
    },
    refetchOnMount: true,
  })

  const allCases = data || []

  // Role-aware filtering: Authorizers see only PENDING_APPROVAL by default
  const filtered = useMemo(() => {
    let list = allCases

    // Authorizers only see pending cases
    if (isAuthorizer(user)) {
      list = list.filter((c) =>
        ['PENDING_APPROVAL', 'PENDING', 'AWAITING_APPROVAL'].includes(
          (c.status || '').toUpperCase()
        )
      )
    }

    if (isInvestigator(user) && user?.id) {
      list = list.filter((c) => {
        const createdBy = c.created_by || c.createdBy || c.creator_id
        const assignedTo = c.assigned_to || c.assignedTo || c.assigned_user_id || c.investigator_id
        return (
          String(createdBy) === String(user.id) || String(assignedTo) === String(user.id)
        )
      })
    }

    // Search — match case_number, id, or title
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (c) =>
          (c.case_number || '').toLowerCase().includes(q) ||
          (c.id          || '').toLowerCase().includes(q) ||
          (c.title       || '').toLowerCase().includes(q)
      )
    }

    return list
  }, [allCases, search, user])

  const pageTitle = isAuthorizer(user)
    ? 'Pending Approvals'
    : isInvestigator(user)
    ? 'My Cases'
    : 'Cases'

  const pageDesc = isAuthorizer(user)
    ? 'Cases awaiting your approval'
    : isInvestigator(user)
    ? 'Cases you have submitted'
    : 'All forensic investigation cases'

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <div>
            <h3 className="font-semibold">Error loading cases</h3>
            <p className="text-sm">{error.message}</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div>
        {createdReferenceNumber && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-6">
            <div className="font-semibold">Case submitted for approval</div>
            <div className="text-sm">
              Reference: <span className="font-mono font-semibold">{createdReferenceNumber}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{pageDesc}</p>
          </div>
          {!isAuthorizer(user) && (
            <button
              onClick={() => navigate('/cases/new')}
              className="flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
            >
              <Plus size={16} /> New Case
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="relative mb-5 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by case ID, reference number or title…"
            className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Results count */}
        {search && (
          <p className="text-xs text-gray-500 mb-3">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &quot;{search}&quot;
          </p>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Fraud type
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Investigator
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Evidence</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                    Updated
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c) => {
                  const investigator =
                    c.assigned_user_name ||
                    c.investigator_name ||
                    c.assigned_to_name ||
                    c.created_by_name ||
                    c.creator_name ||
                    c.created_by_user_name ||
                    (c.created_by &&
                    user?.id &&
                    String(c.created_by) === String(user.id)
                      ? user?.name || user?.full_name || user?.email
                      : null) ||
                    (c.assigned_to &&
                    user?.id &&
                    String(c.assigned_to) === String(user.id)
                      ? user?.name || user?.full_name || user?.email
                      : null) ||
                    '—'
                  const fraudLabel = c.fraud_type ? String(c.fraud_type).replace(/_/g, ' ') : '—'
                  const updated =
                    c.updated_at || c.updatedAt
                      ? new Date(c.updated_at || c.updatedAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'
                  return (
                  <tr key={c.id} className="hover:bg-accent/5 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-mono text-gray-700 whitespace-nowrap">
                      {c.case_number || c.caseNumber || c.id?.substring(0, 10)}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900 max-w-[200px] truncate">
                      {c.title}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 hidden sm:table-cell">{fraudLabel}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 hidden md:table-cell max-w-[140px] truncate">
                      {investigator}
                    </td>
                    <td className="px-5 py-3.5 text-sm">
                      <Badge status={c.status} />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 hidden lg:table-cell">{c.evidenceCount ?? c.evidence_count ?? '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 hidden xl:table-cell whitespace-nowrap">{updated}</td>
                    <td className="px-5 py-3.5 text-sm flex items-center gap-3">
                      <button
                        onClick={() => navigate(`/cases/${c.id}`)}
                        className="text-accent hover:text-accent/80 font-medium"
                      >
                        View
                      </button>
                      {isAuthorizer(user) && (
                        <button
                          onClick={() => navigate(`/cases/${c.id}`)}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-14 text-center">
              <p className="text-sm text-gray-400">
                {search
                  ? `No cases match "${search}". Try a different search term.`
                  : isAuthorizer(user)
                  ? 'No cases are pending approval right now.'
                  : 'No cases found. Create your first case to get started.'}
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="mt-2 text-xs text-accent hover:underline">
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
