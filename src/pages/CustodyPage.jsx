import { useQuery } from '@tanstack/react-query'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import { casesAPI } from '../api/cases'
import { evidenceAPI } from '../api/evidence'
import { custodyAPI } from '../api/custody'
import {
  extractCustodyRecordsFromEvidence,
  getCustodyActionLabel,
  getCustodyActorSummary,
  formatCustodyTimestamp,
} from '../utils/custodyDisplay'
import { getEvidenceItemName } from '../utils/evidenceDisplay'
import { AlertCircle } from 'lucide-react'

export default function CustodyPage() {
  const { data: custodyRecords = [], isLoading, error } = useQuery({
    queryKey: ['custody-records'],
    queryFn: async () => {
      console.log('CustodyPage: Fetching all custody records')
      try {
        // Get all cases
        const casesResult = await casesAPI.getCases()
        const cases = casesResult.cases || []
        console.log('CustodyPage: Got cases:', cases.length)

        if (!cases || cases.length === 0) {
          console.log('CustodyPage: No cases found, returning empty array')
          return []
        }

        // Fetch evidence for all cases in parallel
        const evidencePromises = cases.map(caseItem =>
          evidenceAPI.getEvidenceByCaseId(caseItem.id)
            .then(evidenceList => {
              // getEvidenceByCaseId already returns an array, not an object
              const items = Array.isArray(evidenceList) ? evidenceList : []
              console.log(`CustodyPage: Evidence for case ${caseItem.id}:`, items.length, 'items')
              return { caseItem, evidenceList: items }
            })
            .catch(err => {
              console.warn(`Error fetching evidence for case ${caseItem.id}:`, err?.message)
              return { caseItem, evidenceList: [] }
            })
        )

        const caseEvidenceResults = await Promise.all(evidencePromises)
        console.log('CustodyPage: Fetched evidence for all cases')
        console.log('CustodyPage: Evidence results:', caseEvidenceResults.map(r => ({ case: r.caseItem.id, evidenceCount: r.evidenceList.length })))

        // Now fetch custody logs for all evidence in parallel
        const custodyPromises = []
        caseEvidenceResults.forEach(({ caseItem, evidenceList }) => {
          console.log(`CustodyPage: Building custody promises for case ${caseItem.id} with ${evidenceList.length} evidence items`)
          evidenceList.forEach(evidence => {
            custodyPromises.push(
              custodyAPI.getCustodyLog(evidence.id)
                .then(custodyLog => {
                  let records = custodyLog.custody_records || []
                  if (!records.length) {
                    records = extractCustodyRecordsFromEvidence(evidence)
                  }
                  console.log(`CustodyPage: Custody log for evidence ${evidence.id}:`, records.length, 'records')
                  return {
                    records,
                    caseId: caseItem.id,
                    caseTitle: caseItem.title,
                    evidenceId: evidence.id,
                    evidenceName: getEvidenceItemName(evidence),
                  }
                })
                .catch(err => {
                  console.warn(`Error fetching custody log for evidence ${evidence.id}:`, err?.message)
                  return {
                    records: [],
                    caseId: caseItem.id,
                    caseTitle: caseItem.title,
                    evidenceId: evidence.id,
                    evidenceName: evidence.description || evidence.name,
                  }
                })
            )
          })
        })

        console.log('CustodyPage: Total custody promises created:', custodyPromises.length)

        const custodyResults = await Promise.all(custodyPromises)
        console.log('CustodyPage: Fetched custody logs for all evidence')
        console.log('CustodyPage: Raw custody results:', custodyResults)

        // Aggregate all records
        const allRecords = []
        custodyResults.forEach(({ records, caseId, caseTitle, evidenceId, evidenceName }) => {
          records.forEach(record => {
            allRecords.push({
              ...record,
              caseId,
              caseTitle,
              evidenceId,
              evidenceName,
            })
          })
        })

        console.log('CustodyPage: Total custody records aggregated:', allRecords.length)
        return allRecords
      } catch (err) {
        console.error('CustodyPage: Error fetching custody records:', err?.message || err)
        throw err
      }
    },
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  console.log('CustodyPage - isLoading:', isLoading, 'error:', error, 'records:', custodyRecords)

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
              <h3 className="font-semibold">Error loading custody records</h3>
              <p className="text-sm">{error.message}</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Get recent records (limit to last 50 for performance)
  const recentRecords = custodyRecords.slice(0, 50)

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Custody Records</h1>
          <p className="text-gray-600 text-sm mt-1">Chain of custody timeline for all evidence</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Case</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Evidence</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Parties</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords?.map((record, index) => (
                  <tr key={`${record.caseId}-${record.evidenceId}-${record.id ?? index}`} className="border-b border-gray-200 hover:bg-accent/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{record.caseTitle}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.evidenceName || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{getCustodyActorSummary(record)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatCustodyTimestamp(record)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge status={getCustodyActionLabel(record)} variant="evidence" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!recentRecords || recentRecords.length === 0) && (
            <div className="p-8 text-center text-gray-500">
              <p>No custody records found.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
