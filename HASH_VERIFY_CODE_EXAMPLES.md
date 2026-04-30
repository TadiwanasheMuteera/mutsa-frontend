# Hash Verification Page - Code Examples

## 📝 Common Implementation Examples

### 1. Adding to Your Router

#### React Router v6 Setup
```jsx
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HashVerifyPage from './pages/HashVerifyPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ... other routes ... */}
        <Route 
          path="/evidence/:evidenceId/verify-hash" 
          element={<HashVerifyPage />} 
        />
      </Routes>
    </BrowserRouter>
  )
}
```

### 2. Linking to the Page

#### From Evidence List
```jsx
import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'

export function EvidenceRow({ evidence }) {
  return (
    <tr>
      <td>{evidence.id}</td>
      <td>{evidence.description}</td>
      <td>
        <Link 
          to={`/evidence/${evidence.id}/verify-hash`}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <Lock size={16} />
          Verify Hash
        </Link>
      </td>
    </tr>
  )
}
```

#### From Evidence Detail Page
```jsx
import { useNavigate } from 'react-router-dom'

export function EvidenceDetail({ evidence }) {
  const navigate = useNavigate()
  
  return (
    <>
      <h1>{evidence.description}</h1>
      <button
        onClick={() => navigate(`/evidence/${evidence.id}/verify-hash`)}
        className="px-4 py-2 bg-accent text-white rounded-lg"
      >
        Verify Hash
      </button>
    </>
  )
}
```

### 3. Backend Endpoint Examples

#### Express.js Example
```javascript
// routes/evidence.js
import express from 'express'
import crypto from 'crypto'

const router = express.Router()

// GET evidence details
router.get('/:evidenceId', async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.evidenceId)
    
    // Include verification history
    const verifications = await Verification.find({
      evidenceId: req.params.evidenceId
    })
    
    res.json({
      id: evidence._id,
      caseId: evidence.caseId,
      description: evidence.description,
      hash: evidence.sha256Hash,
      collectionDate: evidence.collectedAt,
      collectedBy: evidence.collectedByName,
      verificationHistory: verifications.map(v => ({
        verificationDate: v.createdAt,
        verifiedBy: v.verifiedByName,
        result: v.result,
        computedHash: v.computedHash
      }))
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching evidence' })
  }
})

// POST verify hash
router.post('/:evidenceId/verify-hash', async (req, res) => {
  try {
    const { hash: computedHash } = req.body
    const evidence = await Evidence.findById(req.params.evidenceId)
    
    const isMatch = evidence.sha256Hash === computedHash
    
    // Record verification
    const verification = new Verification({
      evidenceId: req.params.evidenceId,
      computedHash,
      result: isMatch ? 'INTACT' : 'TAMPERED',
      verifiedByName: req.user.name,
      createdAt: new Date()
    })
    
    await verification.save()
    
    // Notify supervisor if tampered
    if (!isMatch) {
      await notifySupervisor({
        evidence: evidence.id,
        case: evidence.caseId,
        type: 'HASH_MISMATCH',
        severity: 'HIGH'
      })
    }
    
    res.json({
      status: isMatch ? 'INTACT' : 'TAMPERED',
      originalHash: evidence.sha256Hash,
      verifiedHash: computedHash,
      verificationDate: verification.createdAt,
      verifiedBy: req.user.name,
      message: isMatch 
        ? 'Hash matches original' 
        : 'Hash mismatch detected - file may be compromised'
    })
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR',
      message: 'Verification failed' 
    })
  }
})

export default router
```

#### Node.js/MongoDB Schema
```javascript
// models/Evidence.js
const mongoose = require('mongoose')

const evidenceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  caseId: { type: String, required: true },
  description: String,
  sha256Hash: { type: String, required: true },
  collectedAt: { type: Date, default: Date.now },
  collectedByName: String,
  collectedById: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// models/Verification.js
const verificationSchema = new mongoose.Schema({
  evidenceId: mongoose.Schema.Types.ObjectId,
  computedHash: String,
  result: { type: String, enum: ['INTACT', 'TAMPERED'] },
  verifiedByName: String,
  verifiedById: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now }
})
```

### 4. Custom Hook for Hash Verification

