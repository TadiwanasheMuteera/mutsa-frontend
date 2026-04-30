# New Evidence Form - Code Examples

## 📝 Table of Contents
1. Route Setup
2. Navigation Links
3. Backend Examples
4. Custom Hooks
5. Testing Examples
6. Integration Examples

---

## 1. Route Setup

### React Router v6
```jsx
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NewEvidencePage from './pages/NewEvidencePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ... other routes ... */}
        <Route 
          path="/cases/:caseId/evidence/new" 
          element={<NewEvidencePage />} 
        />
        {/* Alternatively, use nested routes */}
        <Route path="/cases/:caseId" element={<CaseDetailPage />}>
          <Route path="evidence/new" element={<NewEvidencePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

---

## 2. Navigation Links

### From Case Detail Page
```jsx
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

export function CaseDetailPage() {
  const { caseId } = useParams()
  
  return (
    <div>
      <h1>Case Details</h1>
      
      <Link 
        to={`/cases/${caseId}/evidence/new`}
        className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
      >
        <Plus size={20} />
        Register New Evidence
      </Link>
    </div>
  )
}
```

### From Evidence List Page
```jsx
export function EvidenceListPage() {
  const { caseId } = useParams()
  
  return (
    <div>
      <h1>Evidence Items</h1>
      
      <button 
        onClick={() => navigate(`/cases/${caseId}/evidence/new`)}
        className="btn btn-primary"
      >
        + Add Evidence
      </button>
    </div>
  )
}
```

### In Navigation Menu
```jsx
export function NavigationMenu({ caseId }) {
  return (
    <nav className="sidebar">
      <Link to={`/cases/${caseId}`}>Case Details</Link>
      <Link to={`/cases/${caseId}/evidence`}>Evidence</Link>
      <Link to={`/cases/${caseId}/evidence/new`} className="highlight">
        📋 New Evidence
      </Link>
    </nav>
  )
}
```

---

## 3. Backend Examples

### Express.js Implementation

```javascript
// routes/cases.js
import express from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()
const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 * 1024 } })

// POST /cases/:caseId/evidence
router.post('/:caseId/evidence', upload.single('file'), async (req, res) => {
  try {
    const { caseId } = req.params
    const {
      description,
      type,
      source,
      collectionDate,
      collectionLocation,
      collectedBy,
      notes,
      hash,
    } = req.body

    // Validate required fields
    if (!description || !type || !source || !collectionDate || !collectionLocation) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Create evidence record
    const evidence = new Evidence({
      id: uuidv4(),
      caseId,
      description,
      type,
      source,
      collectionDate: new Date(collectionDate),
      collectionLocation,
      collectedBy,
      notes,
      hash, // SHA-256 from client
      fileId: req.file?.filename,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await evidence.save()

    // Initialize chain of custody
    await ChainOfCustody.create({
      evidenceId: evidence.id,
      action: 'COLLECTED',
      location: collectionLocation,
      handledBy: collectedBy,
      timestamp: new Date(collectionDate),
      notes: `Evidence collected. Hash: ${hash}`,
    })

    res.status(201).json({
      id: evidence.id,
      message: 'Evidence registered successfully',
      success: true,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error creating evidence', error: error.message })
  }
})

// GET /cases/:caseId
router.get('/:caseId', async (req, res) => {
  try {
    const { caseId } = req.params
    const caseData = await Case.findById(caseId)

    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' })
    }

    res.json(caseData)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching case' })
  }
})

// POST /evidence/:caseId/upload (optional separate endpoint)
router.post('/upload/:caseId', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' })
    }

    res.json({
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    })
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' })
  }
})

export default router
```

### MongoDB Schema
```javascript
// models/Evidence.js
const mongoose = require('mongoose')

const evidenceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  caseId: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['Digital File', 'Physical Item', 'Screenshot', 'Transaction Log', 'Device', 'Other'], required: true },
  source: { type: String, required: true },
  collectionDate: { type: Date, required: true },
  collectionLocation: { type: String, required: true },
  collectedBy: { type: String, required: true },
  notes: String,
  hash: { type: String, required: true }, // SHA-256
  fileId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Evidence', evidenceSchema)

// models/ChainOfCustody.js
const chainOfCustodySchema = new mongoose.Schema({
  evidenceId: { type: String, required: true },
  action: { type: String, enum: ['COLLECTED', 'TRANSFERRED', 'ANALYZED', 'ARCHIVED'], required: true },
  location: String,
  handledBy: String,
  timestamp: { type: Date, required: true },
  notes: String,
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('ChainOfCustody', chainOfCustodySchema)
```

---

## 4. Custom Hooks

### useEvidenceForm Hook
```jsx
// hooks/useEvidenceForm.js
import { useCallback, useState } from 'react'

export function useEvidenceForm() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [computedHash, setComputedHash] = useState(null)
  const [isComputingHash, setIsComputingHash] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const computeSHA256 = useCallback(async (file) => {
    setIsComputingHash(true)
    try {
      const buffer = await file.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      setComputedHash(hashHex)
      return hashHex
    } catch (error) {
      console.error('Hash computation error:', error)
      throw error
    } finally {
      setIsComputingHash(false)
    }
  }, [])

  const handleFileSelect = useCallback((file) => {
    if (file) {
      setSelectedFile(file)
      computeSHA256(file)
    }
  }, [computeSHA256])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0])
      }
    },
    [handleFileSelect]
  )

  const clearFile = useCallback(() => {
    setSelectedFile(null)
    setComputedHash(null)
  }, [])

  return {
    selectedFile,
    computedHash,
    isComputingHash,
    isDragging,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearFile,
  }
}

