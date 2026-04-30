# Custody API Client - Complete Reference

## Overview

All custody management methods are in `src/api/custody.js`. They handle evidence transfers, status updates, and chain of custody tracking.

---

## 📋 Methods Reference

### 1. Transfer Evidence

**Endpoint**: `POST /api/custody/evidence/:evidenceId/transfer`

**Usage**:
```javascript
import { custodyAPI } from '@/api/custody'

const transfer = await custodyAPI.transferEvidence('evi_123', {
  transferred_to_user_id: 'user-uuid-456',  // Required
  reason: 'Transfer for analysis',           // Required
  location: 'Lab Room A',                    // Required
  notes: 'Transferred for forensic analysis' // Optional
})

console.log(transfer)
// {
//   id: "transfer_789",
//   evidence_id: "evi_123",
//   transferred_from_user_id: "user-uuid-123",
//   transferred_to_user_id: "user-uuid-456",
//   reason: "Transfer for analysis",
//   location: "Lab Room A",
//   transferred_at: "2024-01-15T14:00:00Z",
//   notes: "Transferred for forensic analysis"
// }
```

**Request**:
```json
{
  "transferred_to_user_id": "user-uuid-456",
  "reason": "Transfer for analysis",
  "location": "Lab Room A",
  "notes": "Transferred for forensic analysis"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "transfer": {
      "id": "transfer_789",
      "evidence_id": "evi_123",
      "transferred_from_user_id": "user-uuid-123",
      "transferred_to_user_id": "user-uuid-456",
      "reason": "Transfer for analysis",
      "location": "Lab Room A",
      "transferred_at": "2024-01-15T14:00:00Z",
      "notes": "Transferred for forensic analysis"
    }
  },
  "message": "Evidence transferred successfully"
}
```

**Returns**: Transfer record object

---

### 2. Update Evidence Status

**Endpoint**: `PUT /api/custody/evidence/:evidenceId/status`

**Usage**:
```javascript
const statusUpdate = await custodyAPI.updateEvidenceStatus('evi_123', {
  new_status: 'transferred',     // Required
  reason: 'Moving to new location', // Required
  notes: 'Status updated for tracking' // Optional
})

console.log(statusUpdate)
// {
//   id: "status_456",
//   evidence_id: "evi_123",
//   old_status: "stored",
//   new_status: "transferred",
//   reason: "Moving to new location",
//   changed_by: "user-uuid-789",
//   changed_at: "2024-01-15T14:00:00Z",
//   notes: "Status updated for tracking"
// }
```

**Status Values**:
- `stored` - Evidence is in storage
- `transferred` - Evidence in transit
- `destroyed` - Evidence has been destroyed
- `released` - Evidence released to third party
- `archived` - Evidence archived

**Request**:
```json
{
  "new_status": "transferred",
  "reason": "Moving to new location",
  "notes": "Status updated for tracking"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "status_update": {
      "id": "status_456",
      "evidence_id": "evi_123",
      "old_status": "stored",
      "new_status": "transferred",
      "reason": "Moving to new location",
      "changed_by": "user-uuid-789",
      "changed_at": "2024-01-15T14:00:00Z",
      "notes": "Status updated for tracking"
    }
  },
  "message": "Status updated successfully"
}
```

**Returns**: Status update record object

---

### 3. Get Custody Log

**Endpoint**: `GET /api/custody/custody-log/:evidenceId`

**Usage**:
```javascript
const log = await custodyAPI.getCustodyLog('evi_123')

console.log(log)
// {
//   evidence_id: "evi_123",
//   total_transfers: 3,
//   current_location: "Lab Room A",
//   current_status: "transferred",
//   custody_records: [
//     {
//       timestamp: "2024-01-15T10:30:00Z",
//       action: "collected",
//       user_name: "John Investigator",
//       location: "Bank Server Room",
//       details: "Evidence collected"
//     },
//     {
//       timestamp: "2024-01-15T11:00:00Z",
//       action: "transferred",
//       user_name: "Jane Officer",
//       location: "Evidence Storage",
//       details: "Transferred to storage"
//     },
//     ...
//   ]
// }
```

**Response**:
```json
{
  "success": true,
  "data": {
    "custody_log": {
      "evidence_id": "evi_123",
      "total_transfers": 3,
      "current_location": "Lab Room A",
      "current_status": "transferred",
      "custody_records": [
        {
          "timestamp": "2024-01-15T10:30:00Z",
          "action": "collected",
          "user_id": "user-uuid-123",
          "user_name": "John Investigator",
          "location": "Bank Server Room",
          "details": "Evidence collected"
        },
        {
          "timestamp": "2024-01-15T11:00:00Z",
          "action": "transferred",
          "user_id": "user-uuid-456",
          "user_name": "Jane Officer",
          "location": "Evidence Storage",
          "details": "Transferred to storage"
        }
      ]
    }
  },
  "message": "Custody log retrieved"
}
```

