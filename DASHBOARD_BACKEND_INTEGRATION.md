# Dashboard Backend Integration Examples

## Complete Example: Full Dashboard Data Response

### Example 1: Minimal Response (Basic Fields Only)

This is the minimum required to get the dashboard working:

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "caseNumber": "CASE-2024-001",
      "title": "SIM Swap Attack",
      "status": "ACTIVE",
      "fraudType": "SIM_SWAP",
      "investigator": "Det. John Doe",
      "assignedTo": "Det. Jane Smith",
      "evidenceCount": 5,
      "pendingTransfers": 2,
      "createdAt": "2024-04-01T10:30:00Z",
      "updatedAt": "2024-04-11T14:25:00Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440111",
      "caseNumber": "CASE-2024-002",
      "title": "BEC Campaign",
      "status": "PENDING",
      "fraudType": "BEC",
      "investigator": "Det. Bob Wilson",
      "assignedTo": "Off. Sarah Johnson",
      "evidenceCount": 3,
      "pendingTransfers": 1,
      "createdAt": "2024-04-05T09:00:00Z",
      "updatedAt": "2024-04-10T16:45:00Z"
    }
  ]
}
```

**Result on Dashboard:**
- ✅ Stat cards show: Active Cases: 1, Evidence: 8, Pending: 3, Referred: 0
- ✅ Table shows 2 cases with all columns
- ❌ No integrity alerts shown
- ❌ No activity feed shown

---

### Example 2: Complete Response (With Nested Data)

This is the **recommended** implementation:

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "caseNumber": "CASE-2024-001",
      "title": "SIM Swap Attack - Victim Lost $50K",
      "description": "Coordinated SIM swap attack targeting cryptocurrency wallets",
      "status": "ACTIVE",
      "fraudType": "SIM_SWAP",
      "investigator": "Det. John Doe",
      "assignedTo": "Det. Jane Smith",
      "priority": "HIGH",
      "evidenceCount": 5,
      "pendingTransfers": 2,
      "createdAt": "2024-04-01T10:30:00Z",
      "updatedAt": "2024-04-11T14:25:00Z",
      "evidence": [
        {
          "id": "e1d2c3b4-a5f6-47c8-9d0e-1f2a3b4c5d6e",
          "name": "Suspect's iPhone 12",
          "description": "Device used to capture SIM swap",
          "type": "Device",
          "status": "ACTIVE",
          "hashStatus": "INTACT",
          "initialHash": "5d41402abc4b2a76b9719d911017c592",
          "createdAt": "2024-04-01T11:00:00Z"
        },
        {
          "id": "f2e3d4c5-b6f7-48d9-ae1f-2g3a4b5c6d7e",
          "name": "SIM Card",
          "description": "Cloned SIM card from attack",
          "type": "Evidence",
          "status": "ACTIVE",
          "hashStatus": "TAMPERED",
          "initialHash": "8f14e45fceea167a5a36dedd4bea2543",
          "currentHash": "1234567890abcdef1234567890abcdef",
          "flaggedDate": "2024-04-11T09:15:00Z",
          "createdAt": "2024-04-02T14:00:00Z"
        }
      ],
      "custodyRecords": [
        {
          "id": "c1b2a3d4-e5f6-47c8-9d0e-1f2a3b4c5d6e",
          "evidenceId": "e1d2c3b4-a5f6-47c8-9d0e-1f2a3b4c5d6e",
          "action": "COLLECTED",
          "officer": "Det. John Doe",
          "description": "Evidence collected from suspect's residence",
          "location": "123 Main St, City, State",
          "timestamp": "2024-04-01T10:30:00Z",
          "seals": "tamper-evident-seal-001"
        },
        {
          "id": "d2c3b4e5-f6g7-48d9-ae1f-2g3a4b5c6d7e",
          "evidenceId": "e1d2c3b4-a5f6-47c8-9d0e-1f2a3b4c5d6e",
          "action": "TRANSFERRED",
          "officer": "Det. Jane Smith",
          "description": "Transferred to forensics lab for analysis",
          "location": "Forensics Lab, Building B",
          "timestamp": "2024-04-02T14:00:00Z"
        },
        {
          "id": "e3d4c5f6-g7h8-49ea-bf2g-3h4a5b6c7d8e",
          "evidenceId": "f2e3d4c5-b6f7-48d9-ae1f-2g3a4b5c6d7e",
          "action": "TRANSFERRED",
          "officer": "Dr. Lisa Chen",
          "description": "Evidence transferred to SIM analysis lab",
          "location": "SIM Lab, Building C",
          "timestamp": "2024-04-05T10:15:00Z"
        }
      ]
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440111",
      "caseNumber": "CASE-2024-002",
      "title": "BEC Campaign - $2M Wire Fraud",
      "status": "REFERRED",
      "fraudType": "BEC",
      "investigator": "Det. Bob Wilson",
      "assignedTo": "Prosecutor Jane Anderson",
      "evidenceCount": 3,
      "pendingTransfers": 0,
      "createdAt": "2024-04-05T09:00:00Z",
      "updatedAt": "2024-04-08T10:00:00Z",
      "evidence": [
        {
          "id": "g4f5e6d7-c8i9-4af0-cg3h-4i5a6b7c8d9e",
          "name": "Email Server Logs",
          "description": "Full email logs from compromised account",
          "type": "File",
          "status": "ARCHIVED",
          "hashStatus": "INTACT",
          "initialHash": "0cc175b9c0f1b6a831c399e269772661",
          "createdAt": "2024-04-05T09:30:00Z"
        }
      ],
      "custodyRecords": [
        {
          "id": "f4e5d6c7-h8j9-4bg1-dh4i-5i6a7b8c9d0e",
          "evidenceId": "g4f5e6d7-c8i9-4af0-cg3h-4i5a6b7c8d9e",
          "action": "RELEASED",
          "officer": "Prosecutor Jane Anderson",
          "description": "Evidence released to prosecutor for court",
          "timestamp": "2024-04-08T10:00:00Z"
        }
      ]
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440222",
      "caseNumber": "CASE-2024-003",
      "title": "Insider Trading Investigation",
      "status": "ACTIVE",
      "fraudType": "INSIDER_FRAUD",
      "investigator": "Det. Mike Chen",
      "assignedTo": "Det. Mike Chen",
      "evidenceCount": 8,
      "pendingTransfers": 0,
      "createdAt": "2024-03-15T11:20:00Z",
      "updatedAt": "2024-04-09T15:30:00Z",
      "evidence": [],
      "custodyRecords": []
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "pageSize": 50,
    "totalPages": 1
  }
}
```

