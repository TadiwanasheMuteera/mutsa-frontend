# COC Tracker - Quick Reference Guide

## 🎯 What is This Project?

**Chain of Custody Tracker (COC Tracker)** = Forensic evidence management system for criminal investigations

### Core Purpose
- Track evidence throughout investigation
- Maintain complete audit trail (who had it, when, why)
- Verify evidence hasn't been tampered with
- Meet legal/compliance requirements for court cases

---

## 🏗️ System Architecture (Simple)

```
CLIENT BROWSER
    ↓ (HTTPS)
FRONTEND (React App) ← Authentication + Data
    ↓ (API Calls)
BACKEND (Flask Server) ← Token Validation + Business Logic
    ↓ (SQL Queries)
DATABASE (PostgreSQL) ← Permanent Storage
    ↓
FILE STORAGE ← Evidence Files
```

---

## 🔐 Security Features Explained

### 1. **Login & Authentication**
```
What happens:
1. You log in with email/password
2. Backend verifies your credentials
3. Backend gives you TWO tokens:
   - access_token: Use for API calls (expires in 15 min)
   - refresh_token: Use to get new access_token (expires in 7 days)
4. Frontend stores both tokens
5. Every API call includes: Authorization: Bearer {access_token}

Why two tokens?
- Short access token = less damage if stolen
- Long refresh token = user stays logged in (refresh automatically)
- If refresh token invalid = must re-login (stronger security)
```

### 2. **Evidence Integrity - Hash Verification**
```
What happens:
1. You upload evidence file (photo, document, etc.)
2. System calculates SHA-256 hash:
   - Hash = unique fingerprint of file
   - If file changed even 1 byte = completely different hash
3. Hash stored in database
4. Later, you can verify file hasn't been modified:
   - Re-upload same file
   - System calculates hash again
   - Compares with stored hash
   - If match = ✅ File untouched
   - If different = ❌ File was modified (tampered)

Why important:
- Proves evidence is authentic for court
- Detects if someone modified evidence
```

### 3. **Chain of Custody - Audit Trail**
```
What happens:
1. Evidence created = first custody record
2. Evidence transferred to someone = new custody record
3. Evidence status changes = new custody record
4. EVERY record includes:
   - WHO (user ID from login token)
   - WHEN (server timestamp, can't be faked)
   - WHAT (which evidence, what action)
   - WHY (reason for transfer/status change)
   - WHERE (location of evidence)

Why immutable:
- Old records CANNOT be deleted or modified
- Only new records can be added
- Prevents someone covering up their tracks
- Complete history for court

Example custody trail:
Evidence 001 Audit Trail:
├─ 2024-01-15 10:00 Officer Smith CREATED evidence
├─ 2024-01-15 14:30 Officer Smith TRANSFERRED to Lab Tech Jones
├─ 2024-01-16 09:00 Lab Tech Jones TRANSFERRED to Detective Brown
├─ 2024-01-20 11:00 Detective Brown STATUS CHANGED to RELEASED
└─ 2024-01-20 16:00 Officer White RECEIVED (released to)
```

### 4. **Database Protection**
```
SQL Injection Prevention:
- System uses ORM (Object-Relational Mapping)
- User input NEVER directly in SQL queries
- All queries use parameterized statements
- Attacker can't inject SQL code

Password Storage:
- Passwords never stored in plain text
- Passwords hashed with Bcrypt (one-way encryption)
- Even admin can't see original password
- If database stolen, passwords useless
```

### 5. **CORS (Cross-Origin Resource Sharing)**
```
What's the problem:
- Malicious website tries to make API calls to your system
- Could delete evidence, steal data, etc.

How CORS blocks it:
- System only accepts requests from authorized origins
- Frontend domain whitelisted
- Malicious sites blocked automatically
- Browser enforces this (can't bypass)
```

---

## 📊 Main Features

### 1. **Dashboard**
- Shows statistics:
  - Active Cases count
  - Total Evidence logged
  - Pending Transfers
  - Cases referred to prosecution
- Recent activity feed
- Alerts for tampered evidence

### 2. **Case Management**
- Create new cases
- Link evidence to cases
- Track case status (ACTIVE, CLOSED, REFERRED, etc.)
- Assign investigator

### 3. **Evidence Management**
- Upload evidence files
- Record metadata (type, collected by, collection date, location)
- Automatic SHA-256 hash calculation
- Evidence list with status
- Search and filter

### 4. **Chain of Custody**
- View custody history for any evidence
- See who has evidence currently
- Record transfers between users
- Track status changes (STORED → TRANSFERRED → RELEASED)
- Complete audit trail

### 5. **Hash Verification**
- Verify evidence hasn't been modified
- Re-upload file and compare hash
- See original hash and computed hash
- Verification records maintained

---

## 🗄️ Data Models (What Gets Stored)

