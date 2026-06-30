import { supabase, isSupabaseReady } from './supabase';
import { toSnakeCase, toCamelCase } from './db-transform';

function checkReady(): boolean {
  if (!isSupabaseReady()) {
    console.warn('[Supabase] Not configured. Set VITE_SUPABASE_ANON_KEY env variable.');
    return false;
  }
  return true;
}

// ==================== GENERIC HELPERS ====================

async function fetchTable(table: string): Promise<any[]> {
  if (!checkReady()) return [];
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error(`[Supabase] fetch ${table}:`, error.message); return []; }
    return (data || []).map((r) => toCamelCase(r));
  } catch (e) {
    console.error(`[Supabase] fetch ${table} exception:`, e);
    return [];
  }
}

// Insert a record whose keys are ALREADY in DB (snake_case) shape — skips the camel->snake transform.
async function insertRaw(table: string, dbRecord: any): Promise<any | null> {
  if (!checkReady()) return null;
  try {
    const { data, error } = await supabase.from(table).insert([dbRecord]).select();
    if (error) {
      console.error(`[Supabase] insert ${table}:`, error.message, '| Code:', error.code);
      return null;
    }
    if (!data || data.length === 0) return null;
    return toCamelCase(data[0]);
  } catch (e) {
    console.error(`[Supabase] insert ${table} exception:`, e);
    return null;
  }
}

async function insertInto(table: string, record: any): Promise<any | null> {
  if (!checkReady()) return null;
  const dbRecord = toSnakeCase(record);
  try {
    const { data, error } = await supabase
      .from(table)
      .insert([dbRecord])
      .select();
    if (error) {
      console.error(`[Supabase] insert ${table}:`, error.message, '| Code:', error.code);
      return null;
    }
    if (!data || data.length === 0) return null;
    return toCamelCase(data[0]);
  } catch (e) {
    console.error(`[Supabase] insert ${table} exception:`, e);
    return null;
  }
}

async function updateIn(table: string, id: string, record: any): Promise<any | null> {
  if (!checkReady()) return null;
  const dbRecord = toSnakeCase(record);
  try {
    const { data, error } = await supabase
      .from(table)
      .update(dbRecord)
      .eq('id', id)
      .select();
    if (error) { console.error(`[Supabase] update ${table}:`, error.message); return null; }
    if (!data || data.length === 0) return null;
    return toCamelCase(data[0]);
  } catch (e) {
    console.error(`[Supabase] update ${table} exception:`, e);
    return null;
  }
}

async function deleteFrom(table: string, id: string): Promise<boolean> {
  if (!checkReady()) return false;
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) { console.error(`[Supabase] delete ${table}:`, error.message); return false; }
    return true;
  } catch (e) {
    console.error(`[Supabase] delete ${table} exception:`, e);
    return false;
  }
}

// ==================== LEADS ====================
export const fetchLeads = () => fetchTable('leads');
export const createLead = (lead: any) => insertInto('leads', lead);
export const updateLeadDb = (id: string, data: any) => updateIn('leads', id, data);
export const deleteLeadDb = (id: string) => deleteFrom('leads', id);

// ==================== PROJECTS ====================
export const fetchProjects = () => fetchTable('projects');
export const createProject = (project: any) => insertInto('projects', project);
export const updateProjectDb = (id: string, data: any) => updateIn('projects', id, data);

// ==================== USERS ====================
export const fetchUsers = () => fetchTable('users');
export const createUserDb = (user: any) => insertInto('users', user);
export const updateUserDb = (id: string, data: any) => updateIn('users', id, data);
export const deleteUserDb = (id: string) => deleteFrom('users', id);

// ==================== FOLLOWUPS ====================
// The frontend FollowUp shape (scheduledAt/note/assignedTo) differs from the DB columns
// (scheduled_date+scheduled_time/notes/user_id), so map in both directions.
function followupToDb(f: any) {
  const dt = f.scheduledAt ? new Date(f.scheduledAt) : null;
  return {
    lead_id: f.leadId ?? null,
    lead_name: f.leadName ?? null,
    user_id: f.assignedTo || null,
    type: 'Reminder',
    status: f.status || 'pending',
    scheduled_date: dt ? dt.toISOString().split('T')[0] : null,
    scheduled_time: dt ? dt.toISOString().split('T')[1].slice(0, 5) : null,
    notes: f.note ?? '',
    completed_at: f.completedAt || null,
  };
}
function followupFromDb(r: any) {
  if (!r) return r;
  const scheduledAt = r.scheduledDate
    ? (r.scheduledTime ? `${r.scheduledDate}T${r.scheduledTime}:00` : `${r.scheduledDate}T00:00:00`)
    : r.createdAt;
  return {
    id: r.id,
    leadId: r.leadId,
    leadName: r.leadName,
    leadPhone: '',
    note: r.notes ?? '',
    scheduledAt,
    status: r.status,
    assignedTo: r.userId ?? '',
    completedAt: r.completedAt ?? undefined,
    createdAt: r.createdAt,
  };
}
export const fetchFollowups = async () => (await fetchTable('followups')).map(followupFromDb);
export const createFollowup = async (followup: any) => {
  const saved = await insertRaw('followups', followupToDb(followup));
  return saved ? followupFromDb(saved) : null;
};

