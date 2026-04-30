# Backend Integration Setup Guide

## ✅ Changes Made

### 1. Environment Configuration
- **File Changed**: `.env`
- **Old**: `VITE_API_URL=http://172.16.10.71:5000`
- **New**: `VITE_API_BASE_URL=http://172.16.10.71:5000`
- **Reason**: Standard naming convention for base URL; easier to identify in code

### 2. API Configuration
- **File Changed**: `src/api/axios.js`
- **Changes**:
  - Updated to use `VITE_API_BASE_URL` environment variable
  - Enhanced error handling for 401 (Unauthorized), 403 (Forbidden), and network errors
  - Network error now shows backend URL for debugging
  - 401 errors automatically redirect to login and clear session
  - 403 errors display "Access Denied" message

### 3. Authentication
- **File Changed**: `src/api/auth.js`
- **Changes**:
  - Removed mock authentication logic
  - All API calls now use live backend via axiosInstance
  - JWT token automatically sent in `Authorization: Bearer <token>` header

### 4. Login UI
- **File Changed**: `src/pages/LoginPage.jsx`
- **Changes**:
  - Removed demo credentials buttons
  - Removed mock auth UI section
  - Added backend URL display for debugging
  - Improved error messages from backend

### 5. Mock Auth (Deprecated)
- **File**: `src/api/mockAuth.js` (no longer used, can delete later)
- Status: Not imported or called anymore

## 📋 Environment Variables Needed

**File**: `.env` in project root

```env
# Backend API Configuration
# Replace <BACKEND_LAPTOP_IP> with your actual backend server IP address
VITE_API_BASE_URL=http://172.16.10.71:5000
```

**Example**:
```env
# If backend is on IP 192.168.1.100:
VITE_API_BASE_URL=http://172.16.10.71:5000
```

## 🚀 Step-by-Step Setup

### 1. Get Backend IP Address
```bash
# On backend laptop, find IP address:

# Windows:
ipconfig

# Linux/Mac:
ifconfig
# or
ip addr show
```

Note the IP address (e.g., `192.168.1.100`)

### 2. Update .env File
```env
VITE_API_BASE_URL=http://172.16.10.71:5000
```

### 3. Verify Backend is Running
- Backend should be listening on `http://172.16.10.71:5000`
- API docs available at: `http://172.16.10.71:5000/docs` (if implemented)
- CORS must be configured to allow frontend origin

### 4. Start Frontend
```bash
cd frontend
npm install  # if needed
npm run dev
```

### 5. Test Login
1. Go to `http://localhost:5173`
2. Enter valid credentials from your backend
3. Login should succeed and redirect to dashboard
4. Check browser console for any errors

## 🔐 API Error Handling

The frontend now properly handles these backend responses:

### 401 Unauthorized
- **Trigger**: Invalid credentials or expired token
- **Frontend Response**:
  - Clears auth token from store
  - Redirects to login page
  - Shows "Session expired" message

### 403 Forbidden
- **Trigger**: User lacks permission for action
- **Frontend Response**:
  - Shows "Access Denied" error message
  - Stays on current page

### Network Error
- **Trigger**: Backend unreachable
- **Frontend Response**:
  - Shows backend URL that failed to connect
  - Helps diagnose connection issues
  - Example: "Backend unreachable at http://172.16.10.71:5000"

## ✅ Verification Flows

### Login Flow
1. User enters email & password
2. Frontend sends to `POST /auth/login`
3. Backend returns `{ token, user }`
4. Token stored in localStorage via Zustand
5. User redirected to dashboard

### Protected Requests
1. Any API call automatically adds `Authorization: Bearer <token>` header
2. Backend validates token
3. If valid: request proceeds
4. If invalid: backend returns 401, frontend redirects to login

### Case/Evidence Operations
1. Create case: `POST /cases` with `Authorization` header
2. Fetch cases: `GET /cases` with `Authorization` header
3. Create evidence: `POST /cases/:caseId/evidence` with file + `Authorization` header
4. Hash verification: `GET /evidence/:id` with `Authorization` header

## 📁 Files Modified

| File | Changes |
|------|---------|
| `.env` | Updated API base URL variable |
| `src/api/axios.js` | Enhanced error handling, updated env var |
| `src/api/auth.js` | Removed mock auth, use live backend only |
| `src/pages/LoginPage.jsx` | Removed demo credentials, cleaner UI |

## 📁 Files NOT Changed (but still using new config)

These files automatically use the new configuration:
- `src/api/cases.js` - ✅ Uses axiosInstance
- `src/api/evidence.js` - ✅ Uses axiosInstance
- `src/api/custody.js` - ✅ Uses axiosInstance
- All page components using these APIs

## 🔄 Switching Environments

### Temporarily Use Mock Auth Again
If you need to test without backend:
1. Create `.env.local` or update `.env`:
   ```env
   VITE_API_BASE_URL=http://invalid-url:9999
   ```
2. Frontend will show network error
3. Or restore mockAuth logic to `src/api/auth.js`

### Back to Live Backend
Simply update `.env` with correct IP:
```env
VITE_API_BASE_URL=http://172.16.10.71:5000
```

## 🗑️ Cleanup (Optional)

Once backend integration is confirmed working:

```bash
# Delete mock auth file (no longer needed)
rm src/api/mockAuth.js

# Delete mock auth setup guide
rm MOCK_AUTH_SETUP.md
```

## 🐛 Debugging

### Check Backend Connection
Open browser console (F12) and look for:
1. Network tab: API requests should go to correct IP
2. Headers: Should include `Authorization: Bearer <token>`
3. Errors: Any CORS, 401, 403, or network errors

### Test API Endpoint Directly
```bash
# Test login
curl -X POST http://<BACKEND_IP>:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Should return: {"token": "...", "user": {...}}
```

### Check CORS Configuration
- Backend must allow frontend origin in CORS headers
- Example: `Access-Control-Allow-Origin: http://localhost:5173`

## 📊 Current Status

- ✅ Environment variables configured
- ✅ API base URL configurable via `.env`
- ✅ JWT token stored and sent automatically
- ✅ Error handling for 401/403/network errors
- ✅ Mock auth removed
- ✅ Ready for backend integration
- ⏳ Waiting for backend IP address

## Next Steps

1. **Get Backend IP**: Find the IP address of your backend laptop
2. **Update .env**: Replace `<BACKEND_LAPTOP_IP>` with actual IP
3. **Verify Backend**: Ensure backend is running and CORS is enabled
4. **Start Frontend**: Run `npm run dev`
5. **Test Login**: Use your backend credentials
6. **Test APIs**: Create cases, add evidence, verify hashes

---

**Ready to integrate with backend at**: `http://172.16.10.71:5000`


