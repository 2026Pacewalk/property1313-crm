import { create } from 'zustand';
import type { WhatsAppTemplate, MessageLog, AITone, TemplateStatus, MessageLogStatus, SendMethod } from '@/types';
import {
  whatsappTemplates as mockTemplates,
  messageLogs as mockLogs,
  recentTemplateUsage as mockRecentUsage,
  templateCategories,
  aiToneConfigs,
  templateVariables,
} from '@/data/mockData';
// NOTE: window.open() must be called from React click handlers directly,
// not from store actions, to preserve user gesture context.

interface TemplateFilter {
  search: string;
  category: string;
  favoritesOnly: boolean;
  automationOnly: boolean;
  status: TemplateStatus | 'all';
  aiTone: AITone | 'all';
}

interface WhatsAppState {
  templates: WhatsAppTemplate[];
  messageLogs: MessageLog[];
  recentUsage: typeof mockRecentUsage;
  categories: typeof templateCategories;
  aiTones: typeof aiToneConfigs;
  variables: typeof templateVariables;
  filter: TemplateFilter;
  selectedTemplateId: string | null;
  isEditorOpen: boolean;
  isPickerOpen: boolean;
  pickerContext: { leadId?: string; leadName?: string; leadPhone?: string; projectName?: string } | null;

  // Pending confirmation (after deep link opens)
  pendingConfirmation: { logId: string; leadName: string } | null;

  // Getters
  getFilteredTemplates: () => WhatsAppTemplate[];
  getFavorites: () => WhatsAppTemplate[];
  getRecent: () => WhatsAppTemplate[];
  getSuggested: (leadScore?: string, category?: string) => WhatsAppTemplate[];
  getTemplateById: (id: string) => WhatsAppTemplate | undefined;
  getCategoryName: (id: string) => string;
  getLogsForTemplate: (templateId: string) => MessageLog[];
  getLogsForLead: (leadId: string) => MessageLog[];
  getAnalytics: () => { totalSent: number; totalConfirmed: number; totalOpened: number; totalFailed: number; responseRate: number; automationRate: number; topTemplate: string };

  // Actions
  setFilter: (filter: Partial<TemplateFilter>) => void;
  selectTemplate: (id: string | null) => void;
  toggleFavorite: (id: string) => void;
  createTemplate: (template: Omit<WhatsAppTemplate, 'id' | 'createdAt' | 'usageCount'>) => WhatsAppTemplate;
  updateTemplate: (id: string, data: Partial<WhatsAppTemplate>) => void;
  deleteTemplate: (id: string) => void;
  archiveTemplate: (id: string) => void;
  cloneTemplate: (id: string) => WhatsAppTemplate;
  openEditor: (templateId?: string) => void;
  closeEditor: () => void;
  openPicker: (context: { leadId?: string; leadName?: string; leadPhone?: string; projectName?: string }) => void;
  closePicker: () => void;

  // AI Tone Engine
  applyTone: (content: string, tone: AITone) => string;

  // Variable replacement
  renderMessage: (template: WhatsAppTemplate, context: Record<string, string>) => string;
  extractVariables: (content: string) => string[];

  // Deep link send flow (logging only - window.open must be in click handler)
  logWhatsAppOpen: (params: {
    templateId: string;
    leadId?: string;
    leadName: string;
    leadPhone: string;
    userId: string;
    userName: string;
    userMobile: string;
    renderedContent: string;
    method: SendMethod;
  }) => MessageLog;
  markAsSent: (logId: string) => void;
  clearPendingConfirmation: () => void;

  // Log actions
  updateLogStatus: (logId: string, status: MessageLogStatus) => void;
}

const defaultFilter: TemplateFilter = {
  search: '',
  category: 'all',
  favoritesOnly: false,
  automationOnly: false,
  status: 'all',
  aiTone: 'all',
};

