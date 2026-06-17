import { create } from 'zustand'

interface UiState {
  darkMode: boolean
  sidebarOpen: boolean
  setDarkMode: (darkMode: boolean) => void
  setSidebarOpen: (sidebarOpen: boolean) => void
  toggleSidebar: () => void
}

export const useUiStore = create<UiState>((set) => ({
  darkMode: false,
  sidebarOpen: true,
  setDarkMode: (darkMode) => set({ darkMode }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
