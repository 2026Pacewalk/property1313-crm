import { supabase, isSupabaseReady } from './supabase';

function checkReady() {
  if (!isSupabaseReady()) {
    console.warn('Supabase not configured. Set VITE_SUPABASE_ANON_KEY env variable.');
    return false;
  }
  return true;
}

// Generic query helpers
async function fetchTable(table: string) {
  if (!checkReady()) return [];
  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
  if (error) { console.error(`fetch ${table}:`, error); return []; }
  return data || [];
}

async function insertInto(table: string, record: any) {
  if (!checkReady()) return null;
  const { data, error } = await supabase.from(table).insert([record]).select().single();
  if (error) { console.error(`insert ${table}:`, error); return null; }
  return data;
}

async function updateIn(table: string, id: string, record: any) {
  if (!checkReady()) return null;
  const { data, error } = await supabase.from(table).update(record).eq('id', id).select().single();
  if (error) { console.error(`update ${table}:`, error); return null; }
  return data;
}

async function deleteFrom(table: string, id: string) {
  if (!checkReady()) return false;
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) { console.error(`delete ${table}:`, error); return false; }
  return true;
}

// LEADS
export const fetchLeads = () => fetchTable('leads');
export const createLead = (lead: any) => insertInto('leads', lead);
export const updateLeadDb = (id: string, data: any) => updateIn('leads', id, data);
export const deleteLeadDb = (id: string) => deleteFrom('leads', id);

// PROJECTS
export const fetchProjects = () => fetchTable('projects');
export const createProject = (project: any) => insertInto('projects', project);
export const updateProjectDb = (id: string, data: any) => updateIn('projects', id, data);

// USERS
export const fetchUsers = () => fetchTable('users');
export const createUserDb = (user: any) => insertInto('users', user);
export const updateUserDb = (id: string, data: any) => updateIn('users', id, data);
export const deleteUserDb = (id: string) => deleteFrom('users', id);

// FOLLOWUPS
export const fetchFollowups = () => fetchTable('followups');
export const createFollowup = (followup: any) => insertInto('followups', followup);

// VISITS
export const fetchVisits = () => fetchTable('visits');
export const createVisit = (visit: any) => insertInto('visits', visit);

// LOAN INQUIRIES
export const fetchLoanInquiries = () => fetchTable('loan_inquiries');
export const createLoanInquiry = (inquiry: any) => insertInto('loan_inquiries', inquiry);

// NOTIFICATIONS
export const fetchNotifications = async () => {
  if (!checkReady()) return [];
  const { data, error } = await supabase.from('notifications').select('*').eq('deleted', false).order('created_at', { ascending: false });
  if (error) { console.error('fetchNotifications:', error); return []; }
  return data || [];
};
export const createNotification = (notification: any) => insertInto('notifications', notification);
export const markNotificationReadDb = (id: string) => updateIn('notifications', id, { read: true });

// MASTER VALUES
export const fetchMasterValues = async () => {
  if (!checkReady()) return [];
  const { data, error } = await supabase.from('master_values').select('*').eq('is_active', true).order('sort_order');
  if (error) { console.error('fetchMasterValues:', error); return []; }
  return data || [];
};
export const createMasterValue = (value: any) => insertInto('master_values', value);

// AUDIT LOGS
export const fetchAuditLogs = async () => {
  if (!checkReady()) return [];
  const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
  if (error) { console.error('fetchAuditLogs:', error); return []; }
  return data || [];
};
export const createAuditLog = (log: any) => insertInto('audit_logs', log);
