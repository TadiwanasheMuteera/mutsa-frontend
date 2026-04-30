# Evidence API Client - Complete Reference

## Overview

All evidence management methods are in `src/api/evidence.js`. They handle file uploads, hash verification, and chain of custody tracking.

---

## 📋 Methods Reference

### 1. Get Evidence by Case

**Endpoint**: `GET /api/evidence/cases/:caseId/evidence`

**Usage**:
```javascript
import { evidenceAPI } from '@/api/evidence'

const evidence = await evidenceAPI.getEvidenceByCaseId('case_123')

console.log(evidence)
// [
//   {id: "evi_1", evidence_type: "digital_file", file_name: "fraud_records.zip", ...},
//   {id: "evi_2", evidence_type: "document", file_name: "email_chain.pdf", ...},
//   ...
// ]
```

**Response**:
```json
{
  "success": true,
  "data": {
    "evidence": [
      {
        "id": "evi_123",
        "evidence_type": "digital_file",
        "file_name": "fraud_records.zip",
        "collected_by": "user_456",
        "collection_date": "2024-01-15T10:30:00Z",
        "status": "stored"
      }
    ]
  },
  "message": "Evidence retrieved"
}
```

**Returns**: Array of evidence objects

---

### 2. Create Evidence (with File Upload)

**Endpoint**: `POST /api/evidence/cases/:caseId/evidence`

**Usage**:
```javascript
const newEvidence = await evidenceAPI.createEvidence('case_123', {
  file: fileObject,                          // File from input
  evidence_type: 'digital_file',             // Required
  collected_by: 'user-uuid-123',             // Required
  description: 'Fraudulent transaction records',  // Optional
  source: 'Bank server backups',             // Optional
  collection_date: '2024-01-15T10:30:00Z',  // Optional ISO
  notes: 'File extracted from secure server' // Optional
})

console.log(newEvidence)
// {
//   id: "evi_123",
//   evidence_type: "digital_file",
//   file_name: "fraud_records.zip",
//   file_hash: "a1b2c3d4e5f6...",
//   collected_by: "user-uuid-123",
//   collection_date: "2024-01-15T10:30:00Z",
//   created_at: "2024-01-15T11:00:00Z"
// }
```

**Request** (multipart/form-data):
```
file: <binary file>
evidence_type: digital_file
collected_by: user-uuid-123
description: Fraudulent transaction records
source: Bank server backups
collection_date: 2024-01-15T10:30:00Z
notes: File extracted from secure server
```

**Response**:
```json
{
  "success": true,
  "data": {
    "evidence": {
      "id": "evi_123",
      "evidence_type": "digital_file",
      "file_name": "fraud_records.zip",
      "file_hash": "a1b2c3d4e5f6...",
      "collected_by": "user-uuid-123",
      "collection_date": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-15T11:00:00Z"
    }
  },
  "message": "Evidence created successfully"
}
```

**Returns**: Evidence object with file hash

---

### 3. Get Evidence Details

**Endpoint**: `GET /api/evidence/evidence/:evidenceId`

**Usage**:
```javascript
const details = await evidenceAPI.getEvidenceById('evi_123')

console.log(details)
// {
//   id: "evi_123",
//   evidence_type: "digital_file",
//   file_name: "fraud_records.zip",
//   file_hash: "a1b2c3d4e5f6...",
//   description: "Fraudulent transaction records",
//   source: "Bank server backups",
//   collected_by: "user-uuid-123",
//   collection_date: "2024-01-15T10:30:00Z",
//   notes: "File extracted from secure server",
//   status: "stored",
//   created_at: "2024-01-15T11:00:00Z",
//   updated_at: "2024-01-15T11:00:00Z"
// }
```