**Returns**: Complete custody log with all records

---

## 🔄 Additional Methods

### 4. Get Current Custody Status

```javascript
const status = await custodyAPI.getCurrentCustodyStatus('evi_123')
// Returns: {evidence_id, current_status, current_location, current_holder_id, current_holder_name, last_transfer_at}
```

### 5. Get Evidence Transfers

```javascript
const transfers = await custodyAPI.getEvidenceTransfers('evi_123')
// Returns: Array of transfer records
```

### 6. Get Status History

```javascript
const history = await custodyAPI.getStatusHistory('evi_123')
// Returns: Array of status change records
```

### 7. Release Evidence

```javascript
const release = await custodyAPI.releaseEvidence('evi_123', {
  released_to: 'Detective Smith',
  reason: 'Case concluded',
  notes: 'Evidence released per warrant'
})
```

### 8. Destroy Evidence

```javascript
const destruction = await custodyAPI.destroyEvidence('evi_123', {
  destruction_method: 'Incinerated',
  reason: 'Retention period expired',
  witness_id: 'user-uuid-999',
  notes: 'Disposed with witness'
})
```

### 9. Archive Evidence

```javascript
const archive = await custodyAPI.archiveEvidence('evi_123', {
  archive_location: 'Archive Room B, Shelf 3',
  reason: 'Case archived',
  notes: 'Stored for long-term retention'
})
```

### 10. Get Custody Report

```javascript
const report = await custodyAPI.getCustodyReport('evi_123')
// Returns: {evidence_id, current_status, total_transfers, total_status_changes, custody_timeline}
```

### 11. Get Custody Activity

```javascript
const activity = await custodyAPI.getCustodyActivity(30)  // Last 30 days
// Returns: Array of recent custody activities
```

---

## 📝 Usage Examples

### Example 1: Transfer Evidence Between Users

```javascript
import { custodyAPI } from '@/api/custody'
import { useAuthStore } from '@/store/authStore'

async function transferToLab(evidenceId, labTechnicianId, reason) {
  try {
    const transfer = await custodyAPI.transferEvidence(evidenceId, {
      transferred_to_user_id: labTechnicianId,
      reason: reason,
      location: 'Forensic Lab',
      notes: 'Transferred for forensic analysis'
    })
    
    toast.success(`Evidence transferred: ${transfer.id}`)
    return transfer
  } catch (error) {
    toast.error(error.response?.data?.message)
  }
}
```

### Example 2: Update Evidence Status with React Query

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { custodyAPI } from '@/api/custody'

function UpdateEvidenceStatus({ evidenceId, onSuccess }) {
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: (statusData) => custodyAPI.updateEvidenceStatus(evidenceId, statusData),
    onSuccess: (result) => {
      // Invalidate custody log query
      queryClient.invalidateQueries({ queryKey: ['custody-log', evidenceId] })
      
      toast.success('Status updated successfully')
      onSuccess?.(result)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message)
    }
  })

  const handleStatusChange = (newStatus, reason) => {
    updateMutation.mutate({
      new_status: newStatus,
      reason: reason,
      notes: 'Status updated'
    })
  }

  return (
    <div>
      <button onClick={() => handleStatusChange('transferred', 'Moving to lab')}>
        Mark as Transferred
      </button>
      <button onClick={() => handleStatusChange('stored', 'Moved to storage')}>
        Mark as Stored
      </button>
      {updateMutation.isPending && <LoadingSpinner />}
    </div>
  )
}
```

### Example 3: Display Custody Log Timeline

```javascript
import { useQuery } from '@tanstack/react-query'
import { custodyAPI } from '@/api/custody'

