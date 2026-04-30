# Cases API Client - Complete Reference

## Overview

All case management methods are in `src/api/cases.js`. They follow the backend response format: `{ success, data, message }`.

---

## 📋 Methods Reference

### 1. Get Cases (Paginated with Filters)

**Endpoint**: `GET /api/cases?page=1&per_page=10&status=<optional>&fraud_type=<optional>`

**Usage**:
```javascript
import { casesAPI } from '@/api/cases'

// Get first page
const result = await casesAPI.getCases()

// Get page 2 with filters
const result = await casesAPI.getCases({
  page: 2,
  per_page: 20,
  status: 'open',
  fraud_type: 'embezzlement'
})
```

**Request**:
```
GET /api/cases?page=1&per_page=10&status=open&fraud_type=embezzlement
```

**Response**:
```json
{
  "success": true,
  "data": {
    "cases": [
      {
        "id": "case_123",
        "case_number": "CASE-2024-001",
        "title": "Internal Fraud Case",
        "fraud_type": "embezzlement",
        "status": "open",
        "description": "...",
        "assigned_to": "user_456",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "per_page": 10
  },
  "message": "Cases retrieved"
}
```

**Returns**:
```javascript
{
  cases: [/* array of cases */],
  total: 150,
  page: 1,
  per_page: 10
}
```

---

### 2. Create Case

**Endpoint**: `POST /api/cases`

**Usage**:
```javascript
const newCase = await casesAPI.createCase({
  case_number: 'CASE-2024-001',
  title: 'Internal Fraud Investigation',
  fraud_type: 'embezzlement',
  description: 'Suspected embezzlement by department manager',
  suspect_info: 'Jane Smith, Department Head',
  assigned_to: 'user_456'  // optional
})
```

**Request**:
```json
{
  "case_number": "CASE-2024-001",
  "title": "Internal Fraud Investigation",
  "fraud_type": "embezzlement",
  "description": "Suspected embezzlement by department manager",
  "suspect_info": "Jane Smith, Department Head",
  "assigned_to": "user_456"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "case": {
      "id": "case_123",
      "case_number": "CASE-2024-001",
      "title": "Internal Fraud Investigation",
      "fraud_type": "embezzlement",
      "status": "open",
      "created_at": "2024-01-15T10:30:00Z"
    }
  },
  "message": "Case created successfully"
}
```

**Returns**:
```javascript
{
  id: "case_123",
  case_number: "CASE-2024-001",
  title: "Internal Fraud Investigation",
  fraud_type: "embezzlement",
  status: "open",
  created_at: "2024-01-15T10:30:00Z"
}
```

---

### 3. Get Case Details

**Endpoint**: `GET /api/cases/:caseId`

**Usage**:
```javascript
const caseDetails = await casesAPI.getCaseById('case_123')

console.log(caseDetails)
// {
//   id: "case_123",
//   case_number: "CASE-2024-001",
//   title: "Internal Fraud Investigation",
//   fraud_type: "embezzlement",
//   description: "...",
//   suspect_info: "...",
//   assigned_to: "user_456",
//   status: "open",
//   created_at: "...",
//   updated_at: "..."
// }
```

**Response**:
```json
{
  "success": true,
  "data": {
    "case": {
      "id": "case_123",
      "case_number": "CASE-2024-001",
      "title": "Internal Fraud Investigation",
      "fraud_type": "embezzlement",
      "description": "Suspected embezzlement...",
      "suspect_info": "Jane Smith, Department Head",
      "assigned_to": "user_456",
      "status": "open",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  },
  "message": "Case retrieved"
}
```

**Returns**:
```javascript
{
  id: "case_123",
  case_number: "CASE-2024-001",
  title: "Internal Fraud Investigation",
  fraud_type: "embezzlement",
  description: "...",
  suspect_info: "...",
  assigned_to: "user_456",
  status: "open",
  created_at: "...",
  updated_at: "..."
}
```

---

### 4. Update Case

**Endpoint**: `PUT /api/cases/:caseId`

