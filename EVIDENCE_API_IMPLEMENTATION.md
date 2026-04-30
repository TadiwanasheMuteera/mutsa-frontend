# Evidence API Client - Implementation Guide

## Quick Start

### Basic Pattern

All Evidence API methods follow this pattern:

```javascript
import { evidenceAPI } from '@/api/evidence'

// All methods are async
const data = await evidenceAPI.methodName(params)
```

---

## Integration Patterns

### 1. List Evidence with React Query

```javascript
import { useQuery } from '@tanstack/react-query'
import { evidenceAPI } from '@/api/evidence'

function EvidenceList({ caseId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['evidence', caseId],
    queryFn: () => evidenceAPI.getEvidenceByCaseId(caseId),
    enabled: !!caseId
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data?.map(item => (
        <EvidenceCard key={item.id} evidence={item} />
      ))}
    </div>
  )
}
```

### 2. Upload with React Query Mutation

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { evidenceAPI } from '@/api/evidence'
import { useAuthStore } from '@/store/authStore'

function UploadEvidenceForm({ caseId }) {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)

  const uploadMutation = useMutation({
    mutationFn: (formData) => evidenceAPI.createEvidence(caseId, formData),
    onSuccess: (newEvidence) => {
      // Update the evidence list query
      queryClient.invalidateQueries({ queryKey: ['evidence', caseId] })
      
      // Show success
      toast.success(`Evidence uploaded: ${newEvidence.file_name}`)
      
      // Redirect or clear form
      navigate(`/cases/${caseId}`)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Upload failed')
    }
  })

  const handleSubmit = (formData) => {
    uploadMutation.mutate({
      ...formData,
      collected_by: user.id,
      collection_date: new Date().toISOString()
    })
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      handleSubmit(getFormData())
    }}>
      {/* Form fields */}
      <button disabled={uploadMutation.isPending}>
        {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  )
}
```

### 3. File Upload with Drag & Drop

```javascript
import { useState } from 'react'
import { evidenceAPI } from '@/api/evidence'

function DragDropUpload({ caseId }) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length === 0) return

    const file = files[0]
    setUploading(true)

    try {
      const result = await evidenceAPI.createEvidence(caseId, {
        file,
        evidence_type: 'digital_file',
        collected_by: 'current_user_id',
        description: 'Dragged and dropped evidence'
      })
      
      toast.success(`Uploaded: ${result.file_name}`)
    } catch (error) {
      toast.error(error.response?.data?.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed p-8 rounded-lg text-center
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
        ${uploading ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      {uploading ? (
        <LoadingSpinner />
      ) : (
        <>
          <p>Drag and drop evidence file here</p>
          <p className="text-sm text-gray-500">or click to browse</p>
        </>
      )}
    </div>
  )
}
```

### 4. Chain of Custody Tracking

```javascript
import { useQuery } from '@tanstack/react-query'
import { evidenceAPI } from '@/api/evidence'

function ChainOfCustody({ evidenceId }) {
  const { data: chain } = useQuery({
    queryKey: ['evidence-chain', evidenceId],
    queryFn: () => evidenceAPI.getEvidenceChain(evidenceId)
  })

  return (
    <div className="timeline">
      {chain?.map((record, index) => (
        <div key={index} className="timeline-item">
          <div className="timestamp">
            {new Date(record.timestamp).toLocaleString()}
          </div>
          <div className="action">{record.action}</div>
          <div className="user">{record.user_name}</div>
          <div className="location">{record.location}</div>
          <div className="notes">{record.notes}</div>
        </div>
      ))}
    </div>
  )
}
```

### 5. Hash Verification

```javascript
import { useState } from 'react'
import { evidenceAPI } from '@/api/evidence'

function HashVerification({ evidenceId }) {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [verifying, setVerifying] = useState(false)

  const handleVerify = async () => {
    if (!file) return

    setVerifying(true)
    try {
      const verification = await evidenceAPI.verifyHash(evidenceId, file)
      setResult(verification)

      if (verification.match) {
        toast.success('✅ Hash matches - Evidence integrity confirmed')
      } else {
        toast.error('⚠️ Hash mismatch - Evidence may be compromised')
      }
    } catch (error) {
      toast.error(error.response?.data?.message)
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0])}
        disabled={verifying}
      />

      <button onClick={handleVerify} disabled={!file || verifying}>
        {verifying ? 'Verifying...' : 'Verify Hash'}
      </button>

      {result && (
        <div className={result.match ? 'text-green-600' : 'text-red-600'}>
          <h3>{result.match ? 'Hash Match' : 'Hash Mismatch'}</h3>
          <p>Original: <code>{result.original_hash}</code></p>
          <p>Computed: <code>{result.computed_hash}</code></p>
        </div>
      )}
    </div>
  )
}
```

### 6. Download Evidence

```javascript
import { evidenceAPI } from '@/api/evidence'

async function downloadFile(evidenceId, fileName) {
  try {
    const blob = await evidenceAPI.downloadEvidence(evidenceId)
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    
    window.URL.revokeObjectURL(url)
  } catch (error) {
    toast.error(error.response?.data?.message)
  }
}
```

### 7. Search Evidence

```javascript
import { useQuery } from '@tanstack/react-query'
import { evidenceAPI } from '@/api/evidence'

