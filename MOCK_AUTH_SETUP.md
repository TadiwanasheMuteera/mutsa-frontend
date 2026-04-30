# Mock Authentication Setup - Frontend Testing

## Overview
The frontend now includes mock authentication that allows you to test all pages without a backend server. This is perfect for UI/UX testing and development.

## How It Works

### Mock Auth Configuration
- **File**: `src/api/mockAuth.js` - Contains demo users and mock API responses
- **Status**: Automatically enabled when backend is not available
- **Fallback**: Automatically uses real backend when backend is running

### Demo Credentials

Three demo accounts are available:

1. **Investigator**
   - Email: `demo@example.com`
   - Password: `demo123`
   - Role: Investigator

2. **Administrator**
   - Email: `admin@example.com`
   - Password: `admin123`
   - Role: Administrator

3. **Agent**
   - Email: `agent@example.com`
   - Password: `agent123`
   - Role: Agent

## Quick Start

1. **Start the frontend**
   ```bash
   npm run dev
   ```

2. **Go to login page**
   ```
   http://localhost:5173/
   ```

3. **Click any demo button** or manually enter credentials
   - The login form shows all demo accounts as quick-login buttons
   - Just click a button to auto-fill and login

4. **Explore all pages**
   - Dashboard
   - Cases
   - Evidence
   - New Evidence Form
   - Hash Verification
   - Case Details
   - All other pages

## Features

✅ **Mock Authentication**
- Demo login credentials
- Quick-login buttons
- Auto-filled form
- Session persistence

✅ **Mock API Responses**
- Simulated network delays
- Error handling
- Token management

✅ **Easy Toggle**
- Automatic fallback to real backend
- No configuration needed
- Just delete/disable when backend is ready

## Switching to Real Backend

### When Backend is Ready:

**Option 1: Disable Mock Auth**
```javascript
// In src/api/auth.js
const USE_MOCK = false  // Change from true to false
```

**Option 2: Remove Mock Files**
```bash
rm src/api/mockAuth.js
```

Then revert `src/api/auth.js` to use only axios:
```javascript
import axiosInstance from './axios'

export const authAPI = {
  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { email, password })
    return response.data
  },
  // ... rest of endpoints
}
```

## Features Supported in Mock Mode

✅ Login/Logout  
✅ User session persistence (localStorage)  
✅ Role-based access (basic)  
✅ Navigation between all pages  
✅ Form submissions (don't actually save)  
✅ File uploads (simulated)  
✅ All UI features  

## Features Not Supported in Mock Mode

❌ Actual data persistence  
❌ Backend calculations  
❌ Real file uploads  
❌ Database queries  
❌ Email notifications  

## Testing All Pages

Once logged in, you can navigate to:

1. **Dashboard** (`/dashboard`)
   - Overview of cases and evidence
   - Recent activity

2. **Cases** (`/cases`)
   - List of all cases
   - Create new case
   - View case details

3. **Evidence** (`/evidence`)
   - List of all evidence
   - Register new evidence

4. **New Evidence Form** (`/cases/:caseId/evidence/new`)
   - Complete form with:
     - File upload (mock)
     - SHA-256 hash computation
     - Date/time selection
     - All form fields

5. **Hash Verification** (`/evidence/:evidenceId/verify-hash`)
   - SHA-256 verification
   - Mock hash comparison
   - Verification history

6. **Case Detail** (`/cases/:caseId`)
   - Full case information
   - Associated evidence
   - Custody timeline

## Mock Data

Default mock data is generated on login. Each demo user gets:
- Unique ID
- Display name
- Email
- Role

Mock data is stored in Zustand store (localStorage) and persists across page refreshes.

## Environment Variables

To control mock behavior, you can set in `.env`:

```env
# Use mock auth (default: true)
VITE_USE_MOCK_AUTH=true

# Backend URL (when ready)
VITE_API_URL=http://172.16.10.71:5000/api
```

## Implementation Details

### File: `src/api/mockAuth.js`
- Contains `mockAuthAPI` object with all auth methods
- Contains `DEMO_CREDENTIALS` array for quick-login buttons
- Simulates network delays (300-800ms)
- Returns properly formatted responses

### File: `src/api/auth.js`
- Uses mock API when `USE_MOCK === true`
- Falls back to axios when mock is disabled
- Maintains same interface for both

### File: `src/pages/LoginPage.jsx`
- Shows demo credential buttons
- Quick-login functionality
- Information about mock mode

## Troubleshooting

### "Still getting connection refused error"
1. Hard refresh the page (Ctrl+Shift+R)
2. Clear browser cache
3. Check if mockAuth.js is imported correctly

### "Login not working"
1. Verify exact email/password (case-sensitive)
2. Check browser console for errors
3. Try a different demo account

### "Page not loading after login"
1. Ensure mock auth is enabled
2. Check browser console for errors
3. Verify all routes are configured

## Cleanup

When backend is ready:

1. **Delete mock auth file**
   ```bash
   rm src/api/mockAuth.js
   ```

2. **Update auth.js**
   ```javascript
   // Remove mock imports and USE_MOCK check
   // Keep only axios calls
   ```

3. **Remove demo buttons from LoginPage.jsx**
   ```javascript
   // Remove DEMO_CREDENTIALS import
   // Remove demo credential buttons section
   ```

4. **Test with real backend**
   ```bash
   # Start backend server
   npm run dev  # in backend folder
   
   # Start frontend
   npm run dev  # in frontend folder
   ```

## Support

All frontend pages are fully functional in mock mode. Once backend is available, simply switch to real auth and everything continues to work with actual data persistence.

---

**Mock Auth Status**: ✅ Enabled and Ready
**Backend Status**: ❌ Not Connected (Using Mock)
**When Backend Ready**: Simply disable mock or delete mockAuth.js


