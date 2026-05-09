import { create } from 'zustand';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
  init: () => void;
}

const STORAGE_KEY = 'p13-theme';

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',

  toggle: () => {
    const newMode = get().mode === 'light' ? 'dark' : 'light';
    set({ mode: newMode });
    applyTheme(newMode);
  },

  setMode: (mode) => {
    set({ mode });
    applyTheme(mode);
  },

  init: () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    const mode = stored === 'dark' || stored === 'light' ? stored : 'light';
    set({ mode });
    applyTheme(mode);
  },
}));

function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (mode === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  localStorage.setItem('p13-theme', mode);
}