### Users
```
- ID (unique identifier)
- Email
- Name
- Password (hashed with Bcrypt)
- Role (investigator, supervisor, admin)
- Department
- Created date, Last login date
```

### Cases
```
- ID (unique)
- Case Number (e.g., CASE-2024-001)
- Title
- Description
- Fraud Type (SIM Swap, BEC, Phishing, etc.)
- Status (ACTIVE, CLOSED, REFERRED)
- Investigator assigned
- Created by (user ID)
- Suspect information
- Created/Updated dates
```

### Evidence
```
- ID (unique)
- Case ID (linked to case)
- Description
- Type (photo, screenshot, document, etc.)
- File name and hash
- Collected by (officer name)
- Collection date and location
- Current status (STORED, TRANSFERRED, RELEASED, etc.)
- Created/Updated dates
```

### Custody Records
```
- ID (unique)
- Evidence ID
- Action (CREATED, TRANSFERRED, STATUS_CHANGED, RELEASED, DESTROYED)
- Transferred FROM (user ID)
- Transferred TO (user ID)
- Reason (why transferred)
- Location (where evidence is)
- Timestamp (when)
- Notes
```

### Hash Verifications
```
- ID (unique)
- Evidence ID
- Original hash (when uploaded)
- Computed hash (when verified)
- Match (true/false)
- Verified by (user ID)
- Verified date
```

---

## 🔄 Common Workflows

### Workflow 1: Creating a Case
```
1. Click "New Case" button
2. Fill in case details:
   - Title: "SIM Swap Investigation"
   - Description: Details about the case
   - Fraud Type: Select from dropdown
   - Assign to investigator
3. Click "Create"
4. Case appears in:
   - Dashboard (Active Cases count +1)
   - Cases page
   - Can now upload evidence for this case
```

### Workflow 2: Uploading Evidence
```
1. Go to case detail
2. Click "Add Evidence"
3. Fill in evidence info:
   - Description: "Email screenshot"
   - Type: Screenshot
   - Collected by: Officer name
   - Collection date: When found
   - Collection location: Where found
4. Select file to upload
5. Click "Upload"
6. System:
   - Calculates SHA-256 hash
   - Stores file securely
   - Creates evidence record
   - First custody record created (CREATED)
7. Evidence appears in:
   - Evidence page
   - Case details
   - Dashboard (Evidence count +1)
```

### Workflow 3: Transferring Evidence
```
1. Go to Evidence page
2. Find evidence to transfer
3. Click "Transfer"
4. Select:
   - Who to transfer to (select officer)
   - Reason (investigation, analysis, testing, etc.)
   - Current location
   - Notes
5. Click "Transfer"
6. System:
   - Creates new custody record
   - Updates evidence status to TRANSFERRED
   - Records timestamp (server time, can't be faked)
   - Records user ID (from your login token)
7. Custody trail shows:
   - Officer A HAD evidence
   - Transferred to Officer B
   - Date and reason recorded
8. Officer B now has responsibility
```

### Workflow 4: Verifying Evidence Integrity
```
1. Go to Evidence page or Evidence Detail
2. Click "Verify Hash"
3. On verification page:
   - See original hash
   - Upload SAME file you uploaded initially
4. System:
   - Calculates hash of uploaded file
   - Compares with stored hash
5. Result:
   - ✅ MATCH: Evidence untouched, authentic
   - ❌ MISMATCH: Evidence was modified, compromised
6. Verification recorded in audit trail
```

---

## 🚨 Threat Model & Protection

### Threats & How System Protects

| Threat | Attack | Protection |
|--------|--------|-----------|
| **Unauthorized Access** | Attacker logs in as someone else | Bcrypt password hashing, JWT tokens |
| **Evidence Tampering** | Modify evidence file after upload | SHA-256 hash verification |
| **Fake Custody Records** | Claim to have transferred evidence | Immutable records, timestamp from server |
| **Data Interception** | Steal data during transmission | HTTPS/TLS encryption |
| **SQL Injection** | Inject SQL commands | SQLAlchemy ORM, parameterized queries |
| **Token Theft** | Steal JWT and access API | Short-lived tokens (15 min), logout clears tokens |
| **CSRF Attack** | Malicious website makes API calls | CORS policy, SameSite cookies |
| **DoS (Flood)** | Send thousands of requests | Rate limiting, request size limits |

---

## 📋 API Endpoints (Backend)

### Authentication
```
POST /auth/login
   Body: { email, password }
   Returns: { access_token, refresh_token, user }

POST /auth/refresh
   Headers: { Authorization: Bearer refresh_token }
   Returns: { access_token }

POST /auth/logout
   Clears tokens
```

### Cases
```
GET /api/cases
   Returns: List of all cases

POST /api/cases
   Body: { title, description, fraud_type, ... }
   Returns: Created case with ID

GET /api/cases/{caseId}
   Returns: Case details

PUT /api/cases/{caseId}
   Body: { title, status, ... }
   Returns: Updated case
```

