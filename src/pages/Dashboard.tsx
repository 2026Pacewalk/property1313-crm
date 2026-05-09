import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Flame, Bell, MapPin, Plus, Calendar, MessageCircle,
  Building2, FileText, Sparkles, AlertTriangle, ChevronRight,
  Clock, TrendingUp, DollarSign, Target, ArrowUpRight,
  CreditCard, BarChart3
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useDataStore } from '@/stores/dataStore';
import { useReminderStore } from '@/stores/reminderStore';
import { leads, followups, visits, getInitials, getAvatarColor } from '@/data/mockData';
import StatusBadge from '@/components/shared/StatusBadge';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import BottomSheet from '@/components/shared/BottomSheet';
import { useIsMobile } from '@/hooks/use-mobile';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } };

export default function Dashboard() {
  const { user } = useAuthStore();
  const { leads: storeLeads, activityData, notifications, markNotificationRead } = useDataStore();
  const { getTodayReminders, getOverdueReminders, getUpcomingReminders, startScheduler } = useReminderStore();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'analytics'>('overview');

  // Start reminder scheduler
  useEffect(() => {
    startScheduler();
  }, [startScheduler]);

  // Use store leads if available, else mock
  const allLeads = storeLeads.length > 0 ? storeLeads : leads;
  const todayFollowups = followups.filter(f => f.scheduledAt.startsWith('2026-05-08'));
  const overdueFollowups = followups.filter(f => f.status === 'overdue');
  const recentLeads = allLeads.slice(0, 5);
  const todayReminders = getTodayReminders();
  const overdueReminders = getOverdueReminders();
  const upcomingReminders = getUpcomingReminders();

  // Notification alerts
  const activeNotifications = notifications.filter(n => !n.deleted);
  const unreadCount = activeNotifications.filter(n => !n.read).length;
  const urgentAlerts = activeNotifications.filter(n => !n.read && (n.priority === 'urgent' || n.priority === 'high')).slice(0, 3);

  const totalLeadsCount = allLeads.length;
  const hotLeadsCount = allLeads.filter(l => l.status === 'hot').length;
  const pendingVisitsCount = visits.filter(v => v.status === 'scheduled').length;

  // Revenue metrics (mock calculation)
  const convertedLeads = allLeads.filter(l => l.status === 'converted');
  const avgDealSize = convertedLeads.length > 0 ? Math.round(convertedLeads.reduce((sum, l) => sum + (l.budget || 0), 0) / convertedLeads.length) : 0;
  const totalRevenue = convertedLeads.reduce((sum, l) => sum + (l.budget || 0), 0);
  const conversionRate = totalLeadsCount > 0 ? Math.round((convertedLeads.length / totalLeadsCount) * 100) : 0;

  const todayLeadsCount = allLeads.filter(l => l.createdAt.startsWith(new Date().toISOString().split('T')[0])).length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Dynamic insights from real data
  const uncontactedLeads = allLeads.filter(l => l.leadScore === 'cold');
  const hotLeadsNoVisit = allLeads.filter(l => l.leadScore === 'hot');
  const dynamicInsights = [
    uncontactedLeads.length > 0 ? { title: `${uncontactedLeads.length} cold lead${uncontactedLeads.length > 1 ? 's' : ''}`, desc: "Haven't been contacted recently", action: 'Follow up now', onClick: () => navigate('/leads') } : null,
    hotLeadsNoVisit.length > 0 ? { title: `${hotLeadsNoVisit.length} hot lead${hotLeadsNoVisit.length > 1 ? 's' : ''}`, desc: 'Needs immediate attention', action: 'Schedule visit', onClick: () => navigate('/leads') } : null,
    overdueFollowups.length > 0 ? { title: `${overdueFollowups.length} follow-up${overdueFollowups.length > 1 ? 's' : ''} overdue`, desc: 'Due today - needs attention', action: 'View follow-ups', onClick: () => navigate('/follow-ups') } : null,
  ].filter(Boolean) as { title: string; desc: string; action: string; onClick: () => void }[];

  const quickActions = [
    { label: 'Add Lead', icon: Plus, color: 'bg-primary', textColor: 'text-primary-foreground', action: () => navigate('/leads') },
    { label: 'Schedule Visit', icon: Calendar, color: 'bg-blue-500', textColor: 'text-foreground', action: () => navigate('/visits') },
    { label: 'Send WhatsApp', icon: MessageCircle, color: 'bg-green-500', textColor: 'text-foreground', action: () => navigate('/whatsapp-templates') },
    { label: 'Add Follow-up', icon: Bell, color: 'bg-purple-500', textColor: 'text-foreground', action: () => navigate('/follow-ups') },
    { label: 'Add Project', icon: Building2, color: 'bg-orange-500', textColor: 'text-foreground', action: () => navigate('/projects') },
    { label: 'Loan Inquiry', icon: FileText, color: 'bg-pink-500', textColor: 'text-foreground', action: () => navigate('/loan-inquiry') },
  ];

  const quickAddActions = [
    { label: 'Add Lead', icon: Users, color: 'bg-primary', onClick: () => { setShowQuickAdd(false); navigate('/leads'); } },
    { label: 'Schedule Visit', icon: Calendar, color: 'bg-blue-500', onClick: () => { setShowQuickAdd(false); navigate('/visits'); } },
    { label: 'Add Follow-up', icon: Bell, color: 'bg-purple-500', onClick: () => { setShowQuickAdd(false); navigate('/follow-ups'); } },
    { label: 'Add Project', icon: Building2, color: 'bg-green-500', onClick: () => { setShowQuickAdd(false); navigate('/projects'); } },
    { label: 'Send WhatsApp', icon: MessageCircle, color: 'bg-emerald-500', onClick: () => { setShowQuickAdd(false); navigate('/whatsapp-templates'); } },
    { label: 'Loan Inquiry', icon: FileText, color: 'bg-orange-500', onClick: () => { setShowQuickAdd(false); navigate('/loan-inquiry'); } },
  ];

  return (
    <div className="page-container pt-4">
      <motion.div variants={container} initial="hidden" animate="show">
        {/* Greeting + Tabs */}
        <motion.div variants={item}>
          <h2 className="text-h2-mobile md:text-h2-desktop font-semibold text-foreground">{greeting()}, {user?.name?.split(' ')[0]}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
          </p>

          {/* Dashboard Tabs */}
          <div className="flex gap-1 mt-3 bg-muted/50 rounded-lg p-0.5">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'revenue', label: 'Revenue', icon: DollarSign },
              { key: 'analytics', label: 'Analytics', icon: TrendingUp },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
                  activeTab === t.key
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <t.icon size={13} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Mini stats row */}
          <div className="flex gap-4 mt-3 pb-3 border-b border-border">
            <button className="text-center hover:bg-muted rounded-lg px-2 py-1 transition-colors" onClick={() => navigate('/leads')}>
              <span className="text-sm font-semibold text-foreground">{todayLeadsCount}</span>
              <span className="text-[11px] text-muted-foreground ml-1">Today&apos;s Leads</span>
            </button>
            <div className="w-px bg-border" />
            <button className="text-center hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg px-2 py-1 transition-colors" onClick={() => navigate('/follow-ups')}>
              <span className="text-sm font-semibold text-red-500">{overdueFollowups.length}</span>
              <span className="text-[11px] text-muted-foreground ml-1">Overdue</span>
            </button>
            <div className="w-px bg-border" />
            <button className="text-center hover:bg-muted rounded-lg px-2 py-1 transition-colors" onClick={() => navigate('/visits')}>
              <span className="text-sm font-semibold text-foreground">{todayFollowups.length}</span>
              <span className="text-[11px] text-muted-foreground ml-1">Visits</span>
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ===== OVERVIEW TAB ===== */}
          {activeTab === 'overview' && (
            <motion.div key="overview" variants={container} initial="hidden" animate="show" exit={{ opacity: 0 }}>
              {/* KPI Cards */}
              <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {[
                  { label: 'Total Leads', value: String(totalLeadsCount), icon: Users, color: 'bg-primary/15 text-primary', trend: '+12%', onClick: () => navigate('/leads') },
                  { label: 'Hot Leads', value: String(hotLeadsCount), icon: Flame, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-500', trend: '+5%', onClick: () => navigate('/leads') },
                  { label: 'Pending Visits', value: String(pendingVisitsCount), icon: MapPin, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-500', trend: '+3%', onClick: () => navigate('/visits') },
                  { label: 'Conversion Rate', value: `${conversionRate}%`, icon: Target, color: 'bg-green-100 dark:bg-green-900/30 text-green-500', trend: '+2%', onClick: () => navigate('/reports') },
                ].map((kpi) => (
                  <motion.div key={kpi.label} whileHover={{ y: -2 }} onClick={kpi.onClick}
                    className="kpi-card">
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${kpi.color}`}>
                        <kpi.icon size={18} />
                      </div>
                      <span className="flex items-center gap-0.5 text-[10px] font-medium text-green-500">
                        <ArrowUpRight size={10} />{kpi.trend}
                      </span>
                    </div>
                    <p className="text-xl font-bold mt-2 text-foreground">{kpi.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{kpi.label}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={item} className="mt-4">
                <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
                  {quickActions.map((action) => (
                    <button key={action.label} onClick={action.action}
                      className={`flex-shrink-0 flex items-center gap-2 ${action.color} ${action.textColor} px-4 py-2.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity snap-start shadow-sm`}>
                      <action.icon size={14} />
                      {action.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Notification Alerts */}
              {urgentAlerts.length > 0 && (
                <motion.div variants={item} className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-red-500" />
                      <h3 className="text-sm font-semibold text-foreground">Alerts</h3>
                      <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-[10px] font-bold">{unreadCount}</span>
                    </div>
                    <button onClick={() => navigate('/notifications')} className="text-xs text-primary font-medium flex items-center gap-0.5">
                      View all <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {urgentAlerts.map(n => (
                      <div key={n.id} onClick={() => { markNotificationRead(n.id); if (n.module === 'leads' && n.entityId) navigate(`/leads/${n.entityId}`); else navigate('/notifications'); }}
                        className={`bg-card rounded-lg p-3 shadow-xs border-l-[3px] ${n.priority === 'urgent' ? 'border-l-red-500' : 'border-l-orange-500'} cursor-pointer hover:shadow-md transition-all`}>
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.priority === 'urgent' ? 'bg-red-500' : 'bg-orange-500'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">{n.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{n.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Reminders */}
              <motion.div variants={item} className="mt-4">
                {(() => {
                  if (todayReminders.length === 0 && overdueReminders.length === 0 && upcomingReminders.length === 0) return null;
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Clock size={14} className="text-primary" /> Reminders
                        </h3>
                        {overdueReminders.length > 0 && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-[10px] font-bold">
                            {overdueReminders.length} Overdue
                          </span>
                        )}
                      </div>
                      {overdueReminders.slice(0, 2).map((r) => (
                        <motion.div key={r.id} whileTap={{ scale: 0.98 }} onClick={() => navigate('/follow-ups')}
                          className="bg-card rounded-lg p-3 shadow-xs border border-red-200 dark:border-red-800 border-l-[3px] border-l-red-500 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-red-600 dark:text-red-400">{r.title}</p>
                              <p className="text-[10px] text-muted-foreground">{r.message.slice(0, 50)}...</p>
                            </div>
                            <ChevronRight size={12} className="text-red-300" />
                          </div>
                        </motion.div>
                      ))}
                      {todayReminders.slice(0, 3).map((r) => (
                        <motion.div key={r.id} whileTap={{ scale: 0.98 }} onClick={() => navigate('/follow-ups')}
                          className="bg-card rounded-lg p-3 shadow-xs border border-border/50 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Bell size={14} className="text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground">{r.title}</p>
                              <p className="text-[10px] text-muted-foreground">{new Date(r.reminderDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                            </div>
                            <ChevronRight size={12} className="text-muted-foreground/30" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  );
                })()}
              </motion.div>

              {/* AI Insights */}
              <motion.div variants={item} className="mt-4 rounded-xl p-4 revenue-card-gradient border border-primary/15">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-primary" />
                  <span className="text-[13px] font-semibold text-primary">AI Insights</span>
                </div>
                {dynamicInsights.length > 0 ? dynamicInsights.map((insight, i) => (
                  <div key={i} onClick={insight.onClick}
                    className="border-l-2 border-primary pl-3 mb-2.5 last:mb-0 cursor-pointer hover:bg-white/5 dark:hover:bg-white/5 rounded-r-lg py-1 -ml-1 px-1 transition-colors">
                    <p className="text-[13px] font-medium text-foreground">{insight.title}</p>
                    <p className="text-xs text-muted-foreground">{insight.desc}</p>
                    <span className="text-xs text-primary">{insight.action}</span>
                  </div>
                )) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-muted-foreground">No insights available</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">Add leads and follow-ups to see AI insights</p>
                  </div>
                )}
              </motion.div>

              {/* Recent Leads */}
              <motion.div variants={item} className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-h3-mobile md:text-h3-desktop font-semibold text-foreground">Recent Leads</h3>
                  <button onClick={() => navigate('/leads')} className="text-xs text-primary font-medium">View All</button>
                </div>
                <div className="space-y-2">
                  {recentLeads.length > 0 ? recentLeads.map((lead) => {
                    const color = getAvatarColor(lead.name);
                    return (
                      <motion.div key={lead.id} whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/leads/${lead.id}`)}
                        className="bg-card rounded-lg p-3 shadow-xs border border-border/50 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
                        style={{ borderLeft: `3px solid ${getLeadStatusColor(lead.status)}` }}
                      >
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-foreground text-xs font-bold flex-shrink-0" style={{ backgroundColor: color }}>
                          {getInitials(lead.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{lead.name}</p>
                          <p className="text-[11px] text-muted-foreground">{lead.phone}</p>
                        </div>
                        <StatusBadge status={lead.status} />
                      </motion.div>
                    );
                  }) : (
                    <div className="bg-card rounded-lg p-8 text-center border border-border/50">
                      <Users size={24} className="text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No leads yet</p>
                      <button onClick={() => navigate('/leads')} className="text-xs text-primary mt-1">Add your first lead</button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Today's Follow-ups */}
              <motion.div variants={item} className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-h3-mobile md:text-h3-desktop font-semibold text-foreground">Today&apos;s Follow-ups</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{todayFollowups.length}</span>
                    <button onClick={() => navigate('/follow-ups')} className="text-xs text-primary font-medium">View All</button>
                  </div>
                </div>
                <div className="space-y-2">
                  {todayFollowups.map((fu) => (
                    <div key={fu.id} onClick={() => navigate('/follow-ups')}
                      className={`rounded-lg p-3 cursor-pointer hover:shadow-md transition-all ${fu.status === 'overdue' ? 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800' : 'bg-card border border-border/50'}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${fu.status === 'overdue' ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span className={`text-xs font-semibold ${fu.status === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                          {fu.scheduledAt.split('T')[1].slice(0, 5)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto capitalize">{fu.status}</span>
                      </div>
                      <p className="text-[13px] font-medium mt-1 text-foreground">{fu.leadName}</p>
                      <p className="text-xs text-muted-foreground truncate">{fu.note}</p>
                    </div>
                  ))}
                  {todayFollowups.length === 0 && (
                    <div className="bg-card rounded-lg p-6 text-center border border-border/50">
                      <Bell size={24} className="text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No follow-ups for today</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Activity Chart */}
              <motion.div variants={item} className="mt-4 mb-6">
                <div className="bg-card rounded-xl p-4 shadow-xs border border-border/50">
                  <h3 className="text-h3-mobile md:text-h3-desktop font-semibold text-foreground">Lead Activity</h3>
                  <p className="text-xs text-muted-foreground mb-3">Last 7 days</p>
                  <div className="h-[140px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityData}>
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'currentColor' }} axisLine={false} tickLine={false} />
                        <Bar dataKey="newLeads" radius={[4, 4, 0, 0]}>
                          {activityData.map((_, i) => (
                            <Cell key={i} fill={i === activityData.length - 1 ? 'hsl(45 95% 51%)' : 'hsl(220 14% 91%)'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ===== REVENUE TAB ===== */}
          {activeTab === 'revenue' && (
            <motion.div key="revenue" variants={container} initial="hidden" animate="show" exit={{ opacity: 0 }}>
              {/* Revenue KPIs */}
              <motion.div variants={item} className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { label: 'Total Revenue', value: totalRevenue > 0 ? `₹${(totalRevenue / 100000).toFixed(1)}L` : '₹0', icon: DollarSign, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', sub: `${convertedLeads.length} deals closed` },
                  { label: 'Avg Deal Size', value: avgDealSize > 0 ? `₹${(avgDealSize / 100000).toFixed(1)}L` : '₹0', icon: CreditCard, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', sub: 'Per conversion' },
                  { label: 'Pipeline Value', value: `₹${(allLeads.reduce((s, l) => s + (l.budget || 0), 0) / 100000).toFixed(1)}L`, icon: TrendingUp, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', sub: 'Total pipeline' },
                  { label: 'Conversion Rate', value: `${conversionRate}%`, icon: Target, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400', sub: `${convertedLeads.length} / ${totalLeadsCount} leads` },
                ].map((kpi) => (
                  <motion.div key={kpi.label} whileHover={{ y: -2 }}
                    className="kpi-card">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${kpi.color}`}>
                      <kpi.icon size={18} />
                    </div>
                    <p className="text-lg font-bold mt-2 text-foreground">{kpi.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{kpi.label}</p>
                    <p className="text-[10px] text-muted-foreground/60">{kpi.sub}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Revenue by Source */}
              <motion.div variants={item} className="mt-4 bg-card rounded-xl p-4 shadow-xs border border-border/50">
                <h3 className="text-sm font-semibold text-foreground mb-3">Revenue Breakdown</h3>
                {[
                  { source: 'Walk-in', amount: totalRevenue * 0.4, color: 'bg-primary' },
                  { source: 'Website', amount: totalRevenue * 0.3, color: 'bg-blue-500' },
                  { source: 'Referral', amount: totalRevenue * 0.2, color: 'bg-green-500' },
                  { source: 'Social Media', amount: totalRevenue * 0.1, color: 'bg-purple-500' },
                ].map((item) => (
                  <div key={item.source} className="flex items-center gap-3 mb-3 last:mb-0">
                    <div className="w-24 text-xs text-muted-foreground">{item.source}</div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: totalRevenue > 0 ? `${(item.amount / totalRevenue) * 100}%` : '0%' }} />
                    </div>
                    <div className="w-20 text-right text-xs font-medium text-foreground">
                      {item.amount > 0 ? `₹${(item.amount / 100000).toFixed(1)}L` : '₹0'}
                    </div>
                  </div>
                ))}
                {totalRevenue === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No revenue data yet. Convert leads to see revenue breakdown.</p>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ===== ANALYTICS TAB ===== */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" variants={container} initial="hidden" animate="show" exit={{ opacity: 0 }}>
              <motion.div variants={item} className="mt-4 bg-card rounded-xl p-4 shadow-xs border border-border/50">
                <h3 className="text-sm font-semibold text-foreground mb-4">Team Performance</h3>
                {[
                  { name: 'Adamya Khosla', role: 'Manager', leads: 12, closed: 3, rate: 25 },
                  { name: 'Suhail Malik', role: 'Manager', leads: 8, closed: 2, rate: 25 },
                  { name: 'Diksha Sharma', role: 'Telecaller', leads: 15, closed: 1, rate: 7 },
                  { name: 'Rakesh Kumar', role: 'Sales', leads: 10, closed: 2, rate: 20 },
                ].map((member) => (
                  <div key={member.name} className="flex items-center gap-3 mb-4 last:mb-0">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground">
                      {getInitials(member.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-foreground truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.leads} leads</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${member.rate}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-8 text-right">{member.rate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Source Breakdown */}
              <motion.div variants={item} className="mt-4 bg-card rounded-xl p-4 shadow-xs border border-border/50">
                <h3 className="text-sm font-semibold text-foreground mb-3">Lead Sources</h3>
                {['Website', 'Walk-in', 'Referral', 'Social Media', '99acres', 'MagicBricks'].map((source) => {
                  const count = allLeads.filter(l => l.source === source).length;
                  return (
                    <div key={source} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <span className="text-xs text-foreground">{source}</span>
                      <span className="text-xs font-medium text-foreground">{count}</span>
                    </div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      {/* FAB */}
      {isMobile && (
        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowQuickAdd(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-xl z-40"
        >
          <Plus size={24} className="text-primary-foreground" />
        </motion.button>
      )}

      {/* Quick Add Bottom Sheet */}
      <BottomSheet isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} title="Quick Add">
        <div className="grid grid-cols-3 gap-4 py-4">
          {quickAddActions.map((action) => (
            <button key={action.label} onClick={action.onClick}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-foreground ${action.color}`}>
                <action.icon size={20} />
              </div>
              <span className="text-xs text-foreground font-medium">{action.label}</span>
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
