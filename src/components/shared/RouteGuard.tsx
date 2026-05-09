import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export default function RouteGuard({ children, requireAuth = true, allowedRoles }: RouteGuardProps) {
  const { isAuthenticated, checkStoredSession } = useAuthStore();
  const location = useLocation();

  // Try to restore session on mount
  useEffect(() => {
    if (!isAuthenticated) {
      checkStoredSession();
    }
  }, []);

  const currentAuth = useAuthStore.getState().isAuthenticated;

  // Not authenticated, redirect to login
  if (requireAuth && !currentAuth) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role restrictions
  if (requireAuth && allowedRoles && allowedRoles.length > 0) {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser || !allowedRoles.includes(currentUser.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Authenticated but on login page, redirect to dashboard
  if (!requireAuth && currentAuth) {
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      const { getRedirectPath } = useAuthStore.getState();
      return <Navigate to={getRedirectPath(currentUser.role)} replace />;
    }
  }

  return <>{children}</>;
}