function CustodyLogTimeline({ evidenceId }) {
  const { data: log, isLoading } = useQuery({
    queryKey: ['custody-log', evidenceId],
    queryFn: () => custodyAPI.getCustodyLog(evidenceId)
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="custody-timeline">
      <h2>Chain of Custody</h2>
      <p>Current Status: <strong>{log?.current_status}</strong></p>
      <p>Current Location: <strong>{log?.current_location}</strong></p>
      <p>Total Transfers: <strong>{log?.total_transfers}</strong></p>

      <div className="timeline">
        {log?.custody_records?.map((record, index) => (
          <div key={index} className="timeline-entry">
            <div className="timestamp">
              {new Date(record.timestamp).toLocaleString()}
            </div>
            <div className="action">{record.action.toUpperCase()}</div>
            <div className="user">{record.user_name}</div>
            <div className="location">{record.location}</div>
            <div className="details">{record.details}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Example 4: Complete Evidence Handoff Form

```javascript
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { custodyAPI } from '@/api/custody'

export function EvidenceHandoffForm({ evidenceId, users }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const handoffMutation = useMutation({
    mutationFn: (data) => custodyAPI.transferEvidence(evidenceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custody-log', evidenceId] })
      toast.success('Evidence handed off successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message)
    }
  })

  const onSubmit = (formData) => {
    handoffMutation.mutate({
      transferred_to_user_id: formData.user_id,
      reason: formData.reason,
      location: formData.location,
      notes: formData.notes
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Receive by *</label>
        <select {...register('user_id', { required: true })}>
          <option value="">Select person</option>
          {users?.map(u => (
            <option key={u.id} value={u.id}>{u.full_name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Reason *</label>
        <textarea {...register('reason', { required: true })} />
      </div>

      <div>
        <label>Location *</label>
        <input {...register('location', { required: true })} type="text" />
      </div>

      <div>
        <label>Notes</label>
        <textarea {...register('notes')} />
      </div>

      <button type="submit" disabled={handoffMutation.isPending}>
        {handoffMutation.isPending ? 'Processing...' : 'Hand Off Evidence'}
      </button>
    </form>
  )
}
```

### Example 5: Custody Report Dashboard

```javascript
import { useQuery } from '@tanstack/react-query'
import { custodyAPI } from '@/api/custody'

function CustodyReportDashboard({ evidenceId }) {
  const { data: report } = useQuery({
    queryKey: ['custody-report', evidenceId],
    queryFn: () => custodyAPI.getCustodyReport(evidenceId)
  })

  return (
    <div className="custody-report">
      <h2>Custody Report</h2>
      
      <div className="report-grid">
        <div className="stat">
          <label>Current Status</label>
          <span className={`badge badge-${report?.current_status}`}>
            {report?.current_status?.toUpperCase()}
          </span>
        </div>
        
        <div className="stat">
          <label>Total Transfers</label>
          <span>{report?.total_transfers}</span>
        </div>
        
        <div className="stat">
          <label>Status Changes</label>
          <span>{report?.total_status_changes}</span>
        </div>
        
        <div className="stat">
          <label>First Custody</label>
          <span>{new Date(report?.first_custody_at).toLocaleString()}</span>
        </div>
        
        <div className="stat">
          <label>Last Custody</label>
          <span>{new Date(report?.last_custody_at).toLocaleString()}</span>
        </div>
      </div>

      <div className="timeline">
        {report?.custody_timeline?.map((event, i) => (
          <div key={i} className="event">
            {event.description}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## ⚠️ Error Handling

```javascript
try {
  await custodyAPI.transferEvidence(evidenceId, transferData)
} catch (error) {
  const message = error.response?.data?.message
  // "Recipient user not found"
  // "Evidence already in transit"
  // "Invalid status transition"
  // "Evidence not found"
  console.error(message)
}
```

---

## 📊 Custody Status Flow

```
collected
    ↓
 stored ↔ transferred
    ↓       ↓
  archived  ├→ released
            ├→ destroyed
            └→ archived
```

---

## ✅ Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| transferEvidence | POST /custody/evidence/:id/transfer | Transfer to another user |
| updateEvidenceStatus | PUT /custody/evidence/:id/status | Update custody status |
| getCustodyLog | GET /custody/custody-log/:id | Get complete custody log |
| getCurrentCustodyStatus | GET /custody/evidence/:id/current-status | Get current status |
| getEvidenceTransfers | GET /custody/evidence/:id/transfers | Get all transfers |
| getStatusHistory | GET /custody/evidence/:id/status-history | Get status changes |
| releaseEvidence | POST /custody/evidence/:id/release | Release evidence |
| destroyEvidence | POST /custody/evidence/:id/destroy | Destroy evidence |
| archiveEvidence | POST /custody/evidence/:id/archive | Archive evidence |
| getCustodyReport | GET /custody/evidence/:id/report | Get custody summary |
| getCustodyActivity | GET /custody/activity | Get recent activity |

---

**All methods handle error responses and JWT authentication automatically!** 🚀
