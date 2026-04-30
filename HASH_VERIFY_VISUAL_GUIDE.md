# Hash Verification Page - Visual Guide

## Layout Overview

```
┌─────────────────────────────────────────────────────────┐
│  Evidence Integrity Verification                        │
│  Verify the SHA-256 hash of your evidence file          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Evidence Details Header                                  │
├─────────────────┬─────────────────┬────────────────────┤
│ Evidence ID     │ Case ID         │ Description        │
│ #EV-001234      │ #CASE-2024-001  │ Laptop Disk Image  │
└─────────────────┴─────────────────┴────────────────────┘

┌──────────────────────────────────────┬──────────────────┐
│                                      │                  │
│  MAIN CONTENT (2/3 width)            │  SIDEBAR (1/3)   │
│                                      │                  │
│  ┌──────────────────────────────────┤  ┌──────────────┐ │
│  │ Original Hash (Sealed Record)    │  │ Verification │ │
│  │ 🔒 Locked Green Panel            │  │ Process Info │ │
│  │                                  │  │              │ │
│  │ SHA-256: a1b2c3d4...             │  │ 1. Review    │ │
│  │ Collection: Jan 15, 2024         │  │ 2. Upload    │ │
│  │ Collected By: Agent Smith        │  │ 3. Verify    │ │
│  └──────────────────────────────────┤  │ 4. Review    │ │
│                                      │  └──────────────┘ │
│  ┌──────────────────────────────────┤                    │
│  │ Upload Evidence File             │  Blue Info Sidebar│
│  │                                  │  (Sticky)          │
│  │  ┌────────────────────────────┐  │                    │
│  │  │    📤 Drag & Drop Zone     │  │                    │
│  │  │    OR                      │  │                    │
│  │  │  [Browse Files Button]     │  │                    │
│  │  └────────────────────────────┘  │                    │
│  │                                  │                    │
│  │  [File Selected Info Box]        │                    │
│  │  📄 evidence_file.zip (45.2 MB)  │                    │
│  │  [✕] [Compute & Verify Button]   │                    │
│  └──────────────────────────────────┤                    │
│                                      │                    │
│  ┌──────────────────────────────────┤                    │
│  │ VERIFICATION RESULT (After Click)│                    │
│  │                                  │                    │
│  │ INTACT Result:                   │                    │
│  │ ✅ HASH MATCH — Evidence         │                    │
│  │    Integrity Confirmed           │                    │
│  │                                  │                    │
│  │ Original: a1b2c3d4... (green)    │                    │
│  │ Computed: a1b2c3d4... (green)    │                    │
│  │                                  │                    │
│  │ OR TAMPERED Result:              │                    │
│  │ ⚠️  HASH MISMATCH — Evidence     │                    │
│  │     May Be Compromised           │                    │
│  │                                  │                    │
│  │ Original: a1b2c3d4... (green)    │                    │
│  │ Computed: x9y8z7w6... (RED)      │                    │
│  │                                  │                    │
│  │ 🚨 Alert Banner:                 │                    │
│  │ This evidence item has been      │                    │
│  │ flagged. Supervisor notified.    │                    │
│  └──────────────────────────────────┤                    │
└──────────────────────────────────────┴──────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Verification History Table (Full Width)                 │
├──────────────────┬────────────┬────────────┬────────────┤
│ Date             │ Verified By│ Result     │ Hash       │
├──────────────────┼────────────┼────────────┼────────────┤
│ Jan 20, 10:15 AM │ Agent Jones│ ✅ INTACT  │ a1b2c3... │
│ Jan 18, 03:42 PM │ Agent Brown│ ✅ INTACT  │ a1b2c3... │
│ Jan 15, 09:00 AM │ Agent Smith│ ✅ INTACT  │ a1b2c3... │
└──────────────────┴────────────┴────────────┴────────────┘
```

## Color Scheme

### Success (INTACT) State
```
Background: Green-50 (#f0fdf4)
Border: Green-200 (#bbf7d0)
Text: Green-900 (#14532d)
Icon: Green-600 (#16a34a)
Hash Display: Green-50 background with Green-200 border
```

### Warning/Error (TAMPERED) State
```
Background: Red-50 (#fef2f2)
Border: Red-200 (#fecaca)
Text: Red-900 (#7f1d1d)
Icon: Red-600 (#dc2626)
Hash Display: Red-50 background with Red-300 border, Bold text
```

### Information (Sidebar)
```
Background: Blue-50 (#eff6ff)
Border: Blue-200 (#bfdbfe)
Text: Blue-900 (#1e3a8a)
Accent: Blue-600 (#2563eb)
```

## Component States

### 1. Initial State
- Original hash panel visible (read-only, green)
- File upload area empty
- No results shown
- Sidebar information visible

