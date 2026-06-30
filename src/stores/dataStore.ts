import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lead, FollowUp, Visit, Project, LoanInquiry, Notification } from '@/types';
import {
  projects as mockProjects,
  automationRules as mockRules,
  whatsappTemplates as mockTemplates,
  activityData, sourceBreakdown, conversionFunnel, teamPerformance, loginActivity,
} from '@/data/mockData';
import {
  fetchLeads, createLead, updateLeadDb, deleteLeadDb,
  fetchProjects, createProject, updateProjectDb,
  fetchFollowups, createFollowup,
  fetchVisits, createVisit,
  fetchLoanInquiries, createLoanInquiry,
  fetchNotifications, createNotification, markNotificationReadDb,
} from '@/lib/supabase-api';

interface DataState {
  leads: Lead[];
  followups: FollowUp[];
  visits: Visit[];
  projects: Project[];
  loanInquiries: LoanInquiry[];
  notifications: Notification[];
  automationRules: typeof mockRules;
  whatsappTemplates: typeof mockTemplates;
  activityData: typeof activityData;
  sourceBreakdown: typeof sourceBreakdown;
  conversionFunnel: typeof conversionFunnel;
  teamPerformance: typeof teamPerformance;
  loginActivity: typeof loginActivity;
  unreadCount: number;
  isLoading: boolean;
  // Actions
  addLead: (lead: Lead) => Promise<void>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  addFollowup: (followup: FollowUp) => Promise<void>;
  updateFollowup: (id: string, data: Partial<FollowUp>) => void;
  addVisit: (visit: Visit) => Promise<void>;
  updateVisit: (id: string, data: Partial<Visit>) => void;
  addProject: (project: Project) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => void;
  addLoanInquiry: (inquiry: LoanInquiry) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => void;
  markNotificationsReadByIds: (ids: string[]) => void;
  deleteNotification: (id: string) => void;
  deleteNotificationsByIds: (ids: string[]) => void;
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  getUnreadCount: () => number;
  toggleAutomationRule: (id: string) => void;
  runAutomationForTrigger: (trigger: string, context?: { leadName?: string; leadId?: string }) => void;
  syncFromSupabase: () => Promise<void>;
}