// Usage
export function NewEvidencePage() {
  const {
    selectedFile,
    computedHash,
    isComputingHash,
    isDragging,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearFile,
  } = useEvidenceForm()

  // ... rest of component
}
```

---

## 5. Testing Examples

### Jest Unit Tests
```jsx
// __tests__/NewEvidencePage.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import NewEvidencePage from '../pages/NewEvidencePage'

const queryClient = new QueryClient()

const Wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </QueryClientProvider>
)

describe('NewEvidencePage', () => {
  it('renders the form', () => {
    render(<NewEvidencePage />, { wrapper: Wrapper })
    expect(screen.getByText(/Register New Evidence/i)).toBeInTheDocument()
  })

  it('displays all required fields', () => {
    render(<NewEvidencePage />, { wrapper: Wrapper })
    expect(screen.getByLabelText(/Evidence Description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Evidence Type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Source/i)).toBeInTheDocument()
  })

  it('shows validation error for empty required field', async () => {
    render(<NewEvidencePage />, { wrapper: Wrapper })
    const submitButton = screen.getByRole('button', { name: /Register Evidence/i })
    
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument()
    })
  })

  it('computes hash for selected file', async () => {
    render(<NewEvidencePage />, { wrapper: Wrapper })
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const input = screen.getByDisplayValue('file')
    
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText(/Computing hash/i)).toBeInTheDocument()
    })
    
    await waitFor(() => {
      expect(screen.queryByText(/Computing hash/i)).not.toBeInTheDocument()
    })
  })

  it('requires chain of custody agreement', async () => {
    render(<NewEvidencePage />, { wrapper: Wrapper })
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText(/Evidence Description/i), {
      target: { value: 'Test description' },
    })
    
    // Try to submit without agreement
    const submitButton = screen.getByRole('button', { name: /Register Evidence/i })
    fireEvent.click(submitButton)
    
    expect(submitButton).toBeDisabled()
  })
})
```

---

## 6. Integration Examples

### With Toast Notifications
```jsx
import { toast } from 'react-toastify'

const createMutation = useMutation({
  mutationFn: (data) => {
    // ... create evidence
  },
  onSuccess: () => {
    toast.success('Evidence registered successfully!')
    navigate(`/cases/${caseId}`)
  },
  onError: (error) => {
    toast.error(error.response?.data?.message || 'Failed to register evidence')
  },
})
```

### With Loading Toast
```jsx
const createMutation = useMutation({
  mutationFn: async (data) => {
    const toastId = toast.loading('Registering evidence...')
    try {
      const result = await evidenceAPI.createEvidence(caseId, data)
      toast.dismiss(toastId)
      return result
    } catch (error) {
      toast.dismiss(toastId)
      throw error
    }
  },
})
```

### With Error Toast
```jsx
const createMutation = useMutation({
  mutationFn: (data) => evidenceAPI.createEvidence(caseId, data),
  onError: (error) => {
    const errorMsg = error.response?.data?.message || 'Failed to register evidence'
    toast.error(errorMsg, {
      autoClose: 5000,
      closeButton: true,
    })
  },
})
```

### With Analytics Tracking
```jsx
const createMutation = useMutation({
  mutationFn: (data) => {
    analytics.trackEvent('evidence_form_submitted', {
      evidenceType: data.evidenceType,
      hasFile: !!selectedFile,
      timestamp: new Date(),
    })
    return evidenceAPI.createEvidence(caseId, data)
  },
})
```

### With Error Boundary
```jsx
import { Component } from 'react'

export class NewEvidenceErrorBoundary extends Component {
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
          <h2 className="font-semibold text-red-900">Error Loading Form</h2>
          <p className="text-red-700">{this.state.error?.message}</p>
        </div>
      )
    }

    return this.props.children
  }
}

// Usage
<NewEvidenceErrorBoundary>
  <NewEvidencePage />
</NewEvidenceErrorBoundary>
```

---

## 7. Advanced Patterns

### Form with Conditional Fields
```jsx
const evidenceType = watch('evidenceType')

return (
  <>
    {/* ... base fields ... */}
    
    {evidenceType === 'Digital File' && (
      <div>
        <label>File Hash Algorithm</label>
        <select {...register('hashAlgorithm')}>
          <option>SHA-256</option>
          <option>SHA-512</option>
          <option>MD5</option>
        </select>
      </div>
    )}
    
    {evidenceType === 'Physical Item' && (
      <div>
        <label>Physical Dimensions</label>
        <input {...register('dimensions')} />
      </div>
    )}
  </>
)
```

### Form with Dynamic Validation
```jsx
const source = watch('source')

return (
  <input
    {...register('source', {
      required: 'Source is required',
      validate: (value) => {
        if (value.includes('warrant')) {
          return true // Valid
        }
        return 'Source must reference warrant or legal authority'
      },
    })}
  />
)
```

### Form with Auto-save
```jsx
import { useDebouncedCallback } from 'use-debounce'

const watchAllFields = watch()

const debouncedSave = useDebouncedCallback((data) => {
  localStorage.setItem('evidenceFormDraft', JSON.stringify(data))
}, 2000)

useEffect(() => {
  debouncedSave(watchAllFields)
}, [watchAllFields, debouncedSave])
```

---

**Code Examples Version**: 1.0.0  
**Last Updated**: January 2024  
**Status**: ✅ Production Ready
