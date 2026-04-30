# New Evidence Form Page - Complete Implementation

## Overview
The New Evidence Form (`src/pages/NewEvidencePage.jsx`) is a comprehensive React component that allows investigators to log and register new pieces of evidence to a case within the Chain-of-Custody Evidence Tracker application.

## File Location
```
src/pages/NewEvidencePage.jsx
```

## Features Implemented

### ✅ Form Fields (All Required + Optional)

1. **Evidence Description** (Required)
   - Textarea field (4 rows)
   - Validation: Must be provided
   - Placeholder guidance provided

2. **Evidence Type** (Required)
   - Select dropdown with 6 options:
     - Digital File
     - Physical Item
     - Screenshot
     - Transaction Log
     - Device
     - Other
   - Validation: Must be selected

3. **Source / Where Obtained** (Required)
   - Text input field
   - Example: "Seized from suspect's residence"
   - Validation: Required

4. **Collection Date & Time** (Required)
   - Datetime-local input
   - Formatted display below input
   - Shows: "Friday, March 15, 2024 at 2:30 PM"
   - Validation: Required

5. **Collection Location** (Required)
   - Text input field
   - Example: "123 Main St, Building A, Room 201"
   - Validation: Required

6. **Collected By** (Auto-filled, Editable)
   - Text input field
   - Auto-populated from logged-in user (`useAuthStore`)
   - User can edit if needed
   - Shows note: "Auto-filled from your user profile"

7. **File Upload** (Optional)
   - Drag-and-drop zone
   - Click to browse alternative
   - Auto-computes SHA-256 hash on file select
   - Displays:
     - File name
     - File size (in MB)
     - SHA-256 hash (with "Computing..." spinner)
     - Clear button to remove file
   - Maximum file size: 5GB (info message)

8. **Notes** (Optional)
   - Textarea field (3 rows)
   - No validation required

9. **Chain of Custody Declaration** (Required)
   - Checkbox input
   - Legal declaration text
   - Must be checked before submission
   - Warning message if unchecked: "⚠️ You must agree to this declaration before submitting"

### ✅ Technical Features

- **React Hook Form** for form management
- **React Query** for mutations and data fetching
- **useAuthStore** (Zustand) for getting current user
- **Web Crypto API** for client-side SHA-256 computation
- **Drag-and-drop** file upload support
- **Form validation** with error messages
- **Loading states** during submission
- **Error handling** with field-level errors
- **Navigation** integration with React Router
- **Tailwind CSS** styling

### ✅ User Experience

- **Clear form organization** in logical sections
- **Visual feedback** during all operations
- **Loading spinners** during hash computation
- **Error messages** for invalid fields
- **Field-level validation** display
- **Responsive design** (mobile/tablet/desktop)
- **Professional UI** with consistent styling
- **Disabled submit button** until requirements met
- **Date formatting** for readability

## Form Structure

```
Section 1: Evidence Description
  - Evidence Description (textarea, required)
  - Evidence Type (select, required)
  - Source / Where Obtained (text, required)

Section 2: Collection Details
  - Collection Date & Time (datetime, required)
  - Collection Location (text, required)
  - Collected By (text, auto-filled)

Section 3: Evidence File (Optional)
  - File Upload (drag-drop + browse)
  - SHA-256 Hash Display (computed client-side)

Section 4: Additional Information
  - Notes (textarea, optional)

Section 5: Chain of Custody Declaration
  - Checkbox with legal declaration text

Action Buttons:
  - Register Evidence (submit, disabled if declaration not agreed)
  - Cancel (navigate back)
```

## State Management

```javascript
// Form state (React Hook Form)
- description: Evidence description
- evidenceType: Type of evidence
- source: Where obtained
- collectionDate: Date and time
- collectionLocation: Location
- collectedBy: Officer name (auto-filled)
- notes: Additional notes

// Component state (useState)
- selectedFile: Currently selected file
- isDragging: Drag-over state
- computedHash: Computed SHA-256 hash
- isComputingHash: Hash computation flag
- chainOfCustodyAgreed: Declaration checkbox state
- generalError: Form submission error

// URL params
- caseId: From route params (useParams)
```

## API Integration

### Endpoints Used

1. **Get Case Details**
   ```
   GET /cases/:caseId
   ```

2. **Upload File**
   ```
   POST /evidence/:caseId/upload
   Multipart form-data with file
   ```

3. **Create Evidence**
   ```
   POST /cases/:caseId/evidence
   Includes all form fields and computed hash
   ```

### Request Format
```javascript
{
  description: string,
  type: string,
  source: string,
  collectionDate: ISO 8601 datetime,
  collectionLocation: string,
  collectedBy: string,
  notes: string,
  hash: string (SHA-256),
  file: File (optional)
}
```

## SHA-256 Hash Computation

**Method**: Client-side using Web Crypto API
**Algorithm**: SHA-256
**Process**:
1. File selected → `computeSHA256(file)` called
2. File converted to `ArrayBuffer`
3. `crypto.subtle.digest('SHA-256', buffer)` computes hash
4. Hash buffer converted to Uint8Array
5. Converted to hexadecimal string (lowercase)
6. Displayed in monospace font

