# Auth API Client Methods - Complete Reference

## Overview

All authentication methods are in `src/api/auth.js`. They follow the backend response format: `{ success, data, message }`.

---

## 📋 Methods Reference

### 1. Login

**Endpoint**: `POST /api/auth/login`

**Usage**:
```javascript
import { authAPI } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

const { accessToken, refreshToken, user } = await authAPI.login(
  'user@example.com',
  'password123'
)

// Store tokens and user
useAuthStore.getState().setAuth(accessToken, refreshToken, user)
```

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "investigator"
    }
  },
  "message": "Login successful"
}
```

**Returns**:
```javascript
{
  accessToken: "eyJhbGc...",
  refreshToken: "eyJhbGc...",
  user: {...}
}
```

**Error Handling**:
```javascript
try {
  await authAPI.login(email, password)
} catch (error) {
  const message = error.response?.data?.message // "Invalid credentials"
  // Show to user
}
```

---

### 2. Register

**Endpoint**: `POST /api/auth/register`

**Usage**:
```javascript
const { accessToken, refreshToken, user } = await authAPI.register({
  employee_number: '12345',
  full_name: 'John Doe',
  email: 'john@example.com',
  phone: '555-1234',      // optional
  role: 'investigator',   // optional
  password: 'SecurePass123'
})

useAuthStore.getState().setAuth(accessToken, refreshToken, user)
```

**Request**:
```json
{
  "employee_number": "12345",
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "role": "investigator",
  "password": "SecurePass123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "user": {...}
  },
  "message": "Registration successful"
}
```

**Returns**:
```javascript
{
  accessToken: "eyJhbGc...",
  refreshToken: "eyJhbGc...",
  user: {...}
}
```

---

### 3. Refresh Token

**Endpoint**: `POST /api/auth/refresh`

**Usage**:
```javascript
const { accessToken } = await authAPI.refreshToken(refreshToken)

// Update access token
useAuthStore.getState().setAccessToken(accessToken)
```

**Request**:
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Header**:
```
Authorization: Bearer <refresh_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc..."
  },
  "message": "Token refreshed"
}
```

**Returns**:
```javascript
{
  accessToken: "eyJhbGc..."
}
```

**Note**: Automatically called by axios interceptor when access_token expires (401 error).

---

### 4. Get Current User

**Endpoint**: `GET /api/auth/me`

**Usage**:
```javascript
const user = await authAPI.getCurrentUser()

console.log(user)
// {
//   id: "user_123",
//   employee_number: "12345",
//   full_name: "John Doe",
//   email: "john@example.com",
//   phone: "555-1234",
//   role: "investigator",
//   is_active: true
// }
```

**Header**:
```
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "employee_number": "12345",
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "555-1234",
      "role": "investigator",
      "is_active": true
    }
  },
  "message": "User profile retrieved"
}
```

**Returns**:
```javascript
{
  id: "user_123",
  employee_number: "12345",
  full_name: "John Doe",
  email: "john@example.com",
  phone: "555-1234",
  role: "investigator",
  is_active: true
}
```

---

### 5. Change Password

**Endpoint**: `PUT /api/auth/change-password`

**Usage**:
```javascript
const result = await authAPI.changePassword(
  'oldPassword123',
  'newPassword456'
)

if (result.success) {
  console.log('Password changed successfully')
  // Show success message
}
```

**Request**:
```json
{
  "current_password": "oldPassword123",
  "new_password": "newPassword456"
}
```

**Header**:
```
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "success": true,
  "data": {},
  "message": "Password changed successfully"
}
```

**Returns**:
```javascript
{
  success: true,
  message: "Password changed successfully"
}
```

**Error Handling**:
```javascript
try {
  await authAPI.changePassword(currentPassword, newPassword)
} catch (error) {
  const message = error.response?.data?.message 
  // "Current password is incorrect"
  // "New password must be different from current password"
  // "Password does not meet requirements"
}
```

---

### 6. Logout

**Endpoint**: `POST /api/auth/logout`

**Usage**:
```javascript
import { useAuthStore } from '@/store/authStore'

// Call API logout
await authAPI.logout()

// Clear local storage
useAuthStore.getState().logout()

// Redirect to login
window.location.href = '/login'
```

**Header**:
```
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "success": true,
  "data": {},
  "message": "Logged out successfully"
}
```

**Returns**:
```javascript
{
  success: true,
  message: "Logged out successfully"
}
```

**Note**: Frontend automatically logs out locally even if API fails.

---

## 🔐 Authentication Flow

### Login Flow
```javascript
// 1. User submits email/password
const { accessToken, refreshToken, user } = await authAPI.login(email, password)

