import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '@/stores/authStore';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * Role gate for routes rendered inside AppLayout (which already enforces authentication).
 * Reads reactive store state so it re-renders correctly when auth/user changes.
 */
export default function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