**Usage**:
```javascript
const updated = await casesAPI.updateCase('case_123', {
  title: 'Updated Title',
  description: 'New description with more details',
  assigned_to: 'user_789',
  suspect_info: 'Updated suspect info'
})
```

**Request**:
```json
{
  "title": "Updated Title",
  "description": "New description",
  "suspect_info": "Updated suspect info",
  "assigned_to": "user_789",
  "fraud_type": "money_laundering"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "case": {
      "id": "case_123",
      "case_number": "CASE-2024-001",
      "title": "Updated Title",
      "fraud_type": "money_laundering",
      "status": "open",
      "updated_at": "2024-01-15T11:00:00Z"
    }
  },
  "message": "Case updated successfully"
}
```

**Returns**:
```javascript
{
  id: "case_123",
  case_number: "CASE-2024-001",
  title: "Updated Title",
  fraud_type: "money_laundering",
  status: "open",
  updated_at: "2024-01-15T11:00:00Z"
}
```

---

### 5. Update Case Status

**Endpoint**: `PUT /api/cases/:caseId/status`

**Usage**:
```javascript
const statusUpdate = await casesAPI.updateCaseStatus(
  'case_123',
  'closed',
  'Case investigation completed. Perpetrator identified and referred to authorities.'
)
```

**Request**:
```json
{
  "status": "closed",
  "reason": "Case investigation completed. Perpetrator identified and referred to authorities."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "status_update": {
      "id": "case_123",
      "status": "closed",
      "reason": "Case investigation completed...",
      "updated_at": "2024-01-15T14:00:00Z"
    }
  },
  "message": "Case status updated"
}
```

**Returns**:
```javascript
{
  id: "case_123",
  status: "closed",
  reason: "Case investigation completed...",
  updated_at: "2024-01-15T14:00:00Z"
}
```

---

### 6. Get Case Timeline

**Endpoint**: `GET /api/cases/:caseId/timeline`

**Usage**:
```javascript
const timeline = await casesAPI.getCaseTimeline('case_123')

console.log(timeline)
// [
//   {
//     timestamp: "2024-01-15T10:30:00Z",
//     action: "created",
//     user: "user_123",
//     description: "Case created"
//   },
//   {
//     timestamp: "2024-01-15T11:00:00Z",
//     action: "updated",
//     user: "user_456",
//     description: "Case assigned to investigator"
//   },
//   ...
// ]
```

**Response**:
```json
{
  "success": true,
  "data": {
    "timeline": [
      {
        "timestamp": "2024-01-15T10:30:00Z",
        "action": "created",
        "user": "user_123",
        "description": "Case created"
      },
      {
        "timestamp": "2024-01-15T11:00:00Z",
        "action": "updated",
        "user": "user_456",
        "description": "Case assigned to investigator"
      },
      {
        "timestamp": "2024-01-15T14:00:00Z",
        "action": "status_changed",
        "user": "user_789",
        "description": "Status changed from open to closed"
      }
    ]
  },
  "message": "Timeline retrieved"
}
```

**Returns**:
```javascript
[
  {
    timestamp: "2024-01-15T10:30:00Z",
    action: "created",
    user: "user_123",
    description: "Case created"
  },
  // ... more timeline items
]
```

---

## 🔄 Additional Methods

### Get Case Statistics

```javascript
const stats = await casesAPI.getCaseStatistics('case_123')

// Returns:
{
  total_evidence: 5,
  total_custody_records: 12,
  case_status: "open",
  fraud_type: "embezzlement"
}
```

### Delete Case

```javascript
const result = await casesAPI.deleteCase('case_123')

// Returns:
{
  success: true,
  message: "Case deleted successfully"
}
```

### Search Cases

```javascript
const results = await casesAPI.searchCases('embezzlement')

// Returns: array of matching cases
```

---

## 📝 Usage Examples

### Example 1: List Cases with Pagination

