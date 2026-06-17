import { create } from 'zustand'

export interface User {
  id: string
  email: string
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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (accessToken) => set({ accessToken }),
  login: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true }),
  logout: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),
}))