**Features**:
- Async/await prevents UI blocking
- Loading spinner during computation
- Error handling with console logging
- Hash displayed once computation completes

## Styling

### Color Scheme
- Primary text: `text-gray-900`
- Secondary text: `text-gray-600`
- Labels: `text-gray-700` (font-semibold)
- Accent color: `bg-accent` (blue)
- Error: `text-red-500`, `bg-red-50`, `border-red-200`
- Warning: `bg-amber-50`, `border-amber-200`, `text-amber-900`
- Info: `bg-blue-50`, `border-blue-200`

### Components
- **Form sections**: White background with shadow and border
- **Error messages**: Red background with icon
- **File upload**: Gray dashed border, transitions on hover
- **Declaration**: Amber warning color with checkbox
- **Buttons**: Full-width, blue accent with hover effects

## Responsive Design

### Mobile (<768px)
- Single column layout
- Full-width fields
- Stacked sections
- Touch-friendly button sizes

### Tablet (768px-1024px)
- Two-column layout for some fields
- Better use of space
- Readable text

### Desktop (>1024px)
- Optimal layout
- Two-column grids where applicable
- Maximum width container (max-w-4xl)

## Validation

### Field-Level Validation
- **Description**: Required (must not be empty)
- **Evidence Type**: Required (must select)
- **Source**: Required (must not be empty)
- **Collection Date**: Required (must select date/time)
- **Collection Location**: Required (must not be empty)
- **Notes**: Optional (no validation)
- **File**: Optional (no validation)

### Form-Level Validation
- **Chain of Custody**: MUST be checked before submit
- Shows error: "You must agree to this declaration before submitting"
- Submit button disabled if unchecked

## Error Handling

### Field Errors
- Displayed inline below each field
- Red text with error message
- Input border turns red on error
- Real-time validation feedback

### General Errors
- Displayed at top of form
- Red background box with icon
- Shows API error message
- Clears on new submission attempt

## Data Flow

```
1. Component Mount
   ↓
2. Fetch case details (useParams: caseId)
   ↓
3. Auto-fill Collected By from useAuthStore
   ↓
4. Set Collection Date to current time
   ↓
5. User fills form fields
   ↓
6. On file select: computeSHA256(file)
   ↓
7. On form submit: Validate all required fields + declaration
   ↓
8. POST to /cases/:caseId/evidence
   ↓
9. On success: Invalidate queries, navigate to case detail
   ↓
10. On error: Display error message
```

## Integration Steps

### 1. Route Setup
```jsx
import NewEvidencePage from './pages/NewEvidencePage'

<Route path="/cases/:caseId/evidence/new" element={<NewEvidencePage />} />
```

### 2. Navigation Link
```jsx
<Link to={`/cases/${caseId}/evidence/new`}>
  + Register Evidence
</Link>
```

### 3. Backend Endpoints
Ensure these endpoints are implemented:
- `GET /cases/:caseId` - Fetch case details
- `POST /cases/:caseId/evidence` - Create evidence
- `POST /evidence/:caseId/upload` - Upload file (optional, can be combined)

## Browser Support
- ✅ Chrome 37+ (Web Crypto API)
- ✅ Firefox 34+
- ✅ Safari 11+
- ✅ Edge 79+
- ❌ IE 11 (not supported)

## Key Dependencies
- `react-hook-form` - Form management
- `@tanstack/react-query` - Data fetching
- `zustand` - State management (auth store)
- `date-fns` - Date formatting
- `lucide-react` - Icons
- `tailwindcss` - Styling

## Performance Considerations
- SHA-256 computation is async (no UI freeze)
- Form state managed efficiently with React Hook Form
- React Query handles data caching
- Lazy loading of case details
- Optimized re-renders

## Security Features
- ✅ SHA-256 hashing (cryptographically secure)
- ✅ Client-side computation (no sensitive data sent for hashing)
- ✅ File not uploaded until form submission
- ✅ Chain of Custody declaration confirmation
- ✅ User authentication validation via Zustand store
- ✅ Form validation prevents incomplete submissions

## Future Enhancements
- Support for multiple file uploads
- Drag-drop for multiple files at once
- File preview before upload
- Support for multiple hash algorithms
- Automatic chain of custody updates
- Evidence batch registration
- Integration with forensic tools
- Advanced file scanning

## Troubleshooting

### Hash Computation Not Working
- Check browser Web Crypto API support
- Ensure file is not corrupted
- Check browser console for errors

### File Upload Fails
- Verify file size < 5GB
- Check network connection
- Verify backend endpoint is available

### Form Won't Submit
- Ensure all required fields are filled
- Check if Chain of Custody declaration is checked
- Review error messages for validation issues

### Date Not Showing Correctly
- Verify browser supports datetime-local input
- Check timezone settings
- Review date-fns formatting

## Code Quality
- Uses React best practices
- Proper error handling
- Component composition
- Clear variable naming
- Comments where needed
- No console errors in production

## Status
✅ Production Ready
- All requirements implemented
- Fully tested and validated
- Comprehensive error handling
- User-friendly interface
- Documentation complete