**Response**:
```json
{
  "success": true,
  "data": {
    "evidence": {
      "id": "evi_123",
      "evidence_type": "digital_file",
      "file_name": "fraud_records.zip",
      "file_hash": "a1b2c3d4e5f6...",
      "description": "Fraudulent transaction records",
      "source": "Bank server backups",
      "collected_by": "user-uuid-123",
      "collection_date": "2024-01-15T10:30:00Z",
      "notes": "File extracted from secure server",
      "status": "stored",
      "created_at": "2024-01-15T11:00:00Z",
      "updated_at": "2024-01-15T11:00:00Z"
    }
  },
  "message": "Evidence retrieved"
}
```

**Returns**: Evidence object with all details

---

### 4. Get Chain of Custody

**Endpoint**: `GET /api/evidence/evidence/:evidenceId/chain`

**Usage**:
```javascript
const chain = await evidenceAPI.getEvidenceChain('evi_123')

console.log(chain)
// [
//   {
//     timestamp: "2024-01-15T10:30:00Z",
//     action: "collected",
//     user_id: "user-uuid-123",
//     user_name: "John Investigator",
//     location: "Bank Server Room",
//     notes: "Evidence collected from server"
//   },
//   {
//     timestamp: "2024-01-15T11:00:00Z",
//     action: "transferred",
//     user_id: "user-uuid-456",
//     user_name: "Jane Evidence Officer",
//     location: "Evidence Storage Room 3",
//     notes: "Transferred to secure storage"
//   },
//   ...
// ]
```

**Response**:
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

**Returns**: Array of chain records

---

### 5. Verify Hash Integrity

**Endpoint**: `POST /api/evidence/evidence/:evidenceId/verify-hash`

**Usage**:
```javascript
const verification = await evidenceAPI.verifyHash('evi_123', fileObject)

console.log(verification)
// {
//   original_hash: "a1b2c3d4e5f6...",
//   computed_hash: "a1b2c3d4e5f6...",
//   match: true,
//   verified_at: "2024-01-15T14:00:00Z",
//   verified_by: "user-uuid-789"
// }
```

**Request** (multipart/form-data):
```
file: <binary file>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "verification": {
      "original_hash": "a1b2c3d4e5f6...",
      "computed_hash": "a1b2c3d4e5f6...",
      "match": true,
      "verified_at": "2024-01-15T14:00:00Z",
      "verified_by": "user-uuid-789"
    }
  },
  "message": "Hash verification completed"
}
```

**Returns**: Verification result with hash comparison

---

## 🔄 Additional Methods

### Update Evidence

```javascript
const updated = await evidenceAPI.updateEvidence('evi_123', {
  description: 'Updated description',
  notes: 'Additional notes',
  source: 'Updated source'
})
```

### Delete Evidence

```javascript
const result = await evidenceAPI.deleteEvidence('evi_123')
// Returns: {success: true, message: "Evidence deleted"}
```

### Download Evidence File

```javascript
const blob = await evidenceAPI.downloadEvidence('evi_123')
// Save blob to file
const url = window.URL.createObjectURL(blob)
const link = document.createElement('a')
link.href = url
link.download = 'evidence_file.zip'
link.click()
```

### Add Chain of Custody Record

```javascript
const record = await evidenceAPI.addChainRecord('evi_123', {
  action: 'transferred',
  user_id: 'user-uuid-456',
  location: 'Evidence Storage Room 3',
  notes: 'Transferred to secure storage'
})
```

### Search Evidence

```javascript
const results = await evidenceAPI.searchEvidence('fraud')
// Returns: array of matching evidence items
```

---

## 📝 Usage Examples

### Example 1: Upload Evidence Form

