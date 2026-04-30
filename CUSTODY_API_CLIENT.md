# Custody API Client - Quick Summary

**File**: `src/api/custody.js`

## 11 Methods Available

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `transferEvidence` | POST /api/custody/evidence/:evidenceId/transfer | Transfer to another user |
| `updateEvidenceStatus` | PUT /api/custody/evidence/:evidenceId/status | Update status |
| `getCustodyLog` | GET /api/custody/custody-log/:evidenceId | Get complete log |
| `getCurrentCustodyStatus` | GET /api/custody/evidence/:evidenceId/current-status | Get current status |
| `getEvidenceTransfers` | GET /api/custody/evidence/:evidenceId/transfers | Get transfers list |
| `getStatusHistory` | GET /api/custody/evidence/:evidenceId/status-history | Get status changes |
| `releaseEvidence` | POST /api/custody/evidence/:evidenceId/release | Release evidence |
| `destroyEvidence` | POST /api/custody/evidence/:evidenceId/destroy | Destroy evidence |
| `archiveEvidence` | POST /api/custody/evidence/:evidenceId/archive | Archive evidence |
| `getCustodyReport` | GET /api/custody/evidence/:evidenceId/report | Get custody summary |
| `getCustodyActivity` | GET /api/custody/activity | Get recent activity |

---

## 3 Required Methods

### 1. Transfer Evidence
```javascript
import { custodyAPI } from '@/api/custody'

const transfer = await custodyAPI.transferEvidence('evi_123', {
  transferred_to_user_id: 'user-uuid-456',  // Required
  reason: 'Transfer for analysis',           // Required
  location: 'Lab Room A',                    // Required
  notes: 'Optional notes'                    // Optional
})
// Returns: {id, evidence_id, transferred_from_user_id, transferred_to_user_id, ...}
```

### 2. Update Status
```javascript
const statusUpdate = await custodyAPI.updateEvidenceStatus('evi_123', {
  new_status: 'transferred',     // Required: stored|transferred|destroyed|released|archived
  reason: 'Moving to new location', // Required
  notes: 'Optional notes'        // Optional
})
// Returns: {id, evidence_id, old_status, new_status, changed_by, changed_at, ...}
```

### 3. Get Custody Log
```javascript
const log = await custodyAPI.getCustodyLog('evi_123')
// Returns: {
//   evidence_id: 'evi_123',
//   total_transfers: 3,
//   current_location: 'Lab Room A',
//   current_status: 'transferred',
//   custody_records: [...]
// }
```

---

## 5-Minute Start

### List Custody Records
```javascript
const log = await custodyAPI.getCustodyLog('evi_123')
console.log(log.current_status)     // "transferred"
console.log(log.current_location)   // "Lab Room A"
console.log(log.custody_records)    // Array of all custody events
```

### Transfer Evidence to Lab
```javascript
const result = await custodyAPI.transferEvidence('evi_123', {
  transferred_to_user_id: 'lab-tech-uuid',
  reason: 'Forensic analysis required',
  location: 'Forensic Lab - Room 3A',
  notes: 'DNA analysis requested'
})
console.log(result.transferred_at)  // When transfer happened
```

### Mark as Stored
```javascript
await custodyAPI.updateEvidenceStatus('evi_123', {
  new_status: 'stored',
  reason: 'Evidence placed in secure storage',
  notes: 'Stored in Cabinet B, Shelf 2'
})
```

### Release Evidence
```javascript
await custodyAPI.releaseEvidence('evi_123', {
  released_to: 'Defense Attorney John Smith',
  reason: 'Case settlement - discovery release',
  notes: 'Released per court order'
})
```

### Archive Evidence
```javascript
await custodyAPI.archiveEvidence('evi_123', {
  archive_location: 'Archive Room 2, Box 456',
  reason: 'Case closed - long-term storage',
  notes: 'Stored for 7-year retention'
})
```

---

## With React Query

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { custodyAPI } from '@/api/custody'

// Get custody log
function CustodyLog({ evidenceId }) {
  const { data } = useQuery({
    queryKey: ['custody-log', evidenceId],
    queryFn: () => custodyAPI.getCustodyLog(evidenceId)
  })
  return <>{data?.current_status}</>
}