```javascript
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { casesAPI } from '@/api/cases'

export function CasesList() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [fraud_type, setFraudType] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['cases', page, status, fraud_type],
    queryFn: () => casesAPI.getCases({
      page,
      per_page: 10,
      ...(status && { status }),
      ...(fraud_type && { fraud_type })
    })
  })

  if (isLoading) return <div>Loading cases...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All Status</option>
        <option value="open">Open</option>
        <option value="closed">Closed</option>
      </select>

      <table>
        <tbody>
          {data.cases.map(c => (
            <tr key={c.id}>
              <td>{c.case_number}</td>
              <td>{c.title}</td>
              <td>{c.fraud_type}</td>
              <td>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        Page {data.page} of {Math.ceil(data.total / data.per_page)}
        <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
          Previous
        </button>
        <button onClick={() => setPage(p => p + 1)}>
          Next
        </button>
      </div>
    </div>
  )
}
```

### Example 2: Create Case Form

```javascript
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { casesAPI } from '@/api/cases'

export function CreateCaseForm() {
  const [formData, setFormData] = useState({
    case_number: '',
    title: '',
    fraud_type: '',
    description: '',
    suspect_info: ''
  })

  const mutation = useMutation({
    mutationFn: (data) => casesAPI.createCase(data),
    onSuccess: (newCase) => {
      alert(`Case ${newCase.case_number} created!`)
      setFormData({})
    },
    onError: (error) => {
      alert(`Error: ${error.response?.data?.message}`)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Case Number"
        value={formData.case_number}
        onChange={(e) => setFormData({...formData, case_number: e.target.value})}
        required
      />
      <input
        placeholder="Case Title"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        required
      />
      <select
        value={formData.fraud_type}
        onChange={(e) => setFormData({...formData, fraud_type: e.target.value})}
        required
      >
        <option value="">Select Fraud Type</option>
        <option value="embezzlement">Embezzlement</option>
        <option value="money_laundering">Money Laundering</option>
        <option value="fraud">General Fraud</option>
      </select>
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
      />
      <textarea
        placeholder="Suspect Information"
        value={formData.suspect_info}
        onChange={(e) => setFormData({...formData, suspect_info: e.target.value})}
      />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Case'}
      </button>
    </form>
  )
}
```

### Example 3: Case Details with Timeline

```javascript
import { useQuery } from '@tanstack/react-query'
import { casesAPI } from '@/api/cases'

export function CaseDetail({ caseId }) {
  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ['case', caseId],
    queryFn: () => casesAPI.getCaseById(caseId)
  })

  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['case-timeline', caseId],
    queryFn: () => casesAPI.getCaseTimeline(caseId)
  })

  if (caseLoading || timelineLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>{caseData.title}</h1>
      <p>Case #: {caseData.case_number}</p>
      <p>Type: {caseData.fraud_type}</p>
      <p>Status: {caseData.status}</p>
      
      <h2>Timeline</h2>
      <ul>
        {timeline.map(event => (
          <li key={event.timestamp}>
            <strong>{event.action}</strong> - {event.description}
            <br />
            <small>{new Date(event.timestamp).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## ⚠️ Error Handling

```javascript
try {
  await casesAPI.getCases()
} catch (error) {
  // Get backend message
  const message = error.response?.data?.message
  
  if (message.includes('permission')) {
    // Handle permission error
  }
  
  // Show to user
  console.error(message)
}
```

---

## ✅ Summary

| Method | Endpoint | Input | Output |
|--------|----------|-------|--------|
| getCases | GET /cases | options | {cases, total, page, per_page} |
| createCase | POST /cases | caseData | case |
| getCaseById | GET /cases/:id | caseId | case |
| updateCase | PUT /cases/:id | caseId, updates | case |
| updateCaseStatus | PUT /cases/:id/status | caseId, status, reason | status_update |
| getCaseTimeline | GET /cases/:id/timeline | caseId | timeline[] |
| getCaseStatistics | GET /cases/:id/statistics | caseId | statistics |
| deleteCase | DELETE /cases/:id | caseId | {success, message} |
| searchCases | GET /cases/search | query | cases[] |

---

**All methods are production-ready and fully documented!** 🚀
