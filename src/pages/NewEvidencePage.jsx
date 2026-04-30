import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { format } from 'date-fns'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'
import { evidenceAPI } from '../api/evidence'
import { casesAPI } from '../api/cases'
import { useAuthStore } from '../store/authStore'
import {
  ArrowLeft,
  AlertCircle,
  FileUp,
  CheckCircle2,
  Clock,
} from 'lucide-react'

const EVIDENCE_TYPES = [
  { label: 'Digital File', value: 'digital_file' },
  { label: 'Physical Item', value: 'physical_item' },
  { label: 'Screenshot', value: 'screenshot' },
  { label: 'Transaction Log', value: 'transaction_log' },
  { label: 'Device', value: 'device' },
  { label: 'Other', value: 'other' },
]

export default function NewEvidencePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { caseId: caseIdFromParams } = useParams()
  const [searchParams] = useSearchParams()
  const caseId = caseIdFromParams || searchParams.get('caseId')
  const user = useAuthStore((state) => state.user)
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      collected_by: user?.id || '',
      collection_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  })

  const [generalError, setGeneralError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [computedHash, setComputedHash] = useState(null)
  const [isComputingHash, setIsComputingHash] = useState(false)
  const [chainOfCustodyAgreed, setChainOfCustodyAgreed] = useState(false)

  const collectionDate = watch('collection_date')

  // Fetch case details
  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ['case', caseId],
    queryFn: () => casesAPI.getCaseById(caseId),
    enabled: !!caseId,
  })

  // Create evidence mutation
  const createMutation = useMutation({
    mutationFn: (data) => {
      const collectedBy = data.collected_by?.trim()
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        collectedBy || ''
      )

      return evidenceAPI.createEvidence(caseId, {
        ...(data.evidence_type ? { evidence_type: data.evidence_type } : {}),
        ...(collectedBy && isUuid ? { collected_by: collectedBy } : {}),
        file: selectedFile,
        ...(data.description ? { description: data.description } : {}),
        ...(data.source ? { source: data.source } : {}),
        ...(data.collection_date ? { collection_date: new Date(data.collection_date).toISOString() } : {}),
        ...(data.notes ? { notes: data.notes } : {}),
      })
    },
    onSuccess: (createdEvidence) => {
      queryClient.invalidateQueries({ queryKey: ['evidence', caseId] })
      queryClient.invalidateQueries({ queryKey: ['case', caseId] })
      navigate(`/evidence?caseId=${caseId}`, {
        state: { createdEvidenceTag: createdEvidence?.evidence_tag },
      })
    },
    onError: (error) => {
      setGeneralError(error?.response?.data?.message || error?.message || 'Failed to create evidence')
    },
  })

  // Compute SHA-256 hash
  const computeSHA256 = async (file) => {
    setIsComputingHash(true)
    try {
      const buffer = await file.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      setComputedHash(hashHex)
      setIsComputingHash(false)
    } catch (error) {
      console.error('Error computing hash:', error)
      setIsComputingHash(false)
    }
  }

  const handleFileSelect = (file) => {
    if (file) {
      setSelectedFile(file)
      computeSHA256(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0])
      setValue('file', e.dataTransfer.files[0], { shouldValidate: true })
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0])
      setValue('file', e.target.files[0], { shouldValidate: true })
    }
  }

  const onSubmit = (data) => {
    if (!caseId) {
      setGeneralError('Missing case ID for evidence registration')
      return
    }
    if (!chainOfCustodyAgreed) {
      setGeneralError('You must agree to the Chain of Custody declaration')
      return
    }
    if (!selectedFile) {
      setGeneralError('File upload is required (field name: file)')
      return
    }
    setGeneralError('')
    createMutation.mutate(data)
  }

  if (caseLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Spinner />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div>
        <button
          onClick={() => navigate(`/cases/${caseId}`)}
          className="flex items-center gap-2 text-accent hover:text-accent/80 font-medium mb-6"
        >
          <ArrowLeft size={20} />
          Back to Case
        </button>

        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Register New Evidence</h1>
            <p className="text-gray-600 mt-2">
              {caseData ? `Add evidence to case: ${caseData.title}` : 'Add evidence to case'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* General Error */}
            {generalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
                <AlertCircle size={20} />
                {generalError}
              </div>
            )}

            {/* Section 1: Evidence Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Evidence Description</h2>

              <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Evidence Description
                    </label>
                    <textarea
                      {...register('description')}
                      rows="4"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Detailed description of the evidence item..."
                    />
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Evidence Type
                    </label>
                    <select
                      {...register('evidence_type')}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                        errors.evidence_type ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">-- Select Type --</option>
                      {EVIDENCE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.evidence_type && (
                      <p className="text-red-500 text-xs mt-1">{errors.evidence_type.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Source / Where Obtained
                    </label>
                    <input
                      type="text"
                      {...register('source')}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                        errors.source ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Seized from suspect's residence"
                    />
                    {errors.source && (
                      <p className="text-red-500 text-xs mt-1">{errors.source.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Collection Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Collection Details</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Collection Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      {...register('collection_date')}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                        errors.collection_date ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.collection_date && (
                      <p className="text-red-500 text-xs mt-1">{errors.collection_date.message}</p>
                    )}
                    {collectionDate && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock size={12} />
                        {format(new Date(collectionDate), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
                      </p>
                    )}
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600">
                    Source/location is sent in the <span className="font-semibold">Source / Where Obtained</span> field.
                  </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Collected By (UUID)
                    </label>
                  <input
                    type="text"
                    {...register('collected_by')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Collector user UUID"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-filled from your user profile when available</p>
                </div>
              </div>
            </div>

            {/* Section 3: File Upload */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Evidence File *</h2>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-accent bg-accent/5'
                    : 'border-gray-300 bg-gray-50 hover:border-accent/50'
                }`}
              >
                <FileUp
                  size={48}
                  className={`mx-auto mb-3 ${isDragging ? 'text-accent' : 'text-gray-400'}`}
                />
                <p className="text-gray-900 font-semibold mb-1">Drag and drop your file here</p>
                <p className="text-gray-600 text-sm mb-4">or</p>
                <button
                  type="button"
                  onClick={handleBrowseClick}
                  className="inline-block px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
                >
                  Browse Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.odt,.rtf,.png,.jpg,.jpeg,.gif,.bmp,.webp,.tiff,.mp4,.mov,.avi,.mkv,.wmv,.webm,.m4v,.mp3,.wav,.aac,.ogg,.m4a,.csv,.xls,.xlsx,.log,.txt,.json,.xml,.zip,.rar,.7z,.tar,.gz,*/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-4">Maximum file size: 5GB</p>
              </div>

              {/* Selected File Info */}
              {selectedFile && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null)
                        setComputedHash(null)
                      }}
                      className="text-gray-500 hover:text-gray-700 text-lg"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Computed Hash */}
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-600 uppercase font-semibold">SHA-256 Hash</p>
                      {computedHash && !isComputingHash && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 size={14} />
                          Computed
                        </span>
                      )}
                    </div>

                    {isComputingHash ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Spinner size="sm" />
                        Computing hash...
                      </div>
                    ) : computedHash ? (
                      <p className="font-mono text-xs bg-white p-3 rounded border border-gray-300 text-gray-900 break-all">
                        {computedHash}
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Additional Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  {...register('notes')}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Any additional notes or observations about this evidence..."
                />
              </div>
            </div>

            {/* Section 5: Chain of Custody Declaration */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-amber-900 mb-4">Chain of Custody Declaration</h2>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="chainOfCustody"
                  checked={chainOfCustodyAgreed}
                  onChange={(e) => setChainOfCustodyAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-amber-600"
                />
                <label htmlFor="chainOfCustody" className="text-sm text-amber-900 leading-relaxed">
                  I declare that this evidence was collected in accordance with proper forensic
                  procedures and that the information provided above is accurate and complete. I
                  understand that maintaining the chain of custody is critical to the admissibility
                  of this evidence in legal proceedings.
                </label>
              </div>

              {!chainOfCustodyAgreed && (
                <p className="text-xs text-amber-700 mt-3">
                  ⚠️ You must agree to this declaration before submitting
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={createMutation.isPending || !chainOfCustodyAgreed || !caseId}
                  className="flex-1 bg-accent text-white py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                {createMutation.isPending ? (
                  <>
                    <Spinner size="sm" />
                    Registering...
                  </>
                ) : (
                  'Register Evidence'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/cases/${caseId}`)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
