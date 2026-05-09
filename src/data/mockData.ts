import type { User, UserSession, NotificationPrefs, AuditLog, Lead, FollowUp, Visit, Project, LoanInquiry, WhatsAppTemplate, AutomationRule, Notification, ActivityData, SourceBreakdown, FunnelStage, TeamPerformance, LoginActivity, MessageLog, RecentTemplateUsage, TemplateCategory, AIToneConfig, Reminder } from '@/types';

export const currentUser: User = {
  id: 'u1',
  name: 'Pacewalk Admin',
  email: 'hellopacewalk@gmail.com',
  phone: '+91 98765 43210',
  role: 'super_admin',
  avatar: '',
  isActive: true,
  lastLoginAt: '2026-05-08T09:30:00',
  createdAt: '2025-01-15T00:00:00',
  displayName: 'Pacewalk',
  timezone: 'Asia/Kolkata',
  emailVerified: true,
  phoneVerified: true,
  whatsappMobile: '+91 98765 43210',
  accountStatus: 'active',
  loginMethods: { password: true, whatsappOtp: true },
};

export const users: User[] = [
  currentUser,
  { id: 'u2', name: 'Priya Sharma', email: 'priya@property1313.com', phone: '+91 98765 43211', role: 'admin', avatar: '', isActive: true, accountStatus: 'active', lastLoginAt: '2026-05-08T08:00:00', createdAt: '2025-02-01T00:00:00', displayName: 'Priya S.', timezone: 'Asia/Kolkata', emailVerified: true, phoneVerified: true, loginMethods: { password: true, whatsappOtp: false }, whatsappMobile: '+91 98765 43211' },
  { id: 'u3', name: 'Rahul Verma', email: 'rahul@property1313.com', phone: '+91 98765 43212', role: 'sales_person', avatar: '', isActive: true, accountStatus: 'active', lastLoginAt: '2026-05-07T18:00:00', createdAt: '2025-03-10T00:00:00', displayName: 'Rahul V.', timezone: 'Asia/Kolkata', emailVerified: true, phoneVerified: false, managerId: 'u1', loginMethods: { password: true, whatsappOtp: true }, whatsappMobile: '+91 98765 43212' },
  { id: 'u4', name: 'Sneha Patel', email: 'sneha@property1313.com', phone: '+91 98765 43213', role: 'telecaller', avatar: '', isActive: true, accountStatus: 'active', lastLoginAt: '2026-05-08T07:00:00', createdAt: '2025-04-01T00:00:00', displayName: 'Sneha P.', timezone: 'Asia/Kolkata', emailVerified: false, phoneVerified: true, managerId: 'u1', loginMethods: { password: true, whatsappOtp: true }, whatsappMobile: '+91 98765 43213' },
];

export const userSessions: UserSession[] = [
  { id: 's1', userId: 'u1', device: 'Windows PC', browser: 'Chrome 120', ipAddress: '103.21.58.192', location: 'Mumbai, IN', isCurrent: true, lastActiveAt: '2026-05-08T09:30:00', createdAt: '2026-05-08T09:00:00' },
  { id: 's2', userId: 'u1', device: 'iPhone 15', browser: 'Safari', ipAddress: '103.21.58.193', location: 'Mumbai, IN', isCurrent: false, lastActiveAt: '2026-05-08T08:15:00', createdAt: '2026-05-08T08:00:00' },
];

export const notificationPrefs: NotificationPrefs = {
  leadAssigned: true,
  followUpReminders: true,
  visitReminders: true,
  loanInquiryAlerts: true,
  automationAlerts: false,
  loginSecurityAlerts: true,
  emailNotifications: true,
  pushNotifications: true,
  whatsappNotifications: false,
  soundEnabled: true,
};

export const auditLogs: AuditLog[] = [];

export const leads: Lead[] = [];

export const reminders: Reminder[] = [];

export const followups: FollowUp[] = [];

export const visits: Visit[] = [];