// Transfer evidence
function TransferForm({ evidenceId }) {
  const queryClient = useQueryClient()
  const transfer = useMutation({
    mutationFn: (data) => custodyAPI.transferEvidence(evidenceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custody-log', evidenceId] })
      toast.success('Evidence transferred!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    transfer.mutate({
      transferred_to_user_id: e.target.user.value,
      reason: e.target.reason.value,
      location: e.target.location.value
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="user" required />
      <textarea name="reason" required />
      <input name="location" required />
      <button disabled={transfer.isPending}>
        {transfer.isPending ? 'Transferring...' : 'Transfer'}
      </button>
    </form>
  )
}
```

---

## Error Handling

```javascript
try {
  await custodyAPI.transferEvidence(evidenceId, data)
} catch (error) {
  const message = error.response?.data?.message
  console.error(message)
  // "Recipient user not found"
  // "Evidence not found"
  // "Invalid status transition"
}
```

---

## Status Values

- `stored` - Evidence is in storage facility
- `transferred` - Evidence in transit
- `destroyed` - Evidence has been destroyed (final)
- `released` - Evidence released to third party (final)
- `archived` - Evidence archived for long-term storage

**Status Transitions**:
```
collected → stored ↔ transferred → (released|destroyed|archived)
```

---

## Response Format

All endpoints return:
```json
{
  "success": true,
  "data": { "transfer": {...} },
  "message": "Transfer successful"
}
```

Methods automatically extract `.data` so you get:

**transferEvidence**:
```json
{
  "id": "transfer_789",
  "evidence_id": "evi_123",
  "transferred_from_user_id": "user-uuid-123",
  "transferred_to_user_id": "user-uuid-456",
  "reason": "Lab analysis",
  "location": "Lab Room A",
  "transferred_at": "2024-01-15T14:00:00Z",
  "notes": "Analysis requested"
}
```

**updateEvidenceStatus**:
```json
{
  "id": "status_456",
  "evidence_id": "evi_123",
  "old_status": "stored",
  "new_status": "transferred",
  "reason": "Moving to lab",
  "changed_by": "user-uuid-789",
  "changed_at": "2024-01-15T14:00:00Z"
}
```

**getCustodyLog**:
```json
{
  "evidence_id": "evi_123",
  "total_transfers": 3,
  "current_location": "Lab Room A",
  "current_status": "transferred",
  "custody_records": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "action": "collected",
      "user_name": "John Investigator",
      "location": "Bank Server",
      "details": "Evidence collected"
    },
    {
      "timestamp": "2024-01-15T14:00:00Z",
      "action": "transferred",
      "user_name": "Lab Tech",
      "location": "Lab Room A",
      "details": "Transferred to lab"
    }
  ]
}
```

---

## API Endpoints

```
POST /api/custody/evidence/:evidenceId/transfer
PUT /api/custody/evidence/:evidenceId/status
GET /api/custody/custody-log/:evidenceId
GET /api/custody/evidence/:evidenceId/current-status
GET /api/custody/evidence/:evidenceId/transfers
GET /api/custody/evidence/:evidenceId/status-history
POST /api/custody/evidence/:evidenceId/release
POST /api/custody/evidence/:evidenceId/destroy
POST /api/custody/evidence/:evidenceId/archive
GET /api/custody/evidence/:evidenceId/report
GET /api/custody/activity
```

---

## Key Features

🔐 **Audit Trail**: Every action tracked with user, timestamp, reason  
⛓️ **Chain of Custody**: Complete record of evidence handling  
📋 **Status Tracking**: Know exactly where evidence is and its condition  
📊 **Reports**: Get custody summaries for audits  
🔄 **Workflows**: Support for release, destruction, archival  
🔍 **Activity Log**: Dashboard view of recent custody activity  

---

## Integration Points

Ready to use in:
- CaseDetailPage - Custody section
- EvidenceDetailPage - Handoff/transfer UI
- DashboardPage - Recent custody activity widget
- ReportsPage - Evidence custody reports

---

## Next Steps

1. ✅ Import: `import { custodyAPI } from '@/api/custody'`
2. ✅ Use with React Query for caching
3. ✅ Build transfer forms and status buttons
4. ✅ Display custody log timeline
5. ✅ Create custody reports

See `CUSTODY_API_REFERENCE.md` for complete documentation with examples!

---

**Ready to use!** 🚀 All methods handle JWT auth and error handling automatically.