### 2. File Selected State
- Drag-drop area shows selected file info
- File name and size displayed
- "Compute & Verify" button enabled
- Can click to remove file

### 3. Computing Hash State
- "Computing Hash..." message
- Spinner animation
- Button disabled
- No file uploads to backend yet

### 4. Success Result State
- Large green checkmark icon (48px)
- Bold heading: "HASH MATCH — Evidence Integrity Confirmed"
- Original and computed hashes in green boxes (identical)
- Verification timestamp and verifier name
- Confirmation message

### 5. Tampered Result State
- Large red warning triangle (48px)
- Bold heading: "HASH MISMATCH — Evidence May Be Compromised"
- Red alert banner with supervisor notification
- Original hash in green box
- Computed hash in RED box with bold font
- Clear visual distinction

### 6. Error Result State
- Yellow alert box
- Alert icon (24px)
- Error message from server

## Responsive Behavior

### Mobile (< 768px)
- Single column layout
- Sidebar below main content
- Full-width tables with horizontal scroll
- Condensed spacing

### Tablet (768px - 1024px)
- Two column layout
- Sidebar to the right (not sticky)
- Tables with slight compression

### Desktop (> 1024px)
- Three column grid (2fr + 1fr)
- Sidebar sticky on scroll
- Full-size tables with padding
- Optimal spacing

## Icons Used (Lucide React)

| Icon              | Usage                      | Size |
|-------------------|----------------------------|------|
| `CheckCircle2`    | Success indicator          | 48px |
| `AlertTriangle`   | Warning/error indicator    | 48px |
| `Lock`            | Sealed record              | 20px |
| `Upload`          | File upload indicator      | 20px |
| `FileUp`          | Drag-drop zone             | 48px |
| `Clock`           | Timestamp indicator        | 16px |
| `User`            | Verifier indicator         | 16px |
| `AlertCircle`     | General alerts             | 24px |

## Typography

| Element               | Style                    |
|----------------------|--------------------------|
| Page Title           | 3xl bold, gray-900      |
| Subtitle             | sm, gray-600            |
| Panel Headers        | lg semibold, gray-900   |
| Result Heading       | 2xl bold, green-900     |
| Hash Values          | sm monospace, gray-900  |
| Labels               | xs uppercase semibold   |
| Sidebar Instructions | sm, blue-800            |

## Spacing & Sizing

```
Page Padding: p-6 (24px)
Gap Between Sections: gap-6 (24px)
Section Padding: p-6 (24px)
Hash Box Padding: p-3 (12px)
Border Radius: rounded-lg (8px)
Border Width: border / border-2 (1px / 2px)
```

## Interactions

### Drag & Drop
- On drag-over: Border color → accent, Background → accent/5
- Visual feedback: Icon color changes
- Smooth transition (300ms)

### Buttons
- Hover: Opacity decrease, background darkening
- Click: Disabled state during processing
- Focus: Ring-2 focus indicator

### File Input
- Hidden native input
- Triggered by browse button click
- Change handler processes selection

### Table
- Row hover: background-gray-50 transition
- Responsive scroll on mobile
- Truncated hash values with ellipsis

## Accessibility

- Proper heading hierarchy (h1, h2)
- ARIA labels on key sections
- Keyboard navigation support
- Color not sole indicator (icons + text)
- Focus indicators on interactive elements
- Alt-friendly typography and spacing

## Loading States

- Spinner component during hash computation
- "Computing Hash..." message
- Button disabled during processing
- Visual feedback maintains context

## Data Flow Diagram

```
User Action → State Update → UI Render
     ↓
File Selection (Drag or Browse)
     ↓
setSelectedFile() → Show File Info
     ↓
Click "Compute & Verify"
     ↓
computeSHA256(file)
     ↓
Client-side Web Crypto API
     ↓
Send computed hash to backend
     ↓
custodyAPI.verifyHash()
     ↓
Backend comparison with stored hash
     ↓
Return result (INTACT/TAMPERED/ERROR)
     ↓
setVerificationResult()
     ↓
Render appropriate result panel
     ↓
Invalidate verification history query
     ↓
Fetch and display updated history table
```

## Performance Considerations

1. **Client-Side Hashing**: No server round-trip during computation
2. **File Not Uploaded**: Only hash sent to backend (minimal bandwidth)
3. **Query Caching**: React Query caches evidence and history data
4. **Lazy State**: Result panel only renders when needed
5. **Responsive Images**: Icons scale appropriately
6. **CSS Optimization**: Tailwind purges unused classes

## Error Handling

```
Network Error → ERROR state → Yellow alert
File Read Error → ERROR state → Yellow alert
Backend Rejection → ERROR state → Yellow alert
Invalid File → No processing → User feedback
Large File → Async hash computation → No UI freeze
```