export const projects: Project[] = [
  { id: 'p1', name: 'Sunset Residences', description: 'Premium luxury apartments with world-class amenities.', location: 'Zirakpur, Punjab', propertyType: ['2 BHK', '3 BHK', '4 BHK'], minPrice: 4500000, maxPrice: 15000000, status: 'active', coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', galleryImages: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80'], totalUnits: 240, possession: 'Dec 2026', reraId: 'PBRERAPRJ521000', landArea: '5 Acres', floors: 'G+15', amenities: ['Swimming Pool', 'Gym', 'Club House', 'Children Play Area', '24/7 Security', 'Power Backup', 'Parking'], viewCount: 0, leadCount: 0, conversionCount: 0, shareLink: 'https://p1313.com/project/sunset-residences', slug: 'sunset-residences', createdAt: '2025-01-01T00:00:00' },
  { id: 'p2', name: 'Green Valley', description: 'Eco-friendly residential complex surrounded by greenery.', location: 'Mohali, Punjab', propertyType: ['1 BHK', '2 BHK', '3 BHK'], minPrice: 3500000, maxPrice: 9000000, status: 'active', coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', galleryImages: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&q=80'], totalUnits: 180, possession: 'Mar 2027', reraId: 'PBRERAPRJ123456', landArea: '3.5 Acres', floors: 'G+12', amenities: ['Swimming Pool', 'Gym', 'Jogging Track', '24/7 Security', 'Garden'], viewCount: 0, leadCount: 0, conversionCount: 0, shareLink: 'https://p1313.com/project/green-valley', slug: 'green-valley', createdAt: '2025-02-01T00:00:00' },
];

export const loanInquiries: LoanInquiry[] = [];

export const templateCategories: TemplateCategory[] = [
  { id: 'cat_1', name: 'New Lead Response', description: 'Initial responses to new leads', icon: 'UserPlus', order: 1 },
  { id: 'cat_2', name: 'Welcome Message', description: 'Welcome and onboarding messages', icon: 'Hand', order: 2 },
  { id: 'cat_3', name: 'Callback Request', description: 'Callback scheduling messages', icon: 'PhoneCall', order: 3 },
  { id: 'cat_4', name: 'Project Sharing', description: 'Share project details and brochures', icon: 'Building2', order: 4 },
  { id: 'cat_5', name: 'Site Visit', description: 'Visit invitations and reminders', icon: 'MapPin', order: 5 },
  { id: 'cat_6', name: 'Follow-up', description: 'General follow-up messages', icon: 'Bell', order: 6 },
  { id: 'cat_7', name: 'Loan', description: 'Loan inquiry responses', icon: 'Banknote', order: 7 },
  { id: 'cat_8', name: 'Booking', description: 'Booking confirmations', icon: 'CheckCircle', order: 8 },
  { id: 'cat_9', name: 'General', description: 'General purpose messages', icon: 'MessageSquare', order: 9 },
];

export const aiToneConfigs: AIToneConfig[] = [
  { tone: 'hot', label: 'HOT - Urgent', description: 'Urgent, confident, conversion-focused tone', characteristics: ['Immediate action verbs', 'Limited availability urgency', 'Direct CTAs'], emoji: '\uD83D\uDD25' },
  { tone: 'warm', label: 'WARM - Informative', description: 'Informative, relationship-focused tone', characteristics: ['Educational content', 'Personal touch', 'Soft CTAs'], emoji: '\u2600\uFE0F' },
  { tone: 'cold', label: 'COLD - Soft Re-engage', description: 'Soft, re-engagement style tone', characteristics: ['Non-intrusive language', 'Curiosity hooks', 'Low-pressure CTAs'], emoji: '\u2744\uFE0F' },
];

export const templateVariables = [
  { name: 'customer_name', label: 'Customer Name', example: 'Rahul Sharma', source: 'lead' as const },
  { name: 'project_name', label: 'Project Name', example: 'Sunset Residences', source: 'project' as const },
  { name: 'project_location', label: 'Project Location', example: 'Zirakpur, Punjab', source: 'project' as const },
  { name: 'sales_person_name', label: 'Sales Person Name', example: 'Rahul Verma', source: 'user' as const },
  { name: 'company_name', label: 'Company Name', example: 'Property1313', source: 'system' as const },
  { name: 'company_mobile', label: 'Company Mobile', example: '8910001313', source: 'system' as const },
  { name: 'visit_date', label: 'Visit Date', example: 'May 10, 2026', source: 'lead' as const },
  { name: 'visit_time', label: 'Visit Time', example: '10:30 AM', source: 'lead' as const },
];

