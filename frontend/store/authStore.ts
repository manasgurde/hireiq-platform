import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'candidate' | 'recruiter' | 'admin'
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (accessToken) => set({ accessToken }),
      login: (user, accessToken) => {
        if (typeof document !== 'undefined') {
          document.cookie = "logged_in=true; path=/; max-age=604800; samesite=lax";
        }
        set({ user, accessToken, isAuthenticated: true })
      },
      logout: () => {
        if (typeof document !== 'undefined') {
          document.cookie = "logged_in=; path=/; max-age=0; samesite=lax";
        }
        set({ user: null, accessToken: null, isAuthenticated: false })
      },
    }),
    {
      name: 'hireiq_auth',
    }
  )
)

