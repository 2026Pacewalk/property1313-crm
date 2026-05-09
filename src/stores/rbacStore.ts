import { create } from 'zustand';
import type { User, UserRole, Permission, AccountStatus, AuditAction, AuditLog, RoleDefinition } from '@/types';
import { users as initialUsers, auditLogs as initialAuditLogs } from '@/data/mockData';

// ==================== ROLE DEFINITIONS ====================
export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    role: 'super_admin',
    label: 'Super Admin',
    description: 'Full system access. Can manage everything including other admins.',
    level: 100,
    permissions: ['can_view_leads', 'can_create_leads', 'can_edit_own_leads', 'can_edit_team_leads', 'can_delete_leads', 'can_manage_projects', 'can_manage_users', 'can_manage_templates', 'can_manage_automation', 'can_view_reports', 'can_manage_settings', 'can_impersonate', 'can_manage_roles'],
    canBeManagedBy: ['super_admin'],
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
  {
    role: 'admin',
    label: 'Admin',
    description: 'Can manage users, leads, projects and view reports.',
    level: 80,
    permissions: ['can_view_leads', 'can_create_leads', 'can_edit_own_leads', 'can_edit_team_leads', 'can_delete_leads', 'can_manage_projects', 'can_manage_users', 'can_manage_templates', 'can_manage_automation', 'can_view_reports', 'can_manage_settings'],
    canBeManagedBy: ['super_admin', 'admin'],
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  {
    role: 'manager',
    label: 'Manager',
    description: 'Manages team leads, projects and can view team reports.',
    level: 60,
    permissions: ['can_view_leads', 'can_create_leads', 'can_edit_own_leads', 'can_edit_team_leads', 'can_delete_leads', 'can_manage_projects', 'can_manage_templates', 'can_view_reports'],
    canBeManagedBy: ['super_admin', 'admin', 'manager'],
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
  },
  {
    role: 'sales_person',
    label: 'Sales Person',
    description: 'Handles assigned leads, follow-ups and site visits.',
    level: 40,
    permissions: ['can_view_leads', 'can_create_leads', 'can_edit_own_leads', 'can_manage_templates'],
    canBeManagedBy: ['super_admin', 'admin', 'manager'],
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  {
    role: 'telecaller',
    label: 'Telecaller',
    description: 'Makes calls, schedules follow-ups and qualifies leads.',
    level: 30,
    permissions: ['can_view_leads', 'can_create_leads', 'can_edit_own_leads'],
    canBeManagedBy: ['super_admin', 'admin', 'manager'],
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  {
    role: 'project_team',
    label: 'Project Team',
    description: 'Manages project info, site visits and project-related leads.',
    level: 20,
    permissions: ['can_view_leads', 'can_edit_own_leads', 'can_manage_projects'],
    canBeManagedBy: ['super_admin', 'admin', 'manager'],
    color: 'text-pink-700',
    bgColor: 'bg-pink-100',
  },
];

// ==================== ACCOUNT STATUS CONFIG ====================
export const STATUS_CONFIG: Record<AccountStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  active: { label: 'Active', color: 'text-green-700', bgColor: 'bg-green-100', icon: 'check' },
  disabled: { label: 'Disabled', color: 'text-red-700', bgColor: 'bg-red-100', icon: 'x' },
  invite_pending: { label: 'Invite Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: 'mail' },
  locked: { label: 'Locked', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: 'lock' },
  archived: { label: 'Archived', color: 'text-neutral-500', bgColor: 'bg-neutral-100', icon: 'archive' },
};

// ==================== AUDIT ACTION LABELS ====================
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  user_created: 'User Created',
  user_updated: 'User Updated',
  user_disabled: 'User Disabled',
  user_enabled: 'User Enabled',
  user_archived: 'User Archived',
  user_deleted: 'User Deleted',
  role_changed: 'Role Changed',
  password_set: 'Password Set',
  password_reset: 'Password Reset',
  password_changed: 'Password Changed',
  force_password_change_set: 'Force Password Change Set',
  invite_sent: 'Invite Sent',
  invite_resent: 'Invite Resent',
  account_activated: 'Account Activated',
  login_success: 'Login Success',
  login_failed: 'Login Failed',
  login_otp: 'OTP Login',
  logout: 'Logout',
  session_revoked: 'Session Revoked',
  impersonation_started: 'Impersonation Started',
  impersonation_ended: 'Impersonation Ended',
  permission_changed: 'Permission Changed',
  setting_changed: 'Setting Changed',
  template_created: 'Template Created',
  automation_rule_changed: 'Automation Rule Changed',
};

// ==================== STORE ====================
interface RBACState {
  users: User[];
  auditLogs: AuditLog[];
  impersonating: { originalUserId: string; targetUser: User } | null;

  // Permission engine
  hasPermission: (userRole: UserRole, permission: Permission) => boolean;
  hasAnyPermission: (userRole: UserRole, permissions: Permission[]) => boolean;
  getRoleDef: (role: UserRole) => RoleDefinition | undefined;
  canManageRole: (managerRole: UserRole, targetRole: UserRole) => boolean;

  // User CRUD
  createUser: (data: Omit<User, 'id' | 'createdAt' | 'lastLoginAt' | 'accountStatus'> & { accountStatus?: AccountStatus }) => User;
  updateUser: (id: string, data: Partial<User>) => void;
  updateUserRole: (id: string, newRole: UserRole, changedBy: string) => void;
  disableUser: (id: string, changedBy: string) => void;
  enableUser: (id: string, changedBy: string) => void;
  archiveUser: (id: string, changedBy: string) => void;
  deleteUser: (id: string, changedBy: string) => void;
  setPassword: (id: string, password: string, forceChange: boolean, changedBy: string) => void;
  sendInvite: (id: string, changedBy: string) => void;
  resendInvite: (id: string, changedBy: string) => void;
  startImpersonation: (targetUserId: string, adminUserId: string) => void;
  endImpersonation: (adminUserId: string) => void;

  // Audit logging
  addAuditLog: (log: Omit<AuditLog, 'id' | 'createdAt'>) => void;
  getAuditLogsForUser: (userId: string) => AuditLog[];
  getAllAuditLogs: () => AuditLog[];

  // Getters
  getActiveUsers: () => User[];
  getUsersByStatus: (status: AccountStatus) => User[];
  getUsersByRole: (role: UserRole) => User[];
  getManagedUsers: (managerId: string) => User[];
  getUserStats: () => { total: number; active: number; disabled: number; invitePending: number; locked: number; archived: number; online: number };
}

export const useRBACStore = create<RBACState>((set, get) => ({
  users: initialUsers,
  auditLogs: initialAuditLogs,
  impersonating: null,

  // Permission engine
  hasPermission: (userRole, permission) => {
    const def = ROLE_DEFINITIONS.find((r) => r.role === userRole);
    return def?.permissions.includes(permission) ?? false;
  },

  hasAnyPermission: (userRole, permissions) => {
    const def = ROLE_DEFINITIONS.find((r) => r.role === userRole);
    if (!def) return false;
    return permissions.some((p) => def.permissions.includes(p));
  },

  getRoleDef: (role) => ROLE_DEFINITIONS.find((r) => r.role === role),

  canManageRole: (managerRole, targetRole) => {
    const targetDef = ROLE_DEFINITIONS.find((r) => r.role === targetRole);
    if (!targetDef) return false;
    return targetDef.canBeManagedBy.includes(managerRole);
  },

  // User CRUD
  createUser: (data) => {
    const newUser: User = {
      ...data,
      id: `u${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastLoginAt: '',
      accountStatus: data.accountStatus || 'active',
      isActive: data.accountStatus === 'active' || data.isActive,
    };
    set((s) => ({ users: [...s.users, newUser] }));

    get().addAuditLog({
      userId: newUser.id,
      userName: newUser.name,
      action: 'user_created',
      entityType: 'user',
      entityId: newUser.id,
      details: `Created user ${newUser.name} (${newUser.role})`,
    });

    return newUser;
  },

  updateUser: (id, data) => {
    const oldUser = get().users.find((u) => u.id === id);
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
    }));

    if (oldUser) {
      get().addAuditLog({
        userId: id,
        userName: oldUser.name,
        targetUserId: id,
        targetUserName: data.name || oldUser.name,
        action: 'user_updated',
        entityType: 'user',
        entityId: id,
        details: `Updated user ${data.name || oldUser.name}`,
      });
    }
  },

  updateUserRole: (id, newRole, changedBy) => {
    const user = get().users.find((u) => u.id === id);
    if (!user) return;
    const oldRole = user.role;

    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, role: newRole } : u)),
    }));

    get().addAuditLog({
      userId: changedBy,
      userName: get().users.find((u) => u.id === changedBy)?.name || 'Admin',
      targetUserId: id,
      targetUserName: user.name,
      action: 'role_changed',
      entityType: 'user',
      entityId: id,
      details: `Role changed from ${oldRole} to ${newRole} for ${user.name}`,
      performedBy: changedBy,
    });
  },

  disableUser: (id, changedBy) => {
    const user = get().users.find((u) => u.id === id);
    if (!user) return;

    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, isActive: false, accountStatus: 'disabled' } : u)),
    }));

    get().addAuditLog({
      userId: changedBy,
      userName: get().users.find((u) => u.id === changedBy)?.name || 'Admin',
      targetUserId: id,
      targetUserName: user.name,
      action: 'user_disabled',
      entityType: 'user',
      entityId: id,
      details: `Account disabled for ${user.name}`,
      performedBy: changedBy,
    });
  },

  enableUser: (id, changedBy) => {
    const user = get().users.find((u) => u.id === id);
    if (!user) return;

    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, isActive: true, accountStatus: 'active' } : u)),
    }));

    get().addAuditLog({
      userId: changedBy,
      userName: get().users.find((u) => u.id === changedBy)?.name || 'Admin',
      targetUserId: id,
      targetUserName: user.name,
      action: 'user_enabled',
      entityType: 'user',
      entityId: id,
      details: `Account enabled for ${user.name}`,
      performedBy: changedBy,
    });
  },

  archiveUser: (id, changedBy) => {
    const user = get().users.find((u) => u.id === id);
    if (!user) return;

    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, isActive: false, accountStatus: 'archived' } : u)),
    }));

    get().addAuditLog({
      userId: changedBy,
      userName: get().users.find((u) => u.id === changedBy)?.name || 'Admin',
      targetUserId: id,
      targetUserName: user.name,
      action: 'user_archived',
      entityType: 'user',
      entityId: id,
      details: `Account archived for ${user.name}`,
      performedBy: changedBy,
    });
  },

  deleteUser: (id, changedBy) => {
    const user = get().users.find((u) => u.id === id);
    if (!user) return;

    set((s) => ({ users: s.users.filter((u) => u.id !== id) }));

    get().addAuditLog({
      userId: changedBy,
      userName: get().users.find((u) => u.id === changedBy)?.name || 'Admin',
      targetUserId: id,
      targetUserName: user.name,
      action: 'user_deleted',
      entityType: 'user',
      entityId: id,
      details: `User ${user.name} permanently deleted`,
      performedBy: changedBy,
    });
  },

  setPassword: (id, _password, forceChange, changedBy) => {
    const user = get().users.find((u) => u.id === id);
    if (!user) return;

    set((s) => ({
      users: s.users.map((u) =>
        u.id === id ? { ...u, forcePasswordChange: forceChange, loginMethods: { ...u.loginMethods, password: true } } : u
      ),
    }));

    get().addAuditLog({
      userId: changedBy,
      userName: get().users.find((u) => u.id === changedBy)?.name || 'Admin',
      targetUserId: id,
      targetUserName: user.name,
      action: forceChange ? 'force_password_change_set' : 'password_set',
      entityType: 'user',
      entityId: id,
      details: forceChange
        ? `Password set for ${user.name} with force change`
        : `Password set for ${user.name}`,
      performedBy: changedBy,
    });
  },

  sendInvite: (id, changedBy) => {
    const user = get().users.find((u) => u.id === id);
    if (!user) return;

    set((s) => ({
      users: s.users.map((u) =>
        u.id === id
          ? { ...u, accountStatus: 'invite_pending', invitedAt: new Date().toISOString(), invitedBy: changedBy }
          : u
      ),
    }));

    get().addAuditLog({
      userId: changedBy,
      userName: get().users.find((u) => u.id === changedBy)?.name || 'Admin',
      targetUserId: id,
      targetUserName: user.name,
      action: 'invite_sent',
      entityType: 'user',
      entityId: id,
      details: `Invite sent to ${user.email}`,
      performedBy: changedBy,
    });
  },

  resendInvite: (id, changedBy) => {
    const user = get().users.find((u) => u.id === id);
    if (!user) return;

    get().addAuditLog({
      userId: changedBy,
      userName: get().users.find((u) => u.id === changedBy)?.name || 'Admin',
      targetUserId: id,
      targetUserName: user.name,
      action: 'invite_resent',
      entityType: 'user',
      entityId: id,
      details: `Invite resent to ${user.email}`,
      performedBy: changedBy,
    });
  },

  startImpersonation: (targetUserId, adminUserId) => {
    const target = get().users.find((u) => u.id === targetUserId);
    if (!target) return;

    set({ impersonating: { originalUserId: adminUserId, targetUser: target } });

    get().addAuditLog({
      userId: adminUserId,
      userName: get().users.find((u) => u.id === adminUserId)?.name || 'Admin',
      targetUserId,
      targetUserName: target.name,
      action: 'impersonation_started',
      entityType: 'user',
      entityId: targetUserId,
      details: `Started impersonating ${target.name}`,
      performedBy: adminUserId,
    });
  },

  endImpersonation: (adminUserId) => {
    const imp = get().impersonating;
    if (!imp) return;

    get().addAuditLog({
      userId: adminUserId,
      userName: get().users.find((u) => u.id === adminUserId)?.name || 'Admin',
      targetUserId: imp.targetUser.id,
      targetUserName: imp.targetUser.name,
      action: 'impersonation_ended',
      entityType: 'user',
      entityId: imp.targetUser.id,
      details: `Ended impersonation of ${imp.targetUser.name}`,
      performedBy: adminUserId,
    });

    set({ impersonating: null });
  },

  // Audit logging
  addAuditLog: (log) => {
    const newLog: AuditLog = {
      ...log,
      id: `al${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ auditLogs: [newLog, ...s.auditLogs] }));
  },

  getAuditLogsForUser: (userId) => {
    return get().auditLogs.filter((l) => l.targetUserId === userId || l.userId === userId);
  },

  getAllAuditLogs: () => [...get().auditLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

  // Getters
  getActiveUsers: () => get().users.filter((u) => u.accountStatus === 'active'),
  getUsersByStatus: (status) => get().users.filter((u) => u.accountStatus === status),
  getUsersByRole: (role) => get().users.filter((u) => u.role === role),
  getManagedUsers: (managerId) => get().users.filter((u) => u.managerId === managerId),

  getUserStats: () => {
    const all = get().users;
    return {
      total: all.length,
      active: all.filter((u) => u.accountStatus === 'active').length,
      disabled: all.filter((u) => u.accountStatus === 'disabled').length,
      invitePending: all.filter((u) => u.accountStatus === 'invite_pending').length,
      locked: all.filter((u) => u.accountStatus === 'locked').length,
      archived: all.filter((u) => u.accountStatus === 'archived').length,
      online: all.filter((u) => u.isActive && u.accountStatus === 'active').length,
    };
  },
}));
