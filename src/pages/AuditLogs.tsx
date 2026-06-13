import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Shield, Search, Filter, Calendar, AlertTriangle,
  KeyRound, UserPlus, UserCheck, UserX, Lock, Mail, User as UserIcon,
  MailOpen, Archive, Trash2, Eye, LogIn, LogOut, RefreshCw,
  ShieldAlert, ClipboardList, Clock, X, FileText
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRBACStore, AUDIT_ACTION_LABELS } from '@/stores/rbacStore';
import { users as allUsers } from '@/data/mockData';
import BottomSheet from '@/components/shared/BottomSheet';
import { cn } from '@/lib/utils';
import type { AuditAction } from '@/types';

// Action icon mapping
const ACTION_ICONS: Record<string, React.ReactNode> = {
  user_created: <UserPlus size={14} />,
  user_updated: <FileText size={14} />,
  user_disabled: <UserX size={14} />,
  user_enabled: <UserCheck size={14} />,
  user_archived: <Archive size={14} />,
  user_deleted: <Trash2 size={14} />,
  role_changed: <Shield size={14} />,
  password_set: <KeyRound size={14} />,
  password_reset: <RefreshCw size={14} />,
  password_changed: <KeyRound size={14} />,
  force_password_change_set: <AlertTriangle size={14} />,
  invite_sent: <Mail size={14} />,
  invite_resent: <MailOpen size={14} />,
  account_activated: <UserCheck size={14} />,
  login_success: <LogIn size={14} />,
  login_failed: <LogIn size={14} />,
  login_otp: <Shield size={14} />,
  logout: <LogOut size={14} />,
  session_revoked: <Lock size={14} />,
  impersonation_started: <Eye size={14} />,
  impersonation_ended: <Eye size={14} />,
  permission_changed: <ShieldAlert size={14} />,
  setting_changed: <ClipboardList size={14} />,
  template_created: <FileText size={14} />,
  automation_rule_changed: <RefreshCw size={14} />,
};

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
  user_created: { bg: 'bg-green-100', text: 'text-green-700' },
  user_updated: { bg: 'bg-blue-100', text: 'text-blue-700' },
  user_disabled: { bg: 'bg-red-100', text: 'text-red-700' },
  user_enabled: { bg: 'bg-green-100', text: 'text-green-700' },
  user_archived: { bg: 'bg-muted', text: 'text-muted-foreground' },
  user_deleted: { bg: 'bg-red-100', text: 'text-red-700' },
  role_changed: { bg: 'bg-purple-100', text: 'text-purple-700' },
  password_set: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  password_reset: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  password_changed: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  force_password_change_set: { bg: 'bg-orange-100', text: 'text-orange-700' },
  invite_sent: { bg: 'bg-blue-100', text: 'text-blue-700' },
  invite_resent: { bg: 'bg-blue-100', text: 'text-blue-700' },
  account_activated: { bg: 'bg-green-100', text: 'text-green-700' },
  login_success: { bg: 'bg-green-100', text: 'text-green-700' },
  login_failed: { bg: 'bg-red-100', text: 'text-red-700' },
  login_otp: { bg: 'bg-blue-100', text: 'text-blue-700' },
  logout: { bg: 'bg-muted', text: 'text-muted-foreground' },
  session_revoked: { bg: 'bg-red-100', text: 'text-red-700' },
  impersonation_started: { bg: 'bg-purple-100', text: 'text-purple-700' },
  impersonation_ended: { bg: 'bg-purple-100', text: 'text-purple-700' },
  permission_changed: { bg: 'bg-orange-100', text: 'text-orange-700' },
  setting_changed: { bg: 'bg-muted', text: 'text-muted-foreground' },
  template_created: { bg: 'bg-blue-100', text: 'text-blue-700' },
  automation_rule_changed: { bg: 'bg-muted', text: 'text-muted-foreground' },
};

// Group actions by category for filter
const ACTION_CATEGORIES = {
  'All Actions': [] as AuditAction[],
  'User Management': ['user_created', 'user_updated', 'user_disabled', 'user_enabled', 'user_archived', 'user_deleted'] as AuditAction[],
  'Auth & Security': ['login_success', 'login_failed', 'login_otp', 'logout', 'session_revoked', 'password_set', 'password_reset', 'password_changed', 'force_password_change_set'] as AuditAction[],
  'Access Control': ['role_changed', 'permission_changed', 'impersonation_started', 'impersonation_ended'] as AuditAction[],
  'Invites': ['invite_sent', 'invite_resent', 'account_activated'] as AuditAction[],
  'System': ['setting_changed', 'template_created', 'automation_rule_changed'] as AuditAction[],
};

