import { useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Package,
  Link2,
  Search,
  ShieldCheck,
  ClipboardList,
  UserPlus,
  CheckSquare,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { isAdmin, isAuditor, isInvestigator, isAuthorizer } from '../../utils/rbac'

// Nav items for ADMIN — full operational access + user management
const ADMIN_MENU = [
  { path: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard'       },
  { path: '/cases',          icon: FileText,         label: 'Cases'           },
  { path: '/evidence',       icon: Package,          label: 'Evidence'        },
  { path: '/custody',        icon: Link2,            label: 'Custody Records' },
  { path: '/verify',         icon: Search,           label: 'Hash Verification'},
  { path: '/users/new',      icon: UserPlus,         label: 'Create User'     },
  { path: '/admin/access-log', icon: ShieldCheck,    label: 'Access Log', highlight: true },
]

// Nav items for INVESTIGATOR — case creation and evidence
const INVESTIGATOR_MENU = [
  { path: '/investigator',   icon: LayoutDashboard, label: 'Dashboard'       },
  { path: '/cases',          icon: FileText,         label: 'My Cases'        },
  { path: '/cases/new',      icon: FileText,         label: 'New Case'        },
  { path: '/evidence',       icon: Package,          label: 'Evidence'        },
  { path: '/custody',        icon: Link2,            label: 'Custody Records' },
  { path: '/verify',         icon: Search,           label: 'Hash Verification'},
]

// Nav items for AUTHORIZER — approve/reject pending cases
const AUTHORIZER_MENU = [
  { path: '/authorizer',     icon: LayoutDashboard, label: 'Dashboard'        },
  { path: '/cases',          icon: CheckSquare,      label: 'Pending Approvals'},
  { path: '/custody',        icon: Link2,            label: 'Custody Records'  },
]

// Nav items for AUDITOR — read-only audit access only
const AUDITOR_MENU = [
  { path: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'       },
  { path: '/audit',       icon: ClipboardList,   label: 'Audit Monitor'   },
  { path: '/custody',     icon: Link2,           label: 'Chain of Custody'},
  { path: '/verify',      icon: Search,          label: 'Hash Verification'},
]

function NavLink({ path, icon: Icon, label, isActive, highlight }) {
  if (highlight) {
    return (
      <Link
        to={path}
        className={`flex items-center gap-3 px-4 py-3 mx-3 my-1 rounded-lg transition-colors border ${
          isActive
            ? 'bg-amber-400/30 text-amber-100 border-amber-300/40'
            : 'text-amber-100/90 border-amber-300/20 hover:bg-amber-400/20 hover:text-amber-50'
        }`}
      >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </Link>
    )
  }

  return (
    <Link
      to={path}
      className={`flex items-center gap-3 px-4 py-3 mx-3 my-1 rounded-lg transition-colors ${
        isActive
          ? 'bg-white/15 text-white'
          : 'text-white/90 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  )
}

export default function Sidebar() {
  const location = useLocation()
  const { user } = useAuthStore()

  const isActive = (path) => location.pathname.startsWith(path) && path !== '/dashboard'
    ? true
    : location.pathname === path

  const menuItems =
    isAdmin(user)        ? ADMIN_MENU        :
    isInvestigator(user) ? INVESTIGATOR_MENU :
    isAuthorizer(user)   ? AUTHORIZER_MENU   :
    isAuditor(user)      ? AUDITOR_MENU      : []

  const roleLabel =
    isAdmin(user)        ? 'Administrator' :
    isInvestigator(user) ? 'Investigator'  :
    isAuthorizer(user)   ? 'Authorizer'    :
    isAuditor(user)      ? 'Auditor'       : ''

  const roleBadge =
    isAdmin(user)        ? 'bg-purple-500/30 text-purple-100' :
    isInvestigator(user) ? 'bg-blue-500/30   text-blue-100'   :
    isAuthorizer(user)   ? 'bg-amber-500/30  text-amber-100'  :
                           'bg-green-500/30  text-green-100'

  return (
    <aside className="w-64 bg-primary text-white h-screen fixed left-0 top-0 shadow-xl flex flex-col">
      <div className="p-6">
        <h2 className="text-xs font-semibold text-white/70 uppercase tracking-wider">
          Digital Forensics
        </h2>
        {roleLabel && (
          <span className={`mt-2 inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadge}`}>
            {roleLabel}
          </span>
        )}
      </div>

      <nav className="mt-4 flex-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            path={item.path}
            icon={item.icon}
            label={item.label}
            isActive={isActive(item.path)}
            highlight={item.highlight}
          />
        ))}
      </nav>
    </aside>
  )
}
