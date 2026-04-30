import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow, format } from 'date-fns'
import Layout from '../components/layout/Layout'
import StatCard from '../components/ui/StatCard'
import Spinner from '../components/ui/Spinner'
import { useAuthStore } from '../store/authStore'
import { ROLES, normalizeRole } from '../utils/rbac'
import { casesAPI } from '../api/cases'
import { evidenceAPI } from '../api/evidence'
import { custodyAPI } from '../api/custody'
import {
  FileText,
  Package,
  Clock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'

// Loading skeleton component
function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-16"></div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-200">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
      </td>
    </tr>
  )
}

// Fraud type badge
function FraudTypeBadge({ type }) {
  const fraudColors = {
    SIM_SWAP: 'bg-red-100 text-red-800 border border-red-300',
    BEC: 'bg-orange-100 text-orange-800 border border-orange-300',
    INSIDER_FRAUD: 'bg-purple-100 text-purple-800 border border-purple-300',
    PHISHING: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    IDENTITY_THEFT: 'bg-pink-100 text-pink-800 border border-pink-300',
    MONEY_LAUNDERING: 'bg-indigo-100 text-indigo-800 border border-indigo-300',
    CYBER_ATTACK: 'bg-cyan-100 text-cyan-800 border border-cyan-300',
  }

  const color = fraudColors[type] || 'bg-gray-100 text-gray-800 border border-gray-300'
  const label = type?.replace(/_/g, ' ') || 'Unknown'

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      {label}
    </span>
  )
}

