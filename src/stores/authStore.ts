import { create } from 'zustand';
import type { User, UserRole } from '@/types';
import { normalizeMobile } from '@/lib/phone-validation';
import { useRBACStore } from './rbacStore';

/**
 * Resolve the live user list from the RBAC store (persisted + mutated by admin actions),
 * not the static mock — so creating/disabling users and role changes actually affect login.
 */
const getUsers = (): User[] => useRBACStore.getState().users;

interface LoginAttempt {
  count: number;
  lastAttemptAt: number;
  lockedUntil: number | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  loginMethod: 'password' | 'whatsapp';
  rememberMe: boolean;
  loginAttempts: Record<string, LoginAttempt>;
  // Impersonation
  originalUser: User | null;
  isImpersonating: boolean;
  // User pending a forced password change (NOT yet authenticated)
  pendingForcePasswordChange: User | null;
  // Actions
  login: (identifier: string, password: string) => { success: boolean; error?: string; user?: User; requiresPasswordChange?: boolean };
  completeForcedPasswordChange: (newPassword: string, confirmPassword: string) => { success: boolean; error?: string; user?: User };
  loginWithOtp: (identifier: string, otp: string) => { success: boolean; error?: string; user?: User };
  logout: () => void;
  setLoginMethod: (method: 'password' | 'whatsapp') => void;
  setRememberMe: (value: boolean) => void;
  updateUser: (user: Partial<User>) => void;
  hasRole: (roles: UserRole[]) => boolean;
  getUserForIdentifier: (identifier: string) => User | null;
  normalizeMobile: (input: string) => string;
  isIdentifierEmail: (input: string) => boolean;
  getRedirectPath: (role: UserRole) => string;
  isAccountLocked: (identifier: string) => boolean;
  getLockoutTimeRemaining: (identifier: string) => number;
  recordFailedAttempt: (identifier: string) => void;
  clearAttempts: (identifier: string) => void;
  // Impersonation
  impersonateUser: (targetUser: User) => void;
  exitImpersonation: () => void;
  // Forgot password
  requestPasswordReset: (identifier: string) => { success: boolean; error?: string; message?: string };
  resetPassword: (token: string, newPassword: string, confirmPassword: string) => { success: boolean; error?: string };
  // Check auth on load
  checkStoredSession: () => boolean;
}

// Use centralized normalizeMobile - returns 10 digits only

const isIdentifierEmail = (input: string): boolean => input.includes('@');

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const ATTEMPTS_KEY = 'p13_login_attempts';
const loadAttempts = (): Record<string, LoginAttempt> => {
  try {
    if (typeof localStorage === 'undefined') return {};
    return JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '{}');
  } catch { return {}; }
};
const saveAttempts = (attempts: Record<string, LoginAttempt>) => {
  try { localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts)); } catch { /* ignore */ }
};

