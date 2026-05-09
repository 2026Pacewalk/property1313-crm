// Supabase Database Types
// Generate from your Supabase project: https://supabase.com/docs/guides/api/rest/generating-types

export interface Database {
  public: {
    Tables: {
      leads: { Row: Record<string, unknown> };
      projects: { Row: Record<string, unknown> };
      users: { Row: Record<string, unknown> };
      followups: { Row: Record<string, unknown> };
      visits: { Row: Record<string, unknown> };
      loan_inquiries: { Row: Record<string, unknown> };
      notifications: { Row: Record<string, unknown> };
      audit_logs: { Row: Record<string, unknown> };
      master_values: { Row: Record<string, unknown> };
    };
  };
}
