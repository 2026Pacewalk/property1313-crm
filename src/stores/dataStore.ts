import { create } from 'zustand';
import type { Lead, FollowUp, Visit, Project, LoanInquiry, Notification } from '@/types';
import {
  leads as mockLeads, followups as mockFollowups, visits as mockVisits,
  projects as mockProjects, loanInquiries as mockLoans, notifications as mockNotifications,
  automationRules as mockRules, whatsappTemplates as mockTemplates,
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
  // Notification service
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  markNotificationsReadByIds: (ids: string[]) => void;
  deleteNotification: (id: string) => void;
  deleteNotificationsByIds: (ids: string[]) => void;
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  getUnreadCount: () => number;
  toggleAutomationRule: (id: string) => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  leads: mockLeads,
  followups: mockFollowups,
  visits: mockVisits,
  projects: mockProjects,
  loanInquiries: mockLoans,
  notifications: mockNotifications,
  automationRules: mockRules,
  whatsappTemplates: mockTemplates,
  activityData,
  sourceBreakdown,
  conversionFunnel,
  teamPerformance,
  loginActivity,
  unreadCount: mockNotifications.filter((n) => !n.read && !n.deleted).length,
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

  markAllNotificationsRead: () => set((s) => ({
    notifications: s.notifications.map((n) => ({ ...n, read: true })),
    unreadCount: 0,
  })),

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
    const newNotification: Notification = {
      ...notification,
      id: `n${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newNotification, ...s.notifications];
    return { notifications: updated, unreadCount: updated.filter((n) => !n.read && !n.deleted).length };
  }),

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read && !n.deleted).length;
  },

  toggleAutomationRule: (id) => set((s) => ({
    automationRules: s.automationRules.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r),
  })),
}));
