// Demo credentials — one account per role for prototype testing

export const DEMO_USERS = {
  admin: {
    password: 'admin',
    accessToken:  'demo_access_admin',
    refreshToken: 'demo_refresh_admin',
    user: { id: 'u-1', full_name: 'Admin User',      email: 'admin@coc.gov',       role: 'ADMIN'        },
  },
  investigator: {
    password: 'investigator',
    accessToken:  'demo_access_inv',
    refreshToken: 'demo_refresh_inv',
    user: { id: 'u-2', full_name: 'John Investigator', email: 'inv@coc.gov',        role: 'INVESTIGATOR' },
  },
  authorizer: {
    password: 'authorizer',
    accessToken:  'demo_access_auth',
    refreshToken: 'demo_refresh_auth',
    user: { id: 'u-3', full_name: 'Sarah Authorizer',  email: 'auth@coc.gov',       role: 'AUTHORIZER'   },
  },
  auditor: {
    password: 'auditor',
    accessToken:  'demo_access_aud',
    refreshToken: 'demo_refresh_aud',
    user: { id: 'u-4', full_name: 'Mike Auditor',      email: 'auditor@coc.gov',    role: 'AUDITOR'      },
  },
  // also support email-based login for backward compat
  'admin@coc.gov':       { password: 'admin',        accessToken: 'demo_access_admin', refreshToken: 'demo_refresh_admin', user: { id: 'u-1', full_name: 'Admin User',        email: 'admin@coc.gov',    role: 'ADMIN'        } },
  'inv@coc.gov':         { password: 'investigator', accessToken: 'demo_access_inv',   refreshToken: 'demo_refresh_inv',   user: { id: 'u-2', full_name: 'John Investigator', email: 'inv@coc.gov',      role: 'INVESTIGATOR' } },
  'auth@coc.gov':        { password: 'authorizer',   accessToken: 'demo_access_auth',  refreshToken: 'demo_refresh_auth',  user: { id: 'u-3', full_name: 'Sarah Authorizer',  email: 'auth@coc.gov',     role: 'AUTHORIZER'   } },
  'auditor@coc.gov':     { password: 'auditor',      accessToken: 'demo_access_aud',   refreshToken: 'demo_refresh_aud',   user: { id: 'u-4', full_name: 'Mike Auditor',      email: 'auditor@coc.gov',  role: 'AUDITOR'      } },
}

export const ROLE_CARDS = [
  {
    role:     'ADMIN',
    label:    'Administrator',
    username: 'admin',
    password: 'admin',
    color:    'purple',
    bg:       'bg-purple-50 border-purple-200 hover:border-purple-400',
    badge:    'bg-purple-100 text-purple-800',
    desc:     'Full system access. Creates users, views all cases, manages evidence, and monitors access logs.',
    can:      ['Create & manage users', 'View all cases & evidence', 'Access audit logs', 'Full admin controls'],
  },
  {
    role:     'INVESTIGATOR',
    label:    'Investigator',
    username: 'investigator',
    password: 'investigator',
    color:    'blue',
    bg:       'bg-blue-50 border-blue-200 hover:border-blue-400',
    badge:    'bg-blue-100 text-blue-800',
    desc:     'Creates cases and manages evidence. Cases go to PENDING until an Authorizer approves them.',
    can:      ['Create new cases', 'Upload & manage evidence', 'Transfer evidence custody', 'View own cases'],
  },
  {
    role:     'AUTHORIZER',
    label:    'Authorizer',
    username: 'authorizer',
    password: 'authorizer',
    color:    'amber',
    bg:       'bg-amber-50 border-amber-200 hover:border-amber-400',
    badge:    'bg-amber-100 text-amber-800',
    desc:     'Reviews and approves or rejects cases submitted by investigators before they become active.',
    can:      ['Review pending cases', 'Approve cases → OPEN', 'Reject cases with reason', 'View all cases'],
  },
  {
    role:     'AUDITOR',
    label:    'Auditor',
    username: 'auditor',
    password: 'auditor',
    color:    'green',
    bg:       'bg-green-50 border-green-200 hover:border-green-400',
    badge:    'bg-green-100 text-green-800',
    desc:     'Read-only access to system activity. Monitors who logged in, what they did, and when they logged out.',
    can:      ['Full session audit trail', 'Login-to-logout timeline', 'Flag suspicious activity', 'Download audit reports'],
  },
]
