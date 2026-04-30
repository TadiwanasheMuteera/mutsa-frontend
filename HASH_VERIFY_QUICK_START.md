# Hash Verification Page - Quick Start Guide

## 🚀 Getting Started

### Location
```
src/pages/HashVerifyPage.jsx
```

### Usage in Router
```jsx
import HashVerifyPage from './pages/HashVerifyPage'

// In your router configuration:
<Route path="/evidence/:evidenceId/verify-hash" element={<HashVerifyPage />} />
```

## 🔧 Required Dependencies

All dependencies are already installed in `package.json`:

```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.24.0",
  "@tanstack/react-query": "^5.45.1",
  "lucide-react": "^0.408.0",
  "date-fns": "^3.6.0",
  "axios": "^1.7.2",
  "tailwindcss": "^3.4.4"
}
```

## 📋 API Endpoints Required

The component expects these backend endpoints:

### 1. Get Evidence Details
```
GET /evidence/:evidenceId
Response: {
  id: "EV-001",
  caseId: "CASE-2024-001",
  description: "Laptop disk image",
  hash: "sha256_hash_here",
  collectionDate: "2024-01-15T09:00:00Z",
  collectedBy: "Agent Smith",
  verificationHistory: [...]
}
```

### 2. Verify Hash
```
POST /evidence/:evidenceId/verify-hash
Request Body: {
  hash: "computed_sha256_hash"
}
Response: {
  status: "INTACT" | "TAMPERED" | "ERROR",
  originalHash: "stored_hash",
  verifiedHash: "computed_hash",
  verificationDate: "2024-01-20T10:15:00Z",
  verifiedBy: "Agent Jones",
  message: "optional_error_message"
}
```

## 🔗 Existing Component Dependencies

The page uses these existing components:

| Component | Path                          | Purpose              |
|-----------|-------------------------------|----------------------|
| Layout    | `components/layout/Layout`    | Page wrapper         |
| Spinner   | `components/ui/Spinner`       | Loading indicator    |
| HashBadge | `components/ui/HashBadge`     | Status badge (INTACT/TAMPERED) |

## 🎯 Main Features

### ✅ Implemented

1. **Evidence Details Display**
   - Shows evidence ID, case, description
   - Displays original hash with collection metadata

2. **File Upload**
   - Drag-and-drop support
   - Browse file picker
   - File info display (name, size)

3. **Client-Side SHA-256 Computation**
   - Uses Web Crypto API (`crypto.subtle.digest`)
   - No server-side hash computation needed
   - Async processing prevents UI blocking

4. **Verification Results**
   - INTACT: Green success panel with matching hashes
   - TAMPERED: Red warning panel with alert banner
   - ERROR: Yellow error panel with message

5. **Verification History**
   - Table of all past verifications
   - Columns: Date, Verified By, Result, Hash
   - Automatic updates after new verification

6. **Responsive Design**
   - Mobile: Single column
   - Tablet: Two columns
   - Desktop: Three columns with sticky sidebar

## 🔐 Security Features

- ✅ SHA-256 hashing (cryptographically secure)
- ✅ Client-side computation (file never sent for hashing)
- ✅ Read-only original hash display
- ✅ Tamper alerts with supervisor notification
- ✅ Complete verification audit trail

## 🎨 Styling

Uses **Tailwind CSS** with custom color scheme:

```javascript
// Success State
bg-green-50, border-green-200, text-green-900

// Tampered State
bg-red-50, border-red-200, text-red-900

// Info Sidebar
bg-blue-50, border-blue-200, text-blue-900

// Neutral
bg-gray-50, border-gray-200, text-gray-900
```

## 📊 Data Flow

```
Page Load
  ↓
useQuery: Fetch evidence by ID
useQuery: Fetch verification history
  ↓
Display evidence details & original hash
Display upload area
  ↓
User Action: Select/Upload file
  ↓
Compute SHA-256 (client-side)
  ↓
useMutation: Send hash to backend
  ↓
Backend: Compare hashes
  ↓
Display result (INTACT/TAMPERED/ERROR)
  ↓
Invalidate history query
  ↓
Update history table
```

## 🧪 Testing Guide

