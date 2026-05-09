import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lead, FollowUp, Visit, Project, LoanInquiry, Notification } from '@/types';
import {
  projects as mockProjects,
  automationRules as mockRules,
  whatsappTemplates as mockTemplates,
  activityData, sourceBreakdown, conversionFunnel, teamPerformance, loginActivity,
} from '@/data/mockData';

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
  addLead: (lead: Lead) => void;
  updateLead: (id: string, data: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  addFollowup: (followup: FollowUp) => void;
  updateFollowup: (id: string, data: Partial<FollowUp>) => void;
  addVisit: (visit: Visit) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  addLoanInquiry: (inquiry: LoanInquiry) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  markNotificationsReadByIds: (ids: string[]) => void;
  deleteNotification: (id: string) => void;
  deleteNotificationsByIds: (ids: string[]) => void;
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  getUnreadCount: () => number;
  toggleAutomationRule: (id: string) => void;
}

// Non-persisted mock data
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
      // Persisted data
      leads: [],
      followups: [],
      visits: [],
      projects: mockProjects,
      loanInquiries: [],
      notifications: [],

      // Static (not persisted - always from mock data)
      ...staticData,

      unreadCount: 0,

      addLead: (lead) => set((s) => ({ leads: [lead, ...s.leads] })),
      updateLead: (id, data) => set((s) => ({
        leads: s.leads.map((l) => l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l),
      })),
      deleteLead: (id) => set((s) => ({ leads: s.leads.filter((l) => l.id !== id) })),
      addFollowup: (followup) => set((s) => ({ followups: [followup, ...s.followups] })),
      updateFollowup: (id, data) => set((s) => ({
        followups: s.followups.map((f) => f.id === id ? { ...f, ...data } : f),
      })),
      addVisit: (visit) => set((s) => ({ visits: [visit, ...s.visits] })),
      addProject: (project) => set((s) => ({ projects: [project, ...s.projects] })),
      updateProject: (id, data) => set((s) => ({
        projects: s.projects.map((p) => p.id === id ? { ...p, ...data } : p),
      })),
      addLoanInquiry: (inquiry) => set((s) => ({ loanInquiries: [inquiry, ...s.loanInquiries] })),

      // Notification service
      markNotificationRead: (id) => set((s) => {
        const updated = s.notifications.map((n) => n.id === id ? { ...n, read: true } : n);
        return { notifications: updated, unreadCount: updated.filter((n) => !n.read && !n.deleted).length };
      }),
      markAllNotificationsRead: () => set((s) => {
        const updated = s.notifications.map((n) => ({ ...n, read: true }));
        return { notifications: updated, unreadCount: 0 };
      }),
      markNotificationsReadByIds: (ids) => set((s) => {
        const updated = s.notifications.map((n) => ids.includes(n.id) ? { ...n, read: true } : n);
        return { notifications: updated, unreadCount: updated.filter((n) => !n.read && !n.deleted).length };
      }),
      deleteNotification: (id) => set((s) => {
        const updated = s.notifications.map((n) => n.id === id ? { ...n, deleted: true } : n);
        return { notifications: updated, unreadCount: updated.filter((n) => !n.read && !n.deleted).length };
      }),
      deleteNotificationsByIds: (ids) => set((s) => {
        const updated = s.notifications.map((n) => ids.includes(n.id) ? { ...n, deleted: true } : n);
        return { notifications: updated, unreadCount: updated.filter((n) => !n.read && !n.deleted).length };
      }),
      createNotification: (notification) => set((s) => {
        const n: Notification = {
          ...notification,
          id: `not_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        const updated = [n, ...s.notifications];
        return { notifications: updated, unreadCount: updated.filter((n) => !n.read && !n.deleted).length };
      }),
      getUnreadCount: () => get().notifications.filter((n) => !n.read && !n.deleted).length,

      toggleAutomationRule: (id) => set((s) => ({
        automationRules: s.automationRules.map((r) =>
          r.id === id ? { ...r, enabled: !r.enabled } : r
        ),
      })),
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
