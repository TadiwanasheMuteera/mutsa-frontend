import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'
import HashBadge from '../components/ui/HashBadge'
import { evidenceAPI } from '../api/evidence'
import { CheckCircle2, AlertTriangle, FileUp, AlertCircle, Lock } from 'lucide-react'

import { getEvidenceItemName } from '../utils/evidenceDisplay'

export default function HashVerifyPage() {
  const { evidenceId: evidenceIdParam } = useParams()
  const navigate = useNavigate()
  const evidenceId = evidenceIdParam || ''
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [verificationResult, setVerificationResult] = useState(null)
  const [verificationError, setVerificationError] = useState('')

  const { data: pickerList, isLoading: pickerLoading, error: pickerError } = useQuery({
    queryKey: ['hash-verify-evidence-picker'],
    queryFn: () => evidenceAPI.getAllEvidence(),
    enabled: !evidenceIdParam,
  })

  const { data: evidence, isLoading: evidenceLoading, error: evidenceError } = useQuery({
    queryKey: ['evidence', evidenceId],
    queryFn: () => evidenceAPI.getEvidenceById(evidenceId),
    enabled: Boolean(evidenceIdParam),
  })

  const {
    data: hashMetadata,
    isLoading: hashMetadataLoading,
    error: hashMetadataError,
  } = useQuery({
    queryKey: ['evidence-hash-metadata', evidenceId],
    queryFn: () => evidenceAPI.getHashMetadata(evidenceId),
    enabled: Boolean(evidenceIdParam),
  })

  const verifyMutation = useMutation({
    mutationFn: ({ id, file }) => evidenceAPI.verifyHash(id, file),
    onSuccess: (result) => {
      setVerificationResult(result)
      setVerificationError('')
    },
    onError: (error) => {
      setVerificationResult(null)
      setVerificationError(error?.response?.data?.message || error?.message || 'Verification failed')
    },
  })

  const handleFileSelect = (file) => {
    if (!file) return
    setSelectedFile(file)
    setVerificationResult(null)
    setVerificationError('')
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleVerifyIntegrity = () => {
    if (!selectedFile || !evidenceIdParam) {
      setVerificationError('Please select a file to verify')
      return
    }
    verifyMutation.mutate({ id: evidenceIdParam, file: selectedFile })
  }

  if (!evidenceIdParam) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Hash verification</h1>
          <p className="text-sm text-gray-600">
            Choose an evidence record to verify. (The sidebar links here without an ID — this screen lists everything
            available from the API.)
          </p>
          {pickerLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : pickerError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {pickerError?.message || 'Could not load evidence list.'}
            </div>
          ) : (
            <>
              <label className="block text-sm font-semibold text-gray-700">Evidence item</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white"
                defaultValue=""
                onChange={(e) => {
                  const id = e.target.value
                  if (id) navigate(`/verify/${id}`, { replace: true })
                }}
              >
                <option value="" disabled>
                  Select evidence…
                </option>
                {(pickerList || []).map((item) => {
                  const id = item.id || item.evidence_id
                  if (!id) return null
                  return (
                    <option key={id} value={id}>
                      {getEvidenceItemName(item)} ({String(id).slice(0, 8)}…)
                    </option>
                  )
                })}
              </select>
              {(pickerList || []).length === 0 && (
                <p className="text-sm text-gray-500">No evidence items found. Upload evidence on a case first.</p>
              )}
            </>
          )}
        </div>
      </Layout>
    )
  }

  if (evidenceLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Spinner />
        </div>
      </Layout>
    )
  }

  const evidenceResolved = evidence && (evidence.id || evidence.evidence_id)

  if (evidenceError || !evidenceResolved) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto mb-2 text-red-600" size={48} />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Evidence Not Found</h2>
          <p className="text-red-700">{evidenceError?.message || 'The evidence item could not be loaded.'}</p>
          <button
            type="button"
            onClick={() => navigate('/verify', { replace: true })}
            className="mt-4 text-sm text-accent font-semibold hover:underline"
          >
            ← Pick a different evidence item
          </button>
        </div>
      </Layout>
    )
  }

  const isIntact =
    verificationResult &&
    (verificationResult.integrity_status === 'INTACT' ||
      verificationResult.match === true ||
      verificationResult.is_valid === true)

  return (
    <Layout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Evidence Integrity Verification</h1>
          <p className="text-gray-600 mt-1">Verify the file against the backend hash record</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Evidence ID</p>
              <p className="text-lg font-mono text-gray-900 mt-1">{evidence.id || evidence.evidence_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">Case</p>
              <p className="text-lg text-gray-900 mt-1">{evidence.case_id || evidence.caseId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">File Name</p>
              <p className="text-lg text-gray-900 mt-1">{hashMetadata?.file_name || evidence.file_name || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="text-green-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">Original Hash Metadata</h2>
              </div>
              {hashMetadataLoading ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <Spinner size="sm" />
                  Loading hash metadata...
                </div>
              ) : hashMetadataError ? (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
                  {hashMetadataError?.message || 'Failed to load hash metadata'}
                </div>
              ) : (
                <div className="space-y-3 bg-green-50 rounded-lg p-4 border border-green-100">
                  <div>
                    <p className="text-xs text-green-700 uppercase font-semibold mb-2">
                      {hashMetadata?.algorithm || 'SHA-256'}
                    </p>
                    <p className="font-mono text-sm text-gray-900 break-all bg-white p-3 rounded border border-green-200">
                      {hashMetadata?.original_hash || hashMetadata?.sha256_hash || 'No hash available'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-green-700 font-semibold">Hashed At</p>
                      <p className="text-gray-900 mt-1">
                        {hashMetadata?.hashed_at
                          ? format(new Date(hashMetadata.hashed_at), 'MMM dd, yyyy HH:mm')
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-green-700 font-semibold">File Size (bytes)</p>
                      <p className="text-gray-900 mt-1">{hashMetadata?.file_size_bytes ?? 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Comparison File</h2>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging ? 'border-accent bg-accent/5' : 'border-gray-300 bg-gray-50 hover:border-accent/50'
                }`}
              >
                <FileUp size={48} className={`mx-auto mb-3 ${isDragging ? 'text-accent' : 'text-gray-400'}`} />
                <p className="text-gray-900 font-semibold mb-1">Drag and drop your file here</p>
                <p className="text-gray-600 text-sm mb-4">or</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-block px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
                >
                  Browse Files
                </button>
                <input ref={fileInputRef} type="file" onChange={handleFileInputChange} className="hidden" accept="*/*" />
              </div>

              {selectedFile && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button type="button" onClick={() => setSelectedFile(null)} className="text-gray-500 hover:text-gray-700">
                      ✕
                    </button>
                  </div>
                  <button
                    onClick={handleVerifyIntegrity}
                    disabled={verifyMutation.isPending}
                    className="w-full mt-4 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {verifyMutation.isPending ? (
                      <>
                        <Spinner size="sm" />
                        Verifying...
                      </>
                    ) : (
                      <>Verify Integrity</>
                    )}
                  </button>
                </div>
              )}
            </div>

            {verificationError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-yellow-600" size={24} />
                  <div>
                    <p className="font-semibold text-yellow-900">Verification Error</p>
                    <p className="text-yellow-700 text-sm">{verificationError}</p>
                  </div>
                </div>
              </div>
            )}

            {verificationResult && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4 mb-4">
                  {isIntact ? (
                    <>
                      <CheckCircle2 className="text-green-600" size={40} />
                      <div>
                        <p className="text-sm font-semibold text-gray-600">Integrity Status</p>
                        <HashBadge status="INTACT" />
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="text-red-600" size={40} />
                      <div>
                        <p className="text-sm font-semibold text-gray-600">Integrity Status</p>
                        <HashBadge status="TAMPERED" />
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 pt-2 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Original Hash</p>
                    <p className="font-mono text-sm bg-gray-50 p-3 rounded border border-gray-200 text-gray-900 break-all">
                      {verificationResult.original_hash}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Computed Hash</p>
                    <p className="font-mono text-sm bg-gray-50 p-3 rounded border border-gray-200 text-gray-900 break-all">
                      {verificationResult.computed_hash}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 sticky top-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Verification Process</h3>
              <ul className="space-y-3 text-sm text-blue-800">
                <li>1. Load original hash metadata from backend</li>
                <li>2. Upload comparison file</li>
                <li>3. Run Verify Integrity</li>
                <li>4. Review INTACT or TAMPERED result</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
