import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/authStore'
import { useAuthInit } from './store/useAuthInit'
import { useEffect } from 'react'
import { setNavigate } from './store/navigation'
import { hasRole, isAdmin, isAuditor, isInvestigator, isAuthorizer } from './utils/rbac'

// Pages
import LoginPage          from './pages/LoginPage'
import DashboardPage      from './pages/DashboardPage'
import CasesPage          from './pages/CasesPage'
import CaseDetailPage     from './pages/CaseDetailPage'
import NewCasePage        from './pages/NewCasePage'
import EvidencePage       from './pages/EvidencePage'
import EvidenceDetailPage from './pages/EvidenceDetailPage'
import NewEvidencePage    from './pages/NewEvidencePage'
import CustodyPage        from './pages/CustodyPage'
import HashVerifyPage     from './pages/HashVerifyPage'
import AdminAccessLogPage from './pages/AdminAccessLogPage'
import AuditorPage        from './pages/AuditorPage'
import CreateUserPage     from './pages/CreateUserPage'
import AuthorizerPage     from './pages/AuthorizerPage'
import InvestigatorPage   from './pages/InvestigatorPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 text-sm text-gray-700">
        Initializing…
      </div>
    </div>
  )
}

// Protected route — enforces auth + optional role restriction
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, accessToken, isInitialized, user } = useAuthStore()

  if (!isInitialized) return <Loader />

  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" replace />
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !hasRole(user, allowedRoles)) {
    if (isAdmin(user))        return <Navigate to="/dashboard"   replace />
    if (isAuditor(user))      return <Navigate to="/audit"       replace />
    if (isInvestigator(user)) return <Navigate to="/investigator" replace />
    if (isAuthorizer(user))   return <Navigate to="/authorizer"  replace />
    return <Navigate to="/login" replace />
  }

  return children
}

// Redirects / and * to the correct landing page for the current role
function RoleHome() {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated)     return <Navigate to="/login"        replace />
  if (isAuditor(user))      return <Navigate to="/audit"        replace />
  if (isInvestigator(user)) return <Navigate to="/investigator" replace />
  if (isAuthorizer(user))   return <Navigate to="/authorizer"   replace />
  return                           <Navigate to="/dashboard"    replace />
}

function AppContent() {
  const navigate = useNavigate()
  const isInitialized = useAuthInit()

  useEffect(() => { setNavigate(navigate) }, [navigate])

  if (!isInitialized) return <Loader />

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Shared landing aliases */}
      <Route path="/home" element={<RoleHome />} />
      <Route path="/"     element={<RoleHome />} />

      {/* ── ADMIN-only routes (user management + system monitoring) ── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/access-log"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminAccessLogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/new"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <CreateUserPage />
          </ProtectedRoute>
        }
      />

      {/* ── AUDITOR-only routes ───────────────────────────────────── */}
      <Route
        path="/audit"
        element={
          <ProtectedRoute allowedRoles={['AUDITOR']}>
            <AuditorPage />
          </ProtectedRoute>
        }
      />

      {/* ── INVESTIGATOR routes (cases + evidence operations) ────── */}
      <Route
        path="/investigator"
        element={
          <ProtectedRoute allowedRoles={['INVESTIGATOR']}>
            <InvestigatorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/evidence"
        element={
          <ProtectedRoute allowedRoles={['INVESTIGATOR']}>
            <EvidencePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/evidence/new"
        element={
          <ProtectedRoute allowedRoles={['INVESTIGATOR']}>
            <NewEvidencePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/evidence/:evidenceId"
        element={
          <ProtectedRoute allowedRoles={['INVESTIGATOR']}>
            <EvidenceDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases"
        element={
          <ProtectedRoute allowedRoles={['INVESTIGATOR','AUTHORIZER']}>
            <CasesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/new"
        element={
          <ProtectedRoute allowedRoles={['INVESTIGATOR']}>
            <NewCasePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:caseId"
        element={
          <ProtectedRoute allowedRoles={['INVESTIGATOR','AUTHORIZER']}>
            <CaseDetailPage />
          </ProtectedRoute>
        }
      />

      {/* ── AUTHORIZER routes ─────────────────────────────────────── */}
      <Route
        path="/authorizer"
        element={
          <ProtectedRoute allowedRoles={['AUTHORIZER']}>
            <AuthorizerPage />
          </ProtectedRoute>
        }
      />

      {/* ── Shared routes (both roles) ────────────────────────────── */}
      <Route
        path="/custody"
        element={
          <ProtectedRoute>
            <CustodyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verify/:evidenceId"
        element={
          <ProtectedRoute>
            <HashVerifyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verify"
        element={
          <ProtectedRoute>
            <HashVerifyPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<RoleHome />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  )
}
