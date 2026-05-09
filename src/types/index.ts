export type LeadStatus = 'new' | 'warm' | 'hot' | 'cold' | 'converted' | 'lost';
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'telecaller' | 'sales_person' | 'project_team';

// RBAC Permissions
export type Permission =
  | 'can_view_leads' | 'can_create_leads' | 'can_edit_own_leads' | 'can_edit_team_leads' | 'can_delete_leads'
  | 'can_manage_projects' | 'can_manage_users' | 'can_manage_templates' | 'can_manage_automation'
  | 'can_view_reports' | 'can_manage_settings' | 'can_impersonate' | 'can_manage_roles';

export type AccountStatus = 'active' | 'disabled' | 'invite_pending' | 'locked' | 'archived';

export interface RoleDefinition {
  role: UserRole;
  label: string;
  description: string;
  level: number;
  permissions: Permission[];
  canBeManagedBy: UserRole[];
  color: string;
  bgColor: string;
}
export type FollowUpStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type VisitStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'revisit_requested';
export type VisitType = 'first_visit' | 'revisit';
export type LoanInquiryStatus = 'new' | 'contacted' | 'in_progress' | 'approved' | 'closed';
export type AutomationMode = 'manual' | 'semi' | 'full';
export type NotificationType = 'lead_assigned' | 'follow_up_overdue' | 'visit_reminder' | 'lead_converted' | 'automation_alert' | 'loan_inquiry' | 'login_alert' | 'system' | 'follow_up_reminder' | 'visit_scheduled' | 'project_shared' | 'lead_status_changed' | 'user_invited' | 'account_disabled' | 'impersonation';
export type NotificationModule = 'leads' | 'followups' | 'visits' | 'projects' | 'loans' | 'automation' | 'users' | 'system';
export type NotificationPriority = 'urgent' | 'high' | 'normal' | 'low';

// WhatsApp Template System Types
export type MessageType = 'text' | 'image' | 'pdf' | 'video' | 'brochure' | 'link' | 'voice';
export type AITone = 'hot' | 'warm' | 'cold';
export type TemplateStatus = 'active' | 'archived' | 'pending';
export type DeliveryStatus = 'sent' | 'delivered' | 'read' | 'failed';
export type DeliveryMethod = 'manual' | 'automation';

export interface TemplateVariable {
  name: string;
  label: string;
  example: string;
  source: 'lead' | 'project' | 'user' | 'system' | 'custom';
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  description?: string;
  variables: string[];
  messageType: MessageType;
  mediaUrl?: string;
  mediaCaption?: string;
  aiTone?: AITone;
  isFavorite: boolean;
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  status: TemplateStatus;
  automationEnabled: boolean;
  automationTriggers?: string[];
  roleAccess: UserRole[];
  approved: boolean;
  clickCount?: number;
  responseCount?: number;
}

export type SendMethod = 'user_device_manual' | 'whatsapp_web' | 'wa_link' | 'automation';
export type MessageLogStatus = 'opened' | 'manual_sent_unconfirmed' | 'sent_confirmed' | 'failed';

export interface MessageLog {
  id: string;
  sentBy: { userId: string; userName: string; userMobile: string };
  sentTo: { leadId?: string; leadName: string; phone: string };
  templateId?: string;
  templateName?: string;
  content: string;
  status: MessageLogStatus;
  sendMethod: SendMethod;
  automationRuleId?: string;
  createdAt: string;
  response?: string;
  responseAt?: string;
}

export interface RecentTemplateUsage {
  templateId: string;
  templateName: string;
  category: string;
  usedAt: string;
  usedBy: string;
  leadName?: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}

export interface AIToneConfig {
  tone: AITone;
  label: string;
  description: string;
  characteristics: string[];
  emoji: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  accountStatus: AccountStatus;
  lastLoginAt: string;
  createdAt: string;
  displayName?: string;
  timezone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  forcePasswordChange?: boolean;
  managerId?: string;
  whatsappMobile?: string;
  loginMethods: {
    password: boolean;
    whatsappOtp: boolean;
  };
  permissions?: Permission[];
  invitedAt?: string;
  invitedBy?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  isCurrent: boolean;
  lastActiveAt: string;
  createdAt: string;
}

export interface NotificationPrefs {
  leadAssigned: boolean;
  followUpReminders: boolean;
  visitReminders: boolean;
  loanInquiryAlerts: boolean;
  automationAlerts: boolean;
  loginSecurityAlerts: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  whatsappNotifications: boolean;
  soundEnabled: boolean;
}

export type AuditAction =
  | 'user_created' | 'user_updated' | 'user_disabled' | 'user_enabled' | 'user_archived' | 'user_deleted'
  | 'role_changed' | 'password_set' | 'password_reset' | 'password_changed' | 'force_password_change_set'
  | 'invite_sent' | 'invite_resent' | 'account_activated'
  | 'login_success' | 'login_failed' | 'login_otp' | 'logout' | 'session_revoked'
  | 'impersonation_started' | 'impersonation_ended'
  | 'permission_changed' | 'setting_changed' | 'template_created' | 'automation_rule_changed';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  targetUserId?: string;
  targetUserName?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  details: string;
  ipAddress?: string;
  performedBy?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  alternateMobile?: string;
  email?: string;
  status: LeadStatus;
  source: string;
  inquirySource?: string;
  projectInterest?: string;
  targetCity?: string;
  lookingFor?: string;
  typeDetails?: string;
  preferredLocation?: string;
  intendedPurpose?: 'self_use' | 'investment';
  customerBudget?: string;
  assignedTo: string;
  assignTelecaller?: string;
  assignSalesExpert?: string;
  assignManager?: string;
  projectTeamMembers?: string[];
  nextCallDate?: string;
  nextCallTime?: string;
  initialRemark?: string;
  budget?: number;
  notes?: string;
  leadScore: 'hot' | 'warm' | 'cold';
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