```jsx
// hooks/useHashVerification.js
import { useCallback, useState } from 'react'

export function useHashVerification() {
  const [isComputing, setIsComputing] = useState(false)
  const [error, setError] = useState(null)
  
  const computeSHA256 = useCallback(async (file) => {
    setIsComputing(true)
    setError(null)
    
    try {
      // Validate file
      if (!file) throw new Error('No file provided')
      if (file.size === 0) throw new Error('File is empty')
      
      // Read file as ArrayBuffer
      const buffer = await file.arrayBuffer()
      
      // Compute SHA-256
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
      
      // Convert to hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')
      
      setIsComputing(false)
      return hashHex
    } catch (err) {
      setError(err.message)
      setIsComputing(false)
      throw err
    }
  }, [])
  
  return { computeSHA256, isComputing, error }
}

// Usage in component
function MyComponent() {
  const { computeSHA256, isComputing } = useHashVerification()
  
  const handleFile = async (file) => {
    const hash = await computeSHA256(file)
    console.log('SHA-256:', hash)
  }
  
  return (
    // ... component JSX ...
  )
}
```

### 5. Testing Example

```jsx
// __tests__/HashVerifyPage.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import HashVerifyPage from '../HashVerifyPage'

const queryClient = new QueryClient()

const Wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </QueryClientProvider>
)

describe('HashVerifyPage', () => {
  it('renders the page header', () => {
    render(<HashVerifyPage />, { wrapper: Wrapper })
    expect(screen.getByText(/Evidence Integrity Verification/i)).toBeInTheDocument()
  })
  
  it('displays file upload area', () => {
    render(<HashVerifyPage />, { wrapper: Wrapper })
    expect(screen.getByText(/Drag and drop/i)).toBeInTheDocument()
    expect(screen.getByText(/Browse Files/i)).toBeInTheDocument()
  })
  
  it('handles file selection', () => {
    render(<HashVerifyPage />, { wrapper: Wrapper })
    const input = screen.getByDisplayValue('file')
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    
    fireEvent.change(input, { target: { files: [file] } })
    expect(screen.getByText('test.txt')).toBeInTheDocument()
  })
})
```

### 6. Integration with Existing Components

#### Using with Dashboard
```jsx
// pages/DashboardPage.jsx
import HashVerifyPage from './HashVerifyPage'
import EvidenceList from '../components/EvidenceList'

export function DashboardPage() {
  const [selectedEvidence, setSelectedEvidence] = useState(null)
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <EvidenceList onSelect={setSelectedEvidence} />
      </div>
      <div>
        {selectedEvidence && (
          <HashVerifyPage />
        )}
      </div>
    </div>
  )
}
```

#### Using with Case Detail
```jsx
// pages/CaseDetailPage.jsx
import { useParams, useNavigate } from 'react-router-dom'
import HashVerifyPage from './HashVerifyPage'

export function CaseDetailPage() {
  const { caseId } = useParams()
  const [showVerify, setShowVerify] = useState(false)
  const [evidenceId, setEvidenceId] = useState(null)
  
  if (showVerify && evidenceId) {
    return <HashVerifyPage initialEvidenceId={evidenceId} />
  }
  
  return (
    <>
      <h1>Case: {caseId}</h1>
      <EvidenceTable
        onVerify={(id) => {
          setEvidenceId(id)
          setShowVerify(true)
        }}
      />
    </>
  )
}
```

### 7. API Client Setup

```javascript
// api/axios.js
import axios from 'axios'

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Add auth token to requests
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default instance

// api/evidence.js (updated)
import axiosInstance from './axios'

export const evidenceAPI = {
  getEvidenceById: async (id) => {
    const response = await axiosInstance.get(`/evidence/${id}`)
    return response.data
  },
  
  verifyHash: async (evidenceId, hash) => {
    const response = await axiosInstance.post(
      `/evidence/${evidenceId}/verify-hash`,
      { hash }
    )
    return response.data
  }
}
```

### 8. Environmental Configuration

```javascript
// .env.example
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=development
REACT_APP_MAX_FILE_SIZE=5000000000

// .env.production
REACT_APP_API_URL=https://api.production.com
REACT_APP_ENV=production
```

