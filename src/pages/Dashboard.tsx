import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Users, Flame, Bell, MapPin, Plus, Calendar, MessageCircle, Building2, FileText, Sparkles, AlertTriangle, ChevronRight, Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useDataStore } from '@/stores/dataStore';
import { useReminderStore } from '@/stores/reminderStore';
import { useUIStore } from '@/stores/uiStore';
import { leads, followups, visits, getInitials, getAvatarColor } from '@/data/mockData';
import StatusBadge from '@/components/shared/StatusBadge';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import BottomSheet from '@/components/shared/BottomSheet';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } };

export default function Dashboard() {
  const { user } = useAuthStore();
  const { activityData, notifications, markNotificationRead } = useDataStore();
  const { getTodayReminders, getOverdueReminders, getUpcomingReminders, startScheduler } = useReminderStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Start reminder scheduler
  useEffect(() => {
    startScheduler();
  }, [startScheduler]);

  const todayFollowups = followups.filter(f => f.scheduledAt.startsWith('2026-05-08'));
  const overdueFollowups = followups.filter(f => f.status === 'overdue');
  const recentLeads = leads.slice(0, 5);
  const todayReminders = getTodayReminders();
  const overdueReminders = getOverdueReminders();
  const upcomingReminders = getUpcomingReminders();

  // Notification alerts
  const activeNotifications = notifications.filter(n => !n.deleted);
  const unreadCount = activeNotifications.filter(n => !n.read).length;
  const urgentAlerts = activeNotifications.filter(n => !n.read && (n.priority === 'urgent' || n.priority === 'high')).slice(0, 3);

  const totalLeadsCount = leads.length;
  const hotLeadsCount = leads.filter(l => l.status === 'hot').length;
  const pendingVisitsCount = visits.filter(v => v.status === 'scheduled').length;

  const kpis = [
    { label: 'Total Leads', value: String(totalLeadsCount), icon: Users, color: 'bg-p13-yellow/15 text-p13-yellow', onClick: () => navigate('/leads') },
    { label: 'Hot Leads', value: String(hotLeadsCount), icon: Flame, color: 'bg-orange-100 text-orange-500', onClick: () => navigate('/leads') },
    { label: 'Today\'s Tasks', value: String(todayReminders.length + todayFollowups.length), icon: Bell, color: 'bg-blue-100 text-blue-500', onClick: () => navigate('/follow-ups') },
    { label: 'Pending Visits', value: String(pendingVisitsCount), icon: MapPin, color: 'bg-green-100 text-green-500', onClick: () => navigate('/visits') },
  ];

  const quickActions = [
    { label: 'Add Lead', icon: Plus, action: () => navigate('/leads') },
    { label: 'Schedule Visit', icon: Calendar, action: () => navigate('/visits') },
    { label: 'Send WhatsApp', icon: MessageCircle, action: () => addToast({ type: 'info', message: 'WhatsApp templates coming soon' }) },
    { label: 'Add Follow-up', icon: Bell, action: () => navigate('/follow-ups') },
    { label: 'Add Project', icon: Building2, action: () => navigate('/projects') },
  ];

  const todayLeadsCount = leads.filter(l => l.createdAt.startsWith(new Date().toISOString().split('T')[0])).length;

  // Dynamic insights from real data
  const uncontactedLeads = leads.filter(l => l.leadScore === 'cold');
  const hotLeadsNoVisit = leads.filter(l => l.leadScore === 'hot');
  const dynamicInsights = [
    uncontactedLeads.length > 0 ? { title: `${uncontactedLeads.length} cold lead${uncontactedLeads.length > 1 ? 's' : ''}`, desc: "Haven't been contacted recently", action: 'Follow up now', onClick: () => navigate('/leads') } : null,
    hotLeadsNoVisit.length > 0 ? { title: `${hotLeadsNoVisit.length} hot lead${hotLeadsNoVisit.length > 1 ? 's' : ''}`, desc: 'Needs immediate attention', action: 'Schedule visit', onClick: () => navigate('/leads') } : null,
    overdueFollowups.length > 0 ? { title: `${overdueFollowups.length} follow-up${overdueFollowups.length > 1 ? 's' : ''} overdue`, desc: 'Due today - needs attention', action: 'View follow-ups', onClick: () => navigate('/follow-ups') } : null,
  ].filter(Boolean) as { title: string; desc: string; action: string; onClick: () => void }[];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const quickAddActions = [
    { label: 'Add Lead', icon: Users, color: 'bg-p13-yellow', onClick: () => { setShowQuickAdd(false); navigate('/leads'); } },
    { label: 'Schedule Visit', icon: Calendar, color: 'bg-blue-500', onClick: () => { setShowQuickAdd(false); navigate('/visits'); } },
    { label: 'Add Follow-up', icon: Bell, color: 'bg-purple-500', onClick: () => { setShowQuickAdd(false); navigate('/follow-ups'); } },
    { label: 'Add Project', icon: Building2, color: 'bg-green-500', onClick: () => { setShowQuickAdd(false); navigate('/projects'); } },
    { label: 'Send WhatsApp', icon: MessageCircle, color: 'bg-emerald-500', onClick: () => { setShowQuickAdd(false); addToast({ type: 'info', message: 'WhatsApp coming soon' }); } },
    { label: 'Loan Inquiry', icon: FileText, color: 'bg-orange-500', onClick: () => { setShowQuickAdd(false); navigate('/loan-inquiry'); } },
  ];

  return (
    <div className="page-container pt-4">
      <motion.div variants={container} initial="hidden" animate="show">
        {/* Greeting */}
        <motion.div variants={item}>
          <h2 className="text-h2-mobile md:text-h2-desktop text-neutral-900 font-semibold">{greeting()}, {user?.name?.split(' ')[0]}</h2>
          <p className="text-sm text-neutral-400 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <div className="flex gap-4 mt-3 pb-3 border-b border-neutral-200">
            <div className="text-center cursor-pointer hover:bg-neutral-100 rounded-lg px-2 py-1 transition-colors" onClick={() => navigate('/leads')}>
              <span className="text-sm font-semibold">{todayLeadsCount}</span>
              <span className="text-[11px] text-neutral-400 ml-1">Today&apos;s Leads</span>
            </div>
            <div className="w-px bg-neutral-200" />
            <div className="text-center cursor-pointer hover:bg-red-50 rounded-lg px-2 py-1 transition-colors" onClick={() => navigate('/follow-ups')}>
              <span className="text-sm font-semibold">{overdueFollowups.length}</span>
              <span className="text-[11px] text-neutral-400 ml-1">Overdue</span>
            </div>
            <div className="w-px bg-neutral-200" />
            <div className="text-center cursor-pointer hover:bg-neutral-100 rounded-lg px-2 py-1 transition-colors" onClick={() => navigate('/visits')}>
              <span className="text-sm font-semibold">{todayFollowups.length}</span>
              <span className="text-[11px] text-neutral-400 ml-1">Visits</span>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {kpis.map((kpi) => (
            <motion.div key={kpi.label} whileHover={{ y: -2 }} onClick={kpi.onClick}
              className="bg-white rounded-xl p-4 shadow-xs border border-neutral-200/50 cursor-pointer hover:shadow-md hover:border-p13-yellow/30 transition-all">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${kpi.color}`}>
                <kpi.icon size={18} />
              </div>
              <p className="text-xl font-bold mt-2">{kpi.value}</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">{kpi.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Notification Alerts */}
        {urgentAlerts.length > 0 && (
          <motion.div variants={item} className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-500" />
                <h3 className="text-sm font-semibold">Alerts</h3>
                <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold">{unreadCount}</span>
              </div>
              <button onClick={() => navigate('/notifications')} className="text-xs text-p13-yellow font-medium flex items-center gap-0.5">
                View all <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {urgentAlerts.map(n => (
                <div key={n.id} onClick={() => { markNotificationRead(n.id); if (n.module === 'leads' && n.entityId) navigate(`/leads/${n.entityId}`); else navigate('/notifications'); }}
                  className={`bg-white rounded-lg p-3 shadow-xs border-l-[3px] ${n.priority === 'urgent' ? 'border-l-red-500' : 'border-l-orange-500'} cursor-pointer hover:shadow-md transition-all`}>
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.priority === 'urgent' ? 'bg-red-500' : 'bg-orange-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{n.title}</p>
                      <p className="text-xs text-neutral-500 line-clamp-1">{n.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div variants={item} className="mt-4">
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
            {quickActions.map((action) => (
              <button key={action.label} onClick={action.action}
                className="flex-shrink-0 flex items-center gap-2 bg-p13-black text-white px-4 py-2.5 rounded-lg text-xs font-medium hover:bg-neutral-800 transition-colors snap-start">
                <action.icon size={14} className="text-p13-yellow" />
                {action.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Reminders Dashboard Widget */}
        <motion.div variants={item} className="mt-4">
          {(() => {
            const todayRems = todayReminders;
            const overdueRems = overdueReminders;
            const upcomingRems = upcomingReminders;
            if (todayRems.length === 0 && overdueRems.length === 0 && upcomingRems.length === 0) return null;

            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Clock size={14} className="text-p13-yellow" /> Reminders
                  </h3>
                  {overdueRems.length > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold">
                      {overdueRems.length} Overdue
                    </span>
                  )}
                </div>

                {/* Overdue */}
                {overdueRems.slice(0, 2).map((r) => (
                  <motion.div key={r.id} whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/follow-ups')}
                    className="bg-white rounded-lg p-3 shadow-xs border border-red-200 border-l-[3px] border-l-red-500 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-red-700">{r.title}</p>
                        <p className="text-[10px] text-neutral-400">{r.message.slice(0, 50)}...</p>
                      </div>
                      <ChevronRight size={12} className="text-red-300" />
                    </div>
                  </motion.div>
                ))}

                {/* Today's */}
                {todayRems.slice(0, 3).map((r) => (
                  <motion.div key={r.id} whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/follow-ups')}
                    className="bg-white rounded-lg p-3 shadow-xs border border-neutral-200/50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Bell size={14} className="text-p13-yellow flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold">{r.title}</p>
                        <p className="text-[10px] text-neutral-400">{new Date(r.reminderDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                      </div>
                      <ChevronRight size={12} className="text-neutral-300" />
                    </div>
                  </motion.div>
                ))}

                {/* Upcoming this week */}
                {upcomingRems.slice(0, 3).map((r) => (
                  <motion.div key={r.id} whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/follow-ups')}
                    className="bg-white rounded-lg p-3 shadow-xs border border-blue-100 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-blue-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold">{r.title}</p>
                        <p className="text-[10px] text-blue-400">{new Date(r.reminderDateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      </div>
                      <ChevronRight size={12} className="text-neutral-300" />
                    </div>
                  </motion.div>
                ))}
              </div>
            );
          })()}
        </motion.div>

        {/* AI Insights */}
        <motion.div variants={item} className="mt-4 rounded-xl p-4" style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2510 100%)', border: '1px solid rgba(251,189,8,0.15)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-p13-yellow" />
            <span className="text-[13px] font-semibold text-p13-yellow">AI Insights</span>
          </div>
          {dynamicInsights.length > 0 ? dynamicInsights.map((insight, i) => (
            <div key={i} onClick={insight.onClick}
              className="border-l-2 border-p13-yellow pl-3 mb-2.5 last:mb-0 cursor-pointer hover:bg-white/5 rounded-r-lg py-1 -ml-1 px-1 transition-colors">
              <p className="text-[13px] font-medium text-white">{insight.title}</p>
              <p className="text-xs text-neutral-400">{insight.desc}</p>
              <span className="text-xs text-p13-yellow">{insight.action}</span>
            </div>
          )) : (
            <div className="text-center py-4">
              <p className="text-xs text-neutral-500">No insights available</p>
              <p className="text-[11px] text-neutral-600 mt-1">Add leads and follow-ups to see AI insights</p>
            </div>
          )}
        </motion.div>

        {/* Recent Leads */}
        <motion.div variants={item} className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-h3-mobile md:text-h3-desktop font-semibold">Recent Leads</h3>
            <button onClick={() => navigate('/leads')} className="text-xs text-p13-yellow font-medium">View All</button>
          </div>
          <div className="space-y-2">
            {recentLeads.map((lead) => {
              const color = getAvatarColor(lead.name);
              return (
                <motion.div key={lead.id} whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/leads/${lead.id}`)}
                  className="bg-white rounded-lg p-3 shadow-xs border border-neutral-200/50 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
                  style={{ borderLeft: `3px solid ${getLeadStatusColor(lead.status)}` }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: color }}>
                    {getInitials(lead.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{lead.name}</p>
                    <p className="text-[11px] text-neutral-400">{lead.phone}</p>
                  </div>
                  <StatusBadge status={lead.status} />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Today's Follow-ups */}
        <motion.div variants={item} className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-h3-mobile md:text-h3-desktop font-semibold">Today&apos;s Follow-ups</h3>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-p13-yellow text-p13-black text-[10px] font-bold flex items-center justify-center">{todayFollowups.length}</span>
              <button onClick={() => navigate('/follow-ups')} className="text-xs text-p13-yellow font-medium">View All</button>
            </div>
          </div>
          <div className="space-y-2">
            {todayFollowups.map((fu) => (
              <div key={fu.id} onClick={() => navigate('/follow-ups')}
                className={`rounded-lg p-3 cursor-pointer hover:shadow-md transition-all ${fu.status === 'overdue' ? 'bg-red-50 border border-red-100 hover:border-red-300' : 'bg-white border border-neutral-200/50 hover:border-p13-yellow/50'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${fu.status === 'overdue' ? 'bg-error' : 'bg-success'}`} />
                  <span className={`text-xs font-semibold ${fu.status === 'overdue' ? 'text-error' : 'text-neutral-600'}`}>
                    {fu.scheduledAt.split('T')[1].slice(0, 5)}
                  </span>
                  <span className="text-xs text-neutral-400 ml-auto capitalize">{fu.status}</span>
                </div>
                <p className="text-[13px] font-medium mt-1">{fu.leadName}</p>
                <p className="text-xs text-neutral-400 truncate">{fu.note}</p>
              </div>
            ))}
            {todayFollowups.length === 0 && (
              <p className="text-sm text-neutral-400 text-center py-4">No follow-ups for today</p>
            )}
          </div>
        </motion.div>

        {/* Activity Chart */}
        <motion.div variants={item} className="mt-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-xs border border-neutral-200/50">
            <h3 className="text-h3-mobile md:text-h3-desktop font-semibold">Lead Activity</h3>
            <p className="text-xs text-neutral-400 mb-3">Last 7 days</p>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Bar dataKey="newLeads" radius={[4, 4, 0, 0]}>
                    {activityData.map((_, i) => (
                      <Cell key={i} fill={i === 2 ? '#1A1A1A' : '#FBBD08'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
        onClick={() => setShowQuickAdd(true)}
        className="fixed bottom-20 md:bottom-6 right-4 w-14 h-14 bg-p13-yellow rounded-full flex items-center justify-center shadow-xl z-40"
      >
        <Plus size={24} className="text-p13-black" />
      </motion.button>

      {/* Quick Add Bottom Sheet */}
      <BottomSheet isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} title="Quick Add">
        <div className="grid grid-cols-3 gap-4 py-4">
          {quickAddActions.map((action) => (
            <button key={action.label} onClick={action.onClick}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-neutral-200/50 transition-colors"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white ${action.color}`}>
                <action.icon size={20} />
              </div>
              <span className="text-xs text-neutral-600 font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}

function getLeadStatusColor(status: string) {
  const colors: Record<string, string> = { new: '#F59E0B', warm: '#FBBD08', hot: '#FF6B35', cold: '#D1D5DB', converted: '#22C55E', lost: '#9CA3AF' };
  return colors[status] || '#9CA3AF';
}
