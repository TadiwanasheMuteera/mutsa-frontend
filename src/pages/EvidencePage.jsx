import { useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import { evidenceAPI } from '../api/evidence'
import { casesAPI } from '../api/cases'
import { Plus, AlertCircle } from 'lucide-react'

export default function EvidencePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const caseId = searchParams.get('caseId')
  const createdEvidenceTag = location.state?.createdEvidenceTag

  console.log('EvidencePage - caseId from URL:', caseId)

  const { data: allCases = [] } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      console.log('EvidencePage: Fetching all cases')
      try {
        const result = await casesAPI.getCases()
        console.log('EvidencePage: Fetched cases result:', result)
        return result.cases || []
      } catch (err) {
        console.error('EvidencePage: Error fetching cases:', err)
        throw err
      }
    },
    refetchOnMount: true,
  })

  let evidenceQuery
  if (caseId) {
    console.log('EvidencePage: caseId exists, fetching evidence for:', caseId)
    evidenceQuery = useQuery({
      queryKey: ['evidence', caseId],
      queryFn: async () => {
        console.log('Fetching evidence for caseId:', caseId)
        try {
          const result = await evidenceAPI.getEvidenceByCaseId(caseId)
          console.log('Fetched evidence result:', result)
          return result || []
        } catch (err) {
          console.error('Error fetching evidence:', err)
          throw err
        }
      },
      refetchOnMount: true,
    })
  } else {
    console.log('EvidencePage: No caseId in URL, fetching evidence from all cases')
    // Query all cases and then extract their evidence
    evidenceQuery = useQuery({
      queryKey: ['evidence-all'],
      queryFn: async () => {
        console.log('Fetching evidence from all cases')
        try {
          const casesResult = await casesAPI.getCases()
          const allCases = casesResult.cases || []
          console.log('Got cases:', allCases.length)
          
          // Get evidence for each case and combine them
          const allEvidence = await Promise.all(
            allCases.map(c => 
              evidenceAPI.getEvidenceByCaseId(c.id).catch(err => {
                console.warn(`Failed to get evidence for case ${c.id}:`, err)
                return []
              })
            )
          )
          const combined = allEvidence.flat()
          console.log('Fetched all evidence from cases:', combined)
          return combined || []
        } catch (err) {
          console.error('Error fetching all evidence:', err)
          throw err
        }
      },
      refetchOnMount: true,
    })
  }

  const { isLoading, error, data: evidence = [] } = evidenceQuery || { isLoading: false, data: [] }

  console.log('EvidencePage - isLoading:', isLoading, 'error:', error, 'evidence:', evidence)

  useEffect(() => {
    if (createdEvidenceTag) {
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
    }
  }, [createdEvidenceTag, location.pathname, location.search, navigate])

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
              <h3 className="font-semibold">Error loading evidence</h3>
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
        {createdEvidenceTag && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-6">
            <div className="font-semibold">Evidence logged successfully</div>
            <div className="text-sm">
              Evidence Tag: <span className="font-mono font-semibold">{createdEvidenceTag}</span>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Evidence Items</h1>
            <p className="text-gray-600 text-sm mt-1">Manage digital evidence</p>
          </div>
          <button
            onClick={() => navigate('/evidence/new')}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors font-medium"
          >
            <Plus size={20} />
            Add Evidence
          </button>
        </div>

        {caseId && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Showing evidence for case: <span className="font-semibold">{
                allCases?.find(c => c.id === caseId)?.title || caseId
              }</span>
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {evidence?.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-accent/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{item.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.type || 'File'}</td>
                    <td className="px-6 py-4 text-sm">
                      <Badge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => navigate(`/evidence/${item.id}`)}
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
          {(!evidence || evidence.length === 0) && (
            <div className="p-8 text-center text-gray-500">
              <p>No evidence items {caseId ? 'for this case' : ''}. Create your first evidence item to get started.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