// Status badge
function StatusBadge({ status }) {
  const colors = {
    ACTIVE: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    ARCHIVED: 'bg-gray-100 text-gray-800',
    REFERRED: 'bg-blue-100 text-blue-800',
    CLOSED: 'bg-red-100 text-red-800',
  }

  const color = colors[status] || 'bg-gray-100 text-gray-800'

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: cases = [], isLoading: casesLoading, error: casesError } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      try {
        const result = await casesAPI.getCases()
        console.log('Dashboard: Fetched cases from API:', result)
        return result.cases || []
      } catch (err) {
        console.error('Dashboard: Error fetching cases:', err)
        throw err
      }
    },
    refetchOnMount: 'stale',
    staleTime: 0,
    gcTime: 0,
  })

  console.log('Dashboard rendered with cases:', cases)

  // Fetch enriched case data with evidence counts
  const { data: enrichedCases = [], isLoading: enrichedLoading } = useQuery({
    queryKey: ['dashboard-enriched-cases', cases.length],
    queryFn: async () => {
      if (!cases || cases.length === 0) return []
      console.log('Dashboard: Enriching cases with evidence counts')
      
      try {
        const enriched = await Promise.all(
          cases.map(async (caseItem) => {
            try {
              const evidenceResult = await evidenceAPI.getEvidenceByCaseId(caseItem.id)
              const evidenceList = Array.isArray(evidenceResult) ? evidenceResult : []
              return {
                ...caseItem,
                evidenceCount: evidenceList.length,
                evidence: evidenceList,
              }
            } catch (err) {
              console.warn(`Dashboard: Error fetching evidence for case ${caseItem.id}:`, err?.message)
              return {
                ...caseItem,
                evidenceCount: 0,
                evidence: [],
              }
            }
          })
        )
        
        console.log('Dashboard: Enriched cases:', enriched)
        return enriched
      } catch (err) {
        console.error('Dashboard: Error enriching cases:', err)
        return cases
      }
    },
    enabled: cases.length > 0,
    staleTime: 0,
    gcTime: 0,
  })

  if (casesLoading) {
    return (
      <Layout>
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Welcome back! Here's your forensic evidence overview.</p>
          </div>

          {/* Skeleton Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>

          {/* Skeleton Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reference Number</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fraud Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Evidence</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (casesError) {
    return (
      <Layout>
        <div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center gap-3">
            <AlertCircle size={24} />
            <div>
              <h3 className="font-semibold">Error loading dashboard</h3>
              <p className="text-sm">{casesError.message}</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Calculate statistics using enriched cases data
  const displayCases = enrichedCases.length > 0 ? enrichedCases : cases
  const currentRole = normalizeRole(user?.role) || ROLES.AUDITOR
  
  // Active cases = all open cases (not CLOSED and not ARCHIVED)
  const activeCases = displayCases?.filter(c => 
    c.status !== 'CLOSED' && c.status !== 'ARCHIVED' && c.status !== null && c.status !== undefined
  ).length || 0
  const totalEvidence = displayCases?.reduce((sum, c) => sum + (c.evidenceCount || 0), 0) || 0
  const pendingTransfers = 0 // TODO: fetch from custody API if needed
  const prosecutionReferrals = displayCases?.filter(c => c.status === 'REFERRED').length || 0

  // Get tampered evidence (from evidence data)
  const tamperedEvidence = displayCases
    ?.flatMap(c =>
      (c.evidence || [])
        .filter(e => e.hashStatus === 'TAMPERED' || e.hash_status === 'TAMPERED')
        .map(e => ({
          ...e,
          caseId: c.id,
          caseNo: c.case_number || c.caseNumber || c.id.substring(0, 8),
        }))
    )
    .slice(0, 5) || []

  // Get recent activity from all cases (this would need custody records fetched)
  const recentActivity = displayCases
    ?.flatMap(c =>
      (c.custodyRecords || []).map(record => ({
        ...record,
        caseId: c.id,
        caseNo: c.case_number || c.caseNumber || c.id.substring(0, 8),
      }))
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10) || []

  const assignedCases = displayCases?.filter((caseItem) => {
    const assignedId = caseItem.assigned_to || caseItem.assignedTo || caseItem.assigned_user_id
    const assignedName = caseItem.assigned_name || caseItem.assignedTo || caseItem.investigator
    const hasSameId = assignedId && user?.id && String(assignedId) === String(user.id)
    const hasSameName = assignedName && user?.name &&
      String(assignedName).toLowerCase().includes(String(user.name).toLowerCase())
    return hasSameId || hasSameName
  }).length || 0

  const pendingCases = displayCases?.filter(c => c.status === 'PENDING').length || 0
  const archivedCases = displayCases?.filter(c => c.status === 'ARCHIVED').length || 0

  const roleConfig = {
    [ROLES.ADMIN]: {
      tone: 'bg-purple-50 border-purple-200 text-purple-900',
      title: 'Administrator View',
      message: 'Full platform visibility with governance and integrity monitoring tools.',
    },
    [ROLES.AUDITOR]: {
      tone: 'bg-blue-50 border-blue-200 text-blue-900',
      title: 'Auditor View',
      message: 'Audit dashboard focused on custody history, access monitoring, and integrity checks.',
    },
  }[currentRole] || {
    tone: 'bg-blue-50 border-blue-200 text-blue-900',
    title: 'Auditor View',
    message: 'Audit dashboard focused on custody history, access monitoring, and integrity checks.',
  }

  const roleStatCards = {
    [ROLES.ADMIN]: [
      { title: 'Active Cases', value: activeCases, icon: FileText, color: 'accent' },
      { title: 'Evidence Logged', value: totalEvidence, icon: Package, color: 'green' },
      { title: 'Integrity Alerts', value: tamperedEvidence.length, icon: AlertTriangle, color: 'red' },
      { title: 'Referred to Prosecution', value: prosecutionReferrals, icon: CheckCircle2, color: 'primary' },
    ],
    [ROLES.AUDITOR]: [
      { title: 'Evidence Actions Today', value: recentActivity.length, icon: Clock, color: 'blue' },
      { title: 'Chain Integrity Alerts', value: tamperedEvidence.length, icon: AlertTriangle, color: 'red' },
      { title: 'Active Cases', value: activeCases, icon: FileText, color: 'accent' },
      { title: 'Evidence Logged', value: totalEvidence, icon: Package, color: 'green' },
    ],
  }[currentRole] || []

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-gray-600 text-sm mt-1">Welcome back! Here's your forensic evidence overview.</p>
        </div>

        <div className={`mb-6 rounded-xl border px-4 py-3 ${roleConfig.tone}`}>
          <p className="font-semibold text-sm">{roleConfig.title}</p>
          <p className="text-xs mt-1 opacity-90">{roleConfig.message}</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {roleStatCards.map((card) => (
            <StatCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
            />
          ))}
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {currentRole === ROLES.ADMIN && (
            <button
              onClick={() => navigate('/admin/access-log')}
              className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
            >
              Open Access Log
            </button>
          )}
          {currentRole === ROLES.AUDITOR && (
            <button
              onClick={() => navigate('/admin/access-log')}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Review Access Activity
            </button>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Cases Table - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-primary">Recent Cases</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reference Number</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fraud Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Evidence</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayCases?.slice(0, 8).map((caseItem) => (
                      <tr
                        key={caseItem.id}
                        className="border-b border-gray-200 hover:bg-accent/5 cursor-pointer transition-colors"
                        onClick={() => navigate(`/cases/${caseItem.id}`)}
                      >
                        <td className="px-6 py-4 text-sm font-mono font-semibold text-primary">
                          {caseItem.case_number || caseItem.caseNumber || caseItem.id.substring(0, 8)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <FraudTypeBadge type={caseItem.fraudType || 'Unknown'} />
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <StatusBadge status={caseItem.status || 'ACTIVE'} />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {caseItem.evidenceCount || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {caseItem.assignedTo || caseItem.investigator || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {caseItem.updatedAt || caseItem.createdAt ? 
                            format(new Date(caseItem.updatedAt || caseItem.createdAt), 'MMM dd, yyyy')
                            : 'N/A'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(!displayCases || displayCases.length === 0) && (
                <div className="p-8 text-center text-gray-500">
                  <p>No cases found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Chain Integrity Alerts - 1/3 width */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-red-200 bg-red-50">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={20} className="text-red-600" />
                  <h2 className="font-semibold text-red-900">Chain Integrity Alerts</h2>
                </div>
              </div>

              {tamperedEvidence.length > 0 ? (
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {tamperedEvidence.map((evidence, idx) => (
                    <div key={`${evidence.caseId}-${idx}`} className="p-4 hover:bg-red-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-red-200">
                            <AlertTriangle size={14} className="text-red-700" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            Case {evidence.caseNo}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Evidence ID: <span className="font-mono">{evidence.id.substring(0, 8)}</span>
                          </p>
                          <p className="text-xs text-red-700 font-medium mt-1">
                            Hash Mismatch Detected
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {evidence.flaggedDate ? 
                              format(new Date(evidence.flaggedDate), 'MMM dd, yyyy HH:mm')
                              : format(new Date(), 'MMM dd, yyyy HH:mm')
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="flex justify-center mb-3">
                    <CheckCircle2 size={24} className="text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">All Systems Secure</p>
                  <p className="text-xs text-gray-500 mt-1">No integrity issues detected</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-primary">Recent Activity</h2>
          </div>

          {recentActivity.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity, idx) => (
                <div key={`${activity.caseId}-${idx}`} className="px-6 py-4 hover:bg-accent/5 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-accent bg-opacity-10">
                        <ArrowRight size={16} className="text-accent" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {activity.officer || 'System'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.action || 'Updated'}
                        </p>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-mono">
                          Evidence: {activity.evidenceId?.substring(0, 8) || 'N/A'}
                        </span>
                        <span>•</span>
                        <span>
                          Case {activity.caseNo}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mt-2">
                        {activity.timestamp ? 
                          formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })
                          : 'Recently'
                        }
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => navigate(`/cases/${activity.caseId}`)}
                        className="text-accent hover:text-accent/80 transition-colors"
                      >
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No activity recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
