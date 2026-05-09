import { create } from 'zustand';
import type { Reminder, ReminderStatus, ReminderType, SnoozeDuration } from '@/types';
import { reminders as mockReminders } from '@/data/mockData';
import { useDataStore } from './dataStore';

/**
 * Date utility functions - timezone-safe
 * All internal storage in ISO 8601 (UTC)
 * Display converted to user's local timezone
 */

/** Get current time as ISO string */
function now(): string {
  return new Date().toISOString();
}

/** Add N days to a date, returning ISO string */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/** Add N minutes to a date */
function addMinutes(dateStr: string, mins: number): string {
  const d = new Date(dateStr);
  d.setMinutes(d.getMinutes() + mins);
  return d.toISOString();
}

/** Check if reminderDateTime <= now */
function isDue(dateTime: string): boolean {
  return new Date(dateTime) <= new Date();
}

/** Check if date is today */
function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

/** Check if date is this week (next 7 days) */
function isThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr);
  const t = new Date();
  const weekFromNow = new Date(t);
  weekFromNow.setDate(t.getDate() + 7);
  return d >= t && d <= weekFromNow;
}

/** Get start of day */
function startOfDay(dateStr?: string): Date {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Get end of day */
function endOfDay(dateStr?: string): Date {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Format relative time */
function formatRelative(dateStr: string): string {
  const d = new Date(dateStr);
  const t = new Date();
  const diffMs = d.getTime() - t.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 0) return 'Overdue';
  if (diffMins < 60) return `${diffMins} min`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hr`;
  return `${Math.floor(diffMins / 1440)} days`;
}

/** Snooze durations in minutes */
const SNOOZE_MINUTES: Record<SnoozeDuration, number> = {
  '15min': 15,
  '1hour': 60,
  tomorrow: 24 * 60,
  custom: 24 * 60,
};

/** Reminder type labels */
export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  follow_up: 'Follow-up',
  callback: 'Callback',
  revisit: 'Revisit',
  whatsapp: 'WhatsApp',
  loan_inquiry: 'Loan',
  task: 'Task',
  meeting: 'Meeting',
  document: 'Document',
};

/** Quick date presets */
export const QUICK_DATE_PRESETS = [
  { label: 'Tomorrow', days: 1 },
  { label: '3 Days', days: 3 },
  { label: '7 Days', days: 7 },
  { label: '15 Days', days: 15 },
  { label: '30 Days', days: 30 },
];

interface ReminderState {
  reminders: Reminder[];
  schedulerRunning: boolean;
  lastCheckAt: string | null;
  triggeredIds: string[];

  // Getters
  getTodayReminders: () => Reminder[];
  getOverdueReminders: () => Reminder[];
  getUpcomingReminders: () => Reminder[];
  getThisWeekReminders: () => Reminder[];
  getPendingReminders: () => Reminder[];
  getCompletedReminders: () => Reminder[];
  getSnoozedReminders: () => Reminder[];
  getByLeadId: (leadId: string) => Reminder[];
  getReminderStats: () => { total: number; today: number; overdue: number; upcoming: number; thisWeek: number; completed: number; snoozed: number };
  getOverdueCount: () => number;
  getTodayCount: () => number;

  // Actions
  createReminder: (data: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'snoozeCount' | 'isCompleted' | 'notificationSent' | 'status'>) => Reminder;
  updateReminder: (id: string, data: Partial<Reminder>) => void;
  completeReminder: (id: string, note?: string) => void;
  snoozeReminder: (id: string, duration: SnoozeDuration, customMinutes?: number) => void;
  cancelReminder: (id: string) => void;
  deleteReminder: (id: string) => void;

  // Scheduler
  startScheduler: () => void;
  stopScheduler: () => void;
  checkReminders: () => void;
  triggerReminder: (id: string) => void;
}

let schedulerInterval: ReturnType<typeof setInterval> | null = null;

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: mockReminders,
  schedulerRunning: false,
  lastCheckAt: null,
  triggeredIds: [],

  // ==================== GETTERS ====================

  getTodayReminders: () => {
    const s = startOfDay();
    const e = endOfDay();
    return get().reminders.filter((r) => {
      const dt = new Date(r.reminderDateTime);
      return dt >= s && dt <= e && !r.isCompleted && r.status !== 'cancelled';
    }).sort((a, b) => new Date(a.reminderDateTime).getTime() - new Date(b.reminderDateTime).getTime());
  },

  getOverdueReminders: () => {
    const n = now();
    return get().reminders.filter((r) => {
      if (r.isCompleted || r.status === 'cancelled' || r.status === 'snoozed') return false;
      return r.reminderDateTime < n && r.status !== 'triggered';
    }).sort((a, b) => new Date(b.reminderDateTime).getTime() - new Date(a.reminderDateTime).getTime());
  },

  getUpcomingReminders: () => {
    const n = now();
    return get().reminders.filter((r) => {
      if (r.isCompleted || r.status === 'cancelled') return false;
      return r.reminderDateTime > n && r.status !== 'snoozed';
    }).sort((a, b) => new Date(a.reminderDateTime).getTime() - new Date(b.reminderDateTime).getTime());
  },

  getThisWeekReminders: () => {
    return get().reminders.filter((r) => {
      if (r.isCompleted || r.status === 'cancelled') return false;
      return isThisWeek(r.reminderDateTime);
    }).sort((a, b) => new Date(a.reminderDateTime).getTime() - new Date(b.reminderDateTime).getTime());
  },

  getPendingReminders: () => {
    return get().reminders
      .filter((r) => r.status === 'pending' && !r.isCompleted)
      .sort((a, b) => new Date(a.reminderDateTime).getTime() - new Date(b.reminderDateTime).getTime());
  },

  getCompletedReminders: () => {
    return get().reminders
      .filter((r) => r.isCompleted)
      .sort((a, b) => new Date(b.completedAt || b.updatedAt || '').getTime() - new Date(a.completedAt || a.updatedAt || '').getTime());
  },

  getSnoozedReminders: () => {
    return get().reminders
      .filter((r) => r.status === 'snoozed')
      .sort((a, b) => new Date(a.snoozeUntil || '').getTime() - new Date(b.snoozeUntil || '').getTime());
  },

  getByLeadId: (leadId) => {
    return get().reminders
      .filter((r) => r.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getReminderStats: () => {
    return {
      total: get().reminders.length,
      today: get().getTodayReminders().length,
      overdue: get().getOverdueReminders().length,
      upcoming: get().getUpcomingReminders().length,
      thisWeek: get().getThisWeekReminders().length,
      completed: get().getCompletedReminders().length,
      snoozed: get().getSnoozedReminders().length,
    };
  },

  getOverdueCount: () => get().getOverdueReminders().length,
  getTodayCount: () => get().getTodayReminders().length,

  // ==================== CRUD ACTIONS ====================

  createReminder: (data) => {
    const reminder: Reminder = {
      ...data,
      id: `rm${Date.now()}`,
      createdAt: now(),
      snoozeCount: 0,
      isCompleted: false,
      notificationSent: false,
      status: 'pending',
    };
    set((s) => ({ reminders: [reminder, ...s.reminders] }));
    return reminder;
  },

  updateReminder: (id, data) => {
    set((s) => ({
      reminders: s.reminders.map((r) =>
        r.id === id ? { ...r, ...data, updatedAt: now() } : r
      ),
    }));
  },

  completeReminder: (id, note) => {
    set((s) => ({
      reminders: s.reminders.map((r) =>
        r.id === id
          ? { ...r, status: 'completed' as ReminderStatus, isCompleted: true, completedAt: now(), completedNote: note, updatedAt: now() }
          : r
      ),
    }));
  },

  snoozeReminder: (id, duration, customMinutes) => {
    const mins = duration === 'custom' && customMinutes ? customMinutes : SNOOZE_MINUTES[duration];
    const snoozeUntil = addMinutes(now(), mins);
    set((s) => ({
      reminders: s.reminders.map((r) =>
        r.id === id
          ? { ...r, status: 'snoozed' as ReminderStatus, snoozeCount: r.snoozeCount + 1, snoozeUntil, updatedAt: now() }
          : r
      ),
    }));
  },

  cancelReminder: (id) => {
    set((s) => ({
      reminders: s.reminders.map((r) =>
        r.id === id ? { ...r, status: 'cancelled' as ReminderStatus, updatedAt: now() } : r
      ),
    }));
  },

  deleteReminder: (id) => {
    set((s) => ({
      reminders: s.reminders.filter((r) => r.id !== id),
    }));
  },

  // ==================== SCHEDULER ENGINE ====================

  startScheduler: () => {
    if (schedulerInterval) return; // Already running
    // Check every 60 seconds
    schedulerInterval = setInterval(() => {
      get().checkReminders();
    }, 60000);
    set({ schedulerRunning: true });
    // Initial check
    get().checkReminders();
  },

  stopScheduler: () => {
    if (schedulerInterval) {
      clearInterval(schedulerInterval);
      schedulerInterval = null;
    }
    set({ schedulerRunning: false });
  },

  checkReminders: () => {
    const state = get();
    const n = now();
    const newlyTriggered: string[] = [];

    const updatedReminders = state.reminders.map((r) => {
      // Skip completed, cancelled, already triggered
      if (r.isCompleted || r.status === 'cancelled' || r.status === 'triggered') return r;

      // Handle snoozed reminders - check if snooze expired
      if (r.status === 'snoozed' && r.snoozeUntil) {
        if (r.snoozeUntil <= n) {
          // Snooze expired, back to pending
          return { ...r, status: 'pending' as ReminderStatus, updatedAt: n };
        }
        return r;
      }

      // Check if due (pending and time has passed)
      if (r.status === 'pending' && r.reminderDateTime <= n) {
        newlyTriggered.push(r.id);
        return { ...r, status: 'triggered' as ReminderStatus, notificationSent: true, updatedAt: n };
      }

      // Auto-mark as overdue if past due date
      if (r.status === 'pending' && r.reminderDateTime < n) {
        return { ...r, status: 'overdue' as ReminderStatus, updatedAt: n };
      }

      return r;
    });

    if (newlyTriggered.length > 0 || updatedReminders.some((r, i) => r.status !== state.reminders[i]?.status)) {
      set({ reminders: updatedReminders, lastCheckAt: n, triggeredIds: [...state.triggeredIds, ...newlyTriggered] });

      // Create in-app notifications for triggered reminders
      newlyTriggered.forEach((id) => {
        const reminder = updatedReminders.find((r) => r.id === id);
        if (reminder) {
          try {
            useDataStore.getState().createNotification({
              type: 'follow_up_reminder',
              title: reminder.title,
              description: reminder.message,
              read: false,
              priority: reminder.status === 'overdue' ? 'urgent' : 'high',
              module: 'followups',
              entityId: reminder.leadId,
              entityType: 'reminder',
              metadata: {
                reminderId: reminder.id,
                leadId: reminder.leadId || '',
                reminderType: reminder.reminderType,
              },
            });
          } catch {
            // Silent fail if data store not ready
          }
        }
      });
    }

    set({ lastCheckAt: n });
  },

  triggerReminder: (id) => {
    const reminder = get().reminders.find((r) => r.id === id);
    if (!reminder || reminder.isCompleted || reminder.status === 'cancelled') return;

    set((s) => ({
      reminders: s.reminders.map((r) =>
        r.id === id ? { ...r, status: 'triggered' as ReminderStatus, notificationSent: true, updatedAt: now() } : r
      ),
      triggeredIds: [...s.triggeredIds, id],
    }));

    // Create notification
    try {
      useDataStore.getState().createNotification({
        type: 'follow_up_reminder',
        title: reminder.title,
        description: reminder.message,
        read: false,
        priority: 'high',
        module: 'followups',
        entityId: reminder.leadId,
        entityType: 'reminder',
        metadata: {
          reminderId: reminder.id,
          leadId: reminder.leadId || '',
          reminderType: reminder.reminderType,
        },
      });
    } catch {
      // Silent fail
    }
  },
}));

// Auto-start scheduler when module loads (for SPA)
if (typeof window !== 'undefined') {
  // Start after a short delay to ensure stores are initialized
  setTimeout(() => {
    useReminderStore.getState().startScheduler();
  }, 2000);
}

export { addDays, isDue, isToday, isThisWeek, formatRelative };