// Static mock data (not persisted)
const staticData = {
  automationRules: mockRules,
  whatsappTemplates: mockTemplates,
  activityData,
  sourceBreakdown,
  conversionFunnel,
  teamPerformance,
  loginActivity,
};

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      // State
      leads: [],
      followups: [],
      visits: [],
      projects: mockProjects,
      loanInquiries: [],
      notifications: [],
      ...staticData,
      unreadCount: 0,
      isLoading: false,

      // Sync data from Supabase on load
      syncFromSupabase: async () => {
        set({ isLoading: true });
        try {
          const [leadsData, projectsData, followupsData, visitsData, loanData, notifData] = await Promise.all([
            fetchLeads(),
            fetchProjects(),
            fetchFollowups(),
            fetchVisits(),
            fetchLoanInquiries(),
            fetchNotifications(),
          ]);
          // IMPORTANT: only replace a collection when Supabase actually returns rows.
          // Otherwise an empty/failed fetch would wipe locally-saved (localStorage) data
          // created while Supabase writes were unavailable.
          const notifications = (notifData as Notification[]).length > 0 ? (notifData as Notification[]) : get().notifications;
          set({
            leads: (leadsData as Lead[]).length > 0 ? (leadsData as Lead[]) : get().leads,
            projects: projectsData.length > 0 ? (projectsData as Project[]) : get().projects,
            followups: (followupsData as FollowUp[]).length > 0 ? (followupsData as FollowUp[]) : get().followups,
            visits: (visitsData as Visit[]).length > 0 ? (visitsData as Visit[]) : get().visits,
            loanInquiries: (loanData as LoanInquiry[]).length > 0 ? (loanData as LoanInquiry[]) : get().loanInquiries,
            notifications,
            unreadCount: notifications.filter((n: Notification) => !n.read && !n.deleted).length,
          });
        } catch (e) {
          console.error('[dataStore] syncFromSupabase failed:', e);
        } finally {
          // Always clear the loading flag so the UI can't hang on a failed/partial sync
          set({ isLoading: false });
        }
      },

      // Lead CRUD with Supabase
      addLead: async (lead) => {
        console.log('[addLead] Saving lead to Supabase:', lead.name);
        const saved = await createLead(lead as any);
        const finalLead = (saved as Lead) || lead;
        if (saved) {
          console.log('[addLead] Saved to Supabase successfully:', saved.id);
          set((s) => ({ leads: [saved as Lead, ...s.leads] }));
        } else {
          console.warn('[addLead] Supabase save failed, using localStorage fallback');
          set((s) => ({ leads: [lead, ...s.leads] }));
        }
        // Fire automation rules listening for new leads
        get().runAutomationForTrigger('lead_created', { leadName: finalLead.name, leadId: finalLead.id });
      },

      updateLead: async (id, data) => {
        const saved = await updateLeadDb(id, data as any);
        set((s) => {
          if (saved) {
            return { leads: s.leads.map((l) => l.id === id ? {...l, ...saved as any} : l) };
          }
          return { leads: s.leads.map((l) => l.id === id ? {...l, ...data, updatedAt: new Date().toISOString()} : l) };
        });
      },

      deleteLead: async (id) => {
        await deleteLeadDb(id);
        set((s) => ({ leads: s.leads.filter((l) => l.id !== id) }));
      },

      // Followup CRUD
      addFollowup: async (followup) => {
        const saved = await createFollowup(followup as any);
        if (saved) {
          set((s) => ({ followups: [saved as FollowUp, ...s.followups] }));
        } else {
          set((s) => ({ followups: [followup, ...s.followups] }));
        }
      },

      updateFollowup: (id, data) =>
        set((s) => ({ followups: s.followups.map((f) => f.id === id ? { ...f, ...data } : f) })),

      // Visit CRUD
      addVisit: async (visit) => {
        const saved = await createVisit(visit as any);
        if (saved) {
          set((s) => ({ visits: [saved as Visit, ...s.visits] }));
        } else {
          set((s) => ({ visits: [visit, ...s.visits] }));
        }
      },

      updateVisit: (id, data) =>
        set((s) => ({ visits: s.visits.map((v) => v.id === id ? { ...v, ...data } : v) })),

      // Project CRUD
      addProject: async (project) => {
        const saved = await createProject(project as any);
        if (saved) {
          set((s) => ({ projects: [saved as Project, ...s.projects] }));
        } else {
          set((s) => ({ projects: [project, ...s.projects] }));
        }
      },

      updateProject: async (id, data) => {
        const saved = await updateProjectDb(id, data as any);
        if (saved) {
          set((s) => ({ projects: s.projects.map((p) => p.id === id ? { ...p, ...saved } as Project : p) }));
        } else {
          set((s) => ({ projects: s.projects.map((p) => p.id === id ? { ...p, ...data } : p) }));
        }
      },

      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      // Loan Inquiry CRUD
      addLoanInquiry: async (inquiry) => {
        const saved = await createLoanInquiry(inquiry as any);
        if (saved) {
          set((s) => ({ loanInquiries: [saved as LoanInquiry, ...s.loanInquiries] }));
        } else {
          set((s) => ({ loanInquiries: [inquiry, ...s.loanInquiries] }));
        }
      },

      // Notifications
      markNotificationRead: async (id) => {
        await markNotificationReadDb(id);
        set((s) => {
          const updated = s.notifications.map((n) => n.id === id ? { ...n, read: true } : n);
          return { notifications: updated, unreadCount: updated.filter((n) => !n.read && !n.deleted).length };
        });
      },

      markAllNotificationsRead: () =>
        set((s) => {
          const updated = s.notifications.map((n) => ({ ...n, read: true }));
          return { notifications: updated, unreadCount: 0 };
        }),

      markNotificationsReadByIds: (ids) =>
        set((s) => {
          const updated = s.notifications.map((n) => ids.includes(n.id) ? { ...n, read: true } : n);
          return { notifications: updated, unreadCount: updated.filter((n) => !n.read && !n.deleted).length };
        }),

      deleteNotification: (id) =>
        set((s) => {
          const updated = s.notifications.map((n) => n.id === id ? { ...n, deleted: true } : n);
          return { notifications: updated, unreadCount: updated.filter((n) => !n.read && !n.deleted).length };
        }),

      deleteNotificationsByIds: (ids) =>
        set((s) => {
          const updated = s.notifications.map((n) => ids.includes(n.id) ? { ...n, deleted: true } : n);
          return { notifications: updated, unreadCount: updated.filter((n) => !n.read && !n.deleted).length };
        }),

      createNotification: async (notification) => {
        const n = { ...notification, id: `not_${Date.now()}`, createdAt: new Date().toISOString() } as Notification;
        const saved = await createNotification(n as any);
        set((s) => {
          const item = (saved || n) as Notification;
          const updated = [item, ...s.notifications];
          return { notifications: updated, unreadCount: updated.filter((n) => !n.read && !n.deleted).length };
        });
      },

      getUnreadCount: () => get().notifications.filter((n) => !n.read && !n.deleted).length,

      toggleAutomationRule: (id) =>
        set((s) => ({
          automationRules: s.automationRules.map((r) =>
            r.id === id ? { ...r, enabled: !r.enabled } : r
          ),
        })),

      // Minimal automation engine: when an event fires, run matching enabled rules,
      // bump their run stats, and surface an in-app notification per rule.
      runAutomationForTrigger: (trigger, context) => {
        const matched = get().automationRules.filter((r) => r.enabled && r.trigger === trigger);
        if (matched.length === 0) return;
        const ranAt = new Date().toISOString();
        set((s) => ({
          automationRules: s.automationRules.map((r) =>
            r.enabled && r.trigger === trigger
              ? { ...r, runCount: (r.runCount || 0) + 1, lastRunAt: ranAt }
              : r
          ),
        }));
        matched.forEach((rule) => {
          get().createNotification({
            type: 'automation_alert',
            title: `Automation: ${rule.name}`,
            description: context?.leadName ? `${rule.description} — ${context.leadName}` : rule.description,
            read: false,
            priority: 'low',
            module: 'automation',
            entityId: context?.leadId,
            entityType: 'lead',
          });
        });
      },
    }),
    {
      name: 'p13-data-store',
      partialize: (state) => ({
        leads: state.leads,
        followups: state.followups,
        visits: state.visits,
        projects: state.projects,
        loanInquiries: state.loanInquiries,
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);
