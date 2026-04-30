# Dashboard Data Structure Guide

## Overview
The DashboardPage component requires specific data fields from the API. This guide shows the expected structure.

## Cases API Response Expected Structure

### GET `/cases` Response

```json
{
  "cases": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "caseNumber": "CASE-2024-001",
      "title": "Digital Fraud Investigation",
      "description": "SIM swap fraud case",
      "status": "ACTIVE",
      "fraudType": "SIM_SWAP",
      "investigator": "Officer John Doe",
      "assignedTo": "Detective Jane Smith",
      "priority": "HIGH",
      "evidenceCount": 5,
      "pendingTransfers": 2,
      "createdAt": "2024-04-01T10:30:00Z",
      "updatedAt": "2024-04-11T14:25:00Z",
      "evidence": [
        {
          "id": "e1d2c3b4-a5f6-47c8-9d0e-1f2a3b4c5d6e",
          "name": "Laptop Hard Drive",
          "description": "Suspect's primary storage device",
          "status": "ACTIVE",
          "hashStatus": "INTACT",
          "type": "Device"
        },
        {
          "id": "f2e3d4c5-b6f7-48d9-ae1f-2g3a4b5c6d7e",
          "name": "Mobile Phone SIM",
          "description": "Cloned SIM card",
          "status": "ACTIVE",
          "hashStatus": "TAMPERED",
          "type": "Evidence",
          "flaggedDate": "2024-04-11T09:15:00Z"
        }
      ],
      "custodyRecords": [
        {
          "id": "c1b2a3d4-e5f6-47c8-9d0e-1f2a3b4c5d6e",
          "evidenceId": "e1d2c3b4-a5f6-47c8-9d0e-1f2a3b4c5d6e",
          "action": "COLLECTED",
          "officer": "Officer John Doe",
          "description": "Evidence collected from suspect's residence",
          "timestamp": "2024-04-01T10:30:00Z"
        },
        {
          "id": "d2c3b4e5-f6g7-48d9-ae1f-2g3a4b5c6d7e",
          "evidenceId": "e1d2c3b4-a5f6-47c8-9d0e-1f2a3b4c5d6e",
          "action": "TRANSFERRED",
          "officer": "Detective Jane Smith",
          "description": "Transferred to evidence room",
          "timestamp": "2024-04-02T14:00:00Z"
        }
      ]
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440111",
      "caseNumber": "CASE-2024-002",
      "title": "Business Email Compromise",
      "status": "PENDING",
      "fraudType": "BEC",
      "investigator": "Detective Bob Wilson",
      "assignedTo": "Officer Sarah Johnson",
      "evidenceCount": 3,
      "pendingTransfers": 1,
      "createdAt": "2024-04-05T09:00:00Z",
      "updatedAt": "2024-04-10T16:45:00Z",
      "evidence": [],
      "custodyRecords": []
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440222",
      "caseNumber": "CASE-2024-003",
      "title": "Insider Trading Investigation",
      "status": "REFERRED",
      "fraudType": "INSIDER_FRAUD",
      "investigator": "Detective Mike Chen",
      "assignedTo": "Lisa Anderson",
      "evidenceCount": 8,
      "pendingTransfers": 0,
      "createdAt": "2024-03-15T11:20:00Z",
      "updatedAt": "2024-04-08T10:00:00Z",
      "evidence": [],
      "custodyRecords": []
    }
  ]
}
```

## Field Definitions

### Case Object Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string (UUID) | Unique identifier | "550e8400-e29b-41d4-a716-446655440000" |
| caseNumber | string | Human-readable case number | "CASE-2024-001" |
| title | string | Case title | "Digital Fraud Investigation" |
| description | string | Case description | "SIM swap fraud case" |
| status | enum | Case status (ACTIVE, PENDING, REFERRED, CLOSED, ARCHIVED) | "ACTIVE" |
| fraudType | enum | Type of fraud | "SIM_SWAP", "BEC", "INSIDER_FRAUD", "PHISHING", "IDENTITY_THEFT", "MONEY_LAUNDERING", "CYBER_ATTACK" |
| investigator | string | Lead investigator name | "Officer John Doe" |
| assignedTo | string | Assigned officer/detective | "Detective Jane Smith" |
| priority | string | Case priority | "HIGH", "NORMAL", "LOW" |
| evidenceCount | number | Total evidence items | 5 |
| pendingTransfers | number | Number of pending custody transfers | 2 |
| createdAt | ISO 8601 | Case creation timestamp | "2024-04-01T10:30:00Z" |
| updatedAt | ISO 8601 | Last update timestamp | "2024-04-11T14:25:00Z" |
| evidence | array | Evidence items (optional, can be fetched separately) | See Evidence object |
| custodyRecords | array | Custody records (optional) | See Custody Record object |

### Evidence Object Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string (UUID) | Unique identifier | "e1d2c3b4-a5f6-47c8-9d0e-1f2a3b4c5d6e" |
| name | string | Evidence name | "Laptop Hard Drive" |
| description | string | Evidence description | "Suspect's primary storage device" |
| status | enum | Evidence status (ACTIVE, PENDING, ARCHIVED) | "ACTIVE" |
| hashStatus | enum | Hash integrity status (INTACT, TAMPERED) | "TAMPERED" |
| type | string | Evidence type | "Device", "File", "Evidence" |
| flaggedDate | ISO 8601 | Date tampered hash was detected | "2024-04-11T09:15:00Z" |