### Test Scenario 1: Matching File
1. Create a file (e.g., `test.txt`)
2. Note its SHA-256 hash
3. Navigate to `/evidence/{id}/verify-hash`
4. Upload the same file
5. ✅ Result should show INTACT

### Test Scenario 2: Modified File
1. Upload a file and compute hash (note the hash)
2. Modify the file (add/remove content)
3. Upload the modified file
4. ✅ Result should show TAMPERED with red alert

### Test Scenario 3: Large File
1. Create a 500MB+ file
2. Upload and verify
3. ✅ UI should remain responsive (async hashing)

### Test Scenario 4: Error Handling
1. Disconnect network after uploading
2. ✅ Should show ERROR state with message

## 🐛 Troubleshooting

### Hash Computation Error
**Issue**: "Error computing hash" message
- **Fix**: Ensure browser supports Web Crypto API (Chrome 37+, Firefox 34+, Safari 11+)
- **Debug**: Check console for `crypto.subtle` availability

### File Upload Stuck
**Issue**: "Computing Hash..." never completes
- **Fix**: File may be corrupted or extremely large (>2GB)
- **Debug**: Check browser memory and file system

### Verification Always Shows ERROR
**Issue**: Backend response error
- **Fix**: Check backend endpoint `/evidence/:id/verify-hash` is implemented
- **Debug**: Check network tab for response status and error message

### Styles Not Applied
**Issue**: Colors and layout look wrong
- **Fix**: Ensure Tailwind CSS is built and included
- **Debug**: Verify `tailwind.config.js` includes `src/` paths

## 📈 Performance Tips

1. **Large Files**: Hash computation is async, but 1GB+ files may take time
2. **Caching**: React Query caches evidence/history—browser back-button is instant
3. **Pagination**: For very long history, consider paginating the table
4. **Optimization**: Consider virtualizing history table if >1000 records

## 🔄 Future Enhancements

Potential improvements for consideration:

1. **Multiple Hash Algorithms**
   ```jsx
   // Support MD5, SHA-1, SHA-512, Blake3
   const [algorithm, setAlgorithm] = useState('SHA-256')
   ```

2. **Batch Verification**
   ```jsx
   // Upload multiple files at once
   // Compute hashes for all
   // Compare all against database
   ```

3. **Export Reports**
   ```jsx
   // Generate PDF with verification results
   // Include evidence details, hashes, timestamps
   ```

4. **Digital Signatures**
   ```jsx
   // Verify cryptographic signatures
   // Additional authenticity layer
   ```

5. **Advanced Analytics**
   ```jsx
   // Show trends in verification attempts
   // Flag suspicious patterns
   // Dashboard integration
   ```

## 📞 Support

For issues or questions:

1. Check the implementation docs: `HASH_VERIFY_IMPLEMENTATION.md`
2. Check the visual guide: `HASH_VERIFY_VISUAL_GUIDE.md`
3. Review browser console for errors
4. Verify backend endpoints are correctly implemented
5. Test with sample files from the test-fixtures directory

## ✨ Key Code Snippets

### Accessing the Page
```jsx
// Route setup
<Route path="/evidence/:id/verify-hash" element={<HashVerifyPage />} />

// Link to page
<Link to={`/evidence/${evidence.id}/verify-hash`}>
  Verify Hash
</Link>
```

### Manual Hash Verification
```jsx
const file = /* file from input */
const buffer = await file.arrayBuffer()
const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
const hashHex = Array.from(new Uint8Array(hashBuffer))
  .map(b => b.toString(16).padStart(2, '0'))
  .join('')
console.log('SHA-256:', hashHex)
```

### Backend Integration
```jsx
// Send hash to backend
const result = await custodyAPI.verifyHash(evidenceId, computedHash)
// Result includes: status, originalHash, verifiedHash, dates, user info
```

## 📄 Files Modified

- `src/pages/HashVerifyPage.jsx` - Main component (450+ lines)

## 📄 Documentation Created

- `HASH_VERIFY_IMPLEMENTATION.md` - Detailed technical docs
- `HASH_VERIFY_VISUAL_GUIDE.md` - UI/UX visual reference
- `HASH_VERIFY_QUICK_START.md` - This quick start guide

---

**Last Updated**: January 2024
**Component Status**: ✅ Production Ready
**Test Coverage**: Manual testing recommended