// ==================== VISITS ====================
const VISIT_DB_STATUSES = ['scheduled', 'completed', 'no_show', 'cancelled', 'rescheduled', 'revisit_required'];
function visitToDb(v: any) {
  return {
    lead_id: v.leadId ?? null,
    lead_name: v.leadName ?? null,
    project_name: v.projectName ?? null,
    user_id: v.assignedTo || null,
    visit_date: v.visitDate ?? null,
    visit_time: v.visitTime ?? null,
    status: VISIT_DB_STATUSES.includes(v.status) ? v.status : 'scheduled',
    feedback: v.notes ?? null,
  };
}
function visitFromDb(r: any) {
  if (!r) return r;
  return {
    id: r.id,
    leadId: r.leadId,
    leadName: r.leadName,
    leadPhone: '',
    projectName: r.projectName ?? '',
    visitDate: r.visitDate,
    visitTime: r.visitTime,
    duration: '1 hour',
    visitType: 'first_visit',
    status: r.status,
    assignedTo: r.userId ?? '',
    notes: r.feedback ?? '',
    createdAt: r.createdAt,
  };
}
export const fetchVisits = async () => (await fetchTable('visits')).map(visitFromDb);
export const createVisit = async (visit: any) => {
  const saved = await insertRaw('visits', visitToDb(visit));
  return saved ? visitFromDb(saved) : null;
};

// ==================== LOAN INQUIRIES ====================
function loanToDb(l: any) {
  return {
    applicant_name: l.name ?? l.applicantName ?? 'Unknown',
    phone: l.phone ?? '',
    email: l.email ?? null,
    loan_amount: l.loanAmount ?? null,
    loan_type: l.loanType ?? 'Home Loan',
    bank_name: l.bankName ?? null,
    status: l.status || 'new',
    notes: l.notes ?? null,
    assigned_to: l.assignedTo || null,
  };
}
function loanFromDb(r: any) {
  if (!r) return r;
  return {
    id: r.id,
    name: r.applicantName ?? '',
    phone: r.phone ?? '',
    email: r.email ?? undefined,
    loanAmount: r.loanAmount ?? 0,
    loanType: r.loanType ?? 'Home Loan',
    bankName: r.bankName ?? undefined,
    status: r.status,
    notes: r.notes ?? undefined,
    assignedTo: r.assignedTo ?? undefined,
    createdAt: r.createdAt,
  };
}
export const fetchLoanInquiries = async () => (await fetchTable('loan_inquiries')).map(loanFromDb);
export const createLoanInquiry = async (inquiry: any) => {
  const saved = await insertRaw('loan_inquiries', loanToDb(inquiry));
  return saved ? loanFromDb(saved) : null;
};

// ==================== NOTIFICATIONS ====================
// Map the broad frontend NotificationType union onto the DB's CHECK-constrained enum.
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
    user_id: n.userId || null,
    type: notifTypeToDb(n.type || 'system'),
    title: n.title ?? '',
    message: n.description ?? n.message ?? '',
    read: !!n.read,
    deleted: !!n.deleted,
    action_url: n.actionUrl ?? null,
    related_entity_id: n.entityId ?? null,
    related_entity_type: n.entityType ?? null,
  };
}
function notifFromDb(r: any) {
  if (!r) return r;
  return {
    ...r,
    description: r.message ?? r.description ?? '',
    entityId: r.relatedEntityId ?? r.entityId,
    entityType: r.relatedEntityType ?? r.entityType,
  };
}
export const fetchNotifications = async (): Promise<any[]> => {
  if (!checkReady()) return [];
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('deleted', false)
      .order('created_at', { ascending: false });
    if (error) { console.error('[Supabase] fetch notifications:', error.message); return []; }
    return (data || []).map((r) => notifFromDb(toCamelCase(r)));
  } catch (e) { console.error('[Supabase] fetch notifications exception:', e); return []; }
};
export const createNotification = async (notification: any) => {
  const saved = await insertRaw('notifications', notifToDb(notification));
  return saved ? notifFromDb(saved) : null;
};
export const markNotificationReadDb = (id: string) => updateIn('notifications', id, { read: true });

// ==================== MASTER VALUES ====================
export const fetchMasterValues = async (): Promise<any[]> => {
  if (!checkReady()) return [];
  try {
    const { data, error } = await supabase
      .from('master_values')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (error) { console.error('[Supabase] fetch master_values:', error.message); return []; }
    return (data || []).map((r) => toCamelCase(r));
  } catch (e) { console.error('[Supabase] fetch master_values exception:', e); return []; }
};
export const createMasterValue = (value: any) => insertInto('master_values', value);

// ==================== AUDIT LOGS ====================
export const fetchAuditLogs = async (): Promise<any[]> => {
  if (!checkReady()) return [];
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) { console.error('[Supabase] fetch audit_logs:', error.message); return []; }
    return (data || []).map((r) => toCamelCase(r));
  } catch (e) { console.error('[Supabase] fetch audit_logs exception:', e); return []; }
};
export const createAuditLog = (log: any) => insertInto('audit_logs', log);

// ==================== HEALTH CHECK ====================
export async function testSupabaseConnection(): Promise<{ ok: boolean; error?: string; tables?: string[] }> {
  if (!isSupabaseReady()) return { ok: false, error: 'Supabase not configured' };
  try {
    const { error } = await supabase.from('users').select('count').limit(1);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message || 'Unknown error' };
  }
}
