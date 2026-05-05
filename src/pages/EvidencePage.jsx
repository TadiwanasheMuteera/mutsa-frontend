import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import { evidenceAPI } from '../api/evidence'
import { casesAPI } from '../api/cases'
import { Plus, AlertCircle } from 'lucide-react'

import {
  getEvidenceItemName,
  getEvidenceStatus,
  formatEvidenceTypeLabel,
} from '../utils/evidenceDisplay'

export default function EvidencePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const caseId = searchParams.get('caseId')
  const createdEvidenceTag = location.state?.createdEvidenceTag

  const { data: allCases = [] } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const result = await casesAPI.getCases()
      return result.cases || []
    },
    refetchOnMount: true,
  })

  const { isLoading, error, data: evidence = [] } = useQuery({
    queryKey: ['evidence', caseId || 'all'],
    queryFn: async () => {
      if (caseId) {
        const result = await evidenceAPI.getEvidenceByCaseId(caseId)
        return Array.isArray(result) ? result : []
      }
      const casesResult = await casesAPI.getCases()
      const casesList = casesResult.cases || []
      const allEvidence = await Promise.all(
        casesList.map((c) =>
          evidenceAPI.getEvidenceByCaseId(c.id).catch(() => [])
        )
      )
      return allEvidence.flat()
    },
    refetchOnMount: true,
  })

  const tableRows = useMemo(() => {
    if (!Array.isArray(evidence)) return []
    return evidence
  }, [evidence])

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
              Showing evidence for case:{' '}
              <span className="font-semibold">
                {allCases?.find((c) => c.id === caseId)?.title || caseId}
              </span>
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tag
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Item name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((item) => {
                  const itemName = getEvidenceItemName(item)
                  const status = getEvidenceStatus(item)
                  const typeLabel = formatEvidenceTypeLabel(item)
                  const tag = item.evidence_tag || item.evidenceTag || '—'
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-gray-200 hover:bg-accent/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-gray-700">{tag}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{itemName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {item.description || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                          {typeLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {status ? (
                          <Badge status={status} variant="evidence" />
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          type="button"
                          onClick={() => navigate(`/evidence/${item.id}`)}
                          className="text-accent hover:text-accent/80 font-medium transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {(!tableRows || tableRows.length === 0) && (
            <div className="p-8 text-center text-gray-500">
              <p>
                No evidence items {caseId ? 'for this case' : ''}. Create your first evidence item to
                get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