const getRedirectPath = (role: UserRole): string => {
  switch (role) {
    case 'super_admin': return '/dashboard';
    case 'admin': return '/dashboard';
    case 'manager': return '/dashboard';
    case 'telecaller': return '/leads';
    case 'sales_person': return '/leads';
    case 'project_team': return '/visits';
    default: return '/dashboard';
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  loginMethod: 'password',
  rememberMe: false,
  loginAttempts: loadAttempts(),
  originalUser: null,
  isImpersonating: false,
  pendingForcePasswordChange: null,

  normalizeMobile,
  isIdentifierEmail,
  getRedirectPath,

  getUserForIdentifier: (identifier: string) => {
    const trimmed = identifier.trim();
    const allUsers = getUsers();
    if (isIdentifierEmail(trimmed)) {
      return allUsers.find(u => u.email.toLowerCase() === trimmed.toLowerCase()) || null;
    }
    const normalized = normalizeMobile(trimmed);
    return allUsers.find(u => {
      const userMobile = normalizeMobile(u.phone);
      return userMobile === normalized;
    }) || null;
  },

  isAccountLocked: (identifier: string) => {
    const attempts = get().loginAttempts[identifier];
    if (!attempts) return false;
    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) return true;
    return false;
  },

  getLockoutTimeRemaining: (identifier: string) => {
    const attempts = get().loginAttempts[identifier];
    if (!attempts?.lockedUntil) return 0;
    const remaining = attempts.lockedUntil - Date.now();
    return remaining > 0 ? remaining : 0;
  },

  recordFailedAttempt: (identifier: string) => {
    const current = get().loginAttempts[identifier] || { count: 0, lastAttemptAt: 0, lockedUntil: null };
    const newCount = current.count + 1;
    const updated: LoginAttempt = {
      count: newCount,
      lastAttemptAt: Date.now(),
      lockedUntil: newCount >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCKOUT_DURATION_MS : null,
    };
    set((state) => {
      const next = { ...state.loginAttempts, [identifier]: updated };
      saveAttempts(next);
      return { loginAttempts: next };
    });
  },

  clearAttempts: (identifier: string) => {
    set((state) => {
      const copy = { ...state.loginAttempts };
      delete copy[identifier];
      saveAttempts(copy);
      return { loginAttempts: copy };
    });
  },

  login: (identifier: string, password: string) => {
    const { getUserForIdentifier, isAccountLocked, recordFailedAttempt, clearAttempts } = get();

    // Check account lockout
    if (isAccountLocked(identifier)) {
      const remaining = Math.ceil(get().getLockoutTimeRemaining(identifier) / 60000);
      return { success: false, error: `Account temporarily locked. Try again in ${remaining} minutes.` };
    }

    // Find user
    const user = getUserForIdentifier(identifier);
    if (!user) {
      recordFailedAttempt(identifier);
      return { success: false, error: 'Invalid login details or account not active.' };
    }

    // Check account status
    if (!user.isActive) {
      if (user.forcePasswordChange) {
        return { success: false, error: 'Your account is not activated. Please check your invite email or contact admin.' };
      }
      return { success: false, error: 'Account is disabled. Please contact your administrator.' };
    }

    // Check login method enabled
    if (!user.loginMethods.password) {
      return { success: false, error: 'Password login is not enabled for your account.' };
    }

    // Check password (mock - in production: bcrypt.compare)
    // Universal password: Prop@1313 for all users
    const universalPassword = 'Prop@1313';
    if (password !== universalPassword) {
      recordFailedAttempt(identifier);
      const attempts = get().loginAttempts[identifier]?.count || 0;
      const remaining = MAX_FAILED_ATTEMPTS - attempts;
      if (remaining > 0) {
        return { success: false, error: `Invalid login details or account not active. ${remaining} attempts remaining.` };
      }
      return { success: false, error: 'Account temporarily locked. Try again in 15 minutes.' };
    }

    // Password correct, attempts cleared
    clearAttempts(identifier);

    // Forced password change: do NOT authenticate yet — hold the user as pending
    // so they cannot bypass the reset screen by navigating to a URL directly.
    if (user.forcePasswordChange) {
      set({ pendingForcePasswordChange: user, isAuthenticated: false, user: null, token: null });
      return { success: true, user, requiresPasswordChange: true };
    }

    // Success
    const token = `jwt_${user.id}_${Date.now()}`;
    const sessionData = { userId: user.id, token, timestamp: Date.now() };

    if (get().rememberMe) {
      localStorage.setItem('p13_session', JSON.stringify({ ...sessionData, remember: true }));
    } else {
      sessionStorage.setItem('p13_session', JSON.stringify(sessionData));
    }

    set({
      user: { ...user, lastLoginAt: new Date().toISOString() },
      isAuthenticated: true,
      token,
    });

    return { success: true, user };
  },

  completeForcedPasswordChange: (newPassword, confirmPassword) => {
    const pending = get().pendingForcePasswordChange;
    if (!pending) return { success: false, error: 'No pending password change.' };

    const validation = get().resetPassword('', newPassword, confirmPassword);
    if (!validation.success) return validation;

    // Clear the flag on the persisted user record so it isn't required again
    useRBACStore.getState().updateUser(pending.id, { forcePasswordChange: false });

    // Now authenticate the user and persist the session
    const updatedUser = { ...pending, forcePasswordChange: false, lastLoginAt: new Date().toISOString() };
    const token = `jwt_${pending.id}_${Date.now()}`;
    const sessionData = { userId: pending.id, token, timestamp: Date.now() };
    if (get().rememberMe) {
      localStorage.setItem('p13_session', JSON.stringify({ ...sessionData, remember: true }));
    } else {
      sessionStorage.setItem('p13_session', JSON.stringify(sessionData));
    }
    set({ user: updatedUser, isAuthenticated: true, token, pendingForcePasswordChange: null });
    return { success: true, user: updatedUser };
  },

  loginWithOtp: (identifier: string, otp: string) => {
    const { getUserForIdentifier, isAccountLocked, recordFailedAttempt, clearAttempts } = get();

    if (isAccountLocked(identifier)) {
      const remaining = Math.ceil(get().getLockoutTimeRemaining(identifier) / 60000);
      return { success: false, error: `Account temporarily locked. Try again in ${remaining} minutes.` };
    }

    const user = getUserForIdentifier(identifier);
    if (!user) {
      recordFailedAttempt(identifier);
      return { success: false, error: 'Invalid login details or account not active.' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Account is disabled. Please contact your administrator.' };
    }

    if (!user.loginMethods.whatsappOtp) {
      return { success: false, error: 'WhatsApp OTP login is not enabled for your account.' };
    }

    // Mock OTP verification (demo OTP: 131313)
    if (otp !== '131313') {
      recordFailedAttempt(identifier);
      return { success: false, error: 'Invalid OTP. Please try again.' };
    }

    clearAttempts(identifier);
    const token = `jwt_${user.id}_${Date.now()}`;
    const sessionData = { userId: user.id, token, timestamp: Date.now() };

    if (get().rememberMe) {
      localStorage.setItem('p13_session', JSON.stringify({ ...sessionData, remember: true }));
    } else {
      sessionStorage.setItem('p13_session', JSON.stringify(sessionData));
    }

    set({
      user: { ...user, lastLoginAt: new Date().toISOString() },
      isAuthenticated: true,
      token,
    });

    return { success: true, user };
  },

  logout: () => {
    localStorage.removeItem('p13_session');
    sessionStorage.removeItem('p13_session');
    set({ user: null, isAuthenticated: false, token: null });
    // Use replace to avoid back-button returning to logged-in state
    window.location.replace('/');
  },

  setLoginMethod: (method) => set({ loginMethod: method }),
  setRememberMe: (value) => set({ rememberMe: value }),

  updateUser: (partial) => set((state) => ({
    user: state.user ? { ...state.user, ...partial } : null,
  })),

  hasRole: (roles) => {
    const user = get().user;
    return user ? roles.includes(user.role) : false;
  },

  checkStoredSession: () => {
    try {
      const remembered = localStorage.getItem('p13_session');
      const sessioned = sessionStorage.getItem('p13_session');
      const stored = remembered || sessioned;

      if (!stored) return false;

      const data = JSON.parse(stored);
      const user = getUsers().find(u => u.id === data.userId);
      if (!user || !user.isActive) {
        localStorage.removeItem('p13_session');
        sessionStorage.removeItem('p13_session');
        return false;
      }

      set({ user, isAuthenticated: true, token: data.token, rememberMe: !!data.remember });
      return true;
    } catch {
      return false;
    }
  },

  requestPasswordReset: (identifier: string) => {
    const user = get().getUserForIdentifier(identifier);
    if (!user) {
      return { success: false, error: 'Invalid login details or account not active.' };
    }
    if (!user.isActive) {
      return { success: false, error: 'Account is disabled. Please contact your administrator.' };
    }
    return {
      success: true,
      message: isIdentifierEmail(identifier.trim())
        ? 'Password reset link sent to your email.'
        : 'Password reset OTP sent to your WhatsApp.',
    };
  },

  resetPassword: (_token: string, newPassword: string, confirmPassword: string) => {
    if (newPassword.length < 8) return { success: false, error: 'Password must be at least 8 characters.' };
    if (!/[A-Z]/.test(newPassword)) return { success: false, error: 'Password must contain an uppercase letter.' };
    if (!/[0-9]/.test(newPassword)) return { success: false, error: 'Password must contain a number.' };
    if (!/[!@#$%^&*]/.test(newPassword)) return { success: false, error: 'Password must contain a special character.' };
    if (newPassword !== confirmPassword) return { success: false, error: 'Passwords do not match.' };
    return { success: true };
  },

  impersonateUser: (targetUser: User) => {
    const currentUser = get().user;
    if (!currentUser) return;
    set({
      originalUser: currentUser,
      user: targetUser,
      isImpersonating: true,
    });
  },

  exitImpersonation: () => {
    const original = get().originalUser;
    if (!original) return;
    set({
      user: original,
      originalUser: null,
      isImpersonating: false,
    });
  },
}));

export const usePermission = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  const isManager = isAdmin || user?.role === 'manager';
  const isSales = user?.role === 'sales_person' || user?.role === 'telecaller';
  const isProjectTeam = user?.role === 'project_team';
  const can = (permission: string) => {
    if (isAdmin) return true;
    if (permission === 'manage_leads' && (isManager || isSales)) return true;
    if (permission === 'view_leads' && user) return true;
    if (permission === 'manage_projects' && isManager) return true;
    if (permission === 'manage_users' && isAdmin) return true;
    if (permission === 'manage_automation' && isManager) return true;
    if (permission === 'view_reports' && isManager) return true;
    if (permission === 'impersonate' && (user?.role === 'super_admin' || user?.role === 'admin')) return true;
    return false;
  };
  return { isAdmin, isManager, isSales, isProjectTeam, can, userRole: user?.role };
};
