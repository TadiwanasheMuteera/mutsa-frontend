# API Endpoints Reference

This document outlines all the API endpoints your frontend expects from the Flask backend.

## Backend URL
```
Base URL: http://172.16.10.71:5000
Authorization: Bearer <JWT_TOKEN>
```

---

## 🔐 Authentication Endpoints

### POST `/auth/login`
Login user and get JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

### POST `/auth/register`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:** Same as login

### POST `/auth/logout`
Logout current user.

**Auth:** Required ✅

### GET `/auth/me`
Get current authenticated user.

**Auth:** Required ✅

**Response:**
```json
{
  "id": "user-id",
  "name": "John Doe",
  "email": "user@example.com"
}
```

### POST `/auth/refresh`
Refresh JWT token.

**Auth:** Required ✅

**Response:**
```json
{
  "token": "new_jwt_token"
}
```

---

## 📋 Case Endpoints

### GET `/cases`
Get all cases.

**Auth:** Required ✅

**Response:**
```json
[
  {
    "id": "case-uuid",
    "title": "Digital Fraud Investigation",
    "description": "Case description",
    "status": "ACTIVE",
    "investigator": "Officer Name",
    "priority": "High",
    "referenceNumber": "CASE-2024-001",
    "evidenceCount": 5,
    "createdAt": "2024-04-10T10:30:00Z",
    "custodyRecords": []
  }
]
```

### POST `/cases`
Create a new case.

**Auth:** Required ✅

**Request:**
```json
{
  "title": "Case Title",
  "description": "Detailed description",
  "investigator": "Officer Name",
  "priority": "High",
  "status": "ACTIVE",
  "referenceNumber": "CASE-001"
}
```

**Response:** Same case object returned

### GET `/cases/{caseId}`
Get case by ID.

**Auth:** Required ✅

### PUT `/cases/{caseId}`
Update case.

**Auth:** Required ✅

### DELETE `/cases/{caseId}`
Delete case.

**Auth:** Required ✅

### GET `/cases/{caseId}/statistics`
Get case statistics.

**Auth:** Required ✅

**Response:**
```json
{
  "totalEvidence": 5,
  "pendingEvidence": 2,
  "pendingCustodyRecords": 1
}
```

---

## 📦 Evidence Endpoints

### GET `/cases/{caseId}/evidence`
Get all evidence for a case.

**Auth:** Required ✅

**Response:**
```json
[
  {
    "id": "evidence-uuid",
    "name": "Laptop Hard Drive",
    "description": "Dell laptop primary drive",
    "type": "Device",
    "caseId": "case-uuid",
    "status": "ACTIVE",
    "initialHash": "5d41402abc4b2a76b9719d911017c592",
    "collectedBy": "Officer Name",
    "createdAt": "2024-04-10T10:30:00Z"
  }
]
```

### POST `/cases/{caseId}/evidence`
Register new evidence for a case.

**Auth:** Required ✅

**Request:**
```json
{
  "name": "Laptop Hard Drive",
  "description": "Dell laptop primary drive",
  "type": "Device",
  "initialHash": "5d41402abc4b2a76b9719d911017c592",
  "collectedBy": "Officer Name",
  "status": "ACTIVE"
}
```

### GET `/evidence/{evidenceId}`
Get evidence by ID.

**Auth:** Required ✅

### PUT `/evidence/{evidenceId}`
Update evidence.

**Auth:** Required ✅

### DELETE `/evidence/{evidenceId}`
Delete evidence.

**Auth:** Required ✅

### POST `/evidence/{evidenceId}/upload`
Upload file for evidence.

**Auth:** Required ✅

**Request:** multipart/form-data with `file` field

### GET `/evidence/{evidenceId}/custody`
Get custody records for evidence.

**Auth:** Required ✅

---

## 🔗 Custody/Chain of Custody Endpoints

### GET `/evidence/{evidenceId}/custody`
Get custody records for evidence.

**Auth:** Required ✅

**Response:**
```json
[
  {
    "id": "custody-uuid",
    "evidenceId": "evidence-uuid",
    "evidenceName": "Laptop Hard Drive",
    "action": "COLLECTED",
    "officer": "Officer Name",
    "timestamp": "2024-04-10T10:30:00Z",
    "status": "ACTIVE",
    "description": "Evidence collected from scene"
  }
]
```

### POST `/evidence/{evidenceId}/custody`
Add custody record.

**Auth:** Required ✅

**Request:**
```json
{
  "action": "TRANSFER",
  "officer": "Officer Name",
  "description": "Transferred to evidence room",
  "timestamp": "2024-04-10T11:00:00Z"
}
```

### PUT `/custody/{custodyId}`
Update custody record.

**Auth:** Required ✅

### DELETE `/custody/{custodyId}`
Delete custody record.

**Auth:** Required ✅

### GET `/evidence/{evidenceId}/custody/timeline`
Get custody timeline.

**Auth:** Required ✅

### POST `/evidence/{evidenceId}/verify-hash`
Verify hash integrity.

**Auth:** Required ✅

**Request:**
```json
{
  "hash": "5d41402abc4b2a76b9719d911017c592"
}
```

**Response:**
```json
{
  "status": "INTACT",
  "message": "Hash matches original",
  "originalHash": "5d41402abc4b2a76b9719d911017c592",
  "verifiedHash": "5d41402abc4b2a76b9719d911017c592"
}
```

Or if tampered:
```json
{
  "status": "TAMPERED",
  "message": "Hash mismatch detected - evidence may be compromised",
  "originalHash": "5d41402abc4b2a76b9719d911017c592",
  "verifiedHash": "different_hash_here"
}
```

---

## 📊 Status Values

### Case Status
- `PENDING` - Case not yet started
- `ACTIVE` - Case is active
- `INACTIVE` - Case is inactive
- `ARCHIVED` - Case is archived

### Evidence Status
- `ACTIVE` - Active evidence
- `PENDING` - Pending processing
- `ARCHIVED` - Archived

### Custody Status
- `ACTIVE` - Active custody record
- `INACTIVE` - Inactive

### Hash Status
- `INTACT` - Hash matches original
- `TAMPERED` - Hash does not match
- `ERROR` - Verification error

---

## 🔄 Error Responses

All endpoints return errors in this format:

**400 Bad Request:**
```json
{
  "message": "Validation error details",
  "errors": {
    "field": "error message"
  }
}
```

**401 Unauthorized:**
```json
{
  "message": "Unauthorized - invalid or missing token"
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found"
}
```

**500 Server Error:**
```json
{
  "message": "Internal server error"
}
```

---

## 🧪 Testing

### Demo Login
- Email: `demo@forensics.com`
- Password: `password123`

---

## 📋 Notes for Backend Integration

1. All timestamps should be ISO 8601 format (e.g., `2024-04-10T10:30:00Z`)
2. All IDs should be UUIDs
3. JWT tokens should be returned in `Authorization: Bearer <token>` format
4. All endpoints require JWT token in Authorization header (except `/auth/login`)
5. 401 responses trigger automatic logout and redirect to login
6. Use consistent HTTP status codes (200 OK, 201 Created, 400 Bad Request, etc.)
7. All date fields should be returned in ISO 8601 format

---

**Last Updated:** 2024-04-11
**Frontend Version:** 1.0.0


