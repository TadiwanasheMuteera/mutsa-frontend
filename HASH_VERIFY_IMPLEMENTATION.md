# Hash Verification Page Implementation

## Overview
The Hash Verification Page (`src/pages/HashVerifyPage.jsx`) is a comprehensive React component that allows investigators to verify the integrity of digital evidence files by computing SHA-256 hashes client-side and comparing them with original stored hashes.

## Features

### 1. **Page Header with Evidence Details**
- Displays page title: "Evidence Integrity Verification"
- Shows evidence item ID, associated case, and description
- Positioned at the top for quick reference

### 2. **Original Hash Panel (Read-only)**
- Shows the original SHA-256 hash stored at evidence collection time
- Green "Sealed Record" visual indicator with lock icon
- Displays collection date and who collected the evidence
- Prevents any modification to maintain chain-of-custody integrity

### 3. **File Upload Area**
- **Drag-and-Drop Support**: Users can drag files directly onto the zone
- **Click to Browse**: Traditional file picker alternative
- **File Info Display**: Shows selected file name and size (in MB)
- **Responsive Visual Feedback**: Highlights on drag-over with accent color
- **Clear Button**: Remove selected file and reset verification

### 4. **Client-Side Hash Computation**
- Uses **Web Crypto API** (SubtleCrypto) for SHA-256 computation
- Processes files entirely on the client for security and privacy
- No file upload to backend until verification is triggered
- Converts hash buffer to hexadecimal format for comparison
- Displays "Computing Hash..." status during computation

### 5. **Verification Result Panels**

#### INTACT Result (Hash Match)
- Large **green checkmark icon** (CheckCircle2)
- Prominent heading: "HASH MATCH — Evidence Integrity Confirmed"
- Side-by-side hash comparison (both identical, green highlighting)
- Timestamp of verification
- Verifier name/ID
- Confirmation message

#### TAMPERED Result (Hash Mismatch)
- Large **red warning icon** (AlertTriangle)
- Prominent heading: "HASH MISMATCH — Evidence May Be Compromised"
- **Red alert banner** with supervisor notification message
- Original hash displayed in green (good)
- Computed hash displayed in red, bold highlighting (compromised)
- Clear visual distinction between the two hashes
- Timestamp and verifier information

#### ERROR Result
- **Yellow alert** for system errors
- Error message display
- Non-critical failure state

### 6. **Verification History Table**
- Lists all past verifications for the evidence item
- **Columns**:
  - **Date**: Formatted verification date and time
  - **Verified By**: Name/ID of the verifier
  - **Result**: INTACT/TAMPERED status badge (color-coded)
  - **Hash**: First 16 characters of computed hash (truncated with ellipsis)
- Hover effects for better UX
- Responsive design with horizontal scroll on mobile

### 7. **Information Sidebar**
- **Verification Process**: Step-by-step instructions (numbered 1-4)
- **Hash Algorithm**: SHA-256 with Web Crypto API notation
- **Status Legend**: Quick reference for INTACT and TAMPERED states
- Sticky positioning for easy reference while scrolling
- Blue informational styling

## Technical Implementation

### State Management
```javascript
- evidenceId: From URL params (useParams)
- selectedFile: Currently selected file for verification
- isDragging: Drag-over state for visual feedback
- verificationResult: Result of hash verification (null, INTACT, TAMPERED, ERROR)
- computingHash: Loading state during SHA-256 computation
```

### API Integration
- **evidenceAPI.getEvidenceById()**: Fetches evidence details and stored hash
- **custodyAPI.verifyHash()**: Sends computed hash to backend for comparison
- **React Query**: Handles data fetching with caching and invalidation

### SHA-256 Hash Computation
```javascript
const computeSHA256 = async (file) => {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}
```
- Converts file to ArrayBuffer
- Uses `crypto.subtle.digest()` for SHA-256
- Returns lowercase hexadecimal string

### Event Handlers
- **handleDragOver**: Shows visual feedback for drag-over
- **handleDragLeave**: Removes drag-over highlighting
- **handleDrop**: Processes dropped files
- **handleBrowseClick**: Opens file picker
- **handleFileInputChange**: Processes selected files from picker
- **handleComputeAndVerify**: Orchestrates hash computation and verification

### Data Flow
1. User selects/uploads file
2. `handleFileSelect()` stores file in state
3. User clicks "Compute & Verify"
4. `computeSHA256()` computes hash client-side
5. `verifyMutation()` sends computed hash to backend
6. Backend compares with stored hash and returns result
7. Result displayed in appropriate panel (INTACT/TAMPERED/ERROR)
8. Verification history refreshed via `queryClient.invalidateQueries()`

## Styling

### Colors
- **Green**: Original hash, INTACT result (#10b981 - accent green)
- **Red**: Mismatch, TAMPERED result (#dc2626 - error red)
- **Blue**: Information panels and sidebar (#3b82f6 - info blue)
- **Gray**: Default text, borders, backgrounds

### Components Used
- **Tailwind CSS**: Utility-first styling
- **Lucide React Icons**:
  - `CheckCircle2`: Success indicator
  - `AlertTriangle`: Warning/error indicator
  - `Lock`: Sealed record indicator
  - `Upload`: File upload icon
  - `FileUp`: Upload area icon
  - `Clock`: Timestamp indicator
  - `User`: Verifier indicator
  - `AlertCircle`: General alerts

### Responsive Design
- **Mobile**: Single column layout, full-width elements
- **Tablet**: Two-column layout with sidebar
- **Desktop**: Three-column grid with sticky sidebar

## Browser Support
- Requires **Web Crypto API** support (all modern browsers)
- Tested on: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- IE11 not supported (uses modern JS features)

## File Structure
```
src/
├── pages/
│   └── HashVerifyPage.jsx
├── components/
│   ├── layout/
│   │   └── Layout.jsx
│   └── ui/
│       ├── Spinner.jsx
│       └── HashBadge.jsx
├── api/
│   ├── custody.js
│   └── evidence.js
```

## Dependencies
- **react**: UI framework
- **react-router-dom**: URL parameter access (useParams)
- **@tanstack/react-query**: Data fetching and caching
- **lucide-react**: Icon library
- **date-fns**: Date formatting
- **tailwindcss**: Styling

## Security Considerations
- ✅ Hash computation happens client-side (no files uploaded for hashing)
- ✅ Uses native Web Crypto API (no external libraries)
- ✅ Original hash is read-only and sealed with visual indicator
- ✅ Tampering automatically notifies supervisors
- ✅ All verification records maintained for audit trail

## Future Enhancements
- Support for multiple hash algorithms (MD5, SHA-1, SHA-512)
- Batch verification of multiple files
- Export verification report as PDF
- Integration with forensic tools for automated analysis
- Advanced filtering in verification history
- Digital signature verification for added authenticity

## Testing Scenarios
1. **Happy Path**: Upload matching file → INTACT result
2. **Tampering**: Upload modified file → TAMPERED result with alert
3. **Error Handling**: Network failure → ERROR state with retry
4. **History**: Verify same file multiple times → history table updates
5. **UI/UX**: Drag-drop, file picker, state transitions all work smoothly
6. **Performance**: Large file hashing doesn't freeze UI (async/await)
