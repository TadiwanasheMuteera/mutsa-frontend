# Custody API Client - Implementation Guide

## Quick Start

### Basic Pattern

All Custody API methods follow this pattern:

```javascript
import { custodyAPI } from '@/api/custody'

// All methods are async
const data = await custodyAPI.methodName(params)
```

---

## Integration Patterns

### 1. Transfer Evidence (Required endpoint)

```javascript
import { custodyAPI } from '@/api/custody'

async function transferEvidence(evidenceId, recipientUserId) {
  try {
    const transfer = await custodyAPI.transferEvidence(evidenceId, {
      transferred_to_user_id: recipientUserId,
      reason: 'Transferred for analysis',
      location: 'Forensic Lab',
      notes: 'Evidence requires lab analysis'
    })
    
    console.log('Transfer successful:', transfer)
    return transfer
  } catch (error) {
    console.error('Transfer failed:', error.response?.data?.message)
  }
}
```

### 2. Update Status (Required endpoint)

```javascript
async function updateEvidenceStatus(evidenceId, newStatus) {
  try {
    const result = await custodyAPI.updateEvidenceStatus(evidenceId, {
      new_status: newStatus,
      reason: 'Evidence custody status update',
      notes: 'Updated from case management system'
    })
    
    return result
  } catch (error) {
    console.error('Status update failed:', error.response?.data?.message)
  }
}
```

### 3. Get Custody Log (Required endpoint)

```javascript
async function fetchCustodyLog(evidenceId) {
  try {
    const log = await custodyAPI.getCustodyLog(evidenceId)
    console.log('Current status:', log.current_status)
    console.log('Location:', log.current_location)
    console.log('Total transfers:', log.total_transfers)
    return log
  } catch (error) {
    console.error('Failed to fetch custody log:', error.response?.data?.message)
  }
}
```

---

## React Query Integration

### 1. Query: Custody Log with Auto-Refetch

```javascript
import { useQuery } from '@tanstack/react-query'
import { custodyAPI } from '@/api/custody'

export function CustodyLogDisplay({ evidenceId }) {
  const { data: log, isLoading, error } = useQuery({
    queryKey: ['custody-log', evidenceId],
    queryFn: () => custodyAPI.getCustodyLog(evidenceId),
    enabled: !!evidenceId,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000 // 5 minutes
  })

  if (isLoading) return <div>Loading custody log...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h3>Current Status: {log?.current_status}</h3>
      <p>Location: {log?.current_location}</p>
      <p>Transfers: {log?.total_transfers}</p>
    </div>
  )
}
```

### 2. Mutation: Transfer Evidence

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { custodyAPI } from '@/api/custody'

export function TransferEvidenceForm({ evidenceId, users }) {
  const queryClient = useQueryClient()

  const transferMutation = useMutation({
    mutationFn: (transferData) => 
      custodyAPI.transferEvidence(evidenceId, transferData),
    
    onSuccess: (result) => {
      // Invalidate custody log to trigger refetch
      queryClient.invalidateQueries({ 
        queryKey: ['custody-log', evidenceId] 
      })
      
      // Show success
      toast.success(`Evidence transferred to ${result.transferred_to_user_id}`)
      
      // Clear form
      resetForm()
    },
    
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Transfer failed')
    }
  })

  const handleTransfer = (recipientId, reason, location) => {
    transferMutation.mutate({
      transferred_to_user_id: recipientId,
      reason,
      location,
      notes: 'Transfer via UI'
    })
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.target)
      handleTransfer(
        formData.get('recipient'),
        formData.get('reason'),
        formData.get('location')
      )
    }}>
      <select name="recipient" required>
        <option value="">Select recipient</option>
        {users?.map(u => (
          <option key={u.id} value={u.id}>{u.full_name}</option>
        ))}
      </select>

      <input name="reason" placeholder="Reason" required />
      <input name="location" placeholder="Location" required />

      <button type="submit" disabled={transferMutation.isPending}>
        {transferMutation.isPending ? 'Transferring...' : 'Transfer Evidence'}
      </button>
    </form>
  )
}
```

### 3. Mutation: Update Status

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { custodyAPI } from '@/api/custody'

export function UpdateEvidenceStatusForm({ evidenceId }) {
  const queryClient = useQueryClient()

  const statusMutation = useMutation({
    mutationFn: (statusData) => 
      custodyAPI.updateEvidenceStatus(evidenceId, statusData),
    
    onSuccess: (result) => {
      queryClient.invalidateQueries({ 
        queryKey: ['custody-log', evidenceId] 
      })
      
      toast.success(`Status updated to: ${result.new_status}`)
    },
    
    onError: (error) => {
      toast.error(error.response?.data?.message)
    }
  })

  const statuses = ['stored', 'transferred', 'destroyed', 'released', 'archived']

  return (
    <div className="status-buttons">
      {statuses.map(status => (
        <button
          key={status}
          onClick={() => statusMutation.mutate({
            new_status: status,
            reason: `Status changed to ${status}`,
            notes: 'Updated from UI'
          })}
          disabled={statusMutation.isPending}
          className={`btn btn-${status}`}
        >
          {status.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
```

