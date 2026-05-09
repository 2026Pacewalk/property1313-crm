import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, UserPlus, AlertTriangle, MapPin, CheckCircle, Zap,
  FileText, Shield, X, Clock, Check, Flame, Trash2,
  Users, Calendar, Building2, Settings as SettingsIcon
} from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';
import { useUIStore } from '@/stores/uiStore';
import { useNavigate } from 'react-router';
import type { Notification } from '@/types';

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

const priorityDot: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  normal: 'bg-blue-400',
  low: 'bg-gray-300',
};

const moduleLabels: Record<string, string> = {
  leads: 'Leads', followups: 'Follow-ups', visits: 'Visits',
  projects: 'Projects', loans: 'Loans', automation: 'Automation', users: 'Security', system: 'System',
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = useDataStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const activeNotifications = notifications.filter(n => !n.deleted);
  const unreadCount = activeNotifications.filter(n => !n.read).length;
  const recentNotifications = activeNotifications.slice(0, 8);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.read) markNotificationRead(n.id);
    setIsOpen(false);
    if (n.module === 'leads' && n.entityId) navigate(`/leads/${n.entityId}`);
    else if (n.module === 'visits') navigate('/visits');
    else if (n.module === 'followups') navigate('/follow-ups');
    else if (n.module === 'projects') navigate('/projects');
    else if (n.module === 'loans') navigate('/loan-inquiry');
    else if (n.module === 'automation') navigate('/automation');
    else navigate('/notifications');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-muted-foreground hover:text-foreground transition-colors p-1.5"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute -top-0.5 -right-0.5 bg-p13-yellow text-p13-black rounded-full flex items-center justify-center font-bold text-[9px] ${unreadCount > 9 ? 'w-4 h-4' : 'w-3.5 h-3.5'}`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 top-10 w-[400px] max-h-[560px] bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-p13-yellow text-p13-black rounded-full text-[10px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => { markAllNotificationsRead(); addToast({ type: 'success', message: 'All notifications marked as read' }); }}
                      className="text-[11px] text-p13-yellow font-medium hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-muted-foreground">
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="overflow-y-auto max-h-[440px]">
                {recentNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell size={32} className="text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No notifications</p>
                    <p className="text-xs text-muted-foreground">You are all caught up!</p>
                  </div>
                ) : (
                  recentNotifications.map((n, i) => {
                    const config = iconMap[n.type] || iconMap.system;
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        onClick={() => handleNotificationClick(n)}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-neutral-50 cursor-pointer transition-colors hover:bg-muted/50 group ${
                          !n.read ? 'bg-p13-yellow/[0.03]' : ''
                        }`}
                      >
                        {/* Icon */}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${config.bg}`}>
                          <Icon size={16} className={config.color} />
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-[13px] leading-tight ${!n.read ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                              {n.title}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!n.read && <div className={`w-2 h-2 rounded-full ${priorityDot[n.priority]}`} />}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                              <span className="text-[10px] text-muted-foreground/50">|</span>
                              <span className="text-[10px] text-muted-foreground">{moduleLabels[n.module]}</span>
                            </div>
                            {/* Hover actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!n.read && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); markNotificationRead(n.id); }}
                                  className="p-1 hover:bg-neutral-200 rounded"
                                  title="Mark as read"
                                >
                                  <Check size={12} className="text-muted-foreground" />
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); addToast({ type: 'success', message: 'Notification removed' }); }}
                                className="p-1 hover:bg-red-100 rounded"
                                title="Remove"
                              >
                                <Trash2 size={12} className="text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-border/50 bg-muted/50">
                <button
                  onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                  className="w-full text-center text-xs text-p13-yellow font-medium hover:underline"
                >
                  View all notifications
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
