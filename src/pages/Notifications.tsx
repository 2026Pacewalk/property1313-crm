import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Check, CheckCheck, Trash2, Search, X, Filter,
  UserPlus, AlertTriangle, MapPin, CheckCircle, Zap,
  FileText, Shield, Clock, Flame, Calendar, Building2,
  Users, Settings as SettingsIcon
} from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType, NotificationModule, NotificationPriority } from '@/types';

const iconMap: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  lead_assigned: { icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-100' },
  lead_status_changed: { icon: Flame, color: 'text-orange-600', bg: 'bg-orange-100' },
  lead_converted: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  follow_up_overdue: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
  follow_up_reminder: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  visit_reminder: { icon: MapPin, color: 'text-orange-600', bg: 'bg-orange-100' },
  visit_scheduled: { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
  project_shared: { icon: Building2, color: 'text-purple-600', bg: 'bg-purple-100' },
  loan_inquiry: { icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
  automation_alert: { icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  login_alert: { icon: Shield, color: 'text-gray-600', bg: 'bg-gray-200' },
  account_disabled: { icon: Users, color: 'text-red-600', bg: 'bg-red-100' },
  user_invited: { icon: UserPlus, color: 'text-green-600', bg: 'bg-green-100' },
  impersonation: { icon: Shield, color: 'text-red-600', bg: 'bg-red-100' },
  system: { icon: SettingsIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
};

const priorityConfig: Record<string, { label: string; dot: string; badge: string }> = {
  urgent: { label: 'Urgent', dot: 'bg-red-500', badge: 'bg-red-100 text-red-700' },
  high: { label: 'High', dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
  normal: { label: 'Normal', dot: 'bg-blue-400', badge: 'bg-blue-100 text-blue-700' },
  low: { label: 'Low', dot: 'bg-gray-300', badge: 'bg-gray-100 text-gray-600' },
};

const moduleLabels: Record<string, string> = {
  leads: 'Leads', followups: 'Follow-ups', visits: 'Visits',
  projects: 'Projects', loans: 'Loans', automation: 'Automation', users: 'Security', system: 'System',
};

const typeLabels: Record<string, string> = {
  lead_assigned: 'Lead Assigned',
  lead_status_changed: 'Status Changed',
  lead_converted: 'Lead Converted',
  follow_up_overdue: 'Overdue',
  follow_up_reminder: 'Reminder',
  visit_reminder: 'Visit Reminder',
  visit_scheduled: 'Visit Scheduled',
  project_shared: 'Project Shared',
  loan_inquiry: 'Loan Inquiry',
  automation_alert: 'Automation',
  login_alert: 'Login Alert',
  account_disabled: 'Account',
  user_invited: 'User Invited',
  impersonation: 'Impersonation',
  system: 'System',
};

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, markNotificationRead, markAllNotificationsRead, markNotificationsReadByIds, deleteNotification, deleteNotificationsByIds, createNotification } = useDataStore();
  const { addToast } = useUIStore();

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // 20% chance to add a new notification every 15 seconds
      if (Math.random() > 0.8) {
        const newNotifs = [
          { type: 'lead_assigned' as NotificationType, title: 'New lead assigned', description: 'A new lead has been assigned to you', priority: 'normal' as NotificationPriority, module: 'leads' as NotificationModule, read: false, actions: [{ label: 'View', action: 'view' }] },
          { type: 'follow_up_reminder' as NotificationType, title: 'Follow-up reminder', description: 'You have an upcoming follow-up in 30 minutes', priority: 'high' as NotificationPriority, module: 'followups' as NotificationModule, read: false, actions: [{ label: 'View', action: 'view' }] },
          { type: 'visit_reminder' as NotificationType, title: 'Visit reminder', description: 'Site visit scheduled in 1 hour', priority: 'normal' as NotificationPriority, module: 'visits' as NotificationModule, read: false, actions: [{ label: 'View', action: 'view' }] },
        ];
        const random = newNotifs[Math.floor(Math.random() * newNotifs.length)];
        createNotification(random);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [createNotification]);

  const activeNotifications = notifications.filter(n => !n.deleted);

  // Filtered notifications
  const filtered = useMemo(() => {
    return activeNotifications.filter(n => {
      const matchesSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || n.type === typeFilter;
      const matchesModule = moduleFilter === 'all' || n.module === moduleFilter;
      const matchesPriority = priorityFilter === 'all' || n.priority === priorityFilter;
      const matchesRead = readFilter === 'all' || (readFilter === 'unread' ? !n.read : n.read);
      return matchesSearch && matchesType && matchesModule && matchesPriority && matchesRead;
    });
  }, [activeNotifications, search, typeFilter, moduleFilter, priorityFilter, readFilter]);

  const unreadCount = activeNotifications.filter(n => !n.read).length;
  const urgentCount = activeNotifications.filter(n => !n.read && n.priority === 'urgent').length;

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    filtered.forEach(n => {
      const date = new Date(n.createdAt).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(n);
    });
    return groups;
  }, [filtered]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(n => n.id));
    }
  };

  const handleBulkRead = () => {
    markNotificationsReadByIds(selectedIds);
    addToast({ type: 'success', message: `${selectedIds.length} notifications marked as read` });
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    deleteNotificationsByIds(selectedIds);
    addToast({ type: 'success', message: `${selectedIds.length} notifications removed` });
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const dateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const handleNotificationClick = (n: Notification) => {
    if (selectionMode) {
      toggleSelect(n.id);
      return;
    }
    if (!n.read) markNotificationRead(n.id);
    // Navigate based on module
    if (n.module === 'leads' && n.entityId) navigate(`/leads/${n.entityId}`);
    else if (n.module === 'visits') navigate('/visits');
    else if (n.module === 'followups') navigate('/follow-ups');
    else if (n.module === 'projects') navigate('/projects');
    else if (n.module === 'loans') navigate('/loan-inquiry');
    else if (n.module === 'automation') navigate('/automation');
  };

  const hasFilters = typeFilter !== 'all' || moduleFilter !== 'all' || priorityFilter !== 'all' || readFilter !== 'all';

  const clearFilters = () => {
    setTypeFilter('all');
    setModuleFilter('all');
    setPriorityFilter('all');
    setReadFilter('all');
    setSearch('');
  };

  return (
    <div className="page-container pt-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-h1-mobile md:text-h1-desktop font-semibold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-p13-yellow text-p13-black rounded-full text-[10px] font-bold">
              {unreadCount} new
            </span>
          )}
          {urgentCount > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold">
              {urgentCount} urgent
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectionMode ? (
            <>
              <span className="text-xs text-neutral-500">{selectedIds.length} selected</span>
              {selectedIds.length > 0 && (
                <>
                  <button onClick={handleBulkRead} className="text-xs text-blue-600 font-medium hover:underline">
                    Mark read
                  </button>
                  <button onClick={handleBulkDelete} className="text-xs text-red-500 font-medium hover:underline">
                    Delete
                  </button>
                </>
              )}
              <button onClick={() => { setSelectionMode(false); setSelectedIds([]); }} className="text-xs text-neutral-500">
                Cancel
              </button>
            </>
          ) : (
            <>
              {unreadCount > 0 && (
                <button onClick={() => { markAllNotificationsRead(); addToast({ type: 'success', message: 'All marked as read' }); }}
                  className="flex items-center gap-1 text-xs text-p13-yellow font-medium hover:underline">
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
              <button onClick={() => setSelectionMode(true)} className="text-xs text-neutral-500 hover:text-neutral-700">
                Select
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search notifications..."
          className="w-full h-10 pl-9 pr-9 rounded-lg border border-neutral-200 bg-white text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Quick Filters Row */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
        <button onClick={() => setReadFilter('all')}
          className={cn('px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors', readFilter === 'all' ? 'bg-p13-yellow text-p13-black' : 'bg-neutral-200 text-neutral-500')}>
          All ({activeNotifications.length})
        </button>
        <button onClick={() => setReadFilter(readFilter === 'unread' ? 'all' : 'unread')}
          className={cn('px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors', readFilter === 'unread' ? 'bg-p13-yellow text-p13-black' : 'bg-neutral-200 text-neutral-500')}>
          Unread ({unreadCount})
        </button>
        {(['urgent', 'high'] as const).map(p => (
          <button key={p} onClick={() => setPriorityFilter(priorityFilter === p ? 'all' : p)}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-colors', priorityFilter === p ? 'bg-red-100 text-red-700' : 'bg-neutral-200 text-neutral-500')}>
            {p} ({activeNotifications.filter(n => !n.read && n.priority === p).length})
          </button>
        ))}
        <button onClick={() => setShowFilters(!showFilters)}
          className={cn('px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1', showFilters || hasFilters ? 'bg-p13-black text-white' : 'bg-neutral-200 text-neutral-500')}>
          <Filter size={12} /> Filter {hasFilters && <span className="w-1.5 h-1.5 bg-p13-yellow rounded-full" />}
        </button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-3">
            <div className="bg-white rounded-xl p-3 border border-neutral-200/50 space-y-3">
              {/* Type filter */}
              <div>
                <p className="text-[11px] font-semibold text-neutral-500 mb-1.5">Type</p>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => setTypeFilter('all')} className={cn('px-2 py-1 rounded-md text-[11px] font-medium transition-colors', typeFilter === 'all' ? 'bg-p13-yellow text-p13-black' : 'bg-neutral-100 text-neutral-500')}>
                    All
                  </button>
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <button key={key} onClick={() => setTypeFilter(typeFilter === key ? 'all' : key)}
                      className={cn('px-2 py-1 rounded-md text-[11px] font-medium transition-colors', typeFilter === key ? 'bg-p13-yellow text-p13-black' : 'bg-neutral-100 text-neutral-500')}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Module filter */}
              <div>
                <p className="text-[11px] font-semibold text-neutral-500 mb-1.5">Module</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(moduleLabels).map(([key, label]) => (
                    <button key={key} onClick={() => setModuleFilter(moduleFilter === key ? 'all' : key)}
                      className={cn('px-2 py-1 rounded-md text-[11px] font-medium transition-colors', moduleFilter === key ? 'bg-p13-black text-white' : 'bg-neutral-100 text-neutral-500')}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Priority filter */}
              <div>
                <p className="text-[11px] font-semibold text-neutral-500 mb-1.5">Priority</p>
                <div className="flex flex-wrap gap-1.5">
                  {(['urgent', 'high', 'normal', 'low'] as const).map(p => (
                    <button key={p} onClick={() => setPriorityFilter(priorityFilter === p ? 'all' : p)}
                      className={cn('px-2 py-1 rounded-md text-[11px] font-medium capitalize transition-colors', priorityFilter === p ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-neutral-500')}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-p13-yellow font-medium hover:underline">
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection bar */}
      {selectionMode && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-neutral-100 rounded-lg">
          <button onClick={selectAll} className="flex items-center gap-1.5 text-xs font-medium text-neutral-700">
            <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center transition-colors', selectedIds.length === filtered.length && filtered.length > 0 ? 'bg-p13-yellow border-p13-yellow' : 'border-neutral-300')}>
              {selectedIds.length === filtered.length && filtered.length > 0 && <Check size={10} className="text-p13-black" />}
            </div>
            Select All
          </button>
        </div>
      )}

      {/* Notification List - Grouped by Date */}
      <div>
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12">
            <Bell size={40} className="text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 font-medium">No notifications found</p>
            <p className="text-xs text-neutral-400 mt-1">Try adjusting your filters</p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-3 text-xs text-p13-yellow font-medium hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).map(date => (
            <div key={date} className="mb-4">
              <div className="sticky top-0 bg-p13-white z-[5] py-2 border-b border-neutral-200 mb-1">
                <p className="text-xs font-semibold text-neutral-500">{dateLabel(date)}</p>
              </div>
              {grouped[date].map((n, i) => {
                const config = iconMap[n.type] || iconMap.system;
                const Icon = config.icon;
                const pConfig = priorityConfig[n.priority];
                const isSelected = selectedIds.includes(n.id);
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => handleNotificationClick(n)}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-xl mb-1.5 cursor-pointer transition-all hover:shadow-md',
                      !n.read ? 'bg-white border-l-[3px] border-l-p13-yellow shadow-xs' : 'bg-white/60 border border-transparent',
                      isSelected && selectionMode ? 'ring-2 ring-p13-yellow bg-p13-yellow/5' : ''
                    )}
                  >
                    {/* Checkbox in selection mode */}
                    {selectionMode && (
                      <div className={cn('w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors', isSelected ? 'bg-p13-yellow border-p13-yellow' : 'border-neutral-300')}>
                        {isSelected && <Check size={12} className="text-p13-black" />}
                      </div>
                    )}
                    {/* Icon */}
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', config.bg)}>
                      <Icon size={18} className={config.color} />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className={cn('text-sm', !n.read ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700')}>
                              {n.title}
                            </p>
                            {!n.read && <div className={cn('w-2 h-2 rounded-full', pConfig.dot)} />}
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{n.description}</p>
                        </div>
                      </div>
                      {/* Meta row */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize', pConfig.badge)}>
                          {n.priority}
                        </span>
                        <span className="text-[10px] text-neutral-400">{moduleLabels[n.module]}</span>
                        <span className="text-[10px] text-neutral-300">|</span>
                        <span className="text-[10px] text-neutral-400">{timeAgo(n.createdAt)}</span>
                      </div>
                      {/* Actions */}
                      {n.actions && !selectionMode && (
                        <div className="flex items-center gap-3 mt-2">
                          {n.actions.map((a, ai) => (
                            <button
                              key={ai}
                              onClick={(e) => { e.stopPropagation(); addToast({ type: 'info', message: `${a.label} clicked` }); }}
                              className="text-[11px] text-blue-600 font-medium hover:underline"
                            >
                              {a.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Right actions */}
                    {!selectionMode && (
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        {!n.read && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markNotificationRead(n.id); }}
                            className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check size={14} className="text-neutral-400" />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); addToast({ type: 'success', message: 'Notification removed' }); }}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Summary footer */}
      {filtered.length > 0 && (
        <div className="text-center py-4">
          <p className="text-xs text-neutral-400">
            Showing {filtered.length} of {activeNotifications.length} notifications
          </p>
        </div>
      )}
    </div>
  );
}
