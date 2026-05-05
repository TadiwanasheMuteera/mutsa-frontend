import { Link, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import HashBadge from '../components/ui/HashBadge'
import { evidenceAPI } from '../api/evidence'
import { useAuthStore } from '../store/authStore'
import { isAuditor } from '../utils/rbac'
import {
  getEvidenceItemName,
  getEvidenceStatus,
  formatEvidenceTypeLabel,
} from '../utils/evidenceDisplay'
import { AlertCircle, Fingerprint } from 'lucide-react'

function pickHash(item) {
  if (!item) return null
  return (
    item.sha256_hash ||
    item.file_hash ||
    item.original_hash ||
    item.hash ||
    item.fileHash ||
    null
  )
}

function pickHashTime(item) {
  if (!item) return null
  return item.hashed_at || item.hashedAt || item.hash_recorded_at || item.collection_date || null
}

export default function AuditorEvidenceIntegrityPage() {
  const { user } = useAuthStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['auditor-evidence-integrity'],
    queryFn: () => evidenceAPI.getAllEvidence(),
    enabled: isAuditor(user),
    retry: 1,
  })

  if (!isAuditor(user)) return <Navigate to="/home" replace />

  const items = Array.isArray(data) ? data : []

  return (
    <Layout>
      <div>
        <div className="mb-6 flex items-start gap-3">
          <div className="bg-teal-100 p-2.5 rounded-xl">
            <Fingerprint size={22} className="text-teal-800" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Evidence integrity</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Hash metadata and lifecycle fields across all evidence items (read-only).
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm">
            <AlertCircle size={14} />
            <span>{error?.message || 'Could not load evidence list.'}</span>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tag / ref
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                    Hash (truncated)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden xl:table-cell">
                    Hash recorded
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Integrity
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Verify
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <Spinner />
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500 text-sm">
                      No evidence returned from the API.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const hash = pickHash(item)
                    const hashTime = pickHashTime(item)
                    const tag = item.evidence_tag || item.evidenceTag || item.id?.slice(0, 8) || '—'
                    const st = getEvidenceStatus(item)
                    const integrityFromApi =
                      item.hash_status || item.hashStatus || item.integrity_status || null
                    const rowId = item.id || item.evidence_id
                    return (
                      <tr key={rowId || tag} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-800">{tag}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">
                          {getEvidenceItemName(item)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                          {formatEvidenceTypeLabel(item)}
                        </td>
                        <td className="px-4 py-3">
                          {st ? <Badge status={st} variant="evidence" /> : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600 hidden lg:table-cell">
                          {hash ? `${hash.slice(0, 18)}…` : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 hidden xl:table-cell whitespace-nowrap">
                          {hashTime
                            ? new Date(hashTime).toLocaleString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {integrityFromApi ? (
                            <span className="text-xs font-semibold text-gray-800">{integrityFromApi}</span>
                          ) : (
                            <HashBadge status={hash ? 'INTACT' : 'PENDING'} />
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {rowId ? (
                            <Link
                              to={`/verify/${rowId}`}
                              className="text-teal-700 hover:text-teal-900 text-xs font-semibold"
                            >
                              Verify hash
                            </Link>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
