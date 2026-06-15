import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Camera, Pencil, Lock, Shield, Smartphone, Globe, Bell, MessageCircle,
  Clock, Monitor, LogOut, Eye, EyeOff, Check, X, ChevronRight,
  User, Mail, Phone, Calendar, BadgeCheck, AlertCircle, ShieldCheck,
  KeyRound, Fingerprint, Save
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRBACStore } from '@/stores/rbacStore';
import { useUIStore } from '@/stores/uiStore';
import { validateMobile, handleMobileInputChange, handleMobileInputBlur, mobileInputProps } from '@/lib/phone-validation';
import {
  getInitials, getAvatarColor, users as allUsers,
  userSessions, notificationPrefs, auditLogs, loginActivity
} from '@/data/mockData';
import BottomSheet from '@/components/shared/BottomSheet';
import { cn } from '@/lib/utils';

type ProfileTab = 'overview' | 'security' | 'login_activity' | 'notifications';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser, impersonateUser } = useAuthStore();
  const { addToast } = useUIStore();
  const { disableUser, enableUser, deleteUser, startImpersonation, setPassword: rbacSetPassword } = useRBACStore();

  // Direct role check instead of broken usePermission import
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin' || false;

  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  // Edit profile state
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editDisplayName, setEditDisplayName] = useState(user?.displayName || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editWhatsappMobile, setEditWhatsappMobile] = useState(user?.whatsappMobile || '');
  const [editTimezone, setEditTimezone] = useState(user?.timezone || 'Asia/Kolkata');

  // Change password state
  const [showChangePass, setShowChangePass] = useState(false);
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confPass, setConfPass] = useState('');
  const [showCurr, setShowCurr] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);

  // Notification prefs state
  const [prefs, setPrefs] = useState({ ...notificationPrefs });

  // Login activity filter
  const [activityFilter, setActivityFilter] = useState<'all' | 'success' | 'failed'>('all');

  // Admin: show staff list
  const [showStaffList, setShowStaffList] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [showAdminActions, setShowAdminActions] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [adminNewPass, setAdminNewPass] = useState('');
  const [forceChange, setForceChange] = useState(false);

  if (!user) return null;

  const initials = getInitials(user.name);
  const avatarColor = getAvatarColor(user.name);
  const manager = allUsers.find(u => u.id === user.managerId);

  const myActivity = loginActivity.filter(la => la.userId === user.id);
  const filteredActivity = activityFilter === 'all' ? myActivity : myActivity.filter(a => a.status === activityFilter);

  const myAuditLogs = auditLogs.filter(al => al.userId === user.id);

  const handleSaveProfile = () => {
    // Validate mobile numbers
    const phoneResult = validateMobile(editPhone);
    const waResult = editWhatsappMobile.trim() ? validateMobile(editWhatsappMobile) : { valid: true, normalized: editWhatsappMobile };
    if (!phoneResult.valid) { addToast({ type: 'error', message: phoneResult.error || 'Invalid mobile number' }); return; }
    if (!waResult.valid) { addToast({ type: 'error', message: 'Invalid WhatsApp number' }); return; }
    updateUser({ name: editName, displayName: editDisplayName, phone: phoneResult.normalized, whatsappMobile: waResult.normalized, timezone: editTimezone });
    addToast({ type: 'success', message: 'Profile updated successfully' });
    setShowEdit(false);
  };

  const handleChangePassword = () => {
    if (newPass.length < 8) { addToast({ type: 'error', message: 'Password must be at least 8 characters' }); return; }
    if (!/[A-Z]/.test(newPass)) { addToast({ type: 'error', message: 'Password must contain an uppercase letter' }); return; }
    if (!/[0-9]/.test(newPass)) { addToast({ type: 'error', message: 'Password must contain a number' }); return; }
    if (!/[!@#$%^&*]/.test(newPass)) { addToast({ type: 'error', message: 'Password must contain a special character' }); return; }
    if (newPass !== confPass) { addToast({ type: 'error', message: 'Passwords do not match' }); return; }
    addToast({ type: 'success', message: 'Password changed successfully' });
    setShowChangePass(false);
    setCurrPass(''); setNewPass(''); setConfPass('');
  };

  const handleAdminSetPassword = () => {
    if (adminNewPass.length < 8) { addToast({ type: 'error', message: 'Password must be at least 8 characters' }); return; }
    if (selectedStaffId) rbacSetPassword(selectedStaffId, adminNewPass, forceChange, user?.id || 'system');
    addToast({ type: 'success', message: `Password ${forceChange ? 'set with force change' : 'updated'} for user` });
    setShowSetPassword(false); setAdminNewPass(''); setForceChange(false);
  };

  const togglePref = (key: keyof typeof prefs) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  const savePrefs = () => {
    addToast({ type: 'success', message: 'Notification preferences saved' });
  };

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: 'overview', label: 'Profile' },
    { key: 'security', label: 'Security' },
    { key: 'login_activity', label: 'Login Activity' },
    { key: 'notifications', label: 'Notifications' },
  ];

  const passStrength = () => {
    let s = 0;
    if (newPass.length >= 8) s++;
    if (/[A-Z]/.test(newPass)) s++;
    if (/[0-9]/.test(newPass)) s++;
    if (/[!@#$%^&*]/.test(newPass)) s++;
    return s;
  };

  const strength = passStrength();
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[15px] font-semibold flex-1">My Profile</h1>
        {isAdmin && (
          <button onClick={() => setShowStaffList(true)} className="text-xs bg-p13-yellow text-p13-black px-3 py-1.5 rounded-lg font-medium">
            Staff
          </button>
        )}
      </div>

      {/* Profile Hero Card */}
      <div className="bg-card px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-p13-yellow flex items-center justify-center text-foreground text-xl font-bold"
              style={{ backgroundColor: avatarColor }}>
              {initials}
            </div>
            <button className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-p13-yellow rounded-full flex items-center justify-center border-2 border-p13-black">
              <Camera size={12} className="text-p13-black" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-foreground text-lg font-semibold">{user.name}</h2>
            <p className="text-muted-foreground text-xs">{user.displayName || user.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-p13-yellow text-p13-black rounded-full text-[10px] font-semibold capitalize">
                {user.role.replace('_', ' ')}
              </span>
              {user.isActive ? (
                <span className="flex items-center gap-1 text-[10px] text-green-400">
                  <BadgeCheck size={10} /> Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-red-400">
                  <AlertCircle size={10} /> Inactive
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-border">
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-foreground">12</p>
            <p className="text-[10px] text-muted-foreground">Leads</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-foreground">8</p>
            <p className="text-[10px] text-muted-foreground">Follow-ups</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-foreground">5</p>
            <p className="text-[10px] text-muted-foreground">Visits</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-muted px-4 py-1 gap-0.5">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${activeTab === tab.key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="page-container pt-4">
        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Personal Info Card */}
              <div className="bg-card rounded-xl shadow-xs border border-border mb-4">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                  <h3 className="text-sm font-semibold">Personal Information</h3>
                  <button onClick={() => setShowEdit(true)} className="flex items-center gap-1 text-xs text-p13-yellow font-medium">
                    <Pencil size={12} /> Edit
                  </button>
                </div>
                <div className="px-4 py-3 space-y-3">
                  <ProfileInfoRow icon={<User size={14} />} label="Full Name" value={user.name} />
                  <ProfileInfoRow icon={<Mail size={14} />} label="Email" value={user.email} verified={user.emailVerified} />
                  <ProfileInfoRow icon={<Phone size={14} />} label="Mobile" value={user.phone} verified={user.phoneVerified} />
                  <ProfileInfoRow icon={<MessageCircle size={14} />} label="WhatsApp Mobile" value={user.whatsappMobile || '-'} />
                  <ProfileInfoRow icon={<User size={14} />} label="Display Name" value={user.displayName || '-'} />
                  <ProfileInfoRow icon={<Globe size={14} />} label="Timezone" value={user.timezone || '-'} />
                  <ProfileInfoRow icon={<Calendar size={14} />} label="Member Since" value={new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} />
                  {manager && (
                    <ProfileInfoRow icon={<User size={14} />} label="Reporting To" value={manager.name} />
                  )}
                </div>
              </div>

              {/* Account Status Card */}
              <div className="bg-card rounded-xl shadow-xs border border-border mb-4">
                <div className="px-4 py-3 border-b border-border/50">
                  <h3 className="text-sm font-semibold">Account Status</h3>
                </div>
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email Verification</span>
                    <span className={`flex items-center gap-1 text-xs font-medium ${user.emailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {user.emailVerified ? <><Check size={12} /> Verified</> : <><AlertCircle size={12} /> Pending</>}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Phone Verification</span>
                    <span className={`flex items-center gap-1 text-xs font-medium ${user.phoneVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {user.phoneVerified ? <><Check size={12} /> Verified</> : <><AlertCircle size={12} /> Pending</>}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Login</span>
                    <span className="text-xs text-muted-foreground">{new Date(user.lastLoginAt).toLocaleString()}</span>
                  </div>
                  {user.forcePasswordChange && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg p-2.5">
                      <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                      <span className="text-xs text-red-600 font-medium">Password change required on next login</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-card rounded-xl shadow-xs border border-border mb-4">
                <button onClick={() => setShowChangePass(true)} className="flex items-center gap-3 w-full px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-p13-yellow/10 flex items-center justify-center">
                    <Lock size={14} className="text-p13-yellow" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">Change Password</p>
                    <p className="text-[11px] text-muted-foreground">Update your password</p>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </button>
                <button onClick={() => setActiveTab('security')} className="flex items-center gap-3 w-full px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <Shield size={14} className="text-blue-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">Security Settings</p>
                    <p className="text-[11px] text-muted-foreground">Login methods & sessions</p>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </button>
                <button onClick={() => setActiveTab('login_activity')} className="flex items-center gap-3 w-full px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                    <Clock size={14} className="text-purple-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">Login Activity</p>
                    <p className="text-[11px] text-muted-foreground">View your login history</p>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </button>
                <button onClick={() => setActiveTab('notifications')} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                    <Bell size={14} className="text-green-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">Notification Preferences</p>
                    <p className="text-[11px] text-muted-foreground">Manage alert settings</p>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </button>
              </div>

              {/* Recent Audit Log */}
              {myAuditLogs.length > 0 && (
                <div className="bg-card rounded-xl shadow-xs border border-border mb-4">
                  <div className="px-4 py-3 border-b border-border/50">
                    <h3 className="text-sm font-semibold">Recent Account Activity</h3>
                  </div>
                  <div className="px-4 py-2">
                    {myAuditLogs.slice(0, 4).map(log => (
                      <div key={log.id} className="flex items-start gap-2 py-2 border-b border-border/50 last:border-0">
                        <ShieldCheck size={12} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground/80">{log.details}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(log.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Logout */}
              <button onClick={logout} className="w-full flex items-center justify-center gap-2 h-12 bg-red-50 text-red-600 rounded-xl text-sm font-medium mb-6">
                <LogOut size={16} /> Logout
              </button>
            </motion.div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <motion.div key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Login Methods */}
              <div className="bg-card rounded-xl shadow-xs border border-border mb-4">
                <div className="px-4 py-3 border-b border-border/50">
                  <h3 className="text-sm font-semibold">Login Methods</h3>
                </div>
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <KeyRound size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Password Login</p>
                        <p className="text-[11px] text-muted-foreground">Sign in with email and password</p>
                      </div>
                    </div>
                    <div className="w-10 h-5 bg-p13-yellow rounded-full relative flex-shrink-0">
                      <div className="absolute top-0.5 left-[22px] w-4 h-4 rounded-full bg-card shadow" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">WhatsApp OTP</p>
                        <p className="text-[11px] text-muted-foreground">Login with WhatsApp OTP</p>
                      </div>
                    </div>
                    <button
                      onClick={() => addToast({ type: 'success', message: `WhatsApp OTP ${user.loginMethods.whatsappOtp ? 'disabled' : 'enabled'}` })}
                      className={`w-10 h-5 rounded-full relative flex-shrink-0 transition-colors ${user.loginMethods.whatsappOtp ? 'bg-p13-yellow' : 'bg-muted'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-all ${user.loginMethods.whatsappOtp ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-card rounded-xl shadow-xs border border-border mb-4">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                  <h3 className="text-sm font-semibold">Active Sessions</h3>
                  <span className="text-[10px] text-muted-foreground">{userSessions.filter(s => s.userId === user.id).length} devices</span>
                </div>
                <div className="divide-y divide-border">
                  {userSessions.filter(s => s.userId === user.id).map(session => (
                    <div key={session.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Monitor size={16} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{session.device}</p>
                          {session.isCurrent && (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-[9px] font-semibold">Current</span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">{session.browser} &middot; {session.location}</p>
                        <p className="text-[10px] text-muted-foreground">IP: {session.ipAddress}</p>
                      </div>
                      {!session.isCurrent && (
                        <button onClick={() => addToast({ type: 'success', message: 'Session terminated' })}
                          className="text-xs text-red-500 font-medium flex-shrink-0">
                          End
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Two-Factor Auth */}
              <div className="bg-card rounded-xl shadow-xs border border-border mb-4">
                <div className="px-4 py-3 border-b border-border/50">
                  <h3 className="text-sm font-semibold">Two-Factor Authentication</h3>
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Fingerprint size={20} className="text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">2FA Not Enabled</p>
                      <p className="text-[11px] text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <button onClick={() => addToast({ type: 'info', message: '2FA setup coming soon' })}
                      className="px-3 py-1.5 bg-p13-yellow text-p13-black rounded-lg text-xs font-semibold">
                      Enable
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-card rounded-xl shadow-xs border border-red-100 mb-6">
                <div className="px-4 py-3 border-b border-red-100">
                  <h3 className="text-sm font-semibold text-red-600">Danger Zone</h3>
                </div>
                <div className="px-4 py-3">
                  <button onClick={() => { if (confirm('Logout from all devices?')) addToast({ type: 'success', message: 'Logged out from all devices' }); }}
                    className="w-full h-10 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                    Logout from All Devices
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* LOGIN ACTIVITY TAB */}
          {activeTab === 'login_activity' && (
            <motion.div key="login_activity" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Filter */}
              <div className="flex gap-1.5 mb-3">
                {(['all', 'success', 'failed'] as const).map(f => (
                  <button key={f} onClick={() => setActivityFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${activityFilter === f ? 'bg-p13-yellow text-p13-black' : 'bg-muted text-muted-foreground'}`}>
                    {f}
                  </button>
                ))}
              </div>

              {/* Activity List */}
              <div className="bg-card rounded-xl shadow-xs border border-border">
                <div className="divide-y divide-border">
                  {filteredActivity.map((activity, i) => (
                    <motion.div key={activity.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className="flex items-start gap-3 px-4 py-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.status === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {activity.status === 'success' ? <Check size={14} className="text-green-600" /> : <X size={14} className="text-red-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium capitalize">{activity.action.replace(/_/g, ' ')}</p>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${activity.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {activity.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{activity.browser} on {activity.device}</p>
                        <p className="text-[11px] text-muted-foreground">IP: {activity.ipAddress}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(activity.createdAt).toLocaleString()}</p>
                      </div>
                    </motion.div>
                  ))}
                  {filteredActivity.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">No login activity found</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <motion.div key="notifications" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* CRM Alerts */}
              <div className="bg-card rounded-xl shadow-xs border border-border mb-4">
                <div className="px-4 py-3 border-b border-border/50">
                  <h3 className="text-sm font-semibold">CRM Alerts</h3>
                </div>
                <div className="divide-y divide-border">
                  <NotificationToggleRow label="Lead Assigned Alerts" desc="When a new lead is assigned to you" enabled={prefs.leadAssigned} onToggle={() => togglePref('leadAssigned')} />
                  <NotificationToggleRow label="Follow-up Reminders" desc="Reminders for upcoming follow-ups" enabled={prefs.followUpReminders} onToggle={() => togglePref('followUpReminders')} />
                  <NotificationToggleRow label="Visit Reminders" desc="Alerts for scheduled visits" enabled={prefs.visitReminders} onToggle={() => togglePref('visitReminders')} />
                  <NotificationToggleRow label="Loan Inquiry Alerts" desc="New loan inquiry notifications" enabled={prefs.loanInquiryAlerts} onToggle={() => togglePref('loanInquiryAlerts')} />
                  <NotificationToggleRow label="Automation Alerts" desc="Automation rule triggers" enabled={prefs.automationAlerts} onToggle={() => togglePref('automationAlerts')} />
                </div>
              </div>

              {/* Security Alerts */}
              <div className="bg-card rounded-xl shadow-xs border border-border mb-4">
                <div className="px-4 py-3 border-b border-border/50">
                  <h3 className="text-sm font-semibold">Security</h3>
                </div>
                <div className="divide-y divide-border">
                  <NotificationToggleRow label="Login Security Alerts" desc="New device or suspicious login alerts" enabled={prefs.loginSecurityAlerts} onToggle={() => togglePref('loginSecurityAlerts')} />
                </div>
              </div>

              {/* Delivery Channels */}
              <div className="bg-card rounded-xl shadow-xs border border-border mb-4">
                <div className="px-4 py-3 border-b border-border/50">
                  <h3 className="text-sm font-semibold">Delivery Channels</h3>
                </div>
                <div className="divide-y divide-border">
                  <NotificationToggleRow label="Email Notifications" desc="Receive alerts via email" enabled={prefs.emailNotifications} onToggle={() => togglePref('emailNotifications')} />
                  <NotificationToggleRow label="Push Notifications" desc="Browser push notifications" enabled={prefs.pushNotifications} onToggle={() => togglePref('pushNotifications')} />
                  <NotificationToggleRow label="WhatsApp Notifications" desc="Alerts via WhatsApp" enabled={prefs.whatsappNotifications} onToggle={() => togglePref('whatsappNotifications')} />
                  <NotificationToggleRow label="Sound" desc="Play sound for notifications" enabled={prefs.soundEnabled} onToggle={() => togglePref('soundEnabled')} />
                </div>
              </div>

              <button onClick={savePrefs} className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold mb-6">
                Save Preferences
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Profile Bottom Sheet */}
      <BottomSheet isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Profile">
        <div className="space-y-4 py-2">
          {/* Photo upload */}
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-p13-yellow flex items-center justify-center text-foreground text-lg font-bold"
                style={{ backgroundColor: avatarColor }}>
                {getInitials(editName)}
              </div>
              <button className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-p13-yellow rounded-full flex items-center justify-center border-2 border-white">
                <Camera size={12} className="text-p13-black" />
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name *</label>
            <input value={editName} onChange={e => setEditName(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Display Name</label>
            <input value={editDisplayName} onChange={e => setEditDisplayName(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Mobile Number</label>
            <div className="flex">
              <span className="h-11 px-2 flex items-center bg-muted border border-r-0 border-border rounded-l-lg text-xs text-muted-foreground font-medium">+91</span>
              <input
                {...mobileInputProps}
                value={editPhone}
                onChange={e => handleMobileInputChange(e.target.value, setEditPhone)}
                onBlur={() => handleMobileInputBlur(editPhone, setEditPhone)}
                className="flex-1 h-11 px-3 rounded-r-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none font-mono tracking-wide"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">WhatsApp Mobile</label>
            <div className="flex">
              <span className="h-11 px-2 flex items-center bg-muted border border-r-0 border-border rounded-l-lg text-xs text-muted-foreground font-medium">+91</span>
              <input
                {...mobileInputProps}
                value={editWhatsappMobile}
                onChange={e => handleMobileInputChange(e.target.value, setEditWhatsappMobile)}
                onBlur={() => handleMobileInputBlur(editWhatsappMobile, setEditWhatsappMobile)}
                className="flex-1 h-11 px-3 rounded-r-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none font-mono tracking-wide"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Used for WhatsApp template sending</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Timezone</label>
            <select value={editTimezone} onChange={e => setEditTimezone(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none">
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="America/New_York">America/New York (EST)</option>
            </select>
          </div>
          <button onClick={handleSaveProfile} className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
            <Save size={14} /> Save Changes
          </button>
        </div>
      </BottomSheet>

      {/* Change Password Bottom Sheet */}
      <BottomSheet isOpen={showChangePass} onClose={() => setShowChangePass(false)} title="Change Password">
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Current Password</label>
            <div className="relative">
              <input type={showCurr ? 'text' : 'password'} value={currPass} onChange={e => setCurrPass(e.target.value)}
                className="w-full h-11 px-3 pr-10 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none" />
              <button onClick={() => setShowCurr(!showCurr)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showCurr ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">New Password</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)}
                className="w-full h-11 px-3 pr-10 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none" />
              <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {/* Password Strength */}
            {newPass && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColors[strength - 1] : 'bg-muted'}`} />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">{strengthLabels[strength - 1] || 'Too weak'}</p>
              </div>
            )}
            <div className="mt-2 space-y-1">
              {[
                { label: 'At least 8 characters', valid: newPass.length >= 8 },
                { label: 'One uppercase letter', valid: /[A-Z]/.test(newPass) },
                { label: 'One number', valid: /[0-9]/.test(newPass) },
                { label: 'One special character (!@#$%^&*)', valid: /[!@#$%^&*]/.test(newPass) },
              ].map(req => (
                <div key={req.label} className="flex items-center gap-1.5">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${req.valid ? 'bg-green-500' : 'bg-muted'}`}>
                    <Check size={8} className="text-foreground" />
                  </div>
                  <span className={`text-[11px] ${req.valid ? 'text-green-600' : 'text-muted-foreground'}`}>{req.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Confirm Password</label>
            <div className="relative">
              <input type={showConf ? 'text' : 'password'} value={confPass} onChange={e => setConfPass(e.target.value)}
                className="w-full h-11 px-3 pr-10 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none" />
              <button onClick={() => setShowConf(!showConf)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showConf ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {confPass && newPass !== confPass && <p className="text-[11px] text-red-500 mt-1">Passwords do not match</p>}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id="logoutOthers" className="w-4 h-4 accent-p13-yellow" />
            <label htmlFor="logoutOthers" className="text-xs text-muted-foreground">Logout from all other devices</label>
          </div>
          <button onClick={handleChangePassword} className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold">
            Update Password
          </button>
        </div>
      </BottomSheet>

      {/* Admin Staff List Bottom Sheet */}
      <BottomSheet isOpen={showStaffList} onClose={() => { setShowStaffList(false); setSelectedStaffId(null); }} title="Staff Members" maxHeight="90vh">
        <div className="space-y-2 py-2">
          {allUsers.filter(u => u.id !== user.id).map(staff => {
            const sInit = getInitials(staff.name);
            const sColor = getAvatarColor(staff.name);
            const sLeads = [12, 8, 5, 0][Math.abs(staff.name.charCodeAt(0)) % 4];
            return (
              <div key={staff.id} className="bg-card rounded-lg p-3 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-foreground text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: sColor }}>
                    {sInit}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{staff.name}</p>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${staff.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {staff.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground capitalize">{staff.role.replace('_', ' ')} &middot; {sLeads} leads</p>
                  </div>
                  <button onClick={() => { setSelectedStaffId(staff.id); setShowAdminActions(true); }}
                    className="text-xs bg-card text-foreground px-3 py-1.5 rounded-lg font-medium">
                    Manage
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </BottomSheet>

      {/* Admin Actions Bottom Sheet */}
      <BottomSheet isOpen={showAdminActions} onClose={() => { setShowAdminActions(false); setSelectedStaffId(null); }} title="Admin Actions">
        {selectedStaffId && (() => {
          const staff = allUsers.find(u => u.id === selectedStaffId);
          if (!staff) return null;
          return (
            <div className="space-y-2 py-2">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-foreground text-xs font-bold"
                  style={{ backgroundColor: getAvatarColor(staff.name) }}>
                  {getInitials(staff.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{staff.name}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{staff.role.replace('_', ' ')}</p>
                </div>
              </div>
              <button onClick={() => { setShowAdminActions(false); setShowSetPassword(true); }}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-muted transition-colors text-left">
                <KeyRound size={16} className="text-p13-yellow" />
                <div><p className="text-sm font-medium">Set Password</p><p className="text-[11px] text-muted-foreground">Set new password for user</p></div>
              </button>
              <button onClick={() => { addToast({ type: 'success', message: 'Password reset email sent' }); setShowAdminActions(false); }}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-muted transition-colors text-left">
                <Lock size={16} className="text-blue-500" />
                <div><p className="text-sm font-medium">Reset Password</p><p className="text-[11px] text-muted-foreground">Send password reset link</p></div>
              </button>
              <button onClick={() => { startImpersonation(staff.id, user?.id || 'system'); impersonateUser(staff); addToast({ type: 'success', message: `Now viewing as ${staff.name}` }); setShowAdminActions(false); setTimeout(() => navigate('/dashboard'), 200); }}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-muted transition-colors text-left">
                <User size={16} className="text-purple-500" />
                <div><p className="text-sm font-medium">Login as User</p><p className="text-[11px] text-muted-foreground">Impersonate this account</p></div>
              </button>
              <button onClick={() => { if (staff.isActive) disableUser(staff.id, user?.id || 'system'); else enableUser(staff.id, user?.id || 'system'); addToast({ type: 'success', message: `${staff.isActive ? 'Disabled' : 'Enabled'} ${staff.name}` }); setShowAdminActions(false); }}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-muted transition-colors text-left">
                <Shield size={16} className={staff.isActive ? 'text-red-500' : 'text-green-500'} />
                <div><p className="text-sm font-medium">{staff.isActive ? 'Disable Account' : 'Enable Account'}</p><p className="text-[11px] text-muted-foreground">{staff.isActive ? 'Temporarily disable' : 'Reactivate account'}</p></div>
              </button>
              <button onClick={() => { if (confirm(`Delete ${staff.name}?`)) { deleteUser(staff.id, user?.id || 'system'); addToast({ type: 'success', message: 'User deleted' }); setShowAdminActions(false); } }}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-red-50 transition-colors text-left">
                <Trash2Custom />
                <div><p className="text-sm font-medium text-red-600">Delete Account</p><p className="text-[11px] text-muted-foreground">Permanently remove user</p></div>
              </button>
            </div>
          );
        })()}
      </BottomSheet>

      {/* Admin Set Password Sheet */}
      <BottomSheet isOpen={showSetPassword} onClose={() => { setShowSetPassword(false); setAdminNewPass(''); setForceChange(false); }} title="Set Password">
        <div className="space-y-4 py-2">
          {selectedStaffId && (() => {
            const staff = allUsers.find(u => u.id === selectedStaffId);
            return staff ? (
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-foreground text-xs font-bold"
                  style={{ backgroundColor: getAvatarColor(staff.name) }}>
                  {getInitials(staff.name)}
                </div>
                <p className="text-sm font-medium">{staff.name}</p>
              </div>
            ) : null;
          })()}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">New Password</label>
            <input type="password" value={adminNewPass} onChange={e => setAdminNewPass(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="forceChange" checked={forceChange} onChange={e => setForceChange(e.target.checked)}
              className="w-4 h-4 accent-p13-yellow" />
            <label htmlFor="forceChange" className="text-xs text-muted-foreground">Force password change on next login</label>
          </div>
          <button onClick={handleAdminSetPassword} className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold">
            Set Password
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

/* ===== Sub-Components ===== */

function ProfileInfoRow({ icon, label, value, verified }: { icon: React.ReactNode; label: string; value: React.ReactNode; verified?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-foreground">{value}</span>
        {verified !== undefined && (
          verified ? <BadgeCheck size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-yellow-500" />
        )}
      </div>
    </div>
  );
}

function NotificationToggleRow({ label, desc, enabled, onToggle }: { label: string; desc: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </div>
      <button onClick={onToggle}
        className={cn('w-10 h-5 rounded-full relative flex-shrink-0 transition-colors', enabled ? 'bg-p13-yellow' : 'bg-muted')}>
        <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-all', enabled ? 'left-[22px]' : 'left-0.5')} />
      </button>
    </div>
  );
}

function Trash2Custom() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