**Result on Dashboard:**
- ✅ Stat cards: Active Cases: 2, Evidence: 16, Pending: 2, Referred: 1
- ✅ Table shows all 3 cases
- ✅ Integrity alerts show 1 tampered item (SIM Card)
- ✅ Activity feed shows last 3 custody transfers
- ✅ "All Systems Secure" not shown (alerts present)

---

### Example 3: Empty State

```json
{
  "success": true,
  "data": []
}
```

**Result on Dashboard:**
- ✅ Stat cards all show: 0
- ✅ Table shows: "No cases found"
- ✅ Alerts show: "All Systems Secure"
- ✅ Activity shows: "No activity recorded yet"

---

### Example 4: With Multiple Tampered Evidence

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "caseNumber": "CASE-2024-001",
      "status": "ACTIVE",
      "fraudType": "CYBER_ATTACK",
      "evidenceCount": 12,
      "pendingTransfers": 3,
      "evidence": [
        {
          "id": "e1d2c3b4-a5f6-47c8-9d0e-1f2a3b4c5d6e",
          "name": "Server Drive 1",
          "hashStatus": "TAMPERED",
          "flaggedDate": "2024-04-11T08:00:00Z"
        },
        {
          "id": "f2e3d4c5-b6f7-48d9-ae1f-2g3a4b5c6d7e",
          "name": "Server Drive 2",
          "hashStatus": "TAMPERED",
          "flaggedDate": "2024-04-11T09:15:00Z"
        },
        {
          "id": "g3f4e5d6-c7h8-49ea-bf1g-3h4a5b6c7d8e",
          "name": "Backup Drive",
          "hashStatus": "TAMPERED",
          "flaggedDate": "2024-04-10T14:22:00Z"
        }
      ],
      "custodyRecords": [
        {
          "id": "c1b2a3d4-e5f6-47c8-9d0e-1f2a3b4c5d6e",
          "evidenceId": "e1d2c3b4-a5f6-47c8-9d0e-1f2a3b4c5d6e",
          "action": "COLLECTED",
          "officer": "Det. Sarah Kumar",
          "timestamp": "2024-04-01T10:30:00Z"
        }
      ]
    }
  ]
}
```

**Result on Dashboard:**
- ⚠️ Integrity Alerts shows 3 items (limited to 5)
- Each item shows with flagged date
- Visual alert styling applied with red badges

---

## 🔄 Backend SQL/Query Examples

### Query to Get Dashboard Data with Nested Evidence & Custody

**PostgreSQL Example:**

```sql
SELECT
  c.id,
  c.case_number,
  c.title,
  c.description,
  c.status,
  c.fraud_type,
  c.investigator,
  c.assigned_to,
  c.priority,
  COUNT(DISTINCT e.id) as evidence_count,
  COUNT(DISTINCT cr.id) FILTER (WHERE cr.status = 'PENDING') as pending_transfers,
  c.created_at,
  c.updated_at,
  json_agg(
    json_build_object(
      'id', e.id,
      'name', e.name,
      'description', e.description,
      'type', e.type,
      'status', e.status,
      'hashStatus', e.hash_status,
      'initialHash', e.initial_hash,
      'currentHash', e.current_hash,
      'flaggedDate', e.flagged_date,
      'createdAt', e.created_at
    )
  ) FILTER (WHERE e.id IS NOT NULL) as evidence,
  json_agg(
    json_build_object(
      'id', cr.id,
      'evidenceId', cr.evidence_id,
      'action', cr.action,
      'officer', cr.officer_name,
      'description', cr.description,
      'location', cr.location,
      'timestamp', cr.timestamp,
      'seals', cr.evidence_seals
    ) ORDER BY cr.timestamp DESC
  ) FILTER (WHERE cr.id IS NOT NULL) as custody_records
