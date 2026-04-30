# COC Tracker - Security Architecture Deep Dive

## 🔐 Complete Security System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                             │
└─────────────────────────────────────────────────────────────────┘

Layer 1: TRANSPORT SECURITY
├─ HTTPS/TLS Encryption
├─ Certificate pinning (optional)
└─ DNS-over-HTTPS (optional)

Layer 2: AUTHENTICATION
├─ Email/Password login
├─ JWT Access Tokens (short-lived)
├─ JWT Refresh Tokens (long-lived)
├─ Bcrypt password hashing
└─ Multi-factor authentication (optional)

Layer 3: AUTHORIZATION
├─ Role-based access control (RBAC)
├─ Resource-based access control (RBAC)
├─ User can only see assigned cases
└─ Investigator can only modify own records

Layer 4: DATA INTEGRITY
├─ SHA-256 hash verification
├─ Immutable audit trails
├─ Cryptographic signatures (optional)
└─ Tamper detection

Layer 5: API SECURITY
├─ CORS configuration
├─ Rate limiting
├─ Request validation
├─ SQL injection prevention
└─ XSS protection

Layer 6: DATABASE SECURITY
├─ Access control lists
├─ Row-level security
├─ Query parameterization
├─ Encrypted fields (optional)
└─ Backups with encryption

Layer 7: APPLICATION SECURITY
├─ Input validation
├─ Output encoding
├─ Security headers
├─ Dependency scanning
└─ Security logging
```

---

## 🛡️ Detailed Security Controls

### 1. AUTHENTICATION SYSTEM

#### JWT Token Architecture

```
┌────────────────────────────────────────┐
│          LOGIN PROCESS                 │
└────────────────────────────────────────┘

1. User enters credentials
   ↓
2. Frontend sends: POST /auth/login
   Body: { email: "officer@police.gov", password: "SecurePass123!" }
   ↓
3. Backend receives:
   - Hash incoming password
   - Compare with stored hash
   - If match → Generate tokens
   ↓
4. Backend generates access_token:
   {
     "alg": "HS256",
     "typ": "JWT"
   }
   {
     "user_id": "a1b2c3d4-e5f6-47a8-9b0c-1d2e3f4a5b6c",
     "email": "officer@police.gov",
     "role": "investigator",
     "name": "Officer Smith",
     "iat": 1704067200,
     "exp": 1704070800  // Expires in 15 minutes
   }
   Signature: HMACSHA256(header + payload, JWT_SECRET)
   ↓
5. Backend generates refresh_token:
   {
     "user_id": "a1b2c3d4-e5f6-47a8-9b0c-1d2e3f4a5b6c",
     "type": "refresh",
     "iat": 1704067200,
     "exp": 1704672000  // Expires in 7 days
   }
   ↓
6. Backend returns both tokens
   {
     "success": true,
     "data": {
       "access_token": "eyJhbGc...",
       "refresh_token": "eyJhbGc...",
       "user": {
         "id": "a1b2c3d4-e5f6-47a8-9b0c-1d2e3f4a5b6c",
         "email": "officer@police.gov",
         "role": "investigator"
       }
     }
   }
   ↓
7. Frontend stores tokens (localStorage or memory)
   ↓
8. All subsequent API calls include:
   Headers: { Authorization: "Bearer eyJhbGc..." }
```

#### JWT Token Validation

```
For every API request (except /auth/login):

1. Backend receives request with Authorization header
2. Extract token: "Bearer {token}" → token
3. Split token: header.payload.signature
4. Verify signature:
   - Decode header and payload (Base64)
   - Recalculate signature using JWT_SECRET
   - Compare calculated vs provided signature
   - If mismatch → TOKEN INVALID → 401 Unauthorized
5. If signature valid:
   - Check expiration timestamp (exp claim)
   - If expired → 401 Unauthorized
   - If valid → Extract user_id from token
6. If valid user_id:
   - Check user exists in database
   - Check user role has permission
   - If authorized → Process request
   - If not → 403 Forbidden
```

#### Token Refresh Flow

```
Frontend Timeline:
- User logs in at 2:00 PM
- Gets access_token (expires 2:15 PM)
- Gets refresh_token (expires in 7 days)

2:10 PM: User is active
- API calls work (token still valid)

2:20 PM: User clicks something
- Frontend tries: GET /api/cases
- Backend returns: 401 Unauthorized
- Frontend detects: access_token expired
- Frontend sends: POST /auth/refresh
  Headers: { Authorization: "Bearer {refresh_token}" }
- Backend validates refresh_token
- If valid → Returns new access_token
- Frontend retries original request with new token
- User doesn't notice anything happened

