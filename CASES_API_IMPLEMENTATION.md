# Cases API Client - Implementation Guide

## ✅ What Was Created

Complete Cases API client with all 9 methods, full documentation, and usage examples.

---

## 📋 9 Methods Implemented

### 1. **getCases(options)**
```javascript
await casesAPI.getCases({
  page: 1,
  per_page: 10,
  status: 'open',           // optional
  fraud_type: 'embezzlement' // optional
})
```
Returns: `{cases, total, page, per_page}`

### 2. **createCase(caseData)**
```javascript
await casesAPI.createCase({
  case_number: 'CASE-2024-001',
  title: 'Internal Fraud Investigation',
  fraud_type: 'embezzlement',
  description: '...',      // optional
  suspect_info: '...',     // optional
  assigned_to: 'user_456'  // optional
})
```
Returns: `case object`

### 3. **getCaseById(caseId)**
```javascript
await casesAPI.getCaseById('case_123')
```
Returns: `case object with all details`

### 4. **updateCase(caseId, updates)**
```javascript
await casesAPI.updateCase('case_123', {
  title: 'New Title',
  description: '...',
  assigned_to: 'user_789'
})
```
Returns: `updated case`

### 5. **updateCaseStatus(caseId, status, reason)**
```javascript
await casesAPI.updateCaseStatus(
  'case_123',
  'closed',
  'Investigation completed'
)
```
Returns: `{id, status, reason, updated_at}`

### 6. **getCaseTimeline(caseId)**
```javascript
await casesAPI.getCaseTimeline('case_123')
```
Returns: `timeline array`

### 7. **getCaseStatistics(caseId)**
```javascript
await casesAPI.getCaseStatistics('case_123')
```
Returns: `{total_evidence, total_custody_records, case_status, fraud_type}`

### 8. **deleteCase(caseId)**
```javascript
await casesAPI.deleteCase('case_123')
```
Returns: `{success, message}`

### 9. **searchCases(query)**
```javascript
await casesAPI.searchCases('embezzlement')
```
Returns: `cases array`

---

## 🔄 How Each Method Works

### Get Cases
```
GET /api/cases?page=1&per_page=10&status=open
↓
Returns paginated list with filters
```

### Create Case
```
POST /api/cases
{case_number, title, fraud_type, ...}
↓
Returns newly created case
```

### Get Case Details
```
GET /api/cases/:caseId
↓
Returns complete case information
```

### Update Case
```
PUT /api/cases/:caseId
{title, description, ...}
↓
Returns updated case
```

### Update Status
```
PUT /api/cases/:caseId/status
{status, reason}
↓
Returns status update info
```

### Get Timeline
```
GET /api/cases/:caseId/timeline
↓
Returns array of timeline events
```

---

## 💡 Quick Usage Patterns

### Pattern 1: Get Cases with React Query
```javascript
import { useQuery } from '@tanstack/react-query'
import { casesAPI } from '@/api/cases'

const { data, isLoading } = useQuery({
  queryKey: ['cases', page],
  queryFn: () => casesAPI.getCases({ page })
})
```

### Pattern 2: Create Case with Mutation
```javascript
const mutation = useMutation({
  mutationFn: (data) => casesAPI.createCase(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['cases'] })
  }
})

mutation.mutate(formData)
```

### Pattern 3: Get Case Details
```javascript
const { data: caseDetails } = useQuery({
  queryKey: ['case', caseId],
  queryFn: () => casesAPI.getCaseById(caseId)
})
```

---

## 📊 Response Format

All methods follow backend response: `{success, data, message}`

Frontend automatically:
- ✅ Extracts `data` from response
- ✅ Shows `message` on errors
- ✅ Throws error if `success: false`

---

## 🧪 Testing

### Test Get Cases
```javascript
const result = await casesAPI.getCases()
console.log(result)
// {cases: [...], total: 150, page: 1, per_page: 10}
```

### Test Create Case
```javascript
const newCase = await casesAPI.createCase({
  case_number: 'CASE-2024-001',
  title: 'Test Case',
  fraud_type: 'embezzlement'
})
console.log(newCase)
// {id: "case_123", case_number: "CASE-2024-001", ...}
```

### Test Get Timeline
```javascript
const timeline = await casesAPI.getCaseTimeline('case_123')
console.log(timeline)
// [{timestamp, action, user, description}, ...]
```

---

## ⚠️ Error Handling

### What Can Go Wrong
```javascript
// 404 - Case not found
await casesAPI.getCaseById('invalid_id')
// Error: "Case not found"

// 400 - Missing required fields
await casesAPI.createCase({title: 'Only Title'})
// Error: "case_number is required"

// 403 - Permission denied
await casesAPI.deleteCase('case_123')
// Error: "You don't have permission to delete this case"

// 409 - Conflict (duplicate case number)
await casesAPI.createCase({case_number: 'CASE-2024-001', ...})
// Error: "Case number already exists"
```

### Catching Errors
```javascript
try {
  await casesAPI.getCases()
} catch (error) {
  const message = error.response?.data?.message
  console.error(message)
}
```

---

## 📋 Pagination Example

```javascript
const [page, setPage] = useState(1)

const { data } = useQuery({
  queryKey: ['cases', page],
  queryFn: () => casesAPI.getCases({page, per_page: 10})
})

const totalPages = Math.ceil(data.total / data.per_page)

return (
  <div>
    {data.cases.map(c => <div key={c.id}>{c.title}</div>)}
    
    <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
      Previous
    </button>
    <span>Page {page} of {totalPages}</span>
    <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
      Next
    </button>
  </div>
)
```

---

## 🔍 Filter Example

```javascript
const [filters, setFilters] = useState({status: '', fraud_type: ''})

const { data } = useQuery({
  queryKey: ['cases', filters],
  queryFn: () => casesAPI.getCases(filters)
})

return (
  <div>
    <select 
      value={filters.status}
      onChange={(e) => setFilters({...filters, status: e.target.value})}
    >
      <option value="">All Status</option>
      <option value="open">Open</option>
      <option value="closed">Closed</option>
    </select>
    
    <select
      value={filters.fraud_type}
      onChange={(e) => setFilters({...filters, fraud_type: e.target.value})}
    >
      <option value="">All Types</option>
      <option value="embezzlement">Embezzlement</option>
      <option value="money_laundering">Money Laundering</option>
    </select>
  </div>
)
```

---

## 📁 File Modified

**`src/api/cases.js`**
- 9 complete methods
- Full JSDoc comments
- Error handling
- Response parsing

---

## ✅ Features

✅ **Pagination** - Get cases with page/per_page  
✅ **Filtering** - Filter by status, fraud_type  
✅ **CRUD** - Create, Read, Update, Delete cases  
✅ **Status Management** - Update case status with reason  
✅ **Timeline** - View case history  
✅ **Statistics** - Get case statistics  
✅ **Search** - Search cases by query  
✅ **Error Handling** - Automatic error extraction  
✅ **React Query Ready** - Works with useQuery, useMutation  

---

## 🎯 Next Steps

1. ✅ Cases methods created
2. Update CasesList to use pagination
3. Create CreateCaseForm
4. Add CaseDetail page
5. Implement filters
6. Add timeline view

---

## 📖 Full Documentation

See `CASES_API_REFERENCE.md` for:
- Detailed method documentation
- Request/response examples
- Complete usage examples
- Error handling patterns

---

## ✨ Ready to Use

All 9 methods are production-ready and can be used immediately in your components! 🚀