FROM cases c
LEFT JOIN evidence e ON c.id = e.case_id
LEFT JOIN custody_records cr ON e.id = cr.evidence_id
WHERE c.deleted_at IS NULL
GROUP BY c.id
ORDER BY c.updated_at DESC
LIMIT 50;
```

### Query to Get Only Tampered Evidence

```sql
SELECT DISTINCT
  c.case_number,
  e.id,
  e.name,
  e.hash_status,
  e.flagged_date,
  e.initial_hash,
  e.current_hash,
  c.id as case_id
FROM cases c
JOIN evidence e ON c.id = e.case_id
WHERE e.hash_status = 'TAMPERED'
AND c.deleted_at IS NULL
AND e.deleted_at IS NULL
ORDER BY e.flagged_date DESC
LIMIT 5;
```

### Query to Get Recent Custody Activity

```sql
SELECT
  cr.id,
  cr.evidence_id,
  e.name as evidence_name,
  c.id as case_id,
  c.case_number,
  cr.action,
  cr.officer_name,
  cr.description,
  cr.timestamp
FROM custody_records cr
JOIN evidence e ON cr.evidence_id = e.id
JOIN cases c ON e.case_id = c.id
WHERE cr.deleted_at IS NULL
ORDER BY cr.timestamp DESC
LIMIT 10;
```

---

## 📊 Data Transformation in Frontend

### How Dashboard Processes API Response

```javascript
// Raw API response arrives
const cases = [
  { id: '...', evidenceCount: 5, status: 'ACTIVE', evidence: [...] },
  { id: '...', evidenceCount: 3, status: 'PENDING', evidence: [...] }
]