2:25 PM: Refresh token also expires (7 days later)
- Refresh fails
- Frontend clears tokens
- Redirects user to login page
- User must login again
```

### 2. PASSWORD SECURITY

#### Bcrypt Hashing

```
┌─────────────────────────────────────────┐
│      PASSWORD HASHING WITH BCRYPT       │
└─────────────────────────────────────────┘

User enters password: "MyPassword123!"

Step 1: Backend generates SALT
- Random string generated per password
- Example: $2b$10$AaBbCcDdEeFfGgHhIiJjK

Step 2: Hash password + salt
- Input: "MyPassword123!" + salt
- Run through Bcrypt 10+ times (computationally expensive)
- Result: $2b$10$AaBbCcDdEeFfGgHhIiJjKu9qZ8x7w6v5u4t3s2r1q

Step 3: Store only hash in database
- Database contains: $2b$10$AaBbCcDdEeFfGgHhIiJjKu9qZ8x7w6v5u4t3s2r1q
- Original password NOT stored
- Even database admin can't see password

Step 4: User logs in again
- User enters password: "MyPassword123!"
- Backend retrieves stored hash from DB
- Backend hashes new input with same salt
- Compares result with stored hash
- If match → Login success
- If mismatch → Login failed

Why Bcrypt?
✅ One-way: Can't decrypt hash to get password
✅ Salted: Same password produces different hashes
✅ Slow: Takes time to compute (defeats brute force)
✅ Adaptive: Can increase rounds as computers faster
```

### 3. AUTHORIZATION & ACCESS CONTROL

#### Role-Based Access Control (RBAC)

```
ROLES in System:
┌──────────────────────────────────────────┐
│ Role: INVESTIGATOR                       │
├──────────────────────────────────────────┤
│ Can:                                     │
│ ✓ Create cases                           │
│ ✓ Upload evidence to assigned cases      │
│ ✓ Transfer evidence                      │
│ ✓ Verify hash                            │
│ ✓ View assigned cases only               │
│ ✓ View evidence for assigned cases       │
│ ✓ View custody records (own evidence)    │
│                                          │
│ Cannot:                                  │
│ ✗ Delete cases                           │
│ ✗ Delete evidence                        │
│ ✗ Access other investigator's cases      │
│ ✗ Manage users                           │
│ ✗ View audit logs                        │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ Role: SUPERVISOR                         │
├──────────────────────────────────────────┤
│ Can:                                     │
│ ✓ Do everything INVESTIGATOR can        │
│ ✓ View all cases (not just assigned)     │
│ ✓ View custody records (all evidence)    │
│ ✓ Generate reports                       │
│ ✓ Change case status                     │
│ ✓ Reassign cases                         │
│                                          │
│ Cannot:                                  │
│ ✗ Delete cases                           │
│ ✗ Delete evidence                        │
│ ✗ Manage users                           │
│ ✗ Configure system                       │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ Role: ADMIN                              │
├──────────────────────────────────────────┤
│ Can:                                     │
│ ✓ Do everything SUPERVISOR can          │
│ ✓ Manage users (create, edit, delete)    │
│ ✓ Configure system settings              │
│ ✓ Manage roles and permissions           │
│ ✓ View all audit logs                    │
│ ✓ Manage database backups                │
│ ✓ Delete cases (with audit trail)        │
│ ✓ Delete evidence (with audit trail)     │
│                                          │
│ Restrictions:                            │
│ ⚠ All actions logged                     │
│ ⚠ Can't override immutable audit trail   │
│ ⚠ Can't modify past records              │
└──────────────────────────────────────────┘
```

#### Resource-Based Access Control

```
Example: Can Officer A access Case 001?

Backend logic:
1. User requests: GET /api/cases/case-001
2. Backend extracts user_id from JWT token
3. Backend checks:
   - Does case exist?
   - Is user assigned to case?
   - Does user role allow read access?
   - Is case not deleted?

Access Matrix:
                Investigator  Supervisor  Admin
Create Case         ✓            ✓         ✓
Read Own Case       ✓            ✓         ✓
Read All Cases      ✗            ✓         ✓
Edit Own Case       ✓            ✓         ✓
Edit Any Case       ✗            ✓         ✓
Delete Case         ✗            ✗         ✓
```

### 4. DATA INTEGRITY - CHAIN OF CUSTODY

#### Immutable Audit Trail

```
┌────────────────────────────────────────────┐
│    EVIDENCE AUDIT TRAIL (IMMUTABLE)        │
└────────────────────────────────────────────┘

