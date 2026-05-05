import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'
import { casesAPI } from '../api/cases'
import { useAuthStore } from '../store/authStore'
import {
  ArrowLeft, ArrowRight, AlertCircle, CheckCircle2,
  Send, FileText, User, AlignLeft, Info,
} from 'lucide-react'

const FRAUD_TYPES = [
  { value: 'SIM_SWAP',        label: 'SIM Swap'          },
  { value: 'PHISHING',        label: 'Phishing'          },
  { value: 'IDENTITY_THEFT',  label: 'Identity Theft'    },
  { value: 'FINANCIAL_FRAUD', label: 'Financial Fraud'   },
  { value: 'CYBERCRIME',      label: 'Cybercrime'        },
  { value: 'MONEY_LAUNDERING',label: 'Money Laundering'  },
  { value: 'OTHER',           label: 'Other'             },
]

// Step indicator
function Steps({ current }) {
  const steps = ['Case Details', 'Preview', 'Submitted']
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const idx   = i + 1
        const done  = idx < current
        const active= idx === current
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                done   ? 'bg-green-500 text-white' :
                active ? 'bg-accent text-white' :
                         'bg-gray-200 text-gray-500'
              }`}>
                {done ? <CheckCircle2 size={16} /> : idx}
              </div>
              <span className={`text-xs whitespace-nowrap ${active ? 'text-accent font-semibold' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 mb-4 transition-colors ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Read-only row for the preview panel
function PreviewRow({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="w-6 flex-shrink-0 mt-0.5">
        <Icon size={15} className="text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{value || '—'}</p>
      </div>
    </div>
  )
}

export default function NewCasePage() {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const { user }    = useAuthStore()
  const [step, setStep]           = useState(1)   // 1 = form, 2 = preview, 3 = success
  const [preview, setPreview]     = useState(null) // captured form data
  const [generalError, setGeneralError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const createMutation = useMutation({
    mutationFn: (data) => casesAPI.createCase(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      queryClient.invalidateQueries({ queryKey: ['my-cases'] })
      setStep(3)
      // Store created reference for success screen
      setPreview((p) => ({ ...p, case_number: created?.case_number }))
    },
    onError: (err) => {
      setGeneralError(err?.response?.data?.message || err?.message || 'Failed to create case')
      setStep(2) // stay on preview so user can fix
    },
  })

  // Step 1 → Step 2 (capture form data, show preview)
  const handleReview = (data) => {
    setGeneralError('')
    const fraudLabel = FRAUD_TYPES.find((f) => f.value === data.fraud_type)?.label || data.fraud_type
    const leadId = data.reassign_to?.trim() || user?.id
    setPreview({ ...data, fraud_type_label: fraudLabel, assigned_to: leadId })
    setStep(2)
  }

  // Step 2 → Submit
  const handleConfirm = () => {
    setGeneralError('')
    createMutation.mutate({
      title:        preview.title,
      fraud_type:   preview.fraud_type,
      description:  preview.description,
      suspect_info: preview.suspect_info,
      assigned_to:  preview.assigned_to,
    })
  }

  return (
    <Layout>
      <div>
        <button
          onClick={() => step > 1 && step < 3 ? setStep(step - 1) : navigate('/cases')}
          className="flex items-center gap-2 text-accent hover:text-accent/80 font-medium mb-6"
        >
          <ArrowLeft size={18} />
          {step === 1 ? 'Back to Cases' : step === 2 ? 'Back to Edit' : 'View All Cases'}
        </button>

        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create New Case</h1>
          <p className="text-sm text-gray-500 mb-6">
            {step === 1 ? 'Fill in the case details below' :
             step === 2 ? 'Review everything before submitting' :
             'Your case has been submitted'}
          </p>

          <Steps current={step} />

          {/* ── STEP 1: Form ── */}
          {step === 1 && (
            <form onSubmit={handleSubmit(handleReview)} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Case Title *</label>
                <input
                  type="text"
                  {...register('title', { required: 'Case title is required' })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  placeholder="e.g. SIM Swap Investigation — Ref 2026-001"
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
                    <option key={f.value} value={f.value}>{f.label}</option>
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
                  placeholder="Detailed description of the case and circumstances…"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Suspect Information</label>
                <textarea
                  {...register('suspect_info')}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm resize-none"
                  placeholder="Optional: suspect name, ID number, role…"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lead investigator</label>
                <p className="text-sm text-gray-800 mb-1">
                  {user?.name || user?.full_name || user?.email || '—'}{' '}
                  <span className="text-gray-400">(you — submitted as assigned lead by default)</span>
                </p>
                <p className="text-xs text-gray-400 mb-1">
                  Use the field below only if another user should own this case.
                </p>
                <input
                  type="text"
                  {...register('reassign_to')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  placeholder="Optional: different investigator user ID"
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 bg-accent text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                >
                  Review Case <ArrowRight size={15} />
                </button>
                <button type="button" onClick={() => navigate('/cases')}
                  className="px-5 border border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 2: Preview ── */}
          {step === 2 && preview && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <Info size={16} className="text-amber-500" />
                <p className="text-sm font-semibold text-gray-700">
                  Review the details below before submitting.
                </p>
              </div>

              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Status after submission: PENDING APPROVAL
                </span>
                <p className="text-xs text-gray-400 mt-1.5">
                  An Authorizer must approve this case before it becomes active.
                </p>
              </div>

              <PreviewRow icon={FileText} label="Case Title"        value={preview.title} />
              <PreviewRow icon={AlertCircle} label="Fraud Type"     value={preview.fraud_type_label} />
              <PreviewRow icon={AlignLeft}   label="Description"    value={preview.description} />
              <PreviewRow icon={User}        label="Suspect Info"   value={preview.suspect_info} />
              <PreviewRow
                icon={User}
                label="Lead investigator"
                value={
                  preview.assigned_to === user?.id
                    ? `${user?.name || user?.full_name || user?.email || user?.id} (you)`
                    : preview.assigned_to
                }
              />
              <PreviewRow icon={User}        label="Created By"     value={user?.name || user?.email} />

              {generalError && (
                <div className="mt-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <AlertCircle size={16} />
                  <p className="text-sm">{generalError}</p>
                </div>
              )}

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={handleConfirm}
                  disabled={createMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending
                    ? <><Spinner size="sm" /> Submitting…</>
                    : <><Send size={15} /> Confirm &amp; Submit</>}
                </button>
                <button onClick={() => setStep(1)}
                  className="px-5 border border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50">
                  Edit
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 3 && (
            <div className="bg-white rounded-xl border border-green-200 shadow-sm p-8 text-center">
              <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Case Submitted</h2>
              <p className="text-sm text-gray-500 mb-3">
                The case is now <strong>pending approval</strong> by an Authorizer.
              </p>
              {preview?.case_number && (
                <div className="inline-block bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mb-6">
                  <p className="text-xs text-gray-500 mb-0.5">Reference Number</p>
                  <p className="text-base font-mono font-bold text-gray-900">{preview.case_number}</p>
                </div>
              )}
              <div className="flex gap-3 justify-center">
                <button onClick={() => navigate('/cases')}
                  className="bg-accent text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-accent/90">
                  View All Cases
                </button>
                <button onClick={() => { setStep(1); setPreview(null) }}
                  className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50">
                  Create Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