export const useWhatsAppStore = create<WhatsAppState>((set, get) => ({
  templates: mockTemplates,
  messageLogs: mockLogs,
  recentUsage: mockRecentUsage,
  categories: templateCategories,
  aiTones: aiToneConfigs,
  variables: templateVariables,
  filter: { ...defaultFilter },
  selectedTemplateId: null,
  isEditorOpen: false,
  isPickerOpen: false,
  pickerContext: null,
  pendingConfirmation: null,

  getFilteredTemplates: () => {
    const { templates, filter } = get();
    return templates.filter((t) => {
      if (filter.search) {
        const s = filter.search.toLowerCase();
        const matches = t.name.toLowerCase().includes(s) ||
          t.category.toLowerCase().includes(s) ||
          t.content.toLowerCase().includes(s) ||
          t.description?.toLowerCase().includes(s);
        if (!matches) return false;
      }
      if (filter.category !== 'all' && t.category !== filter.category) return false;
      if (filter.favoritesOnly && !t.isFavorite) return false;
      if (filter.automationOnly && !t.automationEnabled) return false;
      if (filter.status !== 'all' && t.status !== filter.status) return false;
      if (filter.aiTone !== 'all' && t.aiTone !== filter.aiTone) return false;
      return true;
    });
  },

  getFavorites: () => get().templates.filter((t) => t.isFavorite && t.status === 'active'),

  getRecent: () => {
    const { templates, recentUsage } = get();
    const recentIds = [...recentUsage]
      .sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime())
      .slice(0, 8)
      .map((r) => r.templateId);
    return recentIds
      .map((id) => templates.find((t) => t.id === id))
      .filter(Boolean) as WhatsAppTemplate[];
  },

  getSuggested: (leadScore?: string, category?: string) => {
    const { templates } = get();
    const score = leadScore?.toLowerCase();
    return templates.filter((t) => {
      if (t.status !== 'active') return false;
      if (category && t.category === category) return true;
      if (score === 'hot' && (t.aiTone === 'hot' || t.category === 'Hot Lead Follow-up')) return true;
      if (score === 'warm' && (t.aiTone === 'warm' || ['Follow-up Reminder', 'Post Visit Follow-up', 'Property Recommendation'].includes(t.category))) return true;
      if (score === 'cold' && (t.aiTone === 'cold' || ['Cold Lead Re-engagement', 'No Response Follow-up'].includes(t.category))) return true;
      return false;
    }).slice(0, 6);
  },

  getTemplateById: (id) => get().templates.find((t) => t.id === id),
  getCategoryName: (id) => templateCategories.find((c) => c.id === id)?.name || id,
  getLogsForTemplate: (templateId) => get().messageLogs.filter((l) => l.templateId === templateId),
  getLogsForLead: (leadId) => get().messageLogs.filter((l) => l.sentTo.leadId === leadId),

  getAnalytics: () => {
    const logs = get().messageLogs;
    const totalSent = logs.length;
    const totalConfirmed = logs.filter((l) => l.status === 'sent_confirmed').length;
    const totalOpened = logs.filter((l) => l.status === 'opened' || l.status === 'manual_sent_unconfirmed').length;
    const totalFailed = logs.filter((l) => l.status === 'failed').length;
    const withResponse = logs.filter((l) => l.response).length;
    const confirmedOrRead = logs.filter((l) => l.status === 'sent_confirmed' && l.response).length;
    const autoSent = logs.filter((l) => l.sendMethod === 'automation').length;

    const templateCounts: Record<string, number> = {};
    logs.forEach((l) => {
      if (l.templateName) templateCounts[l.templateName] = (templateCounts[l.templateName] || 0) + 1;
    });
    const topTemplate = Object.entries(templateCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      totalSent,
      totalConfirmed,
      totalOpened,
      totalFailed,
      responseRate: confirmedOrRead > 0 ? Math.round((withResponse / confirmedOrRead) * 100) || 0 : 0,
      automationRate: totalSent > 0 ? Math.round((autoSent / totalSent) * 100) : 0,
      topTemplate,
    };
  },

  setFilter: (filter) => set((s) => ({ filter: { ...s.filter, ...filter } })),
  selectTemplate: (id) => set({ selectedTemplateId: id }),

  toggleFavorite: (id) => set((s) => ({
    templates: s.templates.map((t) => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t),
  })),

  createTemplate: (template) => {
    const newTemplate: WhatsAppTemplate = {
      ...template,
      id: `wt${Date.now()}`,
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };
    set((s) => ({ templates: [newTemplate, ...s.templates] }));
    return newTemplate;
  },

  updateTemplate: (id, data) => set((s) => ({
    templates: s.templates.map((t) => t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t),
  })),

  deleteTemplate: (id) => set((s) => ({
    templates: s.templates.filter((t) => t.id !== id),
  })),

  archiveTemplate: (id) => set((s) => ({
    templates: s.templates.map((t) => t.id === id ? { ...t, status: 'archived' as TemplateStatus } : t),
  })),

  cloneTemplate: (id) => {
    const original = get().templates.find((t) => t.id === id);
    if (!original) throw new Error('Template not found');
    const cloned: WhatsAppTemplate = {
      ...original,
      id: `wt${Date.now()}`,
      name: `${original.name} (Copy)`,
      isFavorite: false,
      usageCount: 0,
      lastUsed: undefined,
      createdAt: new Date().toISOString(),
      status: 'active',
      approved: false,
    };
    set((s) => ({ templates: [cloned, ...s.templates] }));
    return cloned;
  },

  openEditor: (templateId) => set({ isEditorOpen: true, selectedTemplateId: templateId || null }),
  closeEditor: () => set({ isEditorOpen: false, selectedTemplateId: null }),

  openPicker: (context) => set({ isPickerOpen: true, pickerContext: context }),
  closePicker: () => set({ isPickerOpen: false, pickerContext: null }),

  applyTone: (content, tone) => {
    if (tone === 'hot') {
      return content.replace(/would you like/gi, "don't miss out on")
        .replace(/let me know/gi, "act now - reply immediately")
        .replace(/feel free/gi, "hurry - limited availability");
    }
    if (tone === 'cold') {
      return content.replace(/hurry/gi, "whenever you're ready")
        .replace(/act now/gi, "take your time")
        .replace(/don't miss/gi, "feel free to explore");
    }
    return content;
  },

  renderMessage: (template, context) => {
    let rendered = template.content;
    Object.entries(context).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value || `{{${key}}}`);
    });
    return rendered;
  },

  extractVariables: (content) => {
    const matches = content.match(/\{\{(\w+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.replace(/[{}]/g, '')))];
  },

  // Deep link send flow (logging only)
  logWhatsAppOpen: (params) => {
    const template = get().templates.find((t) => t.id === params.templateId);
    const log: MessageLog = {
      id: `ml${Date.now()}`,
      sentBy: {
        userId: params.userId,
        userName: params.userName,
        userMobile: params.userMobile,
      },
      sentTo: {
        leadId: params.leadId,
        leadName: params.leadName,
        phone: params.leadPhone,
      },
      templateId: params.templateId,
      templateName: template?.name || 'Custom Message',
      content: params.renderedContent,
      status: 'manual_sent_unconfirmed',
      sendMethod: params.method,
      createdAt: new Date().toISOString(),
    };

    set((s) => {
      const updatedTemplates = s.templates.map((t) =>
        t.id === params.templateId
          ? { ...t, usageCount: t.usageCount + 1, lastUsed: new Date().toISOString() }
          : t
      );

      const newRecent = {
        templateId: params.templateId,
        templateName: template?.name || 'Custom Message',
        category: template?.category || 'Custom',
        usedAt: new Date().toISOString(),
        usedBy: params.userId,
        leadName: params.leadName,
      };

      return {
        messageLogs: [log, ...s.messageLogs],
        templates: updatedTemplates,
        recentUsage: [newRecent, ...s.recentUsage.slice(0, 49)],
        pendingConfirmation: { logId: log.id, leadName: params.leadName },
      };
    });

    return log;
  },

  markAsSent: (logId) => {
    set((s) => ({
      messageLogs: s.messageLogs.map((l) =>
        l.id === logId ? { ...l, status: 'sent_confirmed' as MessageLogStatus } : l
      ),
      pendingConfirmation: null,
    }));
  },

  clearPendingConfirmation: () => set({ pendingConfirmation: null }),

  updateLogStatus: (logId, status) => set((s) => ({
    messageLogs: s.messageLogs.map((l) => l.id === logId ? { ...l, status } : l),
  })),
}));