export const whatsappTemplates: WhatsAppTemplate[] = [
  {
    id: 'wt1', name: 'Welcome - New Lead', category: 'New Lead Response',
    content: 'Hi {{customer_name}}, thank you for your interest in {{project_name}} at {{project_location}}.\n\nOur team will contact you shortly.\n\n{{company_name}}',
    description: 'Welcome message for new leads', variables: ['customer_name', 'project_name', 'project_location', 'company_name'],
    messageType: 'text', aiTone: 'warm', isFavorite: true, usageCount: 0,
    createdAt: '2025-01-01', updatedAt: '2025-01-01', status: 'active', automationEnabled: true, automationTriggers: ['lead_created'],
    roleAccess: ['super_admin', 'admin', 'manager', 'telecaller', 'sales_person'], approved: true, clickCount: 0, responseCount: 0,
  },
  {
    id: 'wt2', name: 'Site Visit Reminder', category: 'Site Visit',
    content: 'Hi {{customer_name}}, reminder for your site visit to {{project_name}} on {{visit_date}} at {{visit_time}}.\n\n{{company_name}}',
    description: 'Site visit reminder', variables: ['customer_name', 'project_name', 'visit_date', 'visit_time', 'company_name'],
    messageType: 'text', aiTone: 'warm', isFavorite: true, usageCount: 0,
    createdAt: '2025-02-01', status: 'active', automationEnabled: true, automationTriggers: ['visit_upcoming'],
    roleAccess: ['super_admin', 'admin', 'manager', 'sales_person'], approved: true, clickCount: 0, responseCount: 0,
  },
  {
    id: 'wt3', name: 'Follow-up Reminder', category: 'Follow-up',
    content: 'Hi {{customer_name}}, following up on {{project_name}}. Let us know if you would like a site visit or pricing details.\n\n{{sales_person_name}}\n{{company_name}}',
    description: 'General follow-up', variables: ['customer_name', 'project_name', 'sales_person_name', 'company_name'],
    messageType: 'text', aiTone: 'warm', isFavorite: true, usageCount: 0,
    createdAt: '2025-01-01', status: 'active', automationEnabled: true, automationTriggers: ['followup_upcoming'],
    roleAccess: ['super_admin', 'admin', 'manager', 'telecaller', 'sales_person'], approved: true, clickCount: 0, responseCount: 0,
  },
  {
    id: 'wt4', name: 'Project Sharing', category: 'Project Sharing',
    content: 'Hi {{customer_name}}, here are the details for {{project_name}} at {{project_location}}.\n\nLet us know if you would like more information.\n\n{{sales_person_name}}\n{{company_name}}',
    description: 'Share project details', variables: ['customer_name', 'project_name', 'project_location', 'sales_person_name', 'company_name'],
    messageType: 'link', aiTone: 'warm', isFavorite: false, usageCount: 0,
    createdAt: '2025-01-15', status: 'active', automationEnabled: false,
    roleAccess: ['super_admin', 'admin', 'manager', 'sales_person'], approved: true, clickCount: 0, responseCount: 0,
  },
  {
    id: 'wt5', name: 'Booking Confirmation', category: 'Booking',
    content: 'Congratulations {{customer_name}}! Your booking for {{project_name}} is confirmed.\n\n{{company_name}} will contact you within 24 hours for next steps.\n\n{{sales_person_name}}',
    description: 'Confirm bookings', variables: ['customer_name', 'project_name', 'sales_person_name', 'company_name'],
    messageType: 'text', aiTone: 'hot', isFavorite: true, usageCount: 0,
    createdAt: '2025-01-01', status: 'active', automationEnabled: true, automationTriggers: ['booking_confirmed'],
    roleAccess: ['super_admin', 'admin', 'manager', 'sales_person'], approved: true, clickCount: 0, responseCount: 0,
  },
];

