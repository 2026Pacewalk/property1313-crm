import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'

// Init auth and theme on app mount
function AppWithInit() {
  useEffect(() => {
    useAuthStore.getState().checkStoredSession()
    useThemeStore.getState().init()
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