function EvidenceSearch({ query }) {
  const { data: results } = useQuery({
    queryKey: ['evidence-search', query],
    queryFn: () => evidenceAPI.searchEvidence(query),
    enabled: !!query && query.length >= 2
  })

  return (
    <div>
      {results?.map(item => (
        <div key={item.id}>
          <h4>{item.file_name}</h4>
          <p>{item.evidence_type}</p>
        </div>
      ))}
    </div>
  )
}
```

---

## Error Handling Patterns

### Pattern 1: Simple Try-Catch

```javascript
try {
  const evidence = await evidenceAPI.getEvidenceById(id)
  console.log(evidence)
} catch (error) {
  const message = error.response?.data?.message || 'Unknown error'
  console.error(message)
  // Show to user
}
```

### Pattern 2: React Query with Error Boundaries

```javascript
import { QueryErrorResetBoundary } from '@tanstack/react-query'

function EvidenceWithErrorBoundary() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset}>
          <EvidenceContent />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
```

### Pattern 3: Mutation Error Handling

```javascript
const mutation = useMutation({
  mutationFn: (data) => evidenceAPI.createEvidence(caseId, data),
  onError: (error) => {
    const message = error.response?.data?.message
    
    // Handle specific errors
    if (message?.includes('File')) {
      setFieldError('file', message)
    } else if (message?.includes('size')) {
      toast.error('File too large')
    } else {
      toast.error(message || 'Failed to upload')
    }
  }
})
```

---

## Working with Forms

### Example: Complete Evidence Form

```javascript
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { evidenceAPI } from '@/api/evidence'
import { useAuthStore } from '@/store/authStore'

export function NewEvidenceForm({ caseId, onSuccess }) {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const mutation = useMutation({
    mutationFn: (data) => evidenceAPI.createEvidence(caseId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['evidence', caseId] })
      toast.success('Evidence uploaded successfully')
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message)
    }
  })

  const onSubmit = (formData) => {
    const file = formData.file[0]
    
    mutation.mutate({
      file,
      evidence_type: formData.type,
      collected_by: user.id,
      description: formData.description,
      source: formData.source,
      collection_date: formData.date,
      notes: formData.notes
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>File *</label>
        <input {...register('file', { required: true })} type="file" />
        {errors.file && <span>File is required</span>}
      </div>

      <div>
        <label>Type *</label>
        <select {...register('type', { required: true })}>
          <option value="">Select type</option>
          <option value="digital_file">Digital File</option>
          <option value="document">Document</option>
          <option value="screenshot">Screenshot</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
      </div>

      <div>
        <label>Description</label>
        <textarea {...register('description')} />
      </div>

      <div>
        <label>Source</label>
        <input {...register('source')} type="text" />
      </div>

      <div>
        <label>Collection Date</label>
        <input {...register('date')} type="datetime-local" />
      </div>

      <div>
        <label>Notes</label>
        <textarea {...register('notes')} />
      </div>

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Uploading...' : 'Create Evidence'}
      </button>
    </form>
  )
}
```

---

## Performance Tips

1. **Invalidate selectively**: Only invalidate the specific query after mutation
   ```javascript
   queryClient.invalidateQueries({ queryKey: ['evidence', caseId] })
   ```

2. **Use enabled for conditional queries**:
   ```javascript
   useQuery({
     queryFn: () => evidenceAPI.getEvidenceByCaseId(caseId),
     enabled: !!caseId // Don't fetch until caseId exists
   })
   ```

3. **Paginate large evidence lists**: Implement pagination if > 100 items

4. **Lazy load chain of custody**: Fetch only when user clicks "View Chain"

5. **Cache file downloads**: Store blob in state to avoid re-fetching

---

## Testing

```javascript
import { vi } from 'vitest'
import { evidenceAPI } from '@/api/evidence'

vi.mock('@/api/evidence')

describe('Evidence API', () => {
  it('should create evidence', async () => {
    vi.mocked(evidenceAPI.createEvidence).mockResolvedValue({
      id: 'evi_123',
      file_name: 'test.zip'
    })

    const result = await evidenceAPI.createEvidence('case_1', {
      file: new File(['content'], 'test.zip'),
      evidence_type: 'digital_file',
      collected_by: 'user_1'
    })

    expect(result.id).toBe('evi_123')
  })
})
```

---

## Common Issues

### Issue 1: File Upload Showing Loading Forever
- Ensure `Content-Type: multipart/form-data` header is set
- The client code handles this automatically

### Issue 2: Hash Verification Failing
- File must be exact same as original (any modification changes hash)
- Use SHA-256 algorithm client-side (Web Crypto API)

### Issue 3: Chain of Custody Not Appearing
- Ensure user has permission to view chain
- Check that evidence ID is correct

---

## Summary

✅ All methods work with React Query  
✅ Automatic error handling via axios interceptor  
✅ Multipart form data handled automatically  
✅ JWT auth added to all requests  
✅ File downloads support blob streaming  
✅ Search and filtering support  
✅ Chain of custody tracking  

Ready for production! 🚀