// Calculate stat 1: Active Cases
const activeCases = cases.filter(c => c.status === 'ACTIVE').length
// Result: 1

// Calculate stat 2: Evidence Logged
const totalEvidence = cases.reduce((sum, c) => sum + (c.evidenceCount || 0), 0)
// Result: 8

// Calculate stat 3: Pending Transfers
const pendingTransfers = cases.reduce((sum, c) => sum + (c.pendingTransfers || 0), 0)
// Result: 3 (if included in API)

// Calculate stat 4: Referred to Prosecution
const prosecutionReferrals = cases.filter(c => c.status === 'REFERRED').length
// Result: 0

// Extract tampered evidence
const tamperedEvidence = cases
  .flatMap(c =>
    (c.evidence || [])
      .filter(e => e.hashStatus === 'TAMPERED')
      .map(e => ({
        ...e,
        caseId: c.id,
        caseNo: c.caseNumber
      }))
  )
  .slice(0, 5)
// Result: [{ id: '...', name: 'SIM Card', caseNo: 'CASE-001' }]

// Get recent activity (last 10 sorted by newest)
const recentActivity = cases
  .flatMap(c =>
    (c.custodyRecords || []).map(record => ({
      ...record,
      caseId: c.id,
      caseNo: c.caseNumber
    }))
  )
  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  .slice(0, 10)
// Result: [{ officer: '...', action: 'TRANSFERRED', timestamp: '...' }]
```

---

## ✅ Backend Checklist

Ensure your backend implements:

- [ ] **Cases Endpoint** (`GET /cases`)
  - [ ] Returns array of case objects
  - [ ] Includes all required fields (id, caseNumber, status, fraudType, etc.)
  - [ ] Supports limits/pagination
  - [ ] Returns HTTP 200 on success

- [ ] **Evidence Nesting** (Optional but recommended)
  - [ ] Includes evidence array in each case
  - [ ] Evidence includes hashStatus field
  - [ ] Tampered evidence includes flaggedDate
  - [ ] Evidence includes initialHash and currentHash

- [ ] **Custody Records Nesting** (Optional but recommended)
  - [ ] Includes custodyRecords array in each case
  - [ ] Custody records include officer, action, timestamp
  - [ ] Records sorted by timestamp descending
  - [ ] Includes all required fields

- [ ] **Status Codes**
  - [ ] 200: Success
  - [ ] 400: Bad request
  - [ ] 401: Unauthorized
  - [ ] 500: Server error

- [ ] **Error Handling**
  - [ ] Return meaningful error messages
  - [ ] Don't crash on missing fields
  - [ ] Handle empty results gracefully

- [ ] **Performance**
  - [ ] Limit results (recommend first 50 cases)
  - [ ] Use pagination if needed
  - [ ] Consider ETag/cache headers
  - [ ] Optimize queries (use indexes)

---

## 🧪 Test Data for Development

```json
{
  "success": true,
  "data": [
    {
      "id": "test-uuid-001",
      "caseNumber": "CASE-2024-001",
      "title": "Test Case 1",
      "status": "ACTIVE",
      "fraudType": "SIM_SWAP",
      "investigator": "Test Officer",
      "assignedTo": "Test Detective",
      "evidenceCount": 5,
      "pendingTransfers": 2,
      "createdAt": "2024-04-01T00:00:00Z",
      "updatedAt": "2024-04-11T00:00:00Z",
      "evidence": [
        {
          "id": "test-evid-001",
          "name": "Test Device",
          "hashStatus": "TAMPERED",
          "flaggedDate": "2024-04-11T00:00:00Z"
        }
      ],
      "custodyRecords": [
        {
          "id": "test-cust-001",
          "evidenceId": "test-evid-001",
          "action": "TRANSFERRED",
          "officer": "Test Officer",
          "description": "Test transfer",
          "timestamp": "2024-04-11T00:00:00Z"
        }
      ]
    }
  ]
}
```

---

**Last Updated:** 2026-04-11
**Version:** 1.0