### Evidence
```
POST /api/evidence/cases/{caseId}/evidence
   Body: FormData(file, description, collected_by, ...)
   Returns: Created evidence with hash

GET /api/evidence/cases/{caseId}/evidence
   Returns: Evidence items for this case

GET /api/evidence/evidence/{evidenceId}
   Returns: Evidence details

POST /api/evidence/evidence/{evidenceId}/verify-hash
   Body: { file (to verify) }
   Returns: { match: true/false, original_hash, computed_hash }
```

### Custody
```
POST /api/custody/evidence/{evidenceId}/transfer
   Body: { transferred_to_user_id, reason, location }
   Returns: Created custody record

GET /api/custody/custody-log/{evidenceId}
   Returns: Custody history for evidence

PUT /api/custody/evidence/{evidenceId}/status
   Body: { new_status, reason }
   Returns: Updated status record
```

---

## 🔑 Important Concepts

### JWT Token
```
What is it?
- JSON Web Token
- Contains your user info (id, email, role)
- Digitally signed (can't be faked)
- Expiration date built-in

Structure:
Header.Payload.Signature

Example token (decoded):
Header: { alg: "HS256" }
Payload: { user_id: "abc123", email: "officer@police.gov", exp: 1704067200 }
Signature: "cryptographic_hash_here"

Why useful:
- Stateless (no server session storage needed)
- Secure (can't be forged)
- Includes expiration (automatic logout)
```

### SHA-256 Hash
```
What is it?
- One-way encryption algorithm
- Converts any file to 64-character string
- File + 1 byte change = completely different hash

Example:
Original file "evidence.jpg" → SHA256 = "a3f5d8e9c2b1f4a7e6d8c9b0a1f2e3d4..."
Modified file "evidence.jpg" → SHA256 = "z9x8c7v6b5a4s3d2f1g0h9j8k7l6m5n4..."

Can't work backwards:
- Hash 256-bit → Can't get back to original file
- Different hash = Different file (definitely)
- Same hash = Same file (100% certain)

Use in this system:
- Prove evidence authenticity
- Detect tampering
- Legal requirement for evidence in court
```

### Immutable Audit Trail
```
What is it?
- Record that can't be changed after creation
- Only new records can be added
- Prevents covering up past actions

Why important:
- Chain of custody unbroken
- Proves who had evidence when
- Legal requirement
- Can't modify history to hide wrongdoing

Example:
Can ADD: "Officer transferred evidence at 2pm"
CAN'T CHANGE TO: "Officer transferred evidence at 3pm"
CAN'T DELETE: Earlier transfers
```

---

## 🎓 Learning Resources

### To understand more about:

**JWT Authentication**
- JWT.io - Interactive JWT debugger
- RFC 7519 - JWT standard specification

**SHA-256 Hashing**
- Search: "SHA-256 hash visualization"
- Try online: sha256.online or similar tool

**Chain of Custody**
- Legal definition for forensic evidence
- Court admissibility requirements
- Forensic science best practices

**CORS**
- MDN: Cross-Origin Resource Sharing
- Understand browser same-origin policy

**SQLAlchemy ORM**
- SQLAlchemy documentation
- SQL injection prevention techniques

---

## 📞 Quick Troubleshooting

### Problem: "Can't log in"
- Check email/password correct
- Check backend server is running
- Check API URL in .env file

### Problem: "404 Not Found" on API calls
- Check backend routes are correct
- Check JWT token is valid
- Check API base URL in frontend config

### Problem: "CORS Error"
- Backend CORS not configured for your domain
- Check backend CORS_ORIGINS setting
- Browser blocks cross-origin without proper CORS

### Problem: "Evidence hash mismatch"
- Evidence file was modified
- Re-upload original file to verify
- If truly modified, investigate tampering

### Problem: "401 Unauthorized"
- JWT token expired (refresh automatically)
- JWT token invalid (log in again)
- Authorization header missing from request

---

## 🏆 Best Practices

### For Investigators
1. ✅ Record every evidence transfer immediately
2. ✅ Note the reason for each transfer
3. ✅ Record exact location of evidence
4. ✅ Verify hash regularly to detect tampering
5. ✅ Never bypass the system for manual records

### For Administrators
1. ✅ Review audit trails regularly
2. ✅ Monitor for suspicious patterns
3. ✅ Ensure HTTPS/TLS is enabled
4. ✅ Rotate JWT secrets periodically
5. ✅ Backup database daily
6. ✅ Set strong password policies

### For Developers
1. ✅ Always validate user input
2. ✅ Use parameterized queries
3. ✅ Keep dependencies updated
4. ✅ Use environment variables for secrets
5. ✅ Log security events
6. ✅ Test CORS configuration
7. ✅ Implement rate limiting

---

**That's it!** You now understand how COC Tracker works and why security is critical for maintaining evidence integrity in forensic investigations. 🎉