### 9. Error Boundary Wrapper

```jsx
// components/HashVerifyErrorBoundary.jsx
import { Component } from 'react'
import { AlertCircle } from 'lucide-react'

export class HashVerifyErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600" size={24} />
            <div>
              <h2 className="font-semibold text-red-900">
                Error Loading Hash Verification
              </h2>
              <p className="text-red-700 text-sm">
                {this.state.error?.message}
              </p>
            </div>
          </div>
        </div>
      )
    }
    
    return this.props.children
  }
}

// Usage
<HashVerifyErrorBoundary>
  <HashVerifyPage />
</HashVerifyErrorBoundary>
```

### 10. Exporting Verification Results

```jsx
// utils/exportVerification.js
import { jsPDF } from 'jspdf'
import { format } from 'date-fns'

export async function exportVerificationReport(evidence, result) {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(16)
  doc.text('Evidence Verification Report', 20, 20)
  
  // Evidence Details
  doc.setFontSize(12)
  doc.text(`Evidence ID: ${evidence.id}`, 20, 40)
  doc.text(`Case ID: ${evidence.caseId}`, 20, 50)
  doc.text(`Description: ${evidence.description}`, 20, 60)
  
  // Result
  doc.setFontSize(14)
  const statusColor = result.status === 'INTACT' ? [16, 185, 129] : [220, 38, 38]
  doc.setTextColor(...statusColor)
  doc.text(
    `Status: ${result.status}`,
    20,
    80
  )
  
  // Hashes
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.text('Original Hash:', 20, 100)
  doc.text(result.originalHash, 20, 110, { maxWidth: 170 })
  
  doc.text('Computed Hash:', 20, 130)
  doc.text(result.verifiedHash, 20, 140, { maxWidth: 170 })
  
  // Timestamp
  doc.text(
    `Verified: ${format(new Date(result.verificationDate), 'PPpp')}`,
    20,
    160
  )
  doc.text(`By: ${result.verifiedBy}`, 20, 170)
  
  // Save
  doc.save(`evidence-verification-${evidence.id}.pdf`)
}
```

---

## 🔍 Debugging Tips

### Enable Console Logging
```javascript
// In HashVerifyPage.jsx, add during development:

const computeSHA256 = async (file) => {
  setComputingHash(true)
  console.log('📁 Computing hash for:', file.name, file.size)
  
  try {
    const buffer = await file.arrayBuffer()
    console.log('✅ File read as buffer:', buffer.byteLength, 'bytes')
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    console.log('✅ Hash computed:', hashBuffer)
    
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    console.log('✅ Hash (hex):', hashHex)
    setComputingHash(false)
    return hashHex
  } catch (error) {
    console.error('❌ Hash computation error:', error)
    setComputingHash(false)
    throw error
  }
}
```

### Network Monitoring
```javascript
// Check API calls in browser DevTools:
// 1. Open Network tab
// 2. Look for POST to /evidence/:id/verify-hash
// 3. Inspect request body and response
// 4. Verify response status is 200 and includes all required fields
```

### Component State Debugging
```javascript
// Use React DevTools to inspect:
// 1. evidenceId from URL params
// 2. selectedFile state
// 3. verificationResult state
// 4. Query states (loading, error, data)
```

---

## 📦 Complete Example Project Structure

```
src/
├── pages/
│   ├── HashVerifyPage.jsx          ← Main component
│   ├── EvidencePage.jsx
│   ├── CaseDetailPage.jsx
│   └── DashboardPage.jsx
├── components/
│   ├── layout/
│   │   └── Layout.jsx
│   └── ui/
│       ├── Spinner.jsx
│       ├── HashBadge.jsx
│       ├── Modal.jsx
│       └── Badge.jsx
├── api/
│   ├── axios.js
│   ├── evidence.js                 ← Evidence API
│   ├── custody.js                  ← Custody API
│   └── cases.js
├── hooks/
│   └── useHashVerification.js      ← Custom hook (optional)
├── utils/
│   ├── exportVerification.js       ← Export functionality (optional)
│   └── formatters.js
├── App.jsx
└── main.jsx
```

---

**Ready to integrate!** Follow the examples above for your specific use case.
