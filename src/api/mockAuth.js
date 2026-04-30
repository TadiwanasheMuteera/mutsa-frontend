// Mock Authentication for Frontend Development
// Remove this file when backend is ready

const DEMO_USERS = {
  'demo@example.com': {
    password: 'demo123',
    token: 'demo_token_' + Math.random().toString(36).substring(7),
    user: {
      id: 'user-1',
      name: 'Auditor User',
      email: 'demo@example.com',
      role: 'auditor',
    },
  },
  'admin@example.com': {
    password: 'admin123',
    token: 'admin_token_' + Math.random().toString(36).substring(7),
    user: {
      id: 'user-2',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
    },
  },
  'auditor@example.com': {
    password: 'auditor123',
    token: 'auditor_token_' + Math.random().toString(36).substring(7),
    user: {
      id: 'user-3',
      name: 'Auditor Smith',
      email: 'auditor@example.com',
      role: 'auditor',
    },
  },
}

export const mockAuthAPI = {
  login: async (email, password) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const user = DEMO_USERS[email]
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password')
    }

    return {
      token: user.token,
      user: user.user,
      message: 'Login successful (demo mode)',
    }
  },

  register: async (email, password, name) => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (DEMO_USERS[email]) {
      throw new Error('Email already registered')
    }

    const newToken = 'token_' + Math.random().toString(36).substring(7)
    const newUser = {
      id: 'user-' + Object.keys(DEMO_USERS).length + 1,
      name,
      email,
      role: 'auditor',
    }

    DEMO_USERS[email] = {
      password,
      token: newToken,
      user: newUser,
    }

    return {
      token: newToken,
      user: newUser,
      message: 'Registration successful (demo mode)',
    }
  },

  logout: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return { message: 'Logged out successfully (demo mode)' }
  },

  getCurrentUser: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const token = localStorage.getItem('auth-storage')
    if (!token) throw new Error('Not authenticated')
    
    // Parse auth storage (Zustand persist)
    try {
      const authData = JSON.parse(token)
      return authData.state?.user || null
    } catch {
      throw new Error('Invalid token')
    }
  },

  refreshToken: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const newToken = 'token_' + Math.random().toString(36).substring(7)
    return {
      token: newToken,
      message: 'Token refreshed (demo mode)',
    }
  },
}

export const DEMO_CREDENTIALS = [
  { email: 'admin@example.com', password: 'admin123', role: 'Admin' },
  { email: 'auditor@example.com', password: 'auditor123', role: 'Auditor' },
  { email: 'demo@example.com', password: 'demo123', role: 'Auditor' },
]
