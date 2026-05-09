import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'
import { testSupabaseConnection } from './lib/supabase-api'

// Set theme class on <html> BEFORE React renders to prevent flash
const stored = localStorage.getItem('p13-theme')
const systemDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
const mode = stored === 'dark' || (!stored && systemDark) ? 'dark' : 'light'
if (mode === 'dark') document.documentElement.classList.add('dark')

function AppWithInit() {
  useEffect(() => {
    useAuthStore.getState().checkStoredSession()
    useThemeStore.getState().init()
    // Test Supabase connection
    testSupabaseConnection().then((result) => {
      if (result.ok) {
        console.log('[Supabase] Connected successfully')
      } else {
        console.error('[Supabase] Connection failed:', result.error)
      }
    })
    // Sync data from Supabase on app load
    import('./stores/dataStore').then(({ useDataStore }) => {
      useDataStore.getState().syncFromSupabase()
    })
  }, [])
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppWithInit />
    </BrowserRouter>
  </StrictMode>,
)
