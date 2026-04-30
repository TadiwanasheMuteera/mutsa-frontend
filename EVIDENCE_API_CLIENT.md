# Evidence API Client - Quick Summary

**File**: `src/api/evidence.js`

## 10 Methods Available

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `getEvidenceByCaseId` | GET /api/evidence/cases/:caseId/evidence | List all evidence in a case |
| `createEvidence` | POST /api/evidence/cases/:caseId/evidence | Upload new evidence with file |
| `getEvidenceById` | GET /api/evidence/evidence/:evidenceId | Get evidence details |
| `getEvidenceChain` | GET /api/evidence/evidence/:evidenceId/chain | Get chain of custody records |
| `verifyHash` | POST /api/evidence/evidence/:evidenceId/verify-hash | Verify file integrity |
| `updateEvidence` | PUT /api/evidence/evidence/:evidenceId | Update evidence info |
| `deleteEvidence` | DELETE /api/evidence/evidence/:evidenceId | Delete evidence |
| `downloadEvidence` | GET /api/evidence/evidence/:evidenceId/download | Download file as blob |
| `addChainRecord` | POST /api/evidence/evidence/:evidenceId/chain | Add chain of custody entry |
| `searchEvidence` | GET /api/evidence/search | Search evidence by query |

---

## 5-Minute Start

### Get Evidence for a Case
```javascript
import { evidenceAPI } from '@/api/evidence'

const evidence = await evidenceAPI.getEvidenceByCaseId('case_123')
// Returns: [{id, file_name, evidence_type, collected_by, ...}, ...]
```

### Upload New Evidence
```javascript
const result = await evidenceAPI.createEvidence('case_123', {
  file: fileObject,                    // From <input type="file">
  evidence_type: 'digital_file',       // Required
  collected_by: 'user-uuid-123',       // Required
  description: 'Description',          // Optional
  source: 'Source info',               // Optional
  collection_date: '2024-01-15T10:30:00Z',  // Optional ISO date
  notes: 'Additional notes'            // Optional
})
// Returns: {id, file_name, file_hash, created_at, ...}
```

### Verify File Hash Integrity
```javascript
const verification = await evidenceAPI.verifyHash('evi_123', fileObject)
// Returns: {original_hash, computed_hash, match: true/false, verified_at, ...}
```

### Get Chain of Custody
```javascript
const chain = await evidenceAPI.getEvidenceChain('evi_123')
// Returns: [{timestamp, action, user_name, location, notes}, ...]
```

### Download Evidence File
```javascript
const blob = await evidenceAPI.downloadEvidence('evi_123')
// Save to disk:
const url = URL.createObjectURL(blob)
const link = document.createElement('a')
link.href = url
link.download = 'filename.ext'
link.click()
```

---

## With React Query

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { evidenceAPI } from '@/api/evidence'

// List evidence
function EvidenceList({ caseId }) {
  const { data } = useQuery({
    queryKey: ['evidence', caseId],
    queryFn: () => evidenceAPI.getEvidenceByCaseId(caseId)
  })
  return <>{data?.map(e => <div key={e.id}>{e.file_name}</div>)}</>
}

// Upload evidence
function UploadForm({ caseId }) {
  const queryClient = useQueryClient()
  const upload = useMutation({
    mutationFn: (data) => evidenceAPI.createEvidence(caseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidence', caseId] })
      toast.success('Evidence uploaded!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    upload.mutate({
      file: e.target.file.files[0],
      evidence_type: e.target.type.value,
      collected_by: userId,
      description: e.target.description.value
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" name="file" required />
      <select name="type" required>
        <option value="digital_file">Digital File</option>
        <option value="document">Document</option>
        <option value="screenshot">Screenshot</option>
      </select>
      <textarea name="description" />
      <button disabled={upload.isPending}>
        {upload.isPending ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  )
}
```

---

## Error Handling

```javascript
try {
  await evidenceAPI.createEvidence(caseId, data)
} catch (error) {
  // Backend error message
  const message = error.response?.data?.message
  console.error(message)
  // Shows: "File is required", "Invalid type", "File too large", etc.
}
```

---

## Response Format

All endpoints return:
```json
{
  "success": true,
  "data": { "evidence": {...} },
  "message": "Success message"
}
```

The client methods automatically extract `.data` so you just get:
```javascript
{
  id: 'evi_123',
  file_name: 'fraud_records.zip',
  file_hash: 'a1b2c3d4e5...',
  evidence_type: 'digital_file',
  collected_by: 'user-uuid-123',
  collection_date: '2024-01-15T10:30:00Z',
  status: 'stored',
  created_at: '2024-01-15T11:00:00Z'
}
```

---

## Evidence Types

- `digital_file` - Any computer file
- `document` - PDF, Word, etc
- `screenshot` - Screenshot image
- `transaction_log` - Transaction records
- `email` - Email message
- `video` - Video file
- `audio` - Audio file
- `image` - Image file
- `device` - Physical device serial/info
- `other` - Other

---

## File Upload Requirements

✅ Multipart form-data automatically handled  
✅ File size validated server-side  
✅ SHA-256 hash computed server-side  
✅ No client-side hashing needed  
✅ Works with any file type  

---

## Key Features

🔐 **Hash Integrity**: Verify file hasn't been modified  
⛓️ **Chain of Custody**: Track who handled evidence and when  
📥 **Download**: Download any evidence file  
🔍 **Search**: Find evidence by query  
✏️ **Update**: Modify description, notes, source  
🗑️ **Delete**: Remove evidence from case  

---

## Response Examples

### Create Evidence Response
```json
{
  "success": true,
  "data": {
    "evidence": {
      "id": "evi_123",
      "evidence_type": "digital_file",
      "file_name": "fraud_records.zip",
      "file_hash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      "collected_by": "user-uuid-456",
      "collection_date": "2024-01-15T10:30:00Z",
      "description": "Financial fraud evidence",
      "source": "Bank server backups",
      "notes": "Extracted with secure methods",
      "status": "stored",
      "created_at": "2024-01-15T11:00:00Z",
      "updated_at": "2024-01-15T11:00:00Z"
    }
  },
  "message": "Evidence created successfully"
}
```

### Hash Verification Response
```json
{
  "success": true,
  "data": {
    "verification": {
      "original_hash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      "computed_hash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      "match": true,
      "verified_at": "2024-01-15T14:00:00Z",
      "verified_by": "user-uuid-789"
    }
  },
  "message": "Hash verification completed"
}
```

### Chain of Custody Response
```json
{
  "success": true,
  "data": {
    "chain": [
      {
        "timestamp": "2024-01-15T10:30:00Z",
        "action": "collected",
        "user_id": "user-uuid-123",
        "user_name": "John Investigator",
        "location": "Bank Server Room",
        "notes": "Evidence collected from server"
      },
      {
        "timestamp": "2024-01-15T11:00:00Z",
        "action": "transferred",
        "user_id": "user-uuid-456",
        "user_name": "Jane Evidence Officer",
        "location": "Evidence Storage Room 3",
        "notes": "Transferred to secure storage"
      }
    ]
  },
  "message": "Chain of custody retrieved"
}
```

---

## Next Steps

1. ✅ Import in components: `import { evidenceAPI } from '@/api/evidence'`
2. ✅ Use with React Query for automatic caching
3. ✅ Call methods in forms and pages
4. ✅ Handle errors with `error.response?.data?.message`

See `EVIDENCE_API_REFERENCE.md` for complete documentation with 10+ code examples!

---

**Ready to use!** 🚀 All methods handle JWT auth, file uploads, and error handling automatically.