// 2. Store tokens
useAuthStore.getState().setAuth(accessToken, refreshToken, user)

// 3. Redirect to dashboard
navigate('/dashboard')

// 4. All future requests auto-include:
// Authorization: Bearer <accessToken>
```

### Token Refresh Flow
```javascript
// 1. Make API request
GET /api/cases

// 2. If 401 error:
// axios interceptor detects 401

// 3. Auto-refresh token
const { accessToken } = await authAPI.refreshToken(refreshToken)

// 4. Update store
useAuthStore.getState().setAccessToken(accessToken)

// 5. Retry original request
// GET /api/cases (with new token)

// 6. If refresh fails → logout
```

---

## 📝 Usage Examples

### Example 1: Login Page Component

```javascript
import { useState } from 'react'
import { authAPI } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    
    try {
      const { accessToken, refreshToken, user } = await authAPI.login(
        email,
        password
      )
      setAuth(accessToken, refreshToken, user)
      navigate('/dashboard')
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleLogin() }}>
      {error && <div className="error">{error}</div>}
      <input 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

### Example 2: Change Password Modal

```javascript
import { useState } from 'react'
import { authAPI } from '@/api/auth'

export function ChangePasswordModal() {
  const [current, setCurrent] = useState('')
  const [newPass, setNewPass] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async () => {
    setMessage('')
    setError('')
    setLoading(true)

    try {
      const result = await authAPI.changePassword(current, newPass)
      setMessage(result.message)
      setCurrent('')
      setNewPass('')
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
      
      <input
        type="password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        placeholder="Current Password"
      />
      
      <input
        type="password"
        value={newPass}
        onChange={(e) => setNewPass(e.target.value)}
        placeholder="New Password"
      />
      
      <button onClick={handleChangePassword} disabled={loading}>
        {loading ? 'Updating...' : 'Change Password'}
      </button>
    </div>
  )
}
```

### Example 3: Get User Profile

```javascript
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authAPI } from '@/api/auth'

export function ProfilePage() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => authAPI.getCurrentUser()
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>{user.full_name}</h1>
      <p>Email: {user.email}</p>
      <p>Employee #: {user.employee_number}</p>
      <p>Phone: {user.phone}</p>
      <p>Role: {user.role}</p>
      <p>Active: {user.is_active ? 'Yes' : 'No'}</p>
    </div>
  )
}
```

---

## 🚀 With React Query (useMutation)

```javascript
import { useMutation } from '@tanstack/react-query'
import { authAPI } from '@/api/auth'

const loginMutation = useMutation({
  mutationFn: ({ email, password }) => authAPI.login(email, password),
  onSuccess: (data) => {
    useAuthStore.getState().setAuth(
      data.accessToken,
      data.refreshToken,
      data.user
    )
    navigate('/dashboard')
  },
  onError: (error) => {
    showError(error.response?.data?.message)
  }
})

return <button onClick={() => loginMutation.mutate({ email, password })}>
  {loginMutation.isPending ? 'Logging in...' : 'Login'}
</button>
```

---

## ⚠️ Error Handling

### Expected Errors

```javascript
// 400 Bad Request
{
  "success": false,
  "data": null,
  "message": "Email is required"
}

// 401 Unauthorized (auto-refreshed by interceptor)
{
  "success": false,
  "data": null,
  "message": "Invalid credentials"
}

// 409 Conflict
{
  "success": false,
  "data": null,
  "message": "Email already registered"
}
```

### Handling Errors

```javascript
try {
  await authAPI.login(email, password)
} catch (error) {
  // Option 1: Show backend message
  const message = error.response?.data?.message
  showError(message) // "Invalid credentials"
  
  // Option 2: Show generic message
  showError('Login failed')
  
  // Option 3: Check specific errors
  if (error.response?.data?.message.includes('password')) {
    // Handle password error
  }
}
```

---

## 🔗 Related Files

- **Store**: `src/store/authStore.js` - Auth state management
- **Interceptor**: `src/api/axios.js` - Token refresh logic
- **Login Page**: `src/pages/LoginPage.jsx` - Example usage
- **Config**: `.env` - Backend URL

---

## ✅ Summary

| Method | Endpoint | Auth | Returns |
|--------|----------|------|---------|
| `login()` | POST /auth/login | No | accessToken, refreshToken, user |
| `register()` | POST /auth/register | No | accessToken, refreshToken, user |
| `refreshToken()` | POST /auth/refresh | Bearer | accessToken |
| `getCurrentUser()` | GET /auth/me | Bearer | user profile |
| `changePassword()` | PUT /auth/change-password | Bearer | success, message |
| `logout()` | POST /auth/logout | Bearer | success, message |

---

**All methods are production-ready and handle errors gracefully!** 🚀
