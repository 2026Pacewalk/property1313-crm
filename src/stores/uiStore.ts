import { create } from 'zustand';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface UIState {
  sidebarCollapsed: boolean;
  activeBottomTab: string;
  toasts: Toast[];
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setActiveBottomTab: (tab: string) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  activeBottomTab: 'leads',
  toasts: [],
  theme: 'light',
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setActiveBottomTab: (tab) => set({ activeBottomTab: tab }),
  addToast: (toast) => set((s) => ({ toasts: [...s.toasts, { ...toast, id: Math.random().toString(36).slice(2) }] })),
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  setTheme: (theme) => set({ theme }),
}));