---

## Advanced Patterns

### 1. Custody Timeline Component

```javascript
import { useQuery } from '@tanstack/react-query'
import { custodyAPI } from '@/api/custody'

export function CustodyTimeline({ evidenceId }) {
  const { data: log } = useQuery({
    queryKey: ['custody-log', evidenceId],
    queryFn: () => custodyAPI.getCustodyLog(evidenceId)
  })

  return (
    <div className="timeline">
      <h2>Chain of Custody Timeline</h2>
      
      {log?.custody_records?.map((record, index) => (
        <div key={index} className="timeline-item">
          <div className="timeline-marker" />
          
          <div className="timeline-content">
            <div className="timestamp">
              {new Date(record.timestamp).toLocaleString()}
            </div>
            
            <div className="action-badge">
              {record.action.toUpperCase()}
            </div>
            
            <div className="details">
              <p><strong>By:</strong> {record.user_name}</p>
              <p><strong>Location:</strong> {record.location}</p>
              <p><strong>Details:</strong> {record.details}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### 2. Custody Report Dashboard

```javascript
import { useQuery } from '@tanstack/react-query'
import { custodyAPI } from '@/api/custody'

export function CustodyReportDashboard({ evidenceId }) {
  const { data: report } = useQuery({
    queryKey: ['custody-report', evidenceId],
    queryFn: () => custodyAPI.getCustodyReport(evidenceId)
  })

  return (
    <div className="custody-report">
      <h2>Custody Report</h2>
      
      <div className="report-grid">
        <div className="stat-card">
          <h4>Current Status</h4>
          <div className={`status-badge status-${report?.current_status}`}>
            {report?.current_status?.toUpperCase()}
          </div>
        </div>

        <div className="stat-card">
          <h4>Total Transfers</h4>
          <div className="stat-value">{report?.total_transfers}</div>
        </div>

        <div className="stat-card">
          <h4>Status Changes</h4>
          <div className="stat-value">{report?.total_status_changes}</div>
        </div>

        <div className="stat-card">
          <h4>First Custody</h4>
          <div className="stat-value">
            {new Date(report?.first_custody_at).toLocaleDateString()}
          </div>
        </div>

        <div className="stat-card">
          <h4>Last Update</h4>
          <div className="stat-value">
            {new Date(report?.last_custody_at).toLocaleDateString()}
          </div>
        </div>

        <div className="stat-card">
          <h4>Days in Custody</h4>
          <div className="stat-value">
            {Math.floor(
              (new Date(report?.last_custody_at) - 
               new Date(report?.first_custody_at)) / 
              (1000 * 60 * 60 * 24)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 3. Multi-Step Custody Workflow

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { custodyAPI } from '@/api/custody'

export function CustodyWorkflow({ evidenceId, currentUser }) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState(null)

  const archiveMutation = useMutation({
    mutationFn: (archiveData) => 
      custodyAPI.archiveEvidence(evidenceId, archiveData),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['custody-log', evidenceId] 
      })
      toast.success('Evidence archived')
      setStep(null)
    }
  })

  const releaseMutation = useMutation({
    mutationFn: (releaseData) => 
      custodyAPI.releaseEvidence(evidenceId, releaseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['custody-log', evidenceId] 
      })
      toast.success('Evidence released')
      setStep(null)
    }
  })

  const destroyMutation = useMutation({
    mutationFn: (destroyData) => 
      custodyAPI.destroyEvidence(evidenceId, destroyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['custody-log', evidenceId] 
      })
      toast.success('Evidence destroyed')
      setStep(null)
    }
  })

  return (
    <div className="custody-workflow">
      <h3>Final Custody Actions</h3>

      {!step && (
        <div className="action-buttons">
          <button onClick={() => setStep('archive')}>Archive Evidence</button>
          <button onClick={() => setStep('release')}>Release Evidence</button>
          <button onClick={() => setStep('destroy')}>Destroy Evidence</button>
        </div>
      )}

      {step === 'archive' && (
        <ArchiveForm
          onSubmit={(data) => archiveMutation.mutate(data)}
          onCancel={() => setStep(null)}
          isPending={archiveMutation.isPending}
        />
      )}

      {step === 'release' && (
        <ReleaseForm
          onSubmit={(data) => releaseMutation.mutate(data)}
          onCancel={() => setStep(null)}
          isPending={releaseMutation.isPending}
        />
      )}

      {step === 'destroy' && (
        <DestroyForm
          onSubmit={(data) => destroyMutation.mutate(data)}
          onCancel={() => setStep(null)}
          isPending={destroyMutation.isPending}
        />
      )}
    </div>
  )
}
```

---

## Error Handling

### Simple Error Handling

```javascript
try {
  await custodyAPI.transferEvidence(evidenceId, transferData)
} catch (error) {
  const message = error.response?.data?.message
  console.error(message)
  // "Recipient user not found"
  // "Evidence not found"
  // "Invalid status transition"
}
```

### React Query Error Handling

```javascript
const mutation = useMutation({
  mutationFn: (data) => custodyAPI.transferEvidence(evidenceId, data),
  onError: (error) => {
    const message = error.response?.data?.message || 'Unknown error'
    
    // Show field-specific errors if available
    if (message.includes('recipient')) {
      setFieldError('recipient', message)
    } else {
      toast.error(message)
    }
  }
})
```

---

## Performance Tips

1. **Cache custody logs**: Use `staleTime` to avoid unnecessary refetches
   ```javascript
   useQuery({
     queryFn: () => custodyAPI.getCustodyLog(evidenceId),
     staleTime: 30000 // 30 seconds
   })
   ```

2. **Selective invalidation**: Only invalidate specific queries after mutations
   ```javascript
   queryClient.invalidateQueries({ 
     queryKey: ['custody-log', evidenceId] 
   })
   ```

3. **Paginate activity**: Use pagination for `getCustodyActivity` with large datasets

4. **Batch updates**: If transferring multiple items, use Promise.all
   ```javascript
   await Promise.all(
     evidenceIds.map(id => 
       custodyAPI.transferEvidence(id, transferData)
     )
   )
   ```

---

## Testing

```javascript
import { vi } from 'vitest'
import { custodyAPI } from '@/api/custody'

vi.mock('@/api/custody')

describe('Custody API', () => {
  it('should transfer evidence', async () => {
    vi.mocked(custodyAPI.transferEvidence).mockResolvedValue({
      id: 'transfer_1',
      evidence_id: 'evi_123',
      transferred_to_user_id: 'user_456'
    })

    const result = await custodyAPI.transferEvidence('evi_123', {
      transferred_to_user_id: 'user_456',
      reason: 'Test',
      location: 'Lab'
    })

    expect(result.evidence_id).toBe('evi_123')
  })
})
```

---

## Common Issues

### Issue 1: Custody Log Not Updating After Transfer
- **Solution**: Use `queryClient.invalidateQueries()` after mutation
- Ensures fresh data fetched from backend

### Issue 2: Status Transition Not Allowed
- **Solution**: Check valid status flow (collected → stored/transferred → etc)
- Backend validates status transitions

### Issue 3: Recipient User Not Found
- **Solution**: Ensure user UUID is correct and user exists
- Verify user permissions

---

## Summary

✅ All methods work with React Query  
✅ Automatic error handling  
✅ JWT auth added automatically  
✅ Response format {success, data, message}  
✅ Support for complete custody workflows  
✅ Timeline and reporting built-in  

Ready for production! 🚀
