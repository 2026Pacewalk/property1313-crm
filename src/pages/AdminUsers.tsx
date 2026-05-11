import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Shield, UserPlus, KeyRound, Lock, User, Search,
  Eye, EyeOff, Check, BadgeCheck,
  ShieldCheck, ShieldX, UserCheck, Trash2, Mail, Phone, Globe,
  Activity
} from 'lucide-react';
import { useAuthStore, usePermission } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useRBACStore } from '@/stores/rbacStore';
import { getInitials, getAvatarColor, userSessions, loginActivity } from '@/data/mockData';
import { validateMobile, handleMobileInputChange, handleMobileInputBlur, mobileInputProps } from '@/lib/phone-validation';
import BottomSheet from '@/components/shared/BottomSheet';
import { cn } from '@/lib/utils';

export default function AdminUsers() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { can } = usePermission();
  const { addToast } = useUIStore();
  const rbac = useRBACStore();
  const allUsers = rbac.users;

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [adminNewPass, setAdminNewPass] = useState('');
  const [forceChange, setForceChange] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Create user form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('sales_person');
  const [newPassword, setNewPassword] = useState('');
  const [newManagerId, setNewManagerId] = useState('');

  if (!user || (user.role !== 'super_admin' && user.role !== 'admin' && user.role !== 'manager')) {
    return (
      <div className="page-container pt-10 text-center">
        <Shield size={48} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold">Access Denied</h2>
        <p className="text-sm text-muted-foreground mt-1">You need admin privileges to access this page.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 h-10 px-6 bg-p13-yellow text-p13-black rounded-lg text-sm font-medium">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Filter users
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const selectedUser = selectedUserId ? allUsers.find(u => u.id === selectedUserId) : null;

  const handleSetPassword = () => {
    if (adminNewPass.length < 8) { addToast({ type: 'error', message: 'Password must be at least 8 characters' }); return; }
    if (!selectedUser) return;
    rbac.setPassword(selectedUser.id, adminNewPass, forceChange, user?.id || 'system');
    addToast({ type: 'success', message: `Password ${forceChange ? 'set with force change' : 'updated'} for ${selectedUser.name}` });
    setShowSetPassword(false); setAdminNewPass(''); setForceChange(false); setShowPass(false);
  };

  const handleCreateUser = () => {
    if (!newName.trim() || !newEmail.trim()) { addToast({ type: 'error', message: 'Name and email are required' }); return; }
    if (newPassword.length < 8) { addToast({ type: 'error', message: 'Password must be at least 8 characters' }); return; }
    // Validate mobile if provided
    let normalizedPhone = newPhone;
    if (newPhone.trim()) {
      const result = validateMobile(newPhone);
      if (!result.valid) { addToast({ type: 'error', message: result.error || 'Invalid mobile number' }); return; }
      normalizedPhone = result.normalized;
    }
    rbac.createUser({
      name: newName.trim(),
      email: newEmail.trim(),
      phone: normalizedPhone || '0000000000',
      role: newRole as 'admin' | 'manager' | 'sales_person' | 'telecaller' | 'project_team',
      avatar: '',
      isActive: true,
      managerId: newManagerId || undefined,
      loginMethods: { password: true, whatsappOtp: true },
      displayName: newName.trim().split(' ').map((w: string) => w[0]).join('').toUpperCase(),
      timezone: 'Asia/Kolkata',
      emailVerified: false,
      phoneVerified: false,
    });
    addToast({ type: 'success', message: `Invited ${newName} as ${newRole}` });
    setShowCreateUser(false);
    setNewName(''); setNewEmail(''); setNewPhone(''); setNewRole('sales_person'); setNewPassword(''); setNewManagerId('');
  };

  const handleToggleActive = (u: typeof allUsers[0]) => {
    if (u.isActive) {
      rbac.disableUser(u.id, user?.id || 'system');
      addToast({ type: 'success', message: `${u.name} has been disabled` });
    } else {
      rbac.enableUser(u.id, user?.id || 'system');
      addToast({ type: 'success', message: `${u.name} has been enabled` });
    }
    setShowActions(false); setSelectedUserId(null);
  };

  const handleDeleteUser = (u: typeof allUsers[0]) => {
    if (confirm(`Delete ${u.name} permanently?`)) {
      rbac.deleteUser(u.id, user?.id || 'system');
      addToast({ type: 'success', message: `${u.name} deleted` });
      setShowActions(false); setSelectedUserId(null);
    }
  };

  const roleCounts = {
    all: allUsers.length,
    super_admin: allUsers.filter(u => u.role === 'super_admin').length,
    admin: allUsers.filter(u => u.role === 'admin').length,
    manager: allUsers.filter(u => u.role === 'manager').length,
    sales_person: allUsers.filter(u => u.role === 'sales_person').length,
    telecaller: allUsers.filter(u => u.role === 'telecaller').length,
    project_team: allUsers.filter(u => u.role === 'project_team').length,
  };

  const roleLabels: Record<string, string> = {
    all: 'All', super_admin: 'Super Admin', admin: 'Admin', manager: 'Manager',
    sales_person: 'Sales', telecaller: 'Telecaller', project_team: 'Project Team',
  };

  const roleBadgeColors: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-700',
    admin: 'bg-orange-100 text-orange-700',
    manager: 'bg-purple-100 text-purple-700',
    sales_person: 'bg-green-100 text-green-700',
    telecaller: 'bg-blue-100 text-blue-700',
    project_team: 'bg-pink-100 text-pink-700',
  };

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-p13-white/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground"><ArrowLeft size={18} /></button>
          <h1 className="text-[17px] font-semibold flex-1">User Management</h1>
          <button onClick={() => setShowCreateUser(true)}
            className="h-9 px-3 bg-p13-yellow text-p13-black rounded-lg text-xs font-semibold flex items-center gap-1.5">
            <UserPlus size={14} /> Invite
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none" />
        </div>
      </div>

      {/* Role filter pills */}
      <div className="px-4 pt-3 flex gap-1.5 overflow-x-auto pb-1">
        {Object.entries(roleLabels).map(([role, label]) => (
          <button key={role} onClick={() => setRoleFilter(role)}
            className={cn('flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all',
              roleFilter === role ? 'bg-p13-yellow text-p13-black border-p13-yellow' : 'bg-card text-muted-foreground border-border')}>
            {label} <span className="opacity-60">({roleCounts[role as keyof typeof roleCounts] || 0})</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="px-4 py-3 grid grid-cols-4 gap-2">
        {[
          { label: 'Total', value: allUsers.length, color: 'bg-muted' },
          { label: 'Active', value: allUsers.filter(u => u.isActive).length, color: 'bg-green-100 text-green-700' },
          { label: 'Inactive', value: allUsers.filter(u => !u.isActive).length, color: 'bg-red-100 text-red-700' },
          { label: 'Online', value: allUsers.filter(u => u.isActive).length, color: 'bg-blue-100 text-blue-700' },
        ].map(s => (
          <div key={s.label} className={cn('rounded-lg p-2 text-center', s.color)}>
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[10px] font-medium opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* User List */}
      <div className="px-4 space-y-2">
        {filteredUsers.map((u, i) => (
          <motion.div key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="bg-card rounded-lg border border-neutral-200/50 p-3 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-foreground text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: getAvatarColor(u.name) }}>
                {getInitials(u.name)}
              </div>
              <div className="flex-1 min-w-0" onClick={() => { setSelectedUserId(u.id); setShowUserDetail(true); }}>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{u.name}</p>
                  {u.id === user.id && <span className="text-[9px] bg-p13-yellow text-p13-black px-1.5 py-0.5 rounded-full font-semibold">You</span>}
                </div>
                <p className="text-[11px] text-muted-foreground">{u.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded-full capitalize', roleBadgeColors[u.role] || 'bg-muted')}>
                    {u.role.replace('_', ' ')}
                  </span>
                  <span className={cn('flex items-center gap-0.5 text-[10px]', u.isActive ? 'text-green-500' : 'text-red-500')}>
                    {u.isActive ? <><BadgeCheck size={9} /> Active</> : <><ShieldX size={9} /> Inactive</>}
                  </span>
                  {u.forcePasswordChange && <span className="text-[9px] text-red-500 font-medium">Force Change</span>}
                </div>
              </div>
              <button onClick={() => { setSelectedUserId(u.id); setShowActions(true); }}
                className="text-xs bg-card text-foreground px-3 py-1.5 rounded-lg font-medium flex-shrink-0">
                Manage
              </button>
            </div>
          </motion.div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center py-10">
            <User size={32} className="text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No users found</p>
          </div>
        )}
      </div>

      {/* ==================== USER DETAIL SHEET ==================== */}
      <BottomSheet isOpen={showUserDetail} onClose={() => { setShowUserDetail(false); setSelectedUserId(null); }} title="User Details" maxHeight="85vh">
        {selectedUser && (() => {
          const sessions = userSessions.filter(s => s.userId === selectedUser.id);
          const activity = loginActivity.filter(a => a.userId === selectedUser.id);
          return (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-foreground text-lg font-bold"
                  style={{ backgroundColor: getAvatarColor(selectedUser.name) }}>
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <p className="text-base font-semibold">{selectedUser.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize', roleBadgeColors[selectedUser.role] || 'bg-muted')}>
                      {selectedUser.role.replace('_', ' ')}
                    </span>
                    <span className={cn('text-[10px]', selectedUser.isActive ? 'text-green-500' : 'text-red-500')}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <DetailRow icon={<Mail size={14} />} label="Email" value={selectedUser.email} />
                <DetailRow icon={<Phone size={14} />} label="Mobile" value={selectedUser.phone} />
                <DetailRow icon={<Shield size={14} />} label="Role" value={selectedUser.role.replace('_', ' ')} />
                <DetailRow icon={<Globe size={14} />} label="Timezone" value={selectedUser.timezone || 'Asia/Kolkata'} />
                <DetailRow icon={<Activity size={14} />} label="Last Login" value={new Date(selectedUser.lastLoginAt).toLocaleString()} />
                <DetailRow icon={<Check size={14} />} label="Email Verified" value={selectedUser.emailVerified ? 'Yes' : 'No'} />
                <DetailRow icon={<Check size={14} />} label="Phone Verified" value={selectedUser.phoneVerified ? 'Yes' : 'No'} />
                <DetailRow icon={<KeyRound size={14} />} label="Password Login" value={selectedUser.loginMethods.password ? 'Enabled' : 'Disabled'} />
                <DetailRow icon={<Phone size={14} />} label="WhatsApp OTP" value={selectedUser.loginMethods.whatsappOtp ? 'Enabled' : 'Disabled'} />
                <DetailRow icon={<Check size={14} />} label="Force Password Change" value={selectedUser.forcePasswordChange ? 'Yes' : 'No'} />
              </div>

              {sessions.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Active Sessions ({sessions.length})</p>
                  {sessions.map(s => (
                    <div key={s.id} className="flex items-center gap-2 py-1.5">
                      <span className="text-[10px] text-muted-foreground">{s.device} &middot; {s.browser}</span>
                      {s.isCurrent && <span className="text-[9px] text-green-600 font-semibold">Current</span>}
                    </div>
                  ))}
                </div>
              )}

              {activity.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Recent Activity</p>
                  {activity.slice(0, 5).map(a => (
                    <div key={a.id} className="flex items-center gap-2 py-1.5">
                      <span className={cn('w-2 h-2 rounded-full', a.status === 'success' ? 'bg-green-400' : 'bg-red-400')} />
                      <span className="text-[10px] text-muted-foreground">{a.action.replace(/_/g, ' ')} &middot; {new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </BottomSheet>

      {/* ==================== MANAGE ACTIONS SHEET ==================== */}
      <BottomSheet isOpen={showActions} onClose={() => { setShowActions(false); setSelectedUserId(null); }} title="User Actions">
        {selectedUser && (
          <div className="space-y-1 py-2">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-foreground text-xs font-bold"
                style={{ backgroundColor: getAvatarColor(selectedUser.name) }}>
                {getInitials(selectedUser.name)}
              </div>
              <div>
                <p className="text-sm font-semibold">{selectedUser.name}</p>
                <p className="text-[11px] text-muted-foreground capitalize">{selectedUser.role.replace('_', ' ')} &middot; {selectedUser.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            </div>

            <ActionButton icon={<KeyRound size={16} className="text-p13-yellow" />} label="Set Password" desc="Set new password for user"
              onClick={() => { setShowActions(false); setShowSetPassword(true); }} />
            <ActionButton icon={<Lock size={16} className="text-blue-500" />} label="Reset Password" desc="Send password reset link"
              onClick={() => { addToast({ type: 'success', message: 'Password reset email sent' }); setShowActions(false); }} />
            {can('impersonate') && (
              <ActionButton icon={<UserCheck size={16} className="text-purple-500" />} label="Login as User" desc="Impersonate this account"
                onClick={() => {
                  if (!selectedUser) return;
                  rbac.startImpersonation(selectedUser.id, user?.id || 'system');
                  useAuthStore.getState().impersonateUser(selectedUser);
                  addToast({ type: 'success', message: `Now viewing as ${selectedUser.name}` });
                  setShowActions(false);
                  setTimeout(() => navigate('/dashboard'), 200);
                }} />
            )}
            <ActionButton icon={selectedUser.isActive ? <ShieldX size={16} className="text-red-500" /> : <ShieldCheck size={16} className="text-green-500" />}
              label={selectedUser.isActive ? 'Disable Account' : 'Enable Account'}
              desc={selectedUser.isActive ? 'Temporarily disable user' : 'Reactivate account'}
              onClick={() => handleToggleActive(selectedUser)} />
            <ActionButton icon={<Trash2 size={16} className="text-red-500" />} label="Delete Account" desc="Permanently remove user"
              danger onClick={() => handleDeleteUser(selectedUser)} />
          </div>
        )}
      </BottomSheet>

      {/* ==================== SET PASSWORD SHEET ==================== */}
      <BottomSheet isOpen={showSetPassword} onClose={() => { setShowSetPassword(false); setAdminNewPass(''); setForceChange(false); }} title="Set Password">
        <div className="space-y-4 py-2">
          {selectedUser && (
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-foreground text-xs font-bold"
                style={{ backgroundColor: getAvatarColor(selectedUser.name) }}>
                {getInitials(selectedUser.name)}
              </div>
              <p className="text-sm font-medium">{selectedUser.name}</p>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">New Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={adminNewPass} onChange={e => setAdminNewPass(e.target.value)}
                className="w-full h-11 px-3 pr-10 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow outline-none" />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="forceChange" checked={forceChange} onChange={e => setForceChange(e.target.checked)} className="w-4 h-4 accent-p13-yellow" />
            <label htmlFor="forceChange" className="text-xs text-muted-foreground">Force password change on next login</label>
          </div>
          <button onClick={handleSetPassword} className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold">
            Set Password
          </button>
        </div>
      </BottomSheet>

      {/* ==================== CREATE USER SHEET ==================== */}
      <BottomSheet isOpen={showCreateUser} onClose={() => setShowCreateUser(false)} title="Invite New User" maxHeight="90vh">
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name *</label>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g., John Doe"
              className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-p13-yellow" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Email *</label>
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="john@company.com"
              className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-p13-yellow" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Mobile</label>
            <div className="flex">
              <span className="h-11 px-2 flex items-center bg-muted border border-r-0 border-border rounded-l-lg text-xs text-muted-foreground font-medium">+91</span>
              <input
                {...mobileInputProps}
                value={newPhone}
                onChange={e => handleMobileInputChange(e.target.value, setNewPhone)}
                onBlur={() => handleMobileInputBlur(newPhone, setNewPhone)}
                placeholder="9876543210"
                className="flex-1 h-11 px-3 rounded-r-lg border border-border bg-card text-sm outline-none focus:border-p13-yellow font-mono tracking-wide"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
            <select value={newRole} onChange={e => setNewRole(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-p13-yellow">
              {Object.entries(roleLabels).filter(([k]) => k !== 'all').map(([role, label]) => (
                <option key={role} value={role}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Manager</label>
            <select value={newManagerId} onChange={e => setNewManagerId(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-p13-yellow">
              <option value="">No manager</option>
              {allUsers.filter(u => u.role === 'manager' || u.role === 'admin').map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Initial Password *</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-p13-yellow" />
            <p className="text-[10px] text-muted-foreground mt-1">Min 8 characters with uppercase, number, special char</p>
          </div>
          <button onClick={handleCreateUser} className="w-full h-12 bg-card text-foreground rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2">
            <UserPlus size={16} /> Send Invite
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm text-neutral-800 font-medium">{value}</span>
    </div>
  );
}

function ActionButton({ icon, label, desc, danger, onClick }: {
  icon: React.ReactNode; label: string; desc: string; danger?: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className={cn('flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-muted transition-colors text-left',
      danger && 'hover:bg-red-50')}>
      {icon}
      <div>
        <p className={cn('text-sm font-medium', danger && 'text-red-600')}>{label}</p>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </div>
    </button>
  );
}
