import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import { casesAPI } from '../api/cases'
import { Plus, AlertCircle } from 'lucide-react'

export default function CasesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const createdReferenceNumber = location.state?.createdReferenceNumber

  useEffect(() => {
    // Clear state so the banner doesn't persist on back/refresh navigation.
    if (createdReferenceNumber) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [createdReferenceNumber, location.pathname, navigate])

  const { data: cases = [], isLoading, error, refetch } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      try {
        const result = await casesAPI.getCases()
        console.log('Fetched cases from API:', result)
        return result.cases || []
      } catch (err) {
        console.error('Error fetching cases:', err)
        throw err
      }
    },
    refetchOnMount: true,
  })

  console.log('CasesPage rendered with cases:', cases)

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
        <div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center gap-3">
            <AlertCircle size={24} />
            <div>
              <h3 className="font-semibold">Error loading cases</h3>
              <p className="text-sm">{error.message}</p>
            </div>
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
            <div className="font-semibold">Case created</div>
            <div className="text-sm">Reference Number: <span className="font-mono font-semibold">{createdReferenceNumber}</span></div>
          </div>
        )}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Cases</h1>
            <p className="text-gray-600 text-sm mt-1">Manage forensic investigation cases</p>
          </div>
          <button
            onClick={() => navigate('/cases/new')}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors font-medium"
          >
            <Plus size={20} />
            New Case
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reference Number</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Evidence</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases?.map((caseItem) => (
                  <tr key={caseItem.id} className="border-b border-gray-200 hover:bg-accent/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-700">
                      {caseItem.case_number || caseItem.caseNumber || `${caseItem.id.substring(0, 8)}...`}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{caseItem.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{caseItem.description}</td>
                    <td className="px-6 py-4 text-sm">
                      <Badge status={caseItem.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{caseItem.evidenceCount || 0}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => navigate(`/cases/${caseItem.id}`)}
                        className="text-accent hover:text-accent/80 font-medium transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!cases || cases.length === 0) && (
            <div className="p-8 text-center text-gray-500">
              <p>No cases found. Create your first case to get started.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
