import { useEffect, useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'
import { casesAPI } from '../api/cases'
import { useAuthStore } from '../store/authStore'
import { isInvestigator } from '../utils/rbac'
import { ArrowLeft, AlertCircle } from 'lucide-react'

const FRAUD_TYPES = [
  { value: 'SIM_SWAP', label: 'SIM Swap' },
  { value: 'PHISHING', label: 'Phishing' },
  { value: 'IDENTITY_THEFT', label: 'Identity Theft' },
  { value: 'FINANCIAL_FRAUD', label: 'Financial Fraud' },
  { value: 'CYBERCRIME', label: 'Cybercrime' },
  { value: 'MONEY_LAUNDERING', label: 'Money Laundering' },
  { value: 'OTHER', label: 'Other' },
]

export default function EditCasePage() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [generalError, setGeneralError] = useState('')

  const { data: caseRow, isLoading, error } = useQuery({
    queryKey: ['case', caseId],
    queryFn: () => casesAPI.getCaseById(caseId),
    enabled: !!caseId && isInvestigator(user),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    if (!caseRow) return
    reset({
      title: caseRow.title,
      fraud_type: caseRow.fraud_type,
      description: caseRow.description || '',
      suspect_info: caseRow.suspect_info || caseRow.suspectInfo || '',
      assigned_to: caseRow.assigned_to || caseRow.assignedTo || user?.id || '',
    })
  }, [caseRow, reset, user?.id])

  const updateMutation = useMutation({
    mutationFn: (data) =>
      casesAPI.updateCase(caseId, {
        title: data.title,
        fraud_type: data.fraud_type,
        description: data.description,
        suspect_info: data.suspect_info,
        assigned_to: data.assigned_to?.trim() || user?.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      queryClient.invalidateQueries({ queryKey: ['my-cases'] })
      queryClient.invalidateQueries({ queryKey: ['case', caseId] })
      navigate(`/cases/${caseId}`)
    },
    onError: (err) => {
      setGeneralError(err?.response?.data?.message || err?.message || 'Failed to update case')
    },
  })

  if (!isInvestigator(user)) return <Navigate to="/home" replace />

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Spinner />
        </div>
      </Layout>
    )
  }

  if (error || !caseRow) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <div>
            <h3 className="font-semibold">Could not load case</h3>
            <p className="text-sm">{error?.message || 'Unknown error'}</p>
          </div>
        </div>
      </Layout>
    )
  }

  const owns =
    user?.id &&
    (String(caseRow.created_by || caseRow.createdBy || '') === String(user.id) ||
      String(caseRow.assigned_to || caseRow.assignedTo || '') === String(user.id))

  if (!owns) {
    return (
      <Layout>
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-6 py-4 rounded-lg">
          You can only edit cases you created or are assigned to.
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div>
        <button
          type="button"
          onClick={() => navigate(`/cases/${caseId}`)}
          className="flex items-center gap-2 text-accent hover:text-accent/80 font-medium mb-6"
        >
          <ArrowLeft size={18} />
          Back to case
        </button>

        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit case</h1>
          <p className="text-sm text-gray-500 mb-6">
            Update details for{' '}
            <span className="font-mono font-semibold">
              {caseRow.case_number || caseRow.caseNumber || caseId}
            </span>
          </p>

          <form
            onSubmit={handleSubmit((data) => {
              setGeneralError('')
              updateMutation.mutate(data)
            })}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Case Title *</label>
              <input
                type="text"
                {...register('title', { required: 'Case title is required' })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fraud Type *</label>
              <select
                {...register('fraud_type', { required: 'Please select a fraud type' })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm bg-white"
              >
                <option value="">Select fraud type…</option>
                {FRAUD_TYPES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              {errors.fraud_type && <p className="text-red-500 text-xs mt-1">{errors.fraud_type.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm resize-none"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Suspect Information</label>
              <textarea
                {...register('suspect_info')}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assign To (User ID)</label>
              <input
                type="text"
                {...register('assigned_to')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                placeholder="Leave blank to keep assigned to yourself"
              />
              <p className="text-xs text-gray-400 mt-1">
                Defaults to your account if empty — same as creating a new case.
              </p>
            </div>

            {generalError && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <AlertCircle size={16} />
                <p className="text-sm">{generalError}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 bg-accent text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/cases/${caseId}`)}
                className="px-5 border border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50"
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
