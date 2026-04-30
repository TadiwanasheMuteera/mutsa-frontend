# Chain of Custody Evidence Tracker Frontend

A complete React + Vite frontend for managing digital forensic evidence and maintaining chain of custody records.

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with JWT interceptors
- **TanStack Query** - Server state management
- **Zustand** - Authentication state management
- **React Hook Form** - Form handling
- **Tailwind CSS** - Styling
- **date-fns** - Date formatting
- **lucide-react** - Icons

## 📋 Project Structure

```
src/
├── api/
│   ├── axios.js           # Axios instance with JWT interceptor
│   ├── auth.js            # Authentication endpoints
│   ├── cases.js           # Case management endpoints
│   ├── custody.js         # Custody record endpoints
│   └── evidence.js        # Evidence management endpoints
├── components/
│   ├── layout/
│   │   ├── Layout.jsx     # Main layout wrapper
│   │   ├── Navbar.jsx     # Top navigation bar
│   │   └── Sidebar.jsx    # Left sidebar navigation
│   └── ui/
│       ├── Badge.jsx      # Status badge component
│       ├── HashBadge.jsx  # Hash integrity badge
│       ├── Modal.jsx      # Modal dialog
│       ├── Spinner.jsx    # Loading spinner
│       ├── StatCard.jsx   # Statistics card
│       └── Timeline.jsx   # Custody timeline
├── pages/
│   ├── LoginPage.jsx                 # Login/authentication
│   ├── DashboardPage.jsx             # Main dashboard
│   ├── CasesPage.jsx                 # Case list
│   ├── CaseDetailPage.jsx            # Case details
│   ├── NewCasePage.jsx               # Create new case
│   ├── EvidencePage.jsx              # Evidence list
│   ├── NewEvidencePage.jsx           # Register evidence
│   ├── CustodyPage.jsx               # Custody records
│   └── HashVerifyPage.jsx            # Hash verification
├── store/
│   └── authStore.js                  # Zustand auth store
├── App.jsx                           # Main app component with routing
├── main.jsx                          # Entry point
└── index.css                         # Tailwind imports
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn installed
- Flask backend running at `http://172.16.10.71:5000`

### Installation

```bash
# Install dependencies
npm install

# Create .env file with API URL
echo "VITE_API_URL=http://172.16.10.71:5000" > .env
```

### Development

```bash
# Start development server (opens at http://localhost:3000)
npm run dev
```

### Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Design System

### Color Scheme
- **Primary**: `#1E3A5F` (Navy Blue)
- **Accent**: `#2563EB` (Bright Blue)
- **Background**: White
- **Status Colors**: Green (Active), Red (Error), Yellow (Pending)

### Typography
- All styling uses Tailwind CSS
- Responsive design for mobile and desktop
- Consistent spacing and sizing

## 🔐 Authentication

- JWT token-based authentication
- Automatic token refresh via interceptors
- Protected routes redirect to login if unauthenticated
- User state persisted in localStorage via Zustand

### Protected Routes
- `/dashboard` - Main dashboard
- `/cases` - Case management
- `/evidence` - Evidence management
- `/custody` - Custody records
- `/verify` - Hash verification

### Public Routes
- `/login` - Login page

## 📡 API Integration

### Axios Interceptors
The axios instance automatically:
- Attaches JWT token to all requests
- Redirects to login on 401 errors
- Handles errors globally

### API Modules
Each api module exports functions for specific endpoints:

```javascript
// auth.js
authAPI.login(email, password)
authAPI.register(email, password, name)
authAPI.logout()

// cases.js
casesAPI.getAllCases()
casesAPI.getCaseById(id)
casesAPI.createCase(data)
casesAPI.updateCase(id, data)

// evidence.js
evidenceAPI.getEvidenceByCaseId(caseId)
evidenceAPI.createEvidence(caseId, data)
evidenceAPI.uploadFile(id, file)

// custody.js
custodyAPI.getCustodyByEvidenceId(evidenceId)
custodyAPI.addCustodyRecord(evidenceId, data)
custodyAPI.verifyHash(evidenceId, hash)
```

## 🔍 Key Features

### Dashboard
- Statistics overview (active cases, evidence count, pending items)
- Recent cases table
- Quick navigation

### Case Management
- Create and view cases
- Track evidence per case
- Case status and priority levels
- Investigator assignment

### Evidence Tracking
- Register digital evidence
- Link evidence to cases
- Track evidence status
- Upload and manage files

### Chain of Custody
- Complete custody timeline
- Officer tracking
- Action history
- Timestamp audit trail

### Hash Verification
- Verify MD5 hashes
- Detect tampering
- Compare current vs. original hashes
- Integrity status badges

## 📝 Component Usage

### Using ProtectedRoute
```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### Using Badge Component
```jsx
<Badge status="ACTIVE" />
<HashBadge status="INTACT" />
```

### Using Layout
```jsx
<Layout>
  <div>Your content here</div>
</Layout>
```

## 🎯 Best Practices

- Use React Query for server state management
- Use Zustand for auth and local state
- All forms use React Hook Form
- All queries implement error handling
- Responsive design with Tailwind
- Accessible UI components
- Consistent loading states

## 🔧 Configuration

### Environment Variables
```
VITE_API_URL=http://172.16.10.71:5000
```

### Tailwind Configuration
Located in `tailwind.config.js` with custom colors for the design system.

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Sidebar hidden on mobile, accessible via menu
- Tables with horizontal scroll on small screens

## 🐛 Error Handling

- Global error states in components
- Toast-like UI for error messages
- Graceful fallbacks for missing data
- Network error handling via Axios interceptors
- Form validation with React Hook Form

## 🚦 State Management

- **Server State**: TanStack Query (React Query)
- **Auth State**: Zustand with localStorage persistence
- **Form State**: React Hook Form
- **Local State**: React useState for UI state

---

**Ready to develop!** Start with `npm install` and `npm run dev`.


