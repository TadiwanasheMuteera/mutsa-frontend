import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'
import { casesAPI } from '../api/cases'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export default function NewCasePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [generalError, setGeneralError] = useState('')

  const createMutation = useMutation({
    mutationFn: (data) => casesAPI.createCase(data),
    onSuccess: (created) => {
      // Invalidate the cases query to trigger a refetch
      queryClient.invalidateQueries({ 
        queryKey: ['cases'],
        refetchType: 'active',
      })

      // Navigate to cases page and show generated reference number
      navigate('/cases', {
        state: {
          createdReferenceNumber: created?.case_number,
        },
      })
    },
    onError: (error) => {
      setGeneralError(error.response?.data?.message || 'Failed to create case')
    },
  })

  const onSubmit = (data) => {
    setGeneralError('')
    // Only send fields accepted by backend create contract
    createMutation.mutate({
      title: data.title,
      fraud_type: data.fraud_type,
      description: data.description,
      suspect_info: data.suspect_info,
      assigned_to: data.assigned_to,
    })
  }

  return (
    <Layout>
      <div>
        <button
          onClick={() => navigate('/cases')}
          className="flex items-center gap-2 text-accent hover:text-accent/80 font-medium mb-6"
        >
          <ArrowLeft size={20} />
          Back to Cases
        </button>

        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-primary mb-2">Create New Case</h1>
          <p className="text-gray-600 mb-8">Register a new forensic investigation case</p>

          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            {generalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-3">
                <AlertCircle size={20} />
                {generalError}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Case Title
              </label>
              <input
                type="text"
                {...register('title', { required: 'Case title is required' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition"
                placeholder="e.g., Digital Fraud Investigation - Case 2024-001"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fraud Type
              </label>
              <input
                type="text"
                {...register('fraud_type', { required: 'Fraud type is required' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition"
                placeholder="e.g., embezzlement, phishing, identity_theft"
              />
              {errors.fraud_type && (
                <p className="text-red-500 text-xs mt-1">{errors.fraud_type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition"
                placeholder="Detailed description of the case..."
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Suspect Information
              </label>
              <textarea
                {...register('suspect_info')}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition"
                placeholder="Optional: suspect name, role, identifiers..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assigned To
              </label>
              <input
                type="text"
                {...register('assigned_to')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition"
                placeholder="Optional: user id to assign"
              />
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 bg-accent text-white py-2 rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <Spinner size="sm" />
                    Creating...
                  </>
                ) : (
                  'Create Case'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/cases')}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
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
