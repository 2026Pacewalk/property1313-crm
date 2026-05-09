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
export const fetchFollowups = () => fetchTable('followups');
export const createFollowup = (followup: any) => insertInto('followups', followup);

// ==================== VISITS ====================
export const fetchVisits = () => fetchTable('visits');
export const createVisit = (visit: any) => insertInto('visits', visit);

// ==================== LOAN INQUIRIES ====================
export const fetchLoanInquiries = () => fetchTable('loan_inquiries');
export const createLoanInquiry = (inquiry: any) => insertInto('loan_inquiries', inquiry);

// ==================== NOTIFICATIONS ====================
export const fetchNotifications = async (): Promise<any[]> => {
  if (!checkReady()) return [];
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('deleted', false)
      .order('created_at', { ascending: false });
    if (error) { console.error('[Supabase] fetch notifications:', error.message); return []; }
    return (data || []).map((r) => toCamelCase(r));
  } catch (e) { console.error('[Supabase] fetch notifications exception:', e); return []; }
};
export const createNotification = (notification: any) => insertInto('notifications', notification);
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
