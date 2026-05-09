import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Phone, MessageCircle, Clock, ChevronRight,
  Bell, Calendar, Pause, X, Plus,
  RotateCcw, FileText, User, MapPin,
} from 'lucide-react';
import { useReminderStore, QUICK_DATE_PRESETS, REMINDER_TYPE_LABELS } from '@/stores/reminderStore';
import { useDataStore } from '@/stores/dataStore';
import { useUIStore } from '@/stores/uiStore';
import { useWhatsAppStore } from '@/stores/whatsappStore';
import { cn } from '@/lib/utils';
import type { Reminder, SnoozeDuration } from '@/types';
import BottomSheet from '@/components/shared/BottomSheet';

const typeIcons: Record<string, typeof Bell> = {
  follow_up: Bell,
  callback: Phone,
  revisit: MapPin,
  whatsapp: MessageCircle,
  loan_inquiry: FileText,
  task: Check,
  meeting: User,
  document: FileText,
};

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' },
  triggered: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Triggered' },
  completed: { color: 'text-green-600', bg: 'bg-green-100', label: 'Done' },
  cancelled: { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Cancelled' },
  overdue: { color: 'text-red-600', bg: 'bg-red-100', label: 'Overdue' },
  snoozed: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Snoozed' },
};

export default function Followups() {
  const navigate = useNavigate();
  const {
    reminders,
    getTodayReminders, getOverdueReminders, getUpcomingReminders,
    getThisWeekReminders, getCompletedReminders, getSnoozedReminders,
    getReminderStats, createReminder, completeReminder, snoozeReminder,
    cancelReminder, startScheduler,
  } = useReminderStore();
  const { leads } = useDataStore();
  const { addToast } = useUIStore();
  const { openPicker } = useWhatsAppStore();

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'overdue' | 'week' | 'completed' | 'snoozed'>('today');
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState<Reminder | null>(null);
  const [showSnooze, setShowSnooze] = useState<string | null>(null);
  const [showComplete, setShowComplete] = useState<string | null>(null);

  // Form state
  const [newLeadId, setNewLeadId] = useState('');
  const [newType, setNewType] = useState<Reminder['reminderType']>('follow_up');
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newDateType, setNewDateType] = useState<'preset' | 'custom'>('preset');
  const [newPresetDays, setNewPresetDays] = useState(7);
  const [newCustomDate, setNewCustomDate] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [completeNote, setCompleteNote] = useState('');

  // Ensure scheduler is running
  useEffect(() => {
    startScheduler();
  }, [startScheduler]);

  const stats = getReminderStats();

  const filtered = useMemo(() => {
    switch (activeTab) {
      case 'today': return getTodayReminders();
      case 'overdue': return getOverdueReminders();
      case 'upcoming': return getUpcomingReminders();
      case 'week': return getThisWeekReminders();
      case 'completed': return getCompletedReminders();
      case 'snoozed': return getSnoozedReminders();
      default: return getTodayReminders();
    }
  }, [activeTab, reminders, getTodayReminders, getOverdueReminders, getUpcomingReminders, getThisWeekReminders, getCompletedReminders, getSnoozedReminders]);

  const tabs = [
    { key: 'today' as const, label: 'Today', count: stats.today },
    { key: 'upcoming' as const, label: 'Upcoming', count: stats.upcoming },
    { key: 'overdue' as const, label: 'Overdue', count: stats.overdue },
    { key: 'week' as const, label: 'This Week', count: stats.thisWeek },
    { key: 'completed' as const, label: 'Done', count: stats.completed },
    { key: 'snoozed' as const, label: 'Snoozed', count: stats.snoozed },
  ];

  const handleCreate = () => {
    if (!newTitle.trim()) { addToast({ type: 'error', message: 'Title is required' }); return; }
    if (!newLeadId) { addToast({ type: 'error', message: 'Select a lead' }); return; }

    const lead = leads.find((l) => l.id === newLeadId);
    if (!lead) { addToast({ type: 'error', message: 'Lead not found' }); return; }

    // Calculate date
    let dateTime: string;
    if (newDateType === 'preset') {
      const d = new Date();
      d.setDate(d.getDate() + newPresetDays);
      const [h, m] = newTime.split(':');
      d.setHours(parseInt(h), parseInt(m), 0, 0);
      dateTime = d.toISOString();
    } else {
      if (!newCustomDate) { addToast({ type: 'error', message: 'Select a date' }); return; }
      dateTime = new Date(newCustomDate).toISOString();
    }

    createReminder({
      leadId: lead.id,
      userId: 'u1',
      assignedToUserId: 'u1',
      reminderType: newType,
      title: newTitle.trim(),
      message: newMessage.trim() || newTitle.trim(),
      reminderDateTime: dateTime,
      timezone: 'Asia/Kolkata',
      repeatType: 'none',
    });

    addToast({ type: 'success', message: `Reminder set for ${newPresetDays > 0 ? `${newPresetDays} days` : 'today'}` });
    resetForm();
    setShowAdd(false);
  };

  const resetForm = () => {
    setNewLeadId('');
    setNewType('follow_up');
    setNewTitle('');
    setNewMessage('');
    setNewDateType('preset');
    setNewPresetDays(7);
    setNewCustomDate('');
    setNewTime('10:00');
    setCompleteNote('');
  };

  const handleComplete = (id: string) => {
    completeReminder(id, completeNote);
    addToast({ type: 'success', message: 'Reminder completed!' });
    setShowComplete(null);
    setShowDetail(null);
    setCompleteNote('');
  };

  const handleSnooze = (id: string, duration: SnoozeDuration) => {
    snoozeReminder(id, duration);
    const labels: Record<string, string> = { '15min': '15 minutes', '1hour': '1 hour', tomorrow: 'tomorrow', custom: 'custom time' };
    addToast({ type: 'info', message: `Snoozed for ${labels[duration]}` });
    setShowSnooze(null);
    setShowDetail(null);
  };

  const dateLabel = (dateStr: string) => {
    const d = new Date(dateStr).toISOString().split('T')[0];
    const t = new Date().toISOString().split('T')[0];
    const tm = new Date(); tm.setDate(tm.getDate() + 1);
    const tmStr = tm.toISOString().split('T')[0];
    if (d === t) return 'Today';
    if (d === tmStr) return 'Tomorrow';
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const timeLabel = (dateStr: string) => new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="page-container pt-4 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-h1-mobile md:text-h1-desktop font-semibold">Follow-ups</h1>
        <div className="flex gap-1">
          {stats.overdue > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold">{stats.overdue} Overdue</span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Today', value: stats.today, color: 'bg-p13-yellow/15 text-p13-yellow' },
          { label: 'Overdue', value: stats.overdue, color: 'bg-red-100 text-red-600' },
          { label: 'Week', value: stats.thisWeek, color: 'bg-blue-100 text-blue-600' },
          { label: 'Done', value: stats.completed, color: 'bg-green-100 text-green-600' },
        ].map((s) => (
          <div key={s.label} className={`rounded-lg p-2 text-center ${s.color}`}>
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[10px] font-medium opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-muted rounded-lg p-0.5 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn('flex-shrink-0 py-2 px-3 rounded-md text-xs font-medium transition-all whitespace-nowrap',
              activeTab === tab.key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground')}>
            {tab.label}
            {tab.count > 0 && <span className={cn('ml-1 text-[10px] px-1 py-0.5 rounded-full', activeTab === tab.key ? 'bg-p13-yellow' : 'bg-neutral-200')}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Quick Add FAB */}
      <button onClick={() => setShowAdd(true)}
        className="fixed bottom-20 md:bottom-6 right-4 w-14 h-14 bg-p13-yellow rounded-full flex items-center justify-center shadow-xl z-40">
        <Plus size={24} className="text-p13-black" />
      </button>

      {/* Reminder List */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={40} className="text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No {tabs.find(t => t.key === activeTab)?.label.toLowerCase()} reminders</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((reminder, i) => {
                const TypeIcon = typeIcons[reminder.reminderType] || Bell;
                const cfg = statusConfig[reminder.status] || statusConfig.pending;
                const lead = leads.find((l) => l.id === reminder.leadId);
                return (
                  <motion.div key={reminder.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => setShowDetail(reminder)}
                    className={cn('bg-card rounded-lg p-3 shadow-xs border border-neutral-200/50 cursor-pointer hover:shadow-md transition-all',
                      reminder.status === 'overdue' && 'border-l-[3px] border-l-red-500',
                      reminder.status === 'triggered' && 'border-l-[3px] border-l-orange-500',
                      reminder.status === 'snoozed' && 'border-l-[3px] border-l-blue-400',
                    )}>
                    <div className="flex items-start gap-3">
                      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', cfg.bg)}>
                        <TypeIcon size={16} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[13px] font-semibold truncate">{reminder.title}</span>
                          <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full', cfg.bg, cfg.color)}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{reminder.message}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5"><Calendar size={10} /> {dateLabel(reminder.reminderDateTime)}</span>
                          <span className="flex items-center gap-0.5"><Clock size={10} /> {timeLabel(reminder.reminderDateTime)}</span>
                          {lead && <span className="flex items-center gap-0.5"><User size={10} /> {lead.name}</span>}
                          {reminder.repeatType !== 'none' && <span className="flex items-center gap-0.5 text-blue-500"><RotateCcw size={10} /> {reminder.repeatType}</span>}
                          {reminder.snoozeCount > 0 && <span className="text-blue-500">Snoozed x{reminder.snoozeCount}</span>}
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground/50 mt-1" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ==================== ADD REMINDER SHEET ==================== */}
      <BottomSheet isOpen={showAdd} onClose={() => { setShowAdd(false); resetForm(); }} title="Add Follow-up" maxHeight="90vh">
        <div className="space-y-4 py-2">
          {/* Lead selection */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Lead *</label>
            <select value={newLeadId} onChange={(e) => setNewLeadId(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-p13-yellow">
              <option value="">Select lead...</option>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.name} - {l.phone}</option>)}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(REMINDER_TYPE_LABELS).map(([key, label]) => (
                <button key={key} onClick={() => setNewType(key as Reminder['reminderType'])}
                  className={cn('px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all',
                    newType === key ? 'bg-p13-yellow border-p13-yellow text-p13-black' : 'bg-card border-border text-muted-foreground')}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Follow up on pricing"
              className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20" />
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Note</label>
            <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows={2}
              placeholder="Add details..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-p13-yellow resize-none" />
          </div>

          {/* Quick date presets */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Quick Select</label>
            <div className="flex gap-1.5">
              {QUICK_DATE_PRESETS.map((preset) => (
                <button key={preset.days}
                  onClick={() => { setNewDateType('preset'); setNewPresetDays(preset.days); }}
                  className={cn('flex-1 py-2 rounded-lg text-[11px] font-medium border transition-all',
                    newDateType === 'preset' && newPresetDays === preset.days
                      ? 'bg-p13-yellow border-p13-yellow text-p13-black'
                      : 'bg-card border-border text-muted-foreground')}>
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          {newDateType === 'preset' && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Time</label>
              <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-p13-yellow" />
            </div>
          )}

          {/* Custom date option */}
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={newDateType === 'custom'} onChange={() => setNewDateType(newDateType === 'custom' ? 'preset' : 'custom')} className="accent-p13-yellow" />
            <label className="text-xs text-muted-foreground">Use custom date/time</label>
          </div>

          {newDateType === 'custom' && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Date & Time</label>
              <input type="datetime-local" value={newCustomDate} onChange={(e) => setNewCustomDate(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-p13-yellow" />
            </div>
          )}

          <button onClick={handleCreate}
            className="w-full h-12 bg-card text-foreground rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2">
            <Plus size={16} /> Set Reminder
          </button>
        </div>
      </BottomSheet>

      {/* ==================== DETAIL / ACTIONS SHEET ==================== */}
      <BottomSheet isOpen={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.title || 'Reminder'} maxHeight="85vh">
        {showDetail && (
          <div className="space-y-4 py-2">
            {/* Info */}
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const Icon = typeIcons[showDetail.reminderType] || Bell;
                  return <Icon size={16} className="text-muted-foreground" />;
                })()}
                <span className="text-xs font-medium text-muted-foreground">{REMINDER_TYPE_LABELS[showDetail.reminderType]}</span>
                <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto',
                  statusConfig[showDetail.status]?.bg, statusConfig[showDetail.status]?.color)}>
                  {statusConfig[showDetail.status]?.label}
                </span>
              </div>
              <p className="text-sm">{showDetail.message}</p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar size={11} /> {dateLabel(showDetail.reminderDateTime)} {timeLabel(showDetail.reminderDateTime)}</span>
                <span className="flex items-center gap-1"><Clock size={11} /> Asia/Kolkata</span>
              </div>
              {showDetail.repeatType !== 'none' && (
                <p className="text-[11px] text-blue-500 mt-1 flex items-center gap-1"><RotateCcw size={10} /> Repeats {showDetail.repeatType}</p>
              )}
              {showDetail.snoozeUntil && (
                <p className="text-[11px] text-blue-500 mt-1 flex items-center gap-1"><Pause size={10} /> Snoozed until {timeLabel(showDetail.snoozeUntil)}</p>
              )}
            </div>

            {/* Quick Actions */}
            {showDetail.status !== 'completed' && showDetail.status !== 'cancelled' && (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { setShowComplete(showDetail.id); setShowDetail(null); }}
                  className="h-11 bg-green-500 text-foreground rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-green-600 transition-all">
                  <Check size={14} /> Complete
                </button>
                <button onClick={() => { setShowSnooze(showDetail.id); setShowDetail(null); }}
                  className="h-11 bg-blue-500 text-foreground rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-blue-600 transition-all">
                  <Pause size={14} /> Snooze
                </button>
                {showDetail.leadId && (
                  <>
                    <button onClick={() => { navigate(`/leads/${showDetail.leadId}`); setShowDetail(null); }}
                      className="h-11 bg-muted text-foreground/80 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-neutral-200 transition-all">
                      <User size={14} /> View Lead
                    </button>
                    <button onClick={() => {
                      const lead = leads.find((l) => l.id === showDetail.leadId);
                      if (lead) { openPicker({ leadId: lead.id, leadName: lead.name, leadPhone: lead.phone, projectName: lead.projectInterest }); }
                      setShowDetail(null);
                    }} className="h-11 bg-green-50 text-green-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-green-100 transition-all border border-green-200">
                      <MessageCircle size={14} /> WhatsApp
                    </button>
                  </>
                )}
                <button onClick={() => { cancelReminder(showDetail.id); addToast({ type: 'info', message: 'Reminder cancelled' }); setShowDetail(null); }}
                  className="h-11 bg-red-50 text-red-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-red-100 transition-all border border-red-200 col-span-2">
                  <X size={14} /> Cancel Reminder
                </button>
              </div>
            )}
          </div>
        )}
      </BottomSheet>

      {/* ==================== SNOOZE SHEET ==================== */}
      <BottomSheet isOpen={!!showSnooze} onClose={() => setShowSnooze(null)} title="Snooze Reminder">
        <div className="space-y-2 py-2">
          <p className="text-xs text-muted-foreground mb-2">Choose snooze duration:</p>
          {[
            { key: '15min' as SnoozeDuration, label: '15 Minutes', desc: 'Quick delay' },
            { key: '1hour' as SnoozeDuration, label: '1 Hour', desc: 'Short break' },
            { key: 'tomorrow' as SnoozeDuration, label: 'Tomorrow', desc: 'Next day same time' },
          ].map((opt) => (
            <button key={opt.key}
              onClick={() => showSnooze && handleSnooze(showSnooze, opt.key)}
              className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <Pause size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold">{opt.label}</p>
                <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* ==================== COMPLETE SHEET ==================== */}
      <BottomSheet isOpen={!!showComplete} onClose={() => { setShowComplete(null); setCompleteNote(''); }} title="Complete Reminder">
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Completion Note</label>
            <textarea value={completeNote} onChange={(e) => setCompleteNote(e.target.value)} rows={3}
              placeholder="What was the outcome?..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-green-300 focus:ring-2 focus:ring-green-100 resize-none" />
          </div>
          <button onClick={() => showComplete && handleComplete(showComplete)}
            className="w-full h-12 bg-green-500 text-foreground rounded-lg text-sm font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2">
            <Check size={16} /> Mark as Complete
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