Time: 2024-01-15 10:00:00 UTC
Action: CREATED
Evidence: Evidence_001
Created By: Officer Smith (officer-uuid-123)
Status: STORED
Location: Evidence Room A
Notes: Initial upload
────────────────────────────────────────────
↓ (Time 1 hour later...)
Time: 2024-01-15 11:00:00 UTC
Action: TRANSFERRED
Evidence: Evidence_001
Transferred From: Officer Smith
Transferred To: Lab Tech Jones
Status: TRANSFERRED
Location: Cyber Lab B
Reason: For forensic analysis
Notes: Sealed in evidence bag
────────────────────────────────────────────
↓ (Time 1 day later...)
Time: 2024-01-16 09:00:00 UTC
Action: TRANSFERRED
Evidence: Evidence_001
Transferred From: Lab Tech Jones
Transferred To: Detective Brown
Status: TRANSFERRED
Location: Detective's Office
Reason: Analysis complete, reviewing findings
────────────────────────────────────────────
↓ (Time 5 days later...)
Time: 2024-01-20 11:00:00 UTC
Action: STATUS_CHANGED
Evidence: Evidence_001
Status: RELEASED
Changed By: Detective Brown
Reason: Case resolved, evidence cleared
Released To: Officer White
Location: Evidence Storage - Release
────────────────────────────────────────────