export const messageLogs: MessageLog[] = [];

export const recentTemplateUsage: RecentTemplateUsage[] = [];

export const automationRules: AutomationRule[] = [
  { id: 'ar1', name: 'New Lead Welcome', description: 'Send WhatsApp welcome to new leads', icon: 'MessageCircle', iconColor: '#22C55E', enabled: true, trigger: 'lead_created', actions: [{ type: 'send_whatsapp', config: { template: 'wt1' }, delay: '5min' }], lastRunAt: '', runCount: 0 },
  { id: 'ar2', name: 'Follow-up Reminder', description: 'Remind agents of upcoming follow-ups', icon: 'Bell', iconColor: '#3B82F6', enabled: true, trigger: 'followup_upcoming', triggerCondition: '1 hour before', actions: [{ type: 'notify', config: { channel: 'app' } }], lastRunAt: '', runCount: 0 },
  { id: 'ar3', name: 'Visit Reminder', description: 'Send visit reminders', icon: 'MapPin', iconColor: '#F59E0B', enabled: true, trigger: 'visit_upcoming', triggerCondition: '1 day before', actions: [{ type: 'send_whatsapp', config: { template: 'wt2' } }, { type: 'notify', config: { channel: 'app' } }], lastRunAt: '', runCount: 0 },
];

export const notifications: Notification[] = [];

export const activityData: ActivityData[] = [
  { date: 'Mon', newLeads: 0, converted: 0 },
  { date: 'Tue', newLeads: 0, converted: 0 },
  { date: 'Wed', newLeads: 0, converted: 0 },
  { date: 'Thu', newLeads: 0, converted: 0 },
  { date: 'Fri', newLeads: 0, converted: 0 },
  { date: 'Sat', newLeads: 0, converted: 0 },
  { date: 'Sun', newLeads: 0, converted: 0 },
];

export const sourceBreakdown: SourceBreakdown[] = [];

export const conversionFunnel: FunnelStage[] = [
  { stage: 'New Leads', count: 0, percentage: 100 },
  { stage: 'Contacted', count: 0, percentage: 0 },
  { stage: 'Follow-up', count: 0, percentage: 0 },
  { stage: 'Visits', count: 0, percentage: 0 },
  { stage: 'Negotiation', count: 0, percentage: 0 },
  { stage: 'Converted', count: 0, percentage: 0 },
];

export const teamPerformance: TeamPerformance[] = [
  { userId: 'u3', name: 'Rahul Verma', avatar: '', leadsAssigned: 0, followupsDone: 0, visitsScheduled: 0, conversions: 0, conversionRate: 0 },
  { userId: 'u4', name: 'Sneha Patel', avatar: '', leadsAssigned: 0, followupsDone: 0, visitsScheduled: 0, conversions: 0, conversionRate: 0 },
];

export const loginActivity: LoginActivity[] = [];

export const getLeadStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    new: '#F59E0B', warm: '#FBBD08', hot: '#FF6B35', cold: '#D1D5DB',
    converted: '#22C55E', lost: '#9CA3AF',
  };
  return colors[status] || '#9CA3AF';
};

export const getLeadStatusBg = (status: string) => {
  const bg: Record<string, string> = {
    new: 'bg-warning', warm: 'bg-p13-yellow', hot: 'bg-[#FF6B35]', cold: 'bg-neutral-300',
    converted: 'bg-success', lost: 'bg-neutral-400',
  };
  return bg[status] || 'bg-neutral-400';
};

export const getLeadStatusText = (status: string) => {
  const text: Record<string, string> = {
    new: 'New Lead', warm: 'Warm', hot: 'Hot', cold: 'Cold',
    converted: 'Converted', lost: 'Lost',
  };
  return text[status] || status;
};

export const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getAvatarColor = (name: string) => {
  const colors = ['#FBBD08', '#FF6B35', '#22C55E', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#06B6D4'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};