### Custody Record Object Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string (UUID) | Unique identifier | "c1b2a3d4-e5f6-47c8-9d0e-1f2a3b4c5d6e" |
| evidenceId | string (UUID) | References evidence ID | "e1d2c3b4-a5f6-47c8-9d0e-1f2a3b4c5d6e" |
| action | string | Custody action | "COLLECTED", "TRANSFERRED", "RELEASED", "STORED" |
| officer | string | Officer handling custody | "Officer John Doe" |
| description | string | Action description | "Evidence collected from suspect's residence" |
| timestamp | ISO 8601 | When action occurred | "2024-04-01T10:30:00Z" |

## Dashboard Calculations

### Stat Cards

1. **Active Cases**
   ```javascript
   cases.filter(c => c.status === 'ACTIVE').length
   ```

2. **Evidence Logged**
   ```javascript
   cases.reduce((sum, c) => sum + (c.evidenceCount || 0), 0)
   ```

3. **Pending Transfers**
   ```javascript
   cases.reduce((sum, c) => sum + (c.pendingTransfers || 0), 0)
   ```

4. **Referred to Prosecution**
   ```javascript
   cases.filter(c => c.status === 'REFERRED').length
   ```

### Chain Integrity Alerts

Evidence flagged as TAMPERED:
```javascript
cases
  .flatMap(c =>
    c.evidence.filter(e => e.hashStatus === 'TAMPERED').map(e => ({
      ...e,
      caseId: c.id,
      caseNo: c.caseNumber
    }))
  )
  .slice(0, 5)
```

### Recent Activity

Last 10 custody records sorted by timestamp (newest first):
```javascript
cases
  .flatMap(c =>
    c.custodyRecords.map(record => ({
      ...record,
      caseId: c.id,
      caseNo: c.caseNumber
    }))
  )
  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  .slice(0, 10)
```

## Fraud Type Badge Colors

| Fraud Type | Badge Color | Hex Color |
|------------|------------|-----------|
| SIM_SWAP | Red | #dc2626 |
| BEC | Orange | #ea580c |
| INSIDER_FRAUD | Purple | #7c3aed |
| PHISHING | Yellow | #ca8a04 |
| IDENTITY_THEFT | Pink | #ec4899 |
| MONEY_LAUNDERING | Indigo | #4f46e5 |
| CYBER_ATTACK | Cyan | #06b6d4 |

## Status Badge Colors

| Status | Badge Color |
|--------|------------|
| ACTIVE | Green (#16a34a) |
| PENDING | Yellow (#ca8a04) |
| REFERRED | Blue (#2563eb) |
| CLOSED | Red (#dc2626) |
| ARCHIVED | Gray (#6b7280) |

## Sample Response for Implementation

```javascript
// GET /cases response structure
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "caseNumber": "CASE-2024-001",
      "title": "Case Title",
      "status": "ACTIVE",
      "fraudType": "SIM_SWAP",
      "investigator": "Officer Name",
      "assignedTo": "Detective Name",
      "evidenceCount": 5,
      "pendingTransfers": 2,
      "createdAt": "2024-04-01T10:30:00Z",
      "updatedAt": "2024-04-11T14:25:00Z",
      "evidence": [
        {
          "id": "uuid-here",
          "name": "Evidence Name",
          "hashStatus": "TAMPERED", // Important for alerts
          "flaggedDate": "2024-04-11T09:15:00Z"
        }
      ],
      "custodyRecords": [
        {
          "id": "uuid-here",
          "evidenceId": "uuid-here",
          "action": "TRANSFERRED",
          "officer": "Officer Name",
          "description": "Transfer description",
          "timestamp": "2024-04-02T14:00:00Z"
        }
      ]
    }
  ],
  "count": 25,
  "page": 1,
  "totalPages": 5
}
```

## Implementation Notes

1. **Nested Data**: The dashboard expects `evidence` and `custodyRecords` to be included in the cases response
   - Alternative: Make separate API calls for each case's evidence and custody records
   - Current implementation assumes they're included for performance

2. **Optional Fields**: If any field is missing, the dashboard gracefully handles it:
   ```javascript
   caseItem.fraudType || 'Unknown'
   caseItem.assignedTo || caseItem.investigator || 'Unassigned'
   ```

3. **Timestamps**: All timestamps should be ISO 8601 format
   - `date-fns` library handles conversion automatically
   - `formatDistanceToNow()` for relative times (e.g., "2 hours ago")
   - `format()` for absolute times (e.g., "Apr 11, 2024")

4. **Empty States**: Dashboard handles:
   - No cases
   - No tampered evidence
   - No recent activity

5. **Performance Considerations**:
   - Loading skeletons show while data fetches
   - Limit to 8 cases in table, 5 alerts, 10 activity items
   - Use pagination if dataset grows

## Backend Implementation Checklist

- [ ] Cases endpoint includes `fraudType` field
- [ ] Cases endpoint includes `pendingTransfers` count
- [ ] Cases endpoint supports including nested `evidence` and `custodyRecords`
- [ ] Evidence objects include `hashStatus` field (INTACT or TAMPERED)
- [ ] Evidence includes `flaggedDate` when TAMPERED
- [ ] Custody records include all required fields
- [ ] All timestamps in ISO 8601 format
- [ ] Status field supports: ACTIVE, PENDING, REFERRED, CLOSED, ARCHIVED