export default function AuditLogs() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { auditLogs, getUserStats } = useRBACStore();

  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showLogDetail, setShowLogDetail] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
    return (
      <div className="page-container pt-10 text-center">
        <Shield size={48} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold">Access Denied</h2>
        <p className="text-sm text-muted-foreground mt-1">You need admin privileges to access audit logs.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 h-10 px-6 bg-p13-yellow text-p13-black rounded-lg text-sm font-medium">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const stats = getUserStats();

  // Date filter logic
  const getDateCutoff = () => {
    const now = new Date();
    switch (dateFilter) {
      case 'today': return new Date(now.setHours(0, 0, 0, 0));
      case 'yesterday': { const d = new Date(); d.setDate(d.getDate() - 1); d.setHours(0, 0, 0, 0); return d; }
      case '7days': { const d = new Date(); d.setDate(d.getDate() - 7); return d; }
      case '30days': { const d = new Date(); d.setDate(d.getDate() - 30); return d; }
      default: return null;
    }
  };

  const filteredLogs = useMemo(() => {
    let logs = [...auditLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const dateCutoff = getDateCutoff();

    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(l =>
        l.userName.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        (l.targetUserName && l.targetUserName.toLowerCase().includes(q)) ||
        l.action.toLowerCase().includes(q)
      );
    }

    if (userFilter !== 'all') {
      logs = logs.filter(l => l.userId === userFilter);
    }

    if (actionFilter !== 'all') {
      if (ACTION_CATEGORIES['User Management'].includes(actionFilter as AuditAction)) {
        logs = logs.filter(l => ACTION_CATEGORIES['User Management'].includes(l.action));
      } else if (ACTION_CATEGORIES['Auth & Security'].includes(actionFilter as AuditAction)) {
        logs = logs.filter(l => ACTION_CATEGORIES['Auth & Security'].includes(l.action));
      } else if (ACTION_CATEGORIES['Access Control'].includes(actionFilter as AuditAction)) {
        logs = logs.filter(l => ACTION_CATEGORIES['Access Control'].includes(l.action));
      } else if (ACTION_CATEGORIES['Invites'].includes(actionFilter as AuditAction)) {
        logs = logs.filter(l => ACTION_CATEGORIES['Invites'].includes(l.action));
      } else if (ACTION_CATEGORIES['System'].includes(actionFilter as AuditAction)) {
        logs = logs.filter(l => ACTION_CATEGORIES['System'].includes(l.action));
      }
    }

    if (dateCutoff) {
      logs = logs.filter(l => new Date(l.createdAt) >= dateCutoff);
    }

    return logs;
  }, [auditLogs, search, userFilter, actionFilter, dateFilter]);

  const selectedLog = selectedLogId ? auditLogs.find(l => l.id === selectedLogId) : null;

  const activeFilterCount = [userFilter !== 'all', actionFilter !== 'all', dateFilter !== 'all'].filter(Boolean).length;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground"><ArrowLeft size={18} /></button>
          <h1 className="text-[17px] font-semibold flex-1">Audit Logs</h1>
          <button onClick={() => setShowFilters(!showFilters)}
            className={cn('h-9 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all',
              activeFilterCount > 0 ? 'bg-p13-yellow text-p13-black border-p13-yellow' : 'bg-card text-muted-foreground border-border')}>
            <Filter size={14} />
            Filters
            {activeFilterCount > 0 && <span className="bg-card text-foreground text-[10px] px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs by user, action, details..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-2 pb-1">
            <div className="flex gap-2">
              <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}
                className="flex-1 h-9 px-2 rounded-lg border border-border bg-card text-xs outline-none focus:border-p13-yellow">
                <option value="all">All Users</option>
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
                className="flex-1 h-9 px-2 rounded-lg border border-border bg-card text-xs outline-none focus:border-p13-yellow">
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
              className="w-full h-9 px-2 rounded-lg border border-border bg-card text-xs outline-none focus:border-p13-yellow">
              <option value="all">All Actions</option>
              {Object.entries(ACTION_CATEGORIES).filter(([k]) => k !== 'All Actions').map(([category, actions]) => (
                <optgroup key={category} label={category}>
                  {actions.map(action => (
                    <option key={action} value={action}>{AUDIT_ACTION_LABELS[action]}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {activeFilterCount > 0 && (
              <button onClick={() => { setUserFilter('all'); setActionFilter('all'); setDateFilter('all'); setSearch(''); }}
                className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                <X size={12} /> Clear all filters
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Stats Row */}
      <div className="px-4 py-3 grid grid-cols-4 gap-2">
        {[
          { label: 'Total Logs', value: auditLogs.length, color: 'bg-muted' },
          { label: 'Users', value: stats.total, color: 'bg-blue-100 text-blue-700' },
          { label: 'Active', value: stats.active, color: 'bg-green-100 text-green-700' },
          { label: 'Disabled', value: stats.disabled, color: 'bg-red-100 text-red-700' },
        ].map(s => (
          <div key={s.label} className={cn('rounded-lg p-2 text-center', s.color)}>
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[10px] font-medium opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Results Count */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">{filteredLogs.length} log entries</p>
        {(userFilter !== 'all' || actionFilter !== 'all' || dateFilter !== 'all' || search) && (
          <p className="text-[11px] text-muted-foreground">Filtered</p>
        )}
      </div>

      {/* Audit Log List */}
      <div className="px-4 space-y-1.5">
        {filteredLogs.map((log, i) => {
          const colors = ACTION_COLORS[log.action] || { bg: 'bg-muted', text: 'text-muted-foreground' };
          return (
            <motion.div key={log.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="p-3 flex items-start gap-3 cursor-pointer" onClick={() => { setSelectedLogId(log.id); setShowLogDetail(true); }}>
                {/* Action Icon */}
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', colors.bg, colors.text)}>
                  {ACTION_ICONS[log.action] || <FileText size={14} />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-medium text-foreground">
                      {log.userName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {AUDIT_ACTION_LABELS[log.action] || log.action}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{log.details}</p>

                  {log.targetUserName && log.targetUserId !== log.userId && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Target: {log.targetUserName}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Calendar size={10} />
                      {new Date(log.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock size={10} />
                      {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {log.ipAddress && (
                      <span className="hidden sm:inline">IP: {log.ipAddress}</span>
                    )}
                  </div>
                </div>

                {/* Expand indicator */}
                <div className="text-muted-foreground/50 flex-shrink-0 mt-1">
                  <ChevronRight size={14} />
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList size={40} className="text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">No audit logs found</p>
            <p className="text-[11px] text-muted-foreground mt-1">Try adjusting your filters</p>
            {activeFilterCount > 0 && (
              <button onClick={() => { setUserFilter('all'); setActionFilter('all'); setDateFilter('all'); setSearch(''); }}
                className="mt-3 text-xs text-p13-yellow font-medium underline">
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Log Detail Bottom Sheet */}
      <BottomSheet isOpen={showLogDetail} onClose={() => { setShowLogDetail(false); setSelectedLogId(null); }} title="Log Detail" maxHeight="70vh">
        {selectedLog && (() => {
          const colors = ACTION_COLORS[selectedLog.action] || { bg: 'bg-muted', text: 'text-muted-foreground' };
          return (
            <div className="space-y-4 py-2">
              {/* Action Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', colors.bg, colors.text)}>
                  {ACTION_ICONS[selectedLog.action] || <FileText size={20} />}
                </div>
                <div>
                  <p className="text-sm font-semibold">{AUDIT_ACTION_LABELS[selectedLog.action] || selectedLog.action}</p>
                  <p className="text-[11px] text-muted-foreground">{selectedLog.entityType} &middot; {selectedLog.entityId}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <DetailRow icon={<UserIcon size={14} />} label="Performed By" value={selectedLog.userName} />
                {selectedLog.targetUserName && selectedLog.targetUserId !== selectedLog.userId && (
                  <DetailRow icon={<UserIcon size={14} />} label="Target User" value={selectedLog.targetUserName} />
                )}
                <DetailRow icon={<FileText size={14} />} label="Details" value={selectedLog.details} />
                <DetailRow icon={<Calendar size={14} />} label="Date" value={new Date(selectedLog.createdAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
                <DetailRow icon={<Clock size={14} />} label="Time" value={new Date(selectedLog.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} />
                {selectedLog.ipAddress && (
                  <DetailRow icon={<Shield size={14} />} label="IP Address" value={selectedLog.ipAddress} />
                )}
                {selectedLog.performedBy && (
                  <DetailRow icon={<Shield size={14} />} label="Performed By (Admin)" value={selectedLog.performedBy} />
                )}
              </div>
            </div>
          );
        })()}
      </BottomSheet>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}

// Need to import ChevronRight for the list
function ChevronRight({ size, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}