export type ReminderStatus = 'pending' | 'triggered' | 'completed' | 'cancelled' | 'overdue' | 'snoozed';
export type ReminderType = 'follow_up' | 'callback' | 'revisit' | 'whatsapp' | 'loan_inquiry' | 'task' | 'meeting' | 'document';
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
export type SnoozeDuration = '15min' | '1hour' | 'tomorrow' | 'custom';

export interface Reminder {
  id: string;
  leadId?: string;
  projectId?: string;
  userId: string;
  assignedToUserId: string;
  reminderType: ReminderType;
  title: string;
  message: string;
  reminderDateTime: string;
  timezone: string;
  status: ReminderStatus;
  isCompleted: boolean;
  completedAt?: string;
  completedNote?: string;
  createdAt: string;
  updatedAt?: string;
  notificationSent: boolean;
  repeatType: RepeatType;
  repeatIntervalDays?: number;
  snoozeCount: number;
  snoozeUntil?: string;
  parentReminderId?: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  note: string;
  scheduledAt: string;
  status: FollowUpStatus;
  assignedTo: string;
  completedAt?: string;
  completedNote?: string;
  createdAt: string;
}

export interface Visit {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  projectName: string;
  projectAddress: string;
  visitDate: string;
  visitTime: string;
  duration: string;
  visitType: VisitType;
  status: VisitStatus;
  assignedTo: string;
  notes?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  propertyType: string[];
  minPrice: number;
  maxPrice: number;
  status: 'active' | 'inactive';
  coverImage: string;
  galleryImages: string[];
  youtubeUrl?: string;
  instagramUrl?: string;
  totalUnits?: number;
  possession?: string;
  reraId?: string;
  landArea?: string;
  floors?: string;
  amenities: string[];
  viewCount: number;
  leadCount: number;
  conversionCount: number;
  shareLink: string;
  slug: string;
  createdAt: string;
}

export interface LoanInquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loanAmount: number;
  employmentType: string;
  monthlyIncome?: number;
  linkedProject?: string;
  status: LoanInquiryStatus;
  assignedTo: string;
  notes?: string;
  createdAt: string;
}



export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  enabled: boolean;
  trigger: string;
  triggerCondition?: string;
  actions: AutomationAction[];
  lastRunAt?: string;
  runCount: number;
}

export interface AutomationAction {
  type: 'send_whatsapp' | 'create_followup' | 'notify' | 'assign' | 'update_status';
  config: Record<string, unknown>;
  delay?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  read: boolean;
  priority: NotificationPriority;
  module: NotificationModule;
  createdAt: string;
  entityId?: string;
  entityType?: string;
  actions?: { label: string; action: string }[];
  metadata?: Record<string, string>;
  deleted?: boolean;
}

export interface KPIData {
  label: string;
  value: number;
  trend: number;
  icon: string;
  iconColor: string;
  trendLabel: string;
}

export interface ActivityData {
  date: string;
  newLeads: number;
  converted: number;
}

export interface SourceBreakdown {
  source: string;
  count: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

export interface TeamPerformance {
  userId: string;
  name: string;
  avatar: string;
  leadsAssigned: number;
  followupsDone: number;
  visitsScheduled: number;
  conversions: number;
  conversionRate: number;
}

export interface LoginActivity {
  id: string;
  userId: string;
  userName: string;
  action: 'login_success' | 'login_failure' | 'otp_request' | 'impersonation' | 'logout' | 'password_reset';
  ipAddress: string;
  device: string;
  browser: string;
  createdAt: string;
  status: 'success' | 'failed';
}

// ===================== MASTER DATABASE TYPES =====================
export interface MasterType {
  id: string;
  name: string;
  slug: string;
  module: string;
  description?: string;
  icon?: string;
  hasParent: boolean;
  parentTypeId?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MasterValue {
  id: string;
  masterTypeId: string;
  parentId?: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean;
  isSystemDefault: boolean;
  usageCount: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface FieldSetting {
  id: string;
  moduleName: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: 'text' | 'number' | 'email' | 'phone' | 'select' | 'multiselect' | 'textarea' | 'date' | 'toggle' | 'file' | 'url';
  isRequired: boolean;
  isVisible: boolean;
  isEditable: boolean;
  sortOrder: number;
  roleVisibility?: Record<string, boolean>;
  masterTypeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MasterAuditLog {
  id: string;
  action: 'value_added' | 'value_edited' | 'value_deactivated' | 'value_activated' | 'value_deleted' | 'value_merged' | 'values_reordered' | 'field_setting_changed';
  masterTypeId: string;
  masterTypeName: string;
  valueId?: string;
  valueName?: string;
  oldValue?: string;
  newValue?: string;
  details: string;
  changedBy: string;
  changedByName: string;
  createdAt: string;
}

export type MasterAction = MasterAuditLog['action'];
