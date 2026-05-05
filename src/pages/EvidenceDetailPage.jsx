import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { format } from 'date-fns'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import { evidenceAPI } from '../api/evidence'
import {
  getEvidenceItemName,
  getEvidenceStatus,
  formatEvidenceTypeLabel,
} from '../utils/evidenceDisplay'
import {
  extractCustodyRecordsFromEvidence,
  sortCustodyRecordsChronological,
  getCustodyFromOfficer,
  getCustodyToOfficer,
  getCustodyRecordedBy,
  getCustodyActionLabel,
  formatCustodyTimestamp,
} from '../utils/custodyDisplay'
import { ArrowLeft, AlertCircle } from 'lucide-react'

export default function EvidenceDetailPage() {
  const { evidenceId } = useParams()
  const navigate = useNavigate()

  const { data: evidence, isLoading, error } = useQuery({
    queryKey: ['evidence', evidenceId],
    queryFn: () => evidenceAPI.getEvidenceById(evidenceId),
    enabled: !!evidenceId,
  })

  const embeddedCustody = useMemo(
    () => sortCustodyRecordsChronological(extractCustodyRecordsFromEvidence(evidence)),
    [evidence]
  )

  const { data: chainFallback = [] } = useQuery({
    queryKey: ['evidence-chain', evidenceId],
    queryFn: () => evidenceAPI.getEvidenceChain(evidenceId),
    enabled: Boolean(evidenceId && evidence && embeddedCustody.length === 0),
  })

  const custodyRows = useMemo(() => {
    if (embeddedCustody.length) return embeddedCustody
    return sortCustodyRecordsChronological(chainFallback)
  }, [embeddedCustody, chainFallback])

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
          <div className="mb-6">
            <button
              onClick={() => navigate('/evidence')}
              className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Evidence
            </button>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center gap-3">
            <AlertCircle size={24} />
            <div>
              <h3 className="font-semibold">Error loading evidence</h3>
              <p className="text-sm">{error?.message || 'Failed to load evidence details'}</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!evidence) {
    return (
      <Layout>
        <div>
          <div className="mb-6">
            <button
              onClick={() => navigate('/evidence')}
              className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Evidence
            </button>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg">
            <p>Evidence item not found.</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div>
        <div className="mb-6">
          <button
            onClick={() => navigate('/evidence')}
            className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Evidence
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">
            {getEvidenceItemName(evidence)}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {evidence.evidence_tag && (
              <>
                Tag: <span className="font-mono font-semibold">{evidence.evidence_tag}</span>
                {' · '}
              </>
            )}
            ID: <span className="font-mono">{evidence.id}</span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left Column */}
            <div className="p-6 border-r border-gray-200 md:border-r">
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Description</label>
                  <p className="text-gray-900">{evidence.description || 'N/A'}</p>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Type</label>
                  <p className="text-gray-900">{formatEvidenceTypeLabel(evidence)}</p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Status</label>
                  {getEvidenceStatus(evidence) ? (
                    <Badge status={getEvidenceStatus(evidence)} variant="evidence" />
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </div>

                {/* Source */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Source</label>
                  <p className="text-gray-900">{evidence.source || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Collected By */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Collected By</label>
                  <p className="text-gray-900">{evidence.collected_by || evidence.collectedBy || 'Unknown'}</p>
                </div>

                {/* Collection Date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Collection Date</label>
                  <p className="text-gray-900">
                    {evidence.collection_date || evidence.collectionDate
                      ? format(
                          new Date(evidence.collection_date || evidence.collectionDate),
                          'MMM dd, yyyy HH:mm'
                        )
                      : 'N/A'}
                  </p>
                </div>

                {/* Collection Location */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Collection Location</label>
                  <p className="text-gray-900">{evidence.collection_location || evidence.collectionLocation || 'N/A'}</p>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Notes</label>
                  <p className="text-gray-900">{evidence.notes || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
            <button
              onClick={() => {
                console.log('EvidenceDetailPage: Verify Integrity button clicked, navigating to /verify/' + evidenceId)
                navigate(`/verify/${evidenceId}`)
              }}
              className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
            >
              Verify Integrity
            </button>
          </div>
        </div>

        {/* Chain of custody */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-primary">Custody records</h2>
            <p className="text-sm text-gray-600 mt-1">
              Chain of custody / transfer history for this evidence item
            </p>
          </div>
          <div className="overflow-x-auto">
            {custodyRows.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">No custody records yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      From
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      To
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Recorded by
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {custodyRows.map((row, idx) => (
                    <tr
                      key={row.id != null ? `custody-${row.id}` : `custody-${idx}`}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-4 py-3 text-gray-800 align-top">
                        {getCustodyFromOfficer(row)}
                      </td>
                      <td className="px-4 py-3 text-gray-800 align-top">
                        {getCustodyToOfficer(row)}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <Badge
                          status={getCustodyActionLabel(row)}
                          variant="evidence"
                          className="text-xs px-2 py-0.5"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-700 align-top whitespace-nowrap">
                        {formatCustodyTimestamp(row)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 align-top max-w-[200px]">
                        {row.location || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-800 align-top">
                        {getCustodyRecordedBy(row)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 align-top max-w-[240px]">
                        {row.notes || row.description || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
