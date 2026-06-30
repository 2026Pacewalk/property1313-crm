// Data layer — talks to the Vercel serverless API (/api/*) backed by Vercel Postgres.
// On failure (e.g. local `vite dev` where /api isn't served) callers fall back to
// localStorage in the stores, so the app keeps working offline/in dev.
import { toSnakeCase, toCamelCase } from './db-transform';

const API = '/api';

async function apiGet(resource: string): Promise<any[]> {
  try {
    const r = await fetch(`${API}/${resource}`);
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}
async function apiPost(resource: string, body: any): Promise<any | null> {
  try {
    const r = await fetch(`${API}/${resource}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (!r.ok) { console.warn(`[api] POST ${resource} failed:`, r.status); return null; }
    return await r.json();
  } catch { return null; }
}
async function apiPatch(resource: string, id: string, body: any): Promise<any | null> {
  try {
    const r = await fetch(`${API}/${resource}?id=${encodeURIComponent(id)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}
async function apiDelete(resource: string, id: string): Promise<boolean> {
  try {
    const r = await fetch(`${API}/${resource}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    return r.ok;
  } catch { return false; }
}

// ==================== LEADS ====================
export const fetchLeads = async () => (await apiGet('leads')).map(toCamelCase);
export const createLead = async (lead: any) => { const s = await apiPost('leads', toSnakeCase(lead)); return s ? toCamelCase(s) : null; };
export const updateLeadDb = async (id: string, data: any) => { const s = await apiPatch('leads', id, toSnakeCase(data)); return s ? toCamelCase(s) : null; };
export const deleteLeadDb = (id: string) => apiDelete('leads', id);

// ==================== PROJECTS ====================
export const fetchProjects = async () => (await apiGet('projects')).map(toCamelCase);
export const createProject = async (project: any) => { const s = await apiPost('projects', toSnakeCase(project)); return s ? toCamelCase(s) : null; };
export const updateProjectDb = async (id: string, data: any) => { const s = await apiPatch('projects', id, toSnakeCase(data)); return s ? toCamelCase(s) : null; };

// ==================== USERS ====================
export const fetchUsers = async () => (await apiGet('users')).map(toCamelCase);
export const createUserDb = async (user: any) => { const s = await apiPost('users', toSnakeCase(user)); return s ? toCamelCase(s) : null; };
export const updateUserDb = async (id: string, data: any) => { const s = await apiPatch('users', id, toSnakeCase(data)); return s ? toCamelCase(s) : null; };
export const deleteUserDb = (id: string) => apiDelete('users', id);

// ==================== FOLLOWUPS ====================
function followupToDb(f: any) {
  const dt = f.scheduledAt ? new Date(f.scheduledAt) : null;
  return {
    lead_id: f.leadId ?? null, lead_name: f.leadName ?? null, user_id: f.assignedTo || null,
    type: 'Reminder', status: f.status || 'pending',
    scheduled_date: dt ? dt.toISOString().split('T')[0] : null,
    scheduled_time: dt ? dt.toISOString().split('T')[1].slice(0, 5) : null,
    notes: f.note ?? '', completed_at: f.completedAt || null,
  };
}
function followupFromDb(r: any) {
  if (!r) return r;
  const scheduledAt = r.scheduledDate
    ? (r.scheduledTime ? `${r.scheduledDate}T${r.scheduledTime}:00` : `${r.scheduledDate}T00:00:00`)
    : r.createdAt;
  return { id: r.id, leadId: r.leadId, leadName: r.leadName, leadPhone: '', note: r.notes ?? '', scheduledAt, status: r.status, assignedTo: r.userId ?? '', completedAt: r.completedAt ?? undefined, createdAt: r.createdAt };
}
export const fetchFollowups = async () => (await apiGet('followups')).map((r) => followupFromDb(toCamelCase(r)));
export const createFollowup = async (f: any) => { const s = await apiPost('followups', followupToDb(f)); return s ? followupFromDb(toCamelCase(s)) : null; };

// ==================== VISITS ====================
const VISIT_DB_STATUSES = ['scheduled', 'completed', 'no_show', 'cancelled', 'rescheduled', 'revisit_required'];
function visitToDb(v: any) {
  return {
    lead_id: v.leadId ?? null, lead_name: v.leadName ?? null, project_name: v.projectName ?? null,
    user_id: v.assignedTo || null, visit_date: v.visitDate ?? null, visit_time: v.visitTime ?? null,
    status: VISIT_DB_STATUSES.includes(v.status) ? v.status : 'scheduled', feedback: v.notes ?? null,
  };
}
function visitFromDb(r: any) {
  if (!r) return r;
  return { id: r.id, leadId: r.leadId, leadName: r.leadName, leadPhone: '', projectName: r.projectName ?? '', visitDate: r.visitDate, visitTime: r.visitTime, duration: '1 hour', visitType: 'first_visit', status: r.status, assignedTo: r.userId ?? '', notes: r.feedback ?? '', createdAt: r.createdAt };
}
export const fetchVisits = async () => (await apiGet('visits')).map((r) => visitFromDb(toCamelCase(r)));
export const createVisit = async (v: any) => { const s = await apiPost('visits', visitToDb(v)); return s ? visitFromDb(toCamelCase(s)) : null; };

// ==================== LOAN INQUIRIES ====================
function loanToDb(l: any) {
  return {
    applicant_name: l.name ?? l.applicantName ?? 'Unknown', phone: l.phone ?? '', email: l.email ?? null,
    loan_amount: l.loanAmount ?? null, loan_type: l.loanType ?? 'Home Loan', bank_name: l.bankName ?? null,
    status: l.status || 'new', notes: l.notes ?? null, assigned_to: l.assignedTo || null,
  };
}
function loanFromDb(r: any) {
  if (!r) return r;
  return { id: r.id, name: r.applicantName ?? '', phone: r.phone ?? '', email: r.email ?? undefined, loanAmount: r.loanAmount ?? 0, loanType: r.loanType ?? 'Home Loan', bankName: r.bankName ?? undefined, status: r.status, notes: r.notes ?? undefined, assignedTo: r.assignedTo ?? undefined, createdAt: r.createdAt };
}
export const fetchLoanInquiries = async () => (await apiGet('loan-inquiries')).map((r) => loanFromDb(toCamelCase(r)));
export const createLoanInquiry = async (inquiry: any) => { const s = await apiPost('loan-inquiries', loanToDb(inquiry)); return s ? loanFromDb(toCamelCase(s)) : null; };

// ==================== NOTIFICATIONS ====================
const NOTIF_DB_TYPES = ['lead_assigned', 'followup_reminder', 'visit_reminder', 'loan_alert', 'automation', 'security', 'mention', 'system'];
function notifTypeToDb(type: string): string {
  if (NOTIF_DB_TYPES.includes(type)) return type;
  if (/follow/.test(type)) return 'followup_reminder';
  if (/visit/.test(type)) return 'visit_reminder';
  if (/loan/.test(type)) return 'loan_alert';
  if (/lead/.test(type)) return 'lead_assigned';
  if (/login|security|password/.test(type)) return 'security';
  if (/mention/.test(type)) return 'mention';
  if (/automation/.test(type)) return 'automation';
  return 'system';
}
function notifToDb(n: any) {
  return {
    user_id: n.userId || null, type: notifTypeToDb(n.type || 'system'), title: n.title ?? '',
    message: n.description ?? n.message ?? '', read: !!n.read, deleted: !!n.deleted,
    action_url: n.actionUrl ?? null, related_entity_id: n.entityId ?? null, related_entity_type: n.entityType ?? null,
  };
}
function notifFromDb(r: any) {
  if (!r) return r;
  return { ...r, description: r.message ?? r.description ?? '', entityId: r.relatedEntityId ?? r.entityId, entityType: r.relatedEntityType ?? r.entityType };
}
export const fetchNotifications = async () => (await apiGet('notifications')).map((r) => notifFromDb(toCamelCase(r)));
export const createNotification = async (notification: any) => { const s = await apiPost('notifications', notifToDb(notification)); return s ? notifFromDb(toCamelCase(s)) : null; };
export const markNotificationReadDb = (id: string) => apiPatch('notifications', id, { read: true });

// ==================== MASTER VALUES ====================
export const fetchMasterValues = async () => (await apiGet('master-values')).map(toCamelCase);
export const createMasterValue = async (value: any) => { const s = await apiPost('master-values', toSnakeCase(value)); return s ? toCamelCase(s) : null; };

// ==================== AUDIT LOGS ====================
export const fetchAuditLogs = async () => (await apiGet('audit-logs')).map(toCamelCase);
export const createAuditLog = async (log: any) => { const s = await apiPost('audit-logs', toSnakeCase(log)); return s ? toCamelCase(s) : null; };

// ==================== HEALTH ====================
export const isApiOnline = () => (typeof navigator === 'undefined' ? true : navigator.onLine);
export async function testApiConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const r = await fetch(`${API}/leads`);
    return r.ok ? { ok: true } : { ok: false, error: `HTTP ${r.status}` };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'unreachable' };
  }
}
