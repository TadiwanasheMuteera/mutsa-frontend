import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, formatDistanceToNow } from 'date-fns'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import HashBadge from '../components/ui/HashBadge'
import Modal from '../components/ui/Modal'
import { casesAPI } from '../api/cases'
import { evidenceAPI } from '../api/evidence'
import { custodyAPI } from '../api/custody'
import {
  ArrowLeft,
  Plus,
  AlertCircle,
  Link2,
  CheckCircle2,
  Download,
  Eye,
  ArrowUpRight,
  Clock,
  MapPin,
  FileText,
  X,
} from 'lucide-react'

// Custody Status Colors
const custodyStatusColors = {
  COLLECTED: 'bg-gray-100 text-gray-800',
  IN_TRANSIT: 'bg-blue-100 text-blue-800',
  IN_ANALYSIS: 'bg-amber-100 text-amber-800',
  SECURED: 'bg-green-100 text-green-800',
  SUBMITTED: 'bg-purple-100 text-purple-800',
}

const custodyStatusIcons = {
  COLLECTED: '📋',
  IN_TRANSIT: '🚚',
  IN_ANALYSIS: '🔬',
  SECURED: '🔒',
  SUBMITTED: '📤',
}

// Custody Timeline Drawer
function CustodyDrawer({ isOpen, onClose, evidence, custody }) {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto transition-transform">
        {/* Header */}
        <div className="sticky top-0 bg-primary text-white p-6 flex items-center justify-between border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold">Chain of Custody</h3>
            <p className="text-xs text-gray-300 mt-1">{evidence?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-primary/80 p-2 rounded transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Timeline */}
        <div className="p-6">
          {custody && custody.length > 0 ? (
            <div className="space-y-6">
              {custody.map((record, idx) => (
                <div key={record.id || idx} className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center text-xl">
                      {custodyStatusIcons[record.status] || '📦'}
                    </div>
                    {idx < custody.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-300 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          custodyStatusColors[record.status] || 'bg-gray-100'
                        }`}
                      >
                        {record.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {record.timestamp ? format(new Date(record.timestamp), 'MMM dd, yyyy HH:mm') : 'N/A'}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {record.officer || 'System'}
                    </p>

                    {record.location && (
                      <p className="text-xs text-gray-600 flex items-center gap-1 mb-2">
                        <MapPin size={14} />
                        {record.location}
                      </p>
                    )}

                    {record.description && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-2">
                        {record.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No custody records for this evidence yet.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Status Change Modal
function StatusChangeModal({ isOpen, onClose, caseId, currentStatus, onStatusChange }) {
  const [newStatus, setNewStatus] = useState(currentStatus)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (newStatus === currentStatus) {
      onClose()
      return
    }

    setIsSubmitting(true)
    try {
      await onStatusChange({ status: newStatus, reason })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Case Status">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            New Status
          </label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="REFERRED">Referred to Prosecution</option>
            <option value="CLOSED">Closed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Reason for Change
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Explain the reason for this status change..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-accent text-white py-2 rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Updating...' : 'Update Status'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}

// Fraud Type Badge
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

export default function CaseDetailPage() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [selectedEvidence, setSelectedEvidence] = useState(null)
  const [custodyOpen, setCustodyOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)

  const { data: caseData, isLoading: caseLoading, error: caseError } = useQuery({
    queryKey: ['case', caseId],
    queryFn: async () => {
      console.log('CaseDetailPage: Fetching case details for caseId:', caseId)
      try {
        const result = await casesAPI.getCaseById(caseId)
        console.log('CaseDetailPage: Fetched case data:', result)
        return result
      } catch (err) {
        console.error('CaseDetailPage: Error fetching case:', err)
        throw err
      }
    },
    refetchOnMount: true,
  })

  console.log('CaseDetailPage - caseLoading:', caseLoading, 'caseError:', caseError, 'caseData:', caseData)

  const { data: evidenceItems, isLoading: evidenceLoading } = useQuery({
    queryKey: ['evidence', caseId],
    queryFn: async () => {
      console.log('CaseDetailPage: Fetching evidence for caseId:', caseId)
      try {
        const result = await evidenceAPI.getEvidenceByCaseId(caseId)
        console.log('CaseDetailPage: Fetched evidence:', result)
        return result
      } catch (err) {
        console.error('CaseDetailPage: Error fetching evidence:', err)
        throw err
      }
    },
    refetchOnMount: true,
  })

  const { data: custodyRecords, isLoading: custodyLoading } = useQuery({
    queryKey: ['custody', caseId],
    queryFn: async () => {
      // Fetch custody records for all evidence in case
      if (!evidenceItems) return []
      const records = await Promise.all(
        evidenceItems.map(e => custodyAPI.getCustodyByEvidenceId(e.id).catch(() => []))
      )
      return records.flat()
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: (data) => casesAPI.updateCase(caseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', caseId] })
      setStatusModalOpen(false)
    },
  })

  const handleViewChain = (evidence) => {
    setSelectedEvidence(evidence)
    setCustodyOpen(true)
  }

  const handleStatusChange = (data) => {
    updateStatusMutation.mutate(data)
  }

  const getCustodyForEvidence = (evidenceId) => {
    return custodyRecords?.filter(r => r.evidenceId === evidenceId) || []
  }

  if (caseLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      </Layout>
    )
  }

  if (caseError) {
    return (
      <Layout>
        <div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center gap-3">
            <AlertCircle size={24} />
            <div>
              <h3 className="font-semibold">Error loading case</h3>
              <p className="text-sm">{caseError.message}</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div>
        {/* Back button */}
        <button
          onClick={() => navigate('/cases')}
          className="flex items-center gap-2 text-accent hover:text-accent/80 font-medium mb-6"
        >
          <ArrowLeft size={20} />
          Back to Cases
        </button>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - 60% */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-primary">{caseData?.title}</h1>
                    <Badge status={caseData?.status} />
                  </div>
                  <p className="text-gray-600 text-sm">
                    Reference Number:{' '}
                    <span className="font-mono font-semibold">
                      {caseData?.case_number || caseData?.caseNumber || caseData?.id.substring(0, 8)}
                    </span>
                  </p>
                </div>
              </div>

              {caseData?.fraudType && (
                <div className="mb-4">
                  <FraudTypeBadge type={caseData.fraudType} />
                </div>
              )}

              <p className="text-gray-700 mb-6">{caseData?.description}</p>

              {caseData?.suspectInfo && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Suspect Information</h3>
                  <p className="text-sm text-blue-800">{caseData.suspectInfo}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">Opened</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {caseData?.createdAt ? format(new Date(caseData.createdAt), 'MMM dd, yyyy') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">Investigator</p>
                  <p className="text-sm text-gray-900 mt-1">{caseData?.investigator || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">Evidence Items</p>
                  <p className="text-sm text-gray-900 mt-1">{evidenceItems?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">Priority</p>
                  <p className="text-sm text-gray-900 mt-1">{caseData?.priority || 'Normal'}</p>
                </div>
              </div>
            </div>

            {/* Evidence Items Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-primary">Evidence Items</h2>
                <button
                  onClick={() => navigate(`/evidence/new?caseId=${caseId}`)}
                  className="flex items-center gap-2 bg-accent text-white px-3 py-2 rounded text-sm hover:bg-accent/90 transition-colors"
                >
                  <Plus size={16} />
                  Add Evidence
                </button>
              </div>

              {evidenceLoading ? (
                <div className="flex items-center justify-center p-6">
                  <Spinner size="md" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Evidence ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Collected By</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hash Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evidenceItems?.map((item) => (
                        <tr key={item.id} className="border-b border-gray-200 hover:bg-accent/5 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono text-primary font-semibold">
                            {item.id.substring(0, 8)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {item.description || item.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {item.type || 'File'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Badge status={item.status} />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {item.collectedBy || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <HashBadge status={item.hashStatus || 'INTACT'} />
                          </td>
                          <td className="px-6 py-4 text-sm space-x-2">
                            <button
                              onClick={() => handleViewChain(item)}
                              className="text-accent hover:text-accent/80 font-medium transition-colors inline-flex items-center gap-1"
                              title="View Chain"
                            >
                              <Link2 size={16} />
                              Chain
                            </button>
                            <button
                              onClick={() => navigate(`/verify/${item.id}`)}
                              className="text-blue-600 hover:text-blue-700 font-medium transition-colors inline-flex items-center gap-1"
                              title="Verify Integrity"
                            >
                              <CheckCircle2 size={16} />
                              Verify Integrity
                            </button>
                            <button
                              className="text-green-600 hover:text-green-700 font-medium transition-colors inline-flex items-center gap-1"
                              title="Transfer"
                            >
                              <ArrowUpRight size={16} />
                              Transfer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!evidenceItems || evidenceItems.length === 0) && (
                    <div className="p-8 text-center text-gray-500">
                      <p>No evidence items for this case yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - 40% */}
          <div className="space-y-6">
            {/* Case Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <Clock size={20} />
                  Case Timeline
                </h2>
              </div>

              {custodyLoading ? (
                <div className="flex items-center justify-center p-6">
                  <Spinner size="sm" />
                </div>
              ) : (
                <div className="p-6 max-h-96 overflow-y-auto">
                  {custodyRecords && custodyRecords.length > 0 ? (
                    <div className="space-y-4">
                      {custodyRecords
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .slice(0, 10)
                        .map((record, idx) => (
                          <div key={record.id || idx} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                              {idx < 9 && <div className="w-0.5 h-6 bg-gray-300 mt-1" />}
                            </div>
                            <div className="flex-1 pb-3">
                              <p className="text-xs font-semibold text-accent uppercase">
                                {record.action || 'Updated'}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {record.officer || 'System'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(record.timestamp), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No custody records yet.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Case Actions Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">Case Actions</h2>

              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/evidence/new?caseId=${caseId}`)}
                  className="w-full bg-accent text-white py-2 rounded-lg font-medium hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Evidence
                </button>

                <button
                  onClick={() => setStatusModalOpen(true)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText size={18} />
                  Change Status
                </button>

                <button
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={!evidenceItems || evidenceItems.length === 0}
                >
                  <Download size={18} />
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custody Timeline Drawer */}
      <CustodyDrawer
        isOpen={custodyOpen}
        onClose={() => setCustodyOpen(false)}
        evidence={selectedEvidence}
        custody={selectedEvidence ? getCustodyForEvidence(selectedEvidence.id) : []}
      />

      {/* Status Change Modal */}
      <StatusChangeModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        caseId={caseId}
        currentStatus={caseData?.status}
        onStatusChange={handleStatusChange}
      />
    </Layout>
  )
}
