# COC Tracker (Chain of Custody Tracker) - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Security Features](#security-features)
5. [Data Flow](#data-flow)
6. [Key Components](#key-components)
7. [Backend API Integration](#backend-api-integration)
8. [Cybersecurity & Data Protection](#cybersecurity--data-protection)

---

## 🎯 Project Overview

**COC Tracker** is a forensic evidence management system designed to maintain the chain of custody for digital and physical evidence in criminal investigations. It provides:

- **Evidence Management**: Track all evidence items with complete metadata
- **Chain of Custody**: Record every transfer, status change, and interaction with evidence
- **Case Management**: Organize evidence within criminal cases
- **Hash Verification**: Ensure digital evidence integrity using SHA-256 hashing
- **Custody Records**: Maintain audit trails for compliance and legal requirements
- **User Authentication**: Secure access with JWT tokens

### Key Features
- 🔐 **Secure Authentication** - JWT-based token system with refresh tokens
- 📊 **Real-time Dashboard** - Live statistics and activity feeds
- 🔍 **Evidence Tracking** - Complete lifecycle management
- 🔗 **Custody Chain** - Immutable audit trails
- ✅ **Hash Verification** - Digital evidence integrity checks
- 📋 **Case Management** - Organize evidence by case
- 🔐 **Role-based Access** - User permissions and authentication

---

## 🏗️ Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                       │
│              (React SPA - Chain of Custody UI)              │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/REST API Calls
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  API GATEWAY / CORS HANDLER                 │
│         (Handles preflight requests, auth headers)          │
└──────────────────────┬──────────────────────────────────────┘
                       │ JWT Token Validation
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   BACKEND API SERVER                        │
│                    (Flask/Python)                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Authentication Service                             │  │
│  │  - User login/logout                                │  │
│  │  - Token generation (access + refresh)              │  │
│  │  - Session management                               │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Case Management Service                            │  │
│  │  - Create/read/update cases                         │  │
│  │  - Fraud type classification                        │  │
│  │  - Case status tracking                             │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Evidence Management Service                        │  │
│  │  - Upload/store evidence files                      │  │
│  │  - Calculate SHA-256 hashes                         │  │
│  │  - Link evidence to cases                           │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Custody Chain Service                              │  │
│  │  - Record transfers between users                   │  │
│  │  - Track status changes                             │  │
│  │  - Generate audit trails                            │  │
│  │  - Maintain immutable logs                          │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Hash Verification Service                          │  │
│  │  - Verify file integrity                            │  │
│  │  - Compare computed vs stored hashes                │  │
│  │  - Detect tampering/modification                    │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL Queries
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   DATABASE LAYER                           │
│                  (PostgreSQL/MySQL)                        │
│                                                             │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Users Table                                      │    │
│  │ - user_id, name, email, password_hash, role     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                             │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Cases Table                                      │    │
│  │ - case_id, case_number, title, status           │    │
│  │ - fraud_type, description, created_at           │    │
│  └──────────────────────────────────────────────────┘    │
│                                                             │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Evidence Table                                   │    │
│  │ - evidence_id, case_id, description, type       │    │
│  │ - file_name, file_hash, status, collected_by    │    │
│  │ - collection_date, collection_location          │    │
│  └──────────────────────────────────────────────────┘    │
│                                                             │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Custody Records Table                            │    │
│  │ - record_id, evidence_id, action, user_id        │    │
│  │ - timestamp, location, reason, notes             │    │
│  │ - transferred_from, transferred_to               │    │
│  └──────────────────────────────────────────────────┘    │
│                                                             │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Hash Verification Table                          │    │
│  │ - verification_id, evidence_id, original_hash    │    │
│  │ - computed_hash, match, verified_at, verified_by│    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   FILE STORAGE LAYER                        │
│         (Local filesystem or cloud storage)                 │
│                                                             │
│  Evidence files with metadata and access logs              │
└──────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
src/
├── pages/
│   ├── LoginPage.jsx                 # Authentication
│   ├── DashboardPage.jsx             # Main dashboard with stats
│   ├── CasesPage.jsx                 # Case list
│   ├── CaseDetailPage.jsx            # Individual case details
│   ├── NewCasePage.jsx               # Create new case
│   ├── EvidencePage.jsx              # Evidence list
│   ├── EvidenceDetailPage.jsx        # Individual evidence details
│   ├── NewEvidencePage.jsx           # Upload new evidence
│   ├── CustodyPage.jsx               # Custody records
│   └── HashVerifyPage.jsx            # Hash verification
│
├── components/
│   ├── layout/
│   │   └── Layout.jsx                # Main layout wrapper
│   ├── ui/
│   │   ├── StatCard.jsx              # Dashboard stat cards
│   │   ├── Badge.jsx                 # Status badges
│   │   ├── Spinner.jsx               # Loading indicator
│   │   └── HashBadge.jsx             # Hash verification indicator
│   └── ...
│
├── api/
│   ├── axios.js                      # Axios configuration with interceptors
│   ├── auth.js                       # Authentication API
│   ├── cases.js                      # Cases API
│   ├── evidence.js                   # Evidence API
│   └── custody.js                    # Custody records API
│
├── store/
│   ├── authStore.js                  # Zustand auth state
│   ├── useAuthInit.js                # Auth initialization hook
│   └── navigation.js                 # Router navigation context
│
├── App.jsx                           # Main app with routing
└── index.css                         # Global styles (Tailwind)
```

---

## 💻 Technology Stack

### Frontend
- **React 18.3**: UI framework with hooks
- **Vite 5.2**: Fast build tool and dev server
- **React Router 6.24**: Client-side routing
- **@tanstack/react-query 5.45**: Server state management & caching
- **Zustand 4.5**: Client state management (auth)
- **React Hook Form 7.52**: Form handling
- **Axios 1.7**: HTTP client
- **date-fns 3.6**: Date formatting and manipulation
- **Tailwind CSS 3.4**: Utility-first CSS framework
- **Lucide React**: Icon library

### Backend (Flask)
- **Flask**: Python web framework
- **SQLAlchemy**: ORM for database access
- **PyJWT**: JWT token generation/validation
- **Werkzeug**: Password hashing (bcrypt)
- **Python hashlib**: SHA-256 hashing

### Database
- **PostgreSQL** or **MySQL**: Relational database
- Stores users, cases, evidence, custody records, hash verifications

### Infrastructure
- **CORS Middleware**: Handles cross-origin requests
- **HTTPS**: Encrypted communication
- **JWT Tokens**: Stateless authentication

---

## 🔐 Security Features

### 1. **Authentication & Authorization**

#### JWT Token-Based Authentication
```
Login Flow:
1. User submits credentials (email + password)
2. Backend validates credentials
3. Backend generates:
   - access_token (short-lived, ~15 min)
   - refresh_token (long-lived, ~7 days)
4. Frontend stores tokens in localStorage
5. Subsequent requests include: Authorization: Bearer {access_token}

Token Refresh Flow:
1. Access token expires (401 response)
2. Frontend uses refresh_token to get new access_token
3. If refresh_token invalid, user logged out
```

#### Password Security
- **Bcrypt hashing**: Passwords never stored in plain text
- **Salt rounds**: 10+ rounds to prevent brute force
- **Never transmitted in plain**: Always HTTPS

### 2. **API Security**

#### CORS (Cross-Origin Resource Sharing)
```
Allowed Origins: http://localhost:3000 (dev), production domain
Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
Allowed Headers: Content-Type, Authorization
Credentials: Included in cross-origin requests
```

#### JWT Validation
```
Every API request (except /auth/login):
1. Check Authorization header for "Bearer {token}"
2. Verify JWT signature using secret key
3. Check token expiration
4. Extract user_id from token claims
5. Continue if valid, return 401 if invalid
```

#### Request/Response Headers
```
Secure Headers:
- Strict-Transport-Security: Enforce HTTPS
- X-Content-Type-Options: Prevent MIME type sniffing
- X-Frame-Options: Prevent clickjacking
- Content-Security-Policy: XSS protection
```

### 3. **Data Integrity - Chain of Custody**

#### Immutable Audit Trail
```
Every custody record is immutable:
- No updates after creation (only new records)
- Timestamp is server-generated (can't be spoofed)
- User_id is extracted from JWT token (can't be forged)
- Action logs: CREATE, TRANSFER, STATUS_CHANGE, RELEASE, DESTROY
- Complete history prevents tampering
```

#### Hash Verification
```
Evidence File Integrity:
1. When evidence uploaded: Calculate SHA-256 hash
2. Hash stored in database with evidence record
3. Later, user can upload same file and verify:
   - Frontend calculates SHA-256 (using Web Crypto API)
   - Compares with stored hash
   - Reports match/mismatch
4. Mismatch = Evidence was modified/tampered
```

### 4. **Database Security**

#### Access Control
- **User roles**: investigator, supervisor, admin
- **Role-based queries**: Users only see cases assigned to them
- **Row-level security**: Can't access others' evidence/cases

#### Data Encryption
- **Passwords**: Bcrypt hashed (one-way)
- **Sensitive data**: Can be encrypted at rest (additional layer)
- **TLS/HTTPS**: In-transit encryption

#### SQL Injection Prevention
- **Parameterized queries**: SQLAlchemy ORM prevents SQL injection
- **Input validation**: All inputs sanitized on backend

### 5. **File Storage Security**

#### Evidence File Protection
```
Storage Strategy:
1. Files NOT stored in database (too large, inefficient)
2. Files stored on secure filesystem/cloud storage
3. File path/name encrypted or randomized
4. Access only through authenticated API endpoints
5. Files served with:
   - Content-Disposition: attachment (prevent inline viewing)
   - Content-Type: application/octet-stream
   - Auth header verification
```

#### File Upload Validation
```
Security Checks:
- File size limits (prevent DoS)
- File type validation (extension + MIME type)
- Virus scanning (optional, can integrate)
- Rename uploaded files (prevent path traversal)
```

---

## 🔄 Data Flow

### Creating a Case

```
1. User fills form (title, description, fraud type)
   ↓
2. Frontend sends: POST /api/cases
   Headers: Authorization: Bearer {access_token}
   Body: { title, description, fraud_type, ... }
   ↓
3. Backend receives request
   - Verifies JWT token
   - Extracts user_id from token
   - Validates input data
   - Creates case in database
   ↓
4. Backend returns: 
   { success: true, data: { case_id, case_number, ... } }
   ↓
5. Frontend updates React Query cache
   - Invalidates ['cases'] query
   - Refetches cases list
   - User sees new case immediately
   ↓
6. Case appears in:
   - Dashboard (Active Cases count updates)
   - Cases page (new row in table)
```

### Uploading Evidence

```
1. User selects case and uploads file
   ↓
2. Frontend:
   - Calculates SHA-256 hash (Web Crypto API)
   - Creates FormData with file + metadata
   ↓
3. Frontend sends: POST /api/evidence/cases/{caseId}/evidence
   Headers: Authorization: Bearer {access_token}
   Body: FormData (file, description, collected_by, collection_date, ...)
   ↓
4. Backend receives request
   - Verifies JWT token
   - Validates case exists and user has access
   - Saves file to storage
   - Calculates server-side hash (verify client didn't tamper)
   - Creates evidence record in database
   - Stores both hashes
   ↓
5. Backend returns:
   { success: true, data: { evidence_id, hash, status: "STORED" } }
   ↓
6. Frontend displays:
   - Evidence on Evidence page
   - Evidence count in Dashboard updates
   - File hash displayed for verification
```

### Transferring Evidence (Custody Transfer)

```
1. User initiates transfer (evidence page or detail page)
   ↓
2. User selects:
   - Evidence item to transfer
   - Recipient user
   - Reason (investigation, testing, release, etc.)
   - Location
   ↓
3. Frontend sends: POST /api/custody/evidence/{evidenceId}/transfer
   Body: { transferred_to_user_id, reason, location, notes }
   ↓
4. Backend receives request
   - Verifies user has evidence
   - Creates custody record:
     {
       evidence_id: evidenceId,
       transferred_from_user_id: {extracted from token},
       transferred_to_user_id: {from body},
       reason: {from body},
       location: {from body},
       timestamp: server_now(),  // Can't be spoofed
       status: "TRANSFERRED"
     }
   - Updates evidence status
   ↓
5. Custody record stored in DB (IMMUTABLE - no updates)
   ↓
6. Audit trail shows complete history:
   - Who had it
   - When
   - Who transferred to
   - Why
   - Can prove chain of custody in court
```

### Verifying Hash Integrity

```
1. User navigates to hash verify page with evidence
   ↓
2. Frontend displays:
   - Original hash (from database)
   - Upload area for same file
   ↓
3. User re-uploads file
   ↓
4. Frontend:
   - Reads file from input
   - Calculates SHA-256 hash (Web Crypto API)
   - Sends: POST /api/evidence/evidence/{evidenceId}/verify-hash
   ↓
5. Backend:
   - Receives file
   - Calculates SHA-256
   - Compares with stored hash
   - Returns: { match: true/false, original_hash, computed_hash }
   ↓
6. Frontend displays result:
   - Green checkmark: ✅ MATCH (evidence integrity verified)
   - Red X: ❌ MISMATCH (evidence was modified/tampered)
   ↓
7. Creates verification record in database (audit trail)
```

---

## 🧩 Key Components

### Frontend Components

#### `DashboardPage.jsx`
- **Purpose**: Main dashboard with statistics and recent activity
- **Data Loaded**:
  - All cases (with evidence counts)
  - Active cases count
  - Total evidence items
  - Pending transfers (if applicable)
  - Custody records for activity feed
  - Tampered evidence alerts
- **API Calls**: Parallel fetching of cases + evidence

#### `CasesPage.jsx`
- **Purpose**: List all cases with sorting/filtering
- **Data**: All cases with status, fraud type, assigned officer
- **Interactions**: Click to view details, create new case

#### `EvidencePage.jsx`
- **Purpose**: Browse evidence items
- **Data**: All evidence across all cases
- **Filtering**: By case (if caseId in URL params)
- **Actions**: View details, verify hash, download

#### `CustodyPage.jsx`
- **Purpose**: View complete chain of custody logs
- **Data**: All custody transfers/status changes across all evidence
- **Information**: Who transferred, when, why, to whom
- **Use**: Compliance, audit trails, court evidence

#### `HashVerifyPage.jsx`
- **Purpose**: Verify digital evidence hasn't been tampered
- **Process**:
  1. Show original hash from database
  2. User uploads same file
  3. Calculate hash on client
  4. Send to backend for verification
  5. Display match/mismatch result

### Backend Services

#### Authentication Service
```
Endpoints:
- POST /auth/login → Generate tokens
- POST /auth/refresh → Refresh access token
- POST /auth/logout → Invalidate tokens

Token Claims (JWT payload):
{
  "user_id": "uuid",
  "email": "officer@police.gov",
  "role": "investigator",
  "exp": 1234567890  // Expiration timestamp
}
```

#### Cases Service
```
Endpoints:
- GET /cases → List all cases
- POST /cases → Create case
- GET /cases/{caseId} → View case details
- PUT /cases/{caseId} → Update case
- DELETE /cases/{caseId} → Delete case

Case Fields:
- case_id, case_number, title, description
- fraud_type, status, created_by, created_at
- suspect_info, investigator, assigned_to
```

#### Evidence Service
```
Endpoints:
- POST /evidence/cases/{caseId}/evidence → Upload evidence
- GET /evidence/cases/{caseId}/evidence → List evidence for case
- GET /evidence/evidence/{evidenceId} → View evidence details
- POST /evidence/evidence/{evidenceId}/verify-hash → Verify hash
- GET /evidence/evidence/{evidenceId}/chain → View chain of custody

Evidence Fields:
- evidence_id, case_id, description, type
- file_name, file_hash, file_size, file_path
- collected_by, collection_date, collection_location
- status, created_at, updated_at
```

#### Custody Service
```
Endpoints:
- POST /custody/evidence/{evidenceId}/transfer → Transfer evidence
- GET /custody/custody-log/{evidenceId} → Get custody history
- PUT /custody/evidence/{evidenceId}/status → Change status
- GET /custody/evidence/{evidenceId}/status-history → Status timeline
- POST /custody/evidence/{evidenceId}/release → Release evidence
- POST /custody/evidence/{evidenceId}/destroy → Destroy evidence

Status Values:
- STORED, TRANSFERRED, TESTING, RELEASED, DESTROYED, ARCHIVED
```

---

## 📡 Backend API Integration

### Frontend API Clients

#### `api/axios.js`
- **Axios configuration** with base URL
- **Request interceptor**: Adds JWT token to headers
- **Response interceptor**: Handles 401 errors, refreshes token
- **CORS handling**: Credentials included

```javascript
// Request Interceptor
Authorization: `Bearer ${accessToken}`

// Response Interceptor - Error Handling
if (401 Unauthorized):
  - Try to refresh token
  - Retry original request
  - If refresh fails, logout user
```

#### `api/cases.js`
```javascript
casesAPI.getCases()            // GET /api/cases
casesAPI.getCaseById(id)       // GET /api/cases/{id}
casesAPI.createCase(data)      // POST /api/cases
casesAPI.updateCase(id, data)  // PUT /api/cases/{id}
casesAPI.deleteCase(id)        // DELETE /api/cases/{id}
```

#### `api/evidence.js`
```javascript
evidenceAPI.getEvidenceByCaseId(caseId)     // GET /api/evidence/cases/{caseId}/evidence
evidenceAPI.getEvidenceById(evidenceId)     // GET /api/evidence/evidence/{evidenceId}
evidenceAPI.createEvidence(caseId, data)    // POST /api/evidence/cases/{caseId}/evidence
evidenceAPI.uploadFile(caseId, file)        // POST /api/evidence/cases/{caseId}/upload
evidenceAPI.verifyHash(evidenceId, file)    // POST /api/evidence/evidence/{evidenceId}/verify-hash
evidenceAPI.getEvidenceChain(evidenceId)    // GET /api/evidence/evidence/{evidenceId}/chain
```

#### `api/custody.js`
```javascript
custodyAPI.getCustodyLog(evidenceId)        // GET /api/custody/custody-log/{evidenceId}
custodyAPI.transferEvidence(id, data)       // POST /api/custody/evidence/{id}/transfer
custodyAPI.updateEvidenceStatus(id, data)   // PUT /api/custody/evidence/{id}/status
custodyAPI.releaseEvidence(id, data)        // POST /api/custody/evidence/{id}/release
custodyAPI.destroyEvidence(id, data)        // POST /api/custody/evidence/{id}/destroy
```

### State Management

#### Zustand Auth Store
```javascript
// Stores:
- isAuthenticated
- accessToken
- refreshToken
- user (id, email, role, name)

// Methods:
- login(email, password)
- logout()
- setAccessToken(token)
- setRefreshToken(token)
```

#### React Query
```javascript
// Caching & Server State:
- Query keys: ['cases'], ['evidence', caseId], ['custody-records']
- Automatic refetching on mount
- Stale time: 5 minutes (data considered fresh for 5 min)
- Cache time: 10 minutes (data retained for 10 min)
- Automatic retries on failure
```

---

## 🛡️ Cybersecurity & Data Protection

### Threat Model & Mitigations

#### 1. **Unauthorized Access**
**Threat**: Attacker tries to access evidence without authorization
**Mitigation**:
- JWT token validation on every request
- User can't access cases/evidence not assigned to them
- Role-based access control (investigator vs admin)
- Session timeout on inactivity

#### 2. **Evidence Tampering**
**Threat**: Attacker modifies evidence file after upload
**Mitigation**:
- SHA-256 hash comparison
- Hash verification endpoint
- Immutable custody records (no update allowed)
- All changes logged in audit trail

#### 3. **Token Theft**
**Threat**: Attacker steals JWT token from localStorage
**Mitigation**:
- Short-lived access tokens (15 min expiry)
- Refresh tokens stored securely
- HTTPS only (prevents man-in-the-middle)
- Token stored in httpOnly cookie (optional, more secure)
- Clear tokens on logout

#### 4. **SQL Injection**
**Threat**: Attacker sends malicious SQL in user input
**Mitigation**:
- SQLAlchemy ORM (parameterized queries)
- Input validation on backend
- No string concatenation in SQL

#### 5. **CORS/CSRF Attacks**
**Threat**: Malicious website tries to make requests to API
**Mitigation**:
- CORS policy restricts to specific origins
- SameSite cookie attribute
- CSRF token validation (if using cookies)

#### 6. **Man-in-the-Middle**
**Threat**: Attacker intercepts traffic between client and server
**Mitigation**:
- HTTPS/TLS encryption (all traffic encrypted)
- Certificate validation
- HSTS header (force HTTPS)

#### 7. **Denial of Service (DoS)**
**Threat**: Attacker floods API with requests
**Mitigation**:
- Rate limiting on backend
- File upload size limits
- Request size limits
- Timeout policies

### Compliance & Audit Requirements

#### Chain of Custody Compliance
```
Legal Requirements Met:
✅ Complete evidence history maintained
✅ Custodian identity verified (JWT user_id)
✅ Timestamps immutable (server-generated)
✅ No gaps in custody (audit trail complete)
✅ Reason for each transfer recorded
✅ Location information preserved
✅ Digital signatures (JWT proves authenticity)
```

#### Audit Trail Features
```
Every custody record includes:
- Timestamp (when action occurred)
- User ID (who performed action)
- Evidence ID (which evidence)
- Action type (transfer, status change, etc.)
- Reason (why action taken)
- Location (where evidence is)
- Previous status (before change)
- New status (after change)

Records are:
- Immutable (no deletion/modification)
- Time-ordered (chronological audit)
- Queryable (generate reports)
- Cryptographically verifiable (optional)
```

---

## 📊 Data Models

### User Model
```json
{
  "id": "uuid",
  "email": "officer@police.gov",
  "name": "Officer Name",
  "password_hash": "bcrypt_hash",
  "role": "investigator",
  "department": "Cyber Crimes Unit",
  "created_at": "2024-01-15T10:00:00Z",
  "last_login": "2024-04-12T11:00:00Z"
}
```

### Case Model
```json
{
  "id": "uuid",
  "case_number": "CASE-2024-001",
  "title": "SIM Swap Fraud Investigation",
  "description": "Investigation into coordinated SIM swap incidents",
  "fraud_type": "SIM_SWAP",
  "status": "ACTIVE",
  "created_by": "officer-uuid",
  "investigator": "officer-uuid",
  "assigned_to": "officer-uuid",
  "suspect_info": "Jane Doe, DOB: 1995-03-15",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-04-12T11:00:00Z"
}
```

### Evidence Model
```json
{
  "id": "uuid",
  "case_id": "case-uuid",
  "description": "Email screenshot from compromised account",
  "type": "Screenshot",
  "source": "victim-email-account",
  "file_name": "evidence_001.png",
  "file_size": 156000,
  "file_path": "/storage/evidence/abc123.png",
  "file_hash": "sha256_hash_here",
  "collected_by": "Officer Name",
  "collection_date": "2024-01-15T09:30:00Z",
  "collection_location": "Police Station",
  "status": "STORED",
  "notes": "Screenshots provided by victim",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-04-12T11:00:00Z"
}
```

### Custody Record Model
```json
{
  "id": "uuid",
  "evidence_id": "evidence-uuid",
  "action": "TRANSFER",
  "transferred_from_user_id": "officer-1-uuid",
  "transferred_to_user_id": "officer-2-uuid",
  "reason": "For forensic analysis",
  "location": "Cyber Lab, Building A",
  "timestamp": "2024-01-15T14:30:00Z",
  "status": "TRANSFERRED",
  "notes": "Sealed in evidence bag",
  "created_at": "2024-01-15T14:30:00Z"
}
```

### Hash Verification Model
```json
{
  "id": "uuid",
  "evidence_id": "evidence-uuid",
  "original_hash": "sha256_hash_from_upload",
  "computed_hash": "sha256_hash_on_verify",
  "match": true,
  "verified_at": "2024-01-20T10:00:00Z",
  "verified_by": "officer-uuid",
  "method": "SHA256",
  "notes": "Evidence integrity confirmed"
}
```

---

## 🚀 Deployment Considerations

### Environment Variables
```
FRONTEND:
- VITE_API_BASE_URL=https://api.yourdomain.com
- NODE_ENV=production

BACKEND:
- DATABASE_URL=postgresql://user:pass@host/db
- JWT_SECRET=long_random_string_min_32_chars
- JWT_EXPIRY=900  (15 minutes)
- REFRESH_TOKEN_EXPIRY=604800  (7 days)
- CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
- FILE_STORAGE_PATH=/secure/storage/evidence
```

### Security Checklist
- [ ] HTTPS/TLS enabled for all traffic
- [ ] CORS properly configured
- [ ] JWT secrets are strong (32+ characters)
- [ ] Database credentials not in code
- [ ] File uploads validated and scanned
- [ ] Rate limiting enabled
- [ ] HSTS header configured
- [ ] Security headers set (CSP, X-Frame-Options, etc.)
- [ ] Logs monitored for suspicious activity
- [ ] Regular backups of database
- [ ] Disaster recovery plan
- [ ] User access reviews quarterly

---

## 📝 Summary

**COC Tracker** is a production-grade forensic evidence management system with:
- ✅ Secure JWT authentication with token refresh
- ✅ Immutable chain of custody audit trails
- ✅ SHA-256 hash verification for evidence integrity
- ✅ Role-based access control
- ✅ Comprehensive logging for compliance
- ✅ HTTPS encryption for data in transit
- ✅ Database-level security and SQL injection prevention

The system meets forensic and legal requirements for maintaining evidence integrity and proving chain of custody in court proceedings.