KEY PROPERTIES:
✅ Chronological order maintained
✅ Timestamps from server (can't be faked)
✅ User extracted from JWT (can't be spoofed)
✅ NO UPDATES - Only new records added
✅ NO DELETES - History completely preserved
✅ Court admissible - Proves chain of custody

If someone tries to:
❌ Delete a record → System prevents it
❌ Modify a record → System prevents it
❌ Fake a timestamp → Would be older than next record
❌ Add record out of order → Breaks chronology
→ All visible in audit trail
```

### 5. FILE INTEGRITY - HASH VERIFICATION

#### SHA-256 Hashing Process

```
┌───────────────────────────────────────────┐
│      EVIDENCE FILE HASH PROCESS          │
└───────────────────────────────────────────┘

UPLOAD:
1. User uploads file: "photo.jpg" (5 MB)
   ↓
2. Frontend:
   - Reads file binary data
   - Calculates SHA-256 hash using Web Crypto API
   - Result: "a3f5d8e9c2b1f4a7e6d8c9b0a1f2e3d4..."
   ↓
3. Backend receives:
   - File data
   - Frontend-calculated hash (for logging)
   ↓
4. Backend:
   - Saves file to secure storage
   - Calculates SHA-256 independently
   - Result: "a3f5d8e9c2b1f4a7e6d8c9b0a1f2e3d4..."
   - Compares both hashes
   - If match → File integrity verified
   - If mismatch → File corrupted in transmission
   ↓
5. Backend stores in database:
   {
     evidence_id: "evidence-001",
     file_name: "photo.jpg",
     file_size: 5242880,
     file_hash: "a3f5d8e9c2b1f4a7e6d8c9b0a1f2e3d4...",
     hash_algorithm: "SHA256",
     uploaded_at: "2024-01-15T10:00:00Z"
   }

VERIFICATION (Later):
1. User navigates to: /verify/{evidence_id}
   ↓
2. System shows:
   - Original hash: "a3f5d8e9c2b1f4a7e6d8c9b0a1f2e3d4..."
   - Upload area for verification
   ↓
3. User uploads same file again
   ↓
4. Frontend:
   - Calculates SHA-256 of uploaded file
   - Result: "a3f5d8e9c2b1f4a7e6d8c9b0a1f2e3d4..."
   ↓
5. Backend:
   - Receives file and hash
   - Calculates independent hash
   - Compares: original vs computed
   ↓
6. Result:
   - ✅ MATCH: Evidence untouched, authentic
      "File integrity verified. Hash matches."
   - ❌ MISMATCH: Evidence modified
      "ALERT! File has been modified or tampered."

WHY HASH CAN'T BE FORGED:
- SHA-256 is mathematically one-way
- Can't create fake file with same hash
- Even 1 bit change → completely different hash
- Would need to brute force (2^256 attempts)
- Computationally infeasible (would take universe's age)
```

### 6. API SECURITY

#### CORS Configuration

```
┌──────────────────────────────────────────┐
│         CORS SECURITY SETUP              │
└──────────────────────────────────────────┘

Frontend: http://localhost:3000
Backend: http://172.16.10.71:5000

Browser's Same-Origin Policy:
- Prevents scripts from one origin accessing resources from another
- Origin = protocol + domain + port

Example scenarios:

ALLOWED ✅:
- localhost:3000 → localhost:3000 (same origin)
- 172.16.10.71:5000 → 172.16.10.71:5000 (same origin)

BLOCKED (unless CORS allows) ❌:
- localhost:3000 → 172.16.10.71:5000 (different server)
- malicious.com → 172.16.10.71:5000 (different origin)
- localhost:3001 → 172.16.10.71:5000 (different port)

CORS Header Configuration:
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true

Preflight Request (automatic by browser):
1. Browser sends: OPTIONS /api/cases
   Headers: 
   - Origin: http://localhost:3000
   - Access-Control-Request-Method: POST
   - Access-Control-Request-Headers: Content-Type

2. Backend responds:
   Headers:
   - Access-Control-Allow-Origin: http://localhost:3000
   - Access-Control-Allow-Methods: POST, GET, etc.
   - Access-Control-Allow-Headers: Content-Type, Authorization

3. Browser checks:
   - Is Origin in Allow-Origin? ✓
   - Is Method in Allow-Methods? ✓
   - Are Headers in Allow-Headers? ✓

4. If all ✓: Browser allows actual request
   If any ✗: Browser blocks request (CORS error)

ATTACKER SCENARIO (prevented):
Attacker website: evil.com
Tries: window.fetch("http://172.16.10.71:5000/api/cases")

Browser checks:
- Origin: http://evil.com
- Is evil.com in CORS allow list? ✗ NO
- Browser blocks request: "CORS policy: Access blocked"
- Request never reaches server
```

#### Rate Limiting

```
Purpose: Prevent abuse and DoS attacks

Implementation:
- Track requests per IP address
- Track requests per user (if authenticated)
- Time window: 1 minute, 1 hour, etc.

Example policy:
- Unauthenticated: 100 requests per hour per IP
- Authenticated: 1000 requests per hour per user
- Strict on login: 5 attempts per 15 minutes per IP

When exceeded:
- Return: 429 Too Many Requests
- Headers: Retry-After: 300 (seconds)

Attack prevention:
Attacker tries: 10,000 login attempts per minute
- First 5 attempts: Allowed
- 6th attempt: Blocked for 15 minutes
- All subsequent: Blocked

System benefits:
✅ Prevents brute force password attacks
✅ Prevents data scraping
✅ Prevents API abuse
✅ Fair resource usage
```

### 7. INPUT VALIDATION

#### SQL Injection Prevention

```
VULNERABLE CODE (Bad Practice):
query = "SELECT * FROM users WHERE email = '" + user_input + "'"
# If user_input = "' OR '1'='1"
# Query becomes: SELECT * FROM users WHERE email = '' OR '1'='1'
# Returns ALL users (not intended)

SAFE CODE (Good Practice):
query = "SELECT * FROM users WHERE email = ?"
params = [user_input]
# Parameterized query: SQL structure separate from data
# user_input treated as DATA, not code
# Even if user_input = "' OR '1'='1'"
# Backend searches for email matching exactly: ' OR '1'='1'
# No SQL injection possible

SQLAlchemy ORM (What we use):
users = session.query(User).filter(User.email == user_input)
# Never concatenates strings
# Always uses parameterized queries
# Developer can't accidentally create SQL injection
```

#### File Upload Validation

```
Validation checks on uploaded files:

1. File Type:
   - Check MIME type (Content-Type header)
   - Check file extension
   - Scan file magic bytes (file signature)
   Example:
   - JPEG: JPEG files start with FF D8 FF
   - PNG: PNG files start with 89 50 4E 47
   - PDF: PDF files start with 25 50 44 46

2. File Size:
   - Maximum upload size: 100 MB
   - Reject if size > limit
   - Prevent storage exhaustion

3. File Name:
   - Don't use original filename
   - Rename to: UUID + extension
   - Example: "a1b2c3d4-e5f6-47a8-9b0c-1d2e3f4a5b6c.jpg"
   - Prevents path traversal attacks
   - Prevents overwriting files

4. Virus Scanning (Optional):
   - Integrate antivirus API
   - Scan uploaded files
   - Block if malicious detected

5. Storage Path:
   - Store outside web root
   - Store with restricted permissions
   - Regular cleanup of old files
```

---

## 🚨 Security Incident Response

### If Evidence Hash Mismatch Detected

```
Timeline of response:

T+0: Hash mismatch detected
- System alerts investigator
- Creates alert record in database

T+1 min: Investigation begins
- Review custody history
- Identify when evidence accessed last
- Check who had access

T+2 min: Supervisor notified
- Evidence marked for review
- Case potentially compromised
- All users with access flagged

T+3 min: Evidence isolated
- Stop all operations on evidence
- Preserve current file
- Don't overwrite/delete

T+5 min: Audit trail analysis
- Review all custody records
- Timeline of transfers
- Access logs for file storage

T+10 min: Incident report created
- Document findings
- Identify responsible party
- Preserve evidence

Actions:
1. Case marked as "COMPROMISED"
2. Court notified if case ongoing
3. Criminal investigation if sabotage
4. All subsequent evidence re-verified
```

### If Unauthorized Access Detected

```
Scenarios:

Scenario 1: Multiple failed login attempts
- Auto-trigger: 5 failed logins in 15 minutes
- Action: Account locked for 1 hour
- Notification: User and admin
- Logging: IP address, timestamps

Scenario 2: Access from unusual location
- Detect: Login from new IP address
- Action: Extra verification (email confirmation)
- Logging: New device/location
- Alert: Admin dashboard

Scenario 3: Suspicious API patterns
- Detect: Too many failed authorization checks
- Detect: Rapid-fire API calls (rate limit exceeded)
- Action: Throttle or block IP
- Logging: Pattern details
- Alert: Security team
```

---

## 📋 Security Checklist

### For Production Deployment

- [ ] **HTTPS/TLS**
  - [ ] Valid SSL certificate from trusted CA
  - [ ] TLS 1.2 or higher
  - [ ] HSTS header enabled (Strict-Transport-Security)
  - [ ] Certificate pinning (optional, additional security)

- [ ] **Secrets Management**
  - [ ] JWT_SECRET is 32+ characters, random
  - [ ] Database passwords in env variables
  - [ ] Never commit secrets to git
  - [ ] Secrets rotated regularly

- [ ] **Database**
  - [ ] PostgreSQL or MySQL secured
  - [ ] Database user has least privileges
  - [ ] Remote access disabled (localhost only)
  - [ ] Regular backups with encryption
  - [ ] Backups stored securely (separate location)

- [ ] **API Security**
  - [ ] CORS properly configured
  - [ ] Rate limiting enabled
  - [ ] Input validation on all endpoints
  - [ ] SQL injection prevention verified
  - [ ] Error messages don't leak info

- [ ] **Authentication**
  - [ ] JWT tokens implemented correctly
  - [ ] Access token expiry < 1 hour
  - [ ] Refresh token expiry > 1 day
  - [ ] Bcrypt password hashing (10+ rounds)
  - [ ] Password reset secure

- [ ] **Monitoring & Logging**
  - [ ] Security events logged
  - [ ] Logs stored securely
  - [ ] Alerts for suspicious activity
  - [ ] Audit trails for all data changes
  - [ ] Regular log review

- [ ] **File Security**
  - [ ] Files stored outside web root
  - [ ] File access requires authentication
  - [ ] Malware scanning enabled
  - [ ] Old files cleaned up
  - [ ] Permissions restricted (600)

- [ ] **Infrastructure**
  - [ ] Firewall properly configured
  - [ ] Only necessary ports open
  - [ ] DDoS protection
  - [ ] Regular security patches
  - [ ] System hardening completed

- [ ] **Testing**
  - [ ] Penetration testing completed
  - [ ] OWASP Top 10 tested
  - [ ] Security code review done
  - [ ] Dependency vulnerabilities scanned
  - [ ] Load testing performed

---

## 🎓 Security Best Practices

### For Developers
1. **Never trust user input**
   - Always validate and sanitize
   - Use allow-lists, not deny-lists
   - Check type, length, format

2. **Principle of Least Privilege**
   - Users only get permissions needed
   - API keys only access resources needed
   - Database user can't drop tables

3. **Keep Dependencies Updated**
   - Patch security vulnerabilities
   - Monitor security advisories
   - Test updates before production

4. **Secure by Default**
   - Default settings are secure
   - Require explicit opt-in for weaker security
   - Fail securely (deny access on error)

### For Operations
1. **Monitor Everything**
   - Log all security events
   - Alert on suspicious activity
   - Review logs regularly

2. **Backup & Disaster Recovery**
   - Daily backups
   - Test restore procedures
   - Geo-distributed backups
   - Encrypted backup storage

3. **Access Control**
   - Principle of least privilege
   - Regular access reviews
   - Remove access immediately on departure
   - Multi-factor authentication for admin

4. **Incident Response**
   - Have incident plan
   - Know who to notify
   - Practice incident scenarios
   - Document lessons learned

---

That completes the comprehensive security architecture documentation! This system is designed to meet forensic evidence management standards and maintain legal admissibility of evidence in court proceedings. 🔐



