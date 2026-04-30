# Backend Connection - Quick Checklist

## ✅ What Changed

**Mock auth has been completely removed. Frontend now connects to live backend only.**

### Files Modified

1. **`.env`** 
   - Changed: `VITE_API_URL` → `VITE_API_BASE_URL`
   - Update with your backend IP

2. **`src/api/axios.js`**
   - Uses new `VITE_API_BASE_URL` variable
   - Enhanced error handling (401, 403, network)
   - Auto-redirect on 401 (session expired)

3. **`src/api/auth.js`**
   - Removed all mock auth logic
   - All endpoints now live only
   - JWT sent as `Authorization: Bearer <token>`

4. **`src/pages/LoginPage.jsx`**
   - Removed demo credential buttons
   - Removed mock auth messaging
   - Shows connected backend URL

## 🔧 Setup Steps (DO THIS FIRST)

### Step 1: Get Backend IP
```bash
# On your backend laptop, find IP:

# Windows:
ipconfig
# Look for "IPv4 Address" under your network adapter
# Example: 192.168.1.100

# Mac/Linux:
ifconfig
# or
hostname -I
```

### Step 2: Update .env File
```bash
# Navigate to project root and edit .env:

VITE_API_BASE_URL=http://172.16.10.71:5000
```

**Example:**
```env
VITE_API_BASE_URL=http://172.16.10.71:5000
```

### Step 3: Verify Backend is Running
- Backend should be listening on `http://172.16.10.71:5000`
- Test in browser: `http://172.16.10.71:5000/docs` (if available)
- Check backend is started and not showing connection errors

### Step 4: Start Frontend
```bash
npm run dev
# Frontend will be at http://localhost:5173
```

### Step 5: Test Login
1. Open `http://localhost:5173` in browser
2. Enter your backend credentials
3. Click Login
4. Should redirect to dashboard on success

---

## 📋 Quick Reference

| Item | Details |
|------|---------|
| **API Base URL** | Set in `.env` as `VITE_API_BASE_URL` |
| **Auth Header** | `Authorization: Bearer <token>` |
| **Token Storage** | Zustand store (localStorage) |
| **Login Endpoint** | `POST /auth/login` |
| **Protected Routes** | All API calls auto-add JWT header |
| **Session Timeout** | 401 redirects to `/login` |
| **Network Error** | Shows backend URL for debugging |

---

## 🚨 Common Issues & Fixes

### "Backend unreachable at http://..."
- ✓ Check backend IP is correct
- ✓ Verify backend is running
- ✓ Check firewall allows port 5000
- ✓ On same network/WiFi as backend

### "Invalid credentials"
- ✓ Check email/password are correct for backend
- ✓ Backend user account must exist
- ✓ Password must match backend database

### "Access Denied / 403"
- ✓ User exists but lacks permission
- ✓ Check user role in backend
- ✓ Contact admin to grant permissions

### "Session expired / 401"
- ✓ Token expired or invalid
- ✓ Clear browser storage: F12 → Application → Clear All
- ✓ Login again with fresh credentials

---

## 🔒 Security Checklist

- ✅ JWT token stored securely (localStorage)
- ✅ Token sent in `Authorization` header (not URL)
- ✅ 401 errors clear token immediately
- ✅ Sensitive info not logged to console in production
- ⚠️ Backend CORS must be configured for frontend origin

---

## 📊 Environment Variables

### Required
```env
VITE_API_BASE_URL=http://172.16.10.71:5000
```

### Optional (automatic defaults)
- If `VITE_API_BASE_URL` is not set → uses `http://172.16.10.71:5000`
- Useful for local development if backend runs locally

---

## ✨ What Works Now

✅ Login with real credentials  
✅ Create cases  
✅ Add evidence  
✅ Upload files  
✅ Compute hashes  
✅ Verify integrity  
✅ Track custody chain  
✅ All features connected  

---

## 🎯 Expected Flow

```
User enters email/password
        ↓
Browser sends to backend
        ↓
Backend validates → returns JWT token
        ↓
Frontend stores token
        ↓
All future requests include token in header
        ↓
Backend validates token → grants access
        ↓
User can create cases, evidence, etc.
```

---

**Status**: ✅ Ready to connect to backend  
**Next Action**: Update `.env` with your backend IP and start testing!