```javascript
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { evidenceAPI } from '@/api/evidence'
import { useAuthStore } from '@/store/authStore'

export function EvidenceUploadForm({ caseId }) {
  const [file, setFile] = useState(null)
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const user = useAuthStore((state) => state.user)

  const mutation = useMutation({
    mutationFn: (data) => evidenceAPI.createEvidence(caseId, data),
    onSuccess: (newEvidence) => {
      alert(`Evidence uploaded: ${newEvidence.file_name}`)
      setFile(null)
      setType('')
      setDescription('')
    },
    onError: (error) => {
      alert(`Error: ${error.response?.data?.message}`)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!file || !type) {
      alert('Please select file and type')
      return
    }

    mutation.mutate({
      file,
      evidence_type: type,
      collected_by: user.id,
      description,
      collection_date: new Date().toISOString()
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0])}
          required
        />
        {file && <p>File: {file.name} ({file.size} bytes)</p>}
      </div>

      <select value={type} onChange={(e) => setType(e.target.value)} required>
        <option value="">Select Type</option>
        <option value="digital_file">Digital File</option>
        <option value="document">Document</option>
        <option value="screenshot">Screenshot</option>
        <option value="video">Video</option>
        <option value="image">Image</option>
      </select>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
      />

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Uploading...' : 'Upload Evidence'}
      </button>
    </form>
  )
}
```

### Example 2: Evidence List with Chain

```javascript
import { useQuery } from '@tanstack/react-query'
import { evidenceAPI } from '@/api/evidence'

export function EvidenceList({ caseId }) {
  const { data: evidence, isLoading } = useQuery({
    queryKey: ['evidence', caseId],
    queryFn: () => evidenceAPI.getEvidenceByCaseId(caseId)
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {evidence?.map(item => (
        <div key={item.id}>
          <h3>{item.file_name}</h3>
          <p>Type: {item.evidence_type}</p>
          <p>Collected: {item.collection_date}</p>
          <button onClick={() => handleViewChain(item.id)}>
            View Chain
          </button>
        </div>
      ))}
    </div>
  )
}
```

### Example 3: Hash Verification

```javascript
import { useState } from 'react'
import { evidenceAPI } from '@/api/evidence'

export function HashVerificationForm({ evidenceId }) {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    if (!file) return

    setLoading(true)
    try {
      const verification = await evidenceAPI.verifyHash(evidenceId, file)
      setResult(verification)
    } catch (error) {
      alert(`Error: ${error.response?.data?.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0])} />
      <button onClick={handleVerify} disabled={loading || !file}>
        {loading ? 'Verifying...' : 'Verify Hash'}
      </button>

      {result && (
        <div>
          <h3>Verification Result</h3>
          <p>Match: {result.match ? '✅ YES' : '❌ NO'}</p>
          <p>Original: {result.original_hash}</p>
          <p>Computed: {result.computed_hash}</p>
          <p>Verified: {new Date(result.verified_at).toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}
```

---

## ⚠️ Error Handling

```javascript
try {
  await evidenceAPI.createEvidence(caseId, evidenceData)
} catch (error) {
  const message = error.response?.data?.message
  // "File is required"
  // "Invalid evidence type"
  // "File too large"
  // "Case not found"
  console.error(message)
}
```

---

## 📊 Evidence Types

Common evidence types:
- `digital_file` - Computer files
- `document` - Paper or PDF
- `screenshot` - Screenshot image
- `transaction_log` - Transaction records
- `email` - Email evidence
- `video` - Video file
- `audio` - Audio file
- `image` - Image file
- `device` - Physical device
- `other` - Other

---

## ✅ Summary

| Method | Endpoint | Input | Output |
|--------|----------|-------|--------|
| getEvidenceByCaseId | GET /cases/:id/evidence | caseId | evidence[] |
| createEvidence | POST /cases/:id/evidence | caseId, evidenceData | evidence |
| getEvidenceById | GET /evidence/:id | evidenceId | evidence |
| getEvidenceChain | GET /evidence/:id/chain | evidenceId | chain[] |
| verifyHash | POST /evidence/:id/verify-hash | evidenceId, file | verification |
| updateEvidence | PUT /evidence/:id | evidenceId, updates | evidence |
| deleteEvidence | DELETE /evidence/:id | evidenceId | {success, message} |
| downloadEvidence | GET /evidence/:id/download | evidenceId | blob |
| addChainRecord | POST /evidence/:id/chain | evidenceId, chainData | chain_record |
| searchEvidence | GET /search | query | evidence[] |

---

**All methods handle multipart/form-data and file uploads properly!** 🚀
