import { create } from 'zustand';
import type { MasterType, MasterValue, FieldSetting, MasterAuditLog } from '@/types';

// ===================== MASTER TYPE DEFINITIONS =====================
export const MASTER_TYPES: MasterType[] = [
  { id: 'mt_lead_status', name: 'Lead Status', slug: 'lead_status', module: 'Leads', description: 'Status values for leads pipeline', icon: 'Users', hasParent: false, isActive: true, sortOrder: 1, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_lead_source', name: 'Lead Source', slug: 'lead_source', module: 'Leads', description: 'Source channels for lead origin', icon: 'Globe', hasParent: false, isActive: true, sortOrder: 2, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_looking_for', name: 'Looking For', slug: 'looking_for', module: 'Leads', description: 'Property purpose categories', icon: 'Home', hasParent: false, isActive: true, sortOrder: 3, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_property_sub_category', name: 'Property Sub Category', slug: 'property_sub_category', module: 'Leads', description: 'Sub categories linked to Looking For', icon: 'Building', hasParent: true, parentTypeId: 'mt_looking_for', isActive: true, sortOrder: 4, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_project_type', name: 'Project Type', slug: 'project_type', module: 'Projects', description: 'Types of real estate projects', icon: 'Building2', hasParent: false, isActive: true, sortOrder: 5, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_project_status', name: 'Project Status', slug: 'project_status', module: 'Projects', description: 'Project lifecycle statuses', icon: 'Activity', hasParent: false, isActive: true, sortOrder: 6, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_city', name: 'City Master', slug: 'city', module: 'Location', description: 'Cities where projects operate', icon: 'MapPin', hasParent: false, isActive: true, sortOrder: 7, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_area_location', name: 'Area / Location', slug: 'area_location', module: 'Location', description: 'Areas within cities', icon: 'Navigation', hasParent: true, parentTypeId: 'mt_city', isActive: true, sortOrder: 8, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_unit_type', name: 'Unit Type', slug: 'unit_type', module: 'Projects', description: 'Property unit configurations', icon: 'LayoutGrid', hasParent: false, isActive: true, sortOrder: 9, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_builder', name: 'Builder / Developer', slug: 'builder', module: 'Projects', description: 'Builder and developer companies', icon: 'HardHat', hasParent: false, isActive: true, sortOrder: 10, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_visit_status', name: 'Visit Status', slug: 'visit_status', module: 'Visits', description: 'Site visit status values', icon: 'MapPinCheck', hasParent: false, isActive: true, sortOrder: 11, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_followup_status', name: 'Follow-up Status', slug: 'followup_status', module: 'Follow-ups', description: 'Follow-up tracking statuses', icon: 'Bell', hasParent: false, isActive: true, sortOrder: 12, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_followup_type', name: 'Follow-up Type', slug: 'followup_type', module: 'Follow-ups', description: 'Types of follow-up activities', icon: 'PhoneCall', hasParent: false, isActive: true, sortOrder: 13, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_loan_status', name: 'Loan Inquiry Status', slug: 'loan_inquiry_status', module: 'Loan', description: 'Loan application pipeline statuses', icon: 'Banknote', hasParent: false, isActive: true, sortOrder: 14, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_payment_status', name: 'Payment Status', slug: 'payment_status', module: 'Finance', description: 'Payment tracking statuses', icon: 'Receipt', hasParent: false, isActive: true, sortOrder: 15, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_expense_head', name: 'Expense Head', slug: 'expense_head', module: 'Finance', description: 'Expense categorization', icon: 'Wallet', hasParent: false, isActive: true, sortOrder: 16, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_bank_account', name: 'Bank Account', slug: 'bank_account', module: 'Finance', description: 'Company bank accounts', icon: 'Landmark', hasParent: false, isActive: true, sortOrder: 17, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_template_category', name: 'Template Category', slug: 'template_category', module: 'WhatsApp', description: 'WhatsApp template categories', icon: 'MessageCircle', hasParent: false, isActive: true, sortOrder: 18, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_automation_trigger', name: 'Automation Trigger', slug: 'automation_trigger', module: 'Automation', description: 'Automation rule triggers', icon: 'Zap', hasParent: false, isActive: true, sortOrder: 19, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_user_role', name: 'User Role', slug: 'user_role', module: 'Users', description: 'CRM user roles and permissions', icon: 'Shield', hasParent: false, isActive: true, sortOrder: 20, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_department', name: 'Department / Team', slug: 'department', module: 'Users', description: 'Departments and teams', icon: 'Users2', hasParent: false, isActive: true, sortOrder: 21, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_priority', name: 'Priority', slug: 'priority', module: 'General', description: 'Task and activity priorities', icon: 'Flag', hasParent: false, isActive: true, sortOrder: 22, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_lead_temperature', name: 'Lead Temperature', slug: 'lead_temperature', module: 'Leads', description: 'Lead engagement temperature', icon: 'Thermometer', hasParent: false, isActive: true, sortOrder: 23, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_revisit_reason', name: 'Revisit Reason', slug: 'revisit_reason', module: 'Visits', description: 'Reasons for site revisits', icon: 'RotateCcw', hasParent: false, isActive: true, sortOrder: 24, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'mt_remark_category', name: 'Remark Category', slug: 'remark_category', module: 'General', description: 'Categories for remarks and notes', icon: 'StickyNote', hasParent: false, isActive: true, sortOrder: 25, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
];

// ===================== SEED MASTER VALUES =====================
let _seedValues: MasterValue[] = [];
let vid = 0;
const v = (typeId: string, name: string, opts?: Partial<MasterValue> & { parentName?: string }) => {
  vid++;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const parentId = opts?.parentId;
  _seedValues.push({
    id: `mv_${vid}`,
    masterTypeId: typeId,
    parentId,
    name,
    slug: opts?.slug || slug,
    description: opts?.description,
    color: opts?.color,
    sortOrder: opts?.sortOrder ?? vid,
    isActive: opts?.isActive ?? true,
    isDefault: opts?.isDefault ?? false,
    isSystemDefault: opts?.isSystemDefault ?? false,
    usageCount: opts?.usageCount ?? 0,
    createdBy: 'system',
    updatedBy: 'system',
    createdAt: '2025-01-01',
    updatedAt: '2025-06-01',
    ...opts,
  });
};

// 1. Lead Status
v('mt_lead_status', 'New', { color: '#3B82F6', isDefault: true });
v('mt_lead_status', 'Follow Up', { color: '#F59E0B' });
v('mt_lead_status', 'Pending', { color: '#8B5CF6' });
v('mt_lead_status', 'Scheduled', { color: '#06B6D4' });
v('mt_lead_status', 'Closed', { color: '#10B981' });
v('mt_lead_status', 'Not Picked', { color: '#EF4444' });
v('mt_lead_status', 'Not Interested', { color: '#6B7280' });
v('mt_lead_status', 'Hot', { color: '#DC2626' });
v('mt_lead_status', 'Warm', { color: '#F59E0B' });
v('mt_lead_status', 'Cold', { color: '#60A5FA' });

// 2. Lead Source
v('mt_lead_source', 'Meta Ads', { color: '#1877F2' });
v('mt_lead_source', 'Google Ads', { color: '#DB4437' });
v('mt_lead_source', 'Direct', { color: '#10B981' });
v('mt_lead_source', 'Reference', { color: '#8B5CF6' });
v('mt_lead_source', 'Website', { color: '#06B6D4' });
v('mt_lead_source', 'Public Project Page', { color: '#F59E0B' });
v('mt_lead_source', 'WhatsApp', { color: '#25D366' });
v('mt_lead_source', 'Walk-in', { color: '#EC4899' });
v('mt_lead_source', 'Other', { color: '#6B7280' });

// 3. Looking For
const lookingForIds: Record<string, string> = {};
v('mt_looking_for', 'Residential', { color: '#10B981' });
lookingForIds['Residential'] = `mv_${vid}`;
v('mt_looking_for', 'Commercial', { color: '#3B82F6' });
lookingForIds['Commercial'] = `mv_${vid}`;
v('mt_looking_for', 'Individual', { color: '#F59E0B' });
lookingForIds['Individual'] = `mv_${vid}`;
v('mt_looking_for', 'Plotting', { color: '#8B5CF6' });
lookingForIds['Plotting'] = `mv_${vid}`;
v('mt_looking_for', 'Mixed Use', { color: '#EC4899' });
lookingForIds['Mixed Use'] = `mv_${vid}`;

// 4. Property Sub Category (parent: Looking For)
v('mt_property_sub_category', '1BHK', { parentId: lookingForIds['Residential'], color: '#10B981' });
v('mt_property_sub_category', '2BHK', { parentId: lookingForIds['Residential'], color: '#10B981' });
v('mt_property_sub_category', '3BHK', { parentId: lookingForIds['Residential'], color: '#10B981' });
v('mt_property_sub_category', '4BHK', { parentId: lookingForIds['Residential'], color: '#10B981' });
v('mt_property_sub_category', 'Villa', { parentId: lookingForIds['Residential'], color: '#10B981' });
v('mt_property_sub_category', 'Penthouse', { parentId: lookingForIds['Residential'], color: '#10B981' });
v('mt_property_sub_category', 'Office', { parentId: lookingForIds['Commercial'], color: '#3B82F6' });
v('mt_property_sub_category', 'Showroom', { parentId: lookingForIds['Commercial'], color: '#3B82F6' });
v('mt_property_sub_category', 'SCO', { parentId: lookingForIds['Commercial'], color: '#3B82F6' });
v('mt_property_sub_category', 'Plot', { parentId: lookingForIds['Plotting'], color: '#8B5CF6' });
v('mt_property_sub_category', 'Kothi', { parentId: lookingForIds['Plotting'], color: '#8B5CF6' });
v('mt_property_sub_category', 'Villa', { parentId: lookingForIds['Plotting'], color: '#8B5CF6' });
v('mt_property_sub_category', 'Studio Apartment', { parentId: lookingForIds['Residential'], color: '#10B981' });

// 5. Project Type
v('mt_project_type', 'Residential', { color: '#10B981' });
v('mt_project_type', 'Commercial', { color: '#3B82F6' });
v('mt_project_type', 'Plotting', { color: '#8B5CF6' });
v('mt_project_type', 'Mixed Use', { color: '#EC4899' });

// 6. Project Status
v('mt_project_status', 'Active', { color: '#10B981', isDefault: true });
v('mt_project_status', 'Upcoming', { color: '#3B82F6' });
v('mt_project_status', 'Inactive', { color: '#EF4444' });
v('mt_project_status', 'Sold Out', { color: '#F59E0B' });
v('mt_project_status', 'On Hold', { color: '#8B5CF6' });
v('mt_project_status', 'Archived', { color: '#6B7280' });

// 7. City Master
const cityIds: Record<string, string> = {};
v('mt_city', 'Zirakpur', { color: '#10B981' });
cityIds['Zirakpur'] = `mv_${vid}`;
v('mt_city', 'Chandigarh', { color: '#3B82F6' });
cityIds['Chandigarh'] = `mv_${vid}`;
v('mt_city', 'Mohali', { color: '#F59E0B' });
cityIds['Mohali'] = `mv_${vid}`;
v('mt_city', 'Panchkula', { color: '#8B5CF6' });
cityIds['Panchkula'] = `mv_${vid}`;
v('mt_city', 'New Chandigarh', { color: '#EC4899' });
cityIds['New Chandigarh'] = `mv_${vid}`;
v('mt_city', 'Kharar', { color: '#06B6D4' });
cityIds['Kharar'] = `mv_${vid}`;
v('mt_city', 'Derabassi', { color: '#14B8A6' });
cityIds['Derabassi'] = `mv_${vid}`;
v('mt_city', 'Solan', { color: '#A855F7' });
cityIds['Solan'] = `mv_${vid}`;
v('mt_city', 'Other', { color: '#6B7280' });
cityIds['Other'] = `mv_${vid}`;

// 8. Area / Location (parent: City)
v('mt_area_location', 'Airport Road', { parentId: cityIds['Zirakpur'], color: '#10B981' });
v('mt_area_location', 'PR-7 Road', { parentId: cityIds['Zirakpur'], color: '#10B981' });
v('mt_area_location', 'VIP Road', { parentId: cityIds['Zirakpur'], color: '#10B981' });
v('mt_area_location', 'Patiala Road', { parentId: cityIds['Zirakpur'], color: '#10B981' });
v('mt_area_location', 'Ambala Highway', { parentId: cityIds['Zirakpur'], color: '#10B981' });
v('mt_area_location', 'New Chandigarh', { parentId: cityIds['Chandigarh'], color: '#3B82F6' });
v('mt_area_location', 'Sector Wise Locations', { parentId: cityIds['Chandigarh'], color: '#3B82F6' });
v('mt_area_location', 'Other', { parentId: cityIds['Other'], color: '#6B7280' });

// 9. Unit Type
v('mt_unit_type', '1BHK', { color: '#10B981' });
v('mt_unit_type', '2BHK', { color: '#10B981' });
v('mt_unit_type', '3BHK', { color: '#10B981' });
v('mt_unit_type', '4BHK', { color: '#10B981' });
v('mt_unit_type', 'Plot', { color: '#8B5CF6' });
v('mt_unit_type', 'Villa', { color: '#F59E0B' });
v('mt_unit_type', 'Penthouse', { color: '#EC4899' });
v('mt_unit_type', 'Office', { color: '#3B82F6' });
v('mt_unit_type', 'Showroom', { color: '#06B6D4' });

// 10. Builder / Developer
v('mt_builder', 'DLF', { color: '#10B981', description: 'Contact: +91-99999-00000' });
v('mt_builder', 'Lodha', { color: '#3B82F6', description: 'Contact: +91-99999-00001' });
v('mt_builder', 'Prestige', { color: '#F59E0B', description: 'Contact: +91-99999-00002' });
v('mt_builder', 'Godrej Properties', { color: '#8B5CF6', description: 'Contact: +91-99999-00003' });
v('mt_builder', 'Sobha', { color: '#EC4899', description: 'Contact: +91-99999-00004' });
v('mt_builder', 'Brigade', { color: '#06B6D4', description: 'Contact: +91-99999-00005' });
v('mt_builder', 'L&T Realty', { color: '#14B8A6', description: 'Contact: +91-99999-00006' });
v('mt_builder', 'Tata Housing', { color: '#A855F7', description: 'Contact: +91-99999-00007' });
v('mt_builder', 'Mahindra Lifespaces', { color: '#F97316', description: 'Contact: +91-99999-00008' });
v('mt_builder', 'Local Developer', { color: '#6B7280', description: 'Contact: +91-99999-00009' });

// 11. Visit Status
v('mt_visit_status', 'Scheduled', { color: '#3B82F6', isDefault: true });
v('mt_visit_status', 'Completed', { color: '#10B981' });
v('mt_visit_status', 'No Show', { color: '#EF4444' });
v('mt_visit_status', 'Cancelled', { color: '#6B7280' });
v('mt_visit_status', 'Rescheduled', { color: '#F59E0B' });
v('mt_visit_status', 'Revisit Required', { color: '#8B5CF6' });

// 12. Follow-up Status
v('mt_followup_status', 'Pending', { color: '#F59E0B', isDefault: true });
v('mt_followup_status', 'Completed', { color: '#10B981' });
v('mt_followup_status', 'Overdue', { color: '#EF4444' });
v('mt_followup_status', 'Rescheduled', { color: '#3B82F6' });
v('mt_followup_status', 'Cancelled', { color: '#6B7280' });

// 13. Follow-up Type
v('mt_followup_type', 'Call', { color: '#3B82F6' });
v('mt_followup_type', 'WhatsApp', { color: '#25D366' });
v('mt_followup_type', 'Site Visit', { color: '#10B981' });
v('mt_followup_type', 'Meeting', { color: '#8B5CF6' });
v('mt_followup_type', 'Reminder', { color: '#F59E0B' });
v('mt_followup_type', 'Payment', { color: '#06B6D4' });
v('mt_followup_type', 'Document', { color: '#EC4899' });
v('mt_followup_type', 'General', { color: '#6B7280' });

// 14. Loan Inquiry Status
v('mt_loan_status', 'New', { color: '#3B82F6', isDefault: true });
v('mt_loan_status', 'Contacted', { color: '#F59E0B' });
v('mt_loan_status', 'In Progress', { color: '#8B5CF6' });
v('mt_loan_status', 'Documents Pending', { color: '#EC4899' });
v('mt_loan_status', 'Approved', { color: '#10B981' });
v('mt_loan_status', 'Rejected', { color: '#EF4444' });
v('mt_loan_status', 'Closed', { color: '#6B7280' });

// 15. Payment Status
v('mt_payment_status', 'Pending', { color: '#F59E0B', isDefault: true });
v('mt_payment_status', 'Partial', { color: '#8B5CF6' });
v('mt_payment_status', 'Paid', { color: '#10B981' });
v('mt_payment_status', 'Overdue', { color: '#EF4444' });
v('mt_payment_status', 'Cancelled', { color: '#6B7280' });

// 16. Expense Head
v('mt_expense_head', 'Marketing', { color: '#3B82F6' });
v('mt_expense_head', 'Salary', { color: '#10B981' });
v('mt_expense_head', 'Office Rent', { color: '#F59E0B' });
v('mt_expense_head', 'Travel', { color: '#8B5CF6' });
v('mt_expense_head', 'Utility', { color: '#06B6D4' });
v('mt_expense_head', 'Commission', { color: '#EC4899' });
v('mt_expense_head', 'Software', { color: '#14B8A6' });
v('mt_expense_head', 'Other', { color: '#6B7280' });

// 17. Bank Account
v('mt_bank_account', 'HDFC Bank - Main', { color: '#004C8F', description: 'A/c: 50100234567890 | IFSC: HDFC0000123' });
v('mt_bank_account', 'ICICI Bank - Operations', { color: '#F7941D', description: 'A/c: 123456789012 | IFSC: ICIC0000456' });
v('mt_bank_account', 'SBI - Escrow', { color: '#1E3A8A', description: 'A/c: 987654321098 | IFSC: SBIN0000789' });

// 18. Template Category
v('mt_template_category', 'New Lead Response', { color: '#3B82F6' });
v('mt_template_category', 'Callback Confirmation', { color: '#10B981' });
v('mt_template_category', 'Follow-up Reminder', { color: '#F59E0B' });
v('mt_template_category', 'Project Sharing', { color: '#8B5CF6' });
v('mt_template_category', 'Site Visit Confirmation', { color: '#06B6D4' });
v('mt_template_category', 'Site Visit Reminder', { color: '#EC4899' });
v('mt_template_category', 'Post Visit Follow-up', { color: '#14B8A6' });
v('mt_template_category', 'Re-engagement', { color: '#A855F7' });
v('mt_template_category', 'Loan Inquiry Response', { color: '#F97316' });
v('mt_template_category', 'General Message', { color: '#6B7280' });

// 19. Automation Trigger
v('mt_automation_trigger', 'New Lead Created', { color: '#3B82F6' });
v('mt_automation_trigger', 'Follow-up Due', { color: '#F59E0B' });
v('mt_automation_trigger', 'Visit Scheduled', { color: '#10B981' });
v('mt_automation_trigger', 'Visit Reminder', { color: '#06B6D4' });
v('mt_automation_trigger', 'Loan Inquiry Received', { color: '#8B5CF6' });
v('mt_automation_trigger', 'Hot Lead Alert', { color: '#EF4444' });
v('mt_automation_trigger', 'No Response', { color: '#6B7280' });
v('mt_automation_trigger', 'Project Inquiry', { color: '#EC4899' });
v('mt_automation_trigger', 'WhatsApp Sent', { color: '#25D366' });

// 20. User Role
v('mt_user_role', 'Super Admin', { color: '#EF4444', isSystemDefault: true });
v('mt_user_role', 'Admin', { color: '#F97316', isSystemDefault: true });
v('mt_user_role', 'Manager', { color: '#8B5CF6', isSystemDefault: true });
v('mt_user_role', 'Telecaller', { color: '#3B82F6', isSystemDefault: true });
v('mt_user_role', 'Sales Person', { color: '#10B981', isSystemDefault: true });
v('mt_user_role', 'Project Team Member', { color: '#EC4899', isSystemDefault: true });

// 21. Department / Team
v('mt_department', 'Sales', { color: '#10B981' });
v('mt_department', 'Telecalling', { color: '#3B82F6' });
v('mt_department', 'Project Team', { color: '#F59E0B' });
v('mt_department', 'Loan Team', { color: '#8B5CF6' });
v('mt_department', 'Admin', { color: '#EF4444' });
v('mt_department', 'Marketing', { color: '#EC4899' });

// 22. Priority
v('mt_priority', 'Urgent', { color: '#EF4444' });
v('mt_priority', 'High', { color: '#F97316' });
v('mt_priority', 'Medium', { color: '#F59E0B', isDefault: true });
v('mt_priority', 'Low', { color: '#3B82F6' });

// 23. Lead Temperature
v('mt_lead_temperature', 'Hot', { color: '#EF4444' });
v('mt_lead_temperature', 'Warm', { color: '#F59E0B' });
v('mt_lead_temperature', 'Cold', { color: '#3B82F6' });

// 24. Revisit Reason
v('mt_revisit_reason', 'Client Requested', { color: '#3B82F6' });
v('mt_revisit_reason', 'Family Visit', { color: '#10B981' });
v('mt_revisit_reason', 'Price Discussion', { color: '#F59E0B' });
v('mt_revisit_reason', 'Site Clarification', { color: '#8B5CF6' });
v('mt_revisit_reason', 'Final Decision', { color: '#EF4444' });
v('mt_revisit_reason', 'Other', { color: '#6B7280' });

// 25. Remark Category
v('mt_remark_category', 'General', { color: '#6B7280', isDefault: true });
v('mt_remark_category', 'Requirement', { color: '#3B82F6' });
v('mt_remark_category', 'Budget', { color: '#10B981' });
v('mt_remark_category', 'Follow-up', { color: '#F59E0B' });
v('mt_remark_category', 'Visit', { color: '#8B5CF6' });
v('mt_remark_category', 'Objection', { color: '#EF4444' });
v('mt_remark_category', 'Payment', { color: '#06B6D4' });
v('mt_remark_category', 'Document', { color: '#EC4899' });

export const SEED_MASTER_VALUES = _seedValues;

// ===================== FIELD SETTINGS =====================
export const SEED_FIELD_SETTINGS: FieldSetting[] = [
  // Add Lead
  { id: 'fs_1', moduleName: 'add_lead', fieldKey: 'name', fieldLabel: 'Customer Name', fieldType: 'text', isRequired: true, isVisible: true, isEditable: true, sortOrder: 1, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_2', moduleName: 'add_lead', fieldKey: 'phone', fieldLabel: 'Mobile Number', fieldType: 'phone', isRequired: true, isVisible: true, isEditable: true, sortOrder: 2, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_3', moduleName: 'add_lead', fieldKey: 'email', fieldLabel: 'Email', fieldType: 'email', isRequired: false, isVisible: true, isEditable: true, sortOrder: 3, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_4', moduleName: 'add_lead', fieldKey: 'city', fieldLabel: 'City', fieldType: 'select', isRequired: true, isVisible: true, isEditable: true, sortOrder: 4, masterTypeId: 'mt_city', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_5', moduleName: 'add_lead', fieldKey: 'lookingFor', fieldLabel: 'Looking For', fieldType: 'select', isRequired: true, isVisible: true, isEditable: true, sortOrder: 5, masterTypeId: 'mt_looking_for', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_6', moduleName: 'add_lead', fieldKey: 'source', fieldLabel: 'Source', fieldType: 'select', isRequired: true, isVisible: true, isEditable: true, sortOrder: 6, masterTypeId: 'mt_lead_source', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_7', moduleName: 'add_lead', fieldKey: 'status', fieldLabel: 'Status', fieldType: 'select', isRequired: true, isVisible: true, isEditable: true, sortOrder: 7, masterTypeId: 'mt_lead_status', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_8', moduleName: 'add_lead', fieldKey: 'assignedTo', fieldLabel: 'Assigned User', fieldType: 'select', isRequired: false, isVisible: true, isEditable: true, sortOrder: 8, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_9', moduleName: 'add_lead', fieldKey: 'budget', fieldLabel: 'Budget', fieldType: 'number', isRequired: false, isVisible: true, isEditable: true, sortOrder: 9, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_10', moduleName: 'add_lead', fieldKey: 'notes', fieldLabel: 'Notes', fieldType: 'textarea', isRequired: false, isVisible: true, isEditable: true, sortOrder: 10, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  // Add Project
  { id: 'fs_11', moduleName: 'add_project', fieldKey: 'name', fieldLabel: 'Project Name', fieldType: 'text', isRequired: true, isVisible: true, isEditable: true, sortOrder: 1, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_12', moduleName: 'add_project', fieldKey: 'projectType', fieldLabel: 'Project Type', fieldType: 'select', isRequired: true, isVisible: true, isEditable: true, sortOrder: 2, masterTypeId: 'mt_project_type', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_13', moduleName: 'add_project', fieldKey: 'propertyCategory', fieldLabel: 'Property Category', fieldType: 'multiselect', isRequired: true, isVisible: true, isEditable: true, sortOrder: 3, masterTypeId: 'mt_property_sub_category', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_14', moduleName: 'add_project', fieldKey: 'city', fieldLabel: 'City', fieldType: 'select', isRequired: true, isVisible: true, isEditable: true, sortOrder: 4, masterTypeId: 'mt_city', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_15', moduleName: 'add_project', fieldKey: 'location', fieldLabel: 'Location/Area', fieldType: 'select', isRequired: true, isVisible: true, isEditable: true, sortOrder: 5, masterTypeId: 'mt_area_location', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_16', moduleName: 'add_project', fieldKey: 'status', fieldLabel: 'Status', fieldType: 'select', isRequired: true, isVisible: true, isEditable: true, sortOrder: 6, masterTypeId: 'mt_project_status', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_17', moduleName: 'add_project', fieldKey: 'builder', fieldLabel: 'Builder', fieldType: 'select', isRequired: false, isVisible: true, isEditable: true, sortOrder: 7, masterTypeId: 'mt_builder', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_18', moduleName: 'add_project', fieldKey: 'minPrice', fieldLabel: 'Min Price', fieldType: 'number', isRequired: true, isVisible: true, isEditable: true, sortOrder: 8, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_19', moduleName: 'add_project', fieldKey: 'maxPrice', fieldLabel: 'Max Price', fieldType: 'number', isRequired: true, isVisible: true, isEditable: true, sortOrder: 9, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_20', moduleName: 'add_project', fieldKey: 'coverImage', fieldLabel: 'Cover Image', fieldType: 'file', isRequired: false, isVisible: true, isEditable: true, sortOrder: 10, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  // Schedule Visit
  { id: 'fs_21', moduleName: 'schedule_visit', fieldKey: 'lead', fieldLabel: 'Lead', fieldType: 'select', isRequired: true, isVisible: true, isEditable: true, sortOrder: 1, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_22', moduleName: 'schedule_visit', fieldKey: 'project', fieldLabel: 'Project', fieldType: 'select', isRequired: true, isVisible: true, isEditable: true, sortOrder: 2, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_23', moduleName: 'schedule_visit', fieldKey: 'visitDate', fieldLabel: 'Visit Date', fieldType: 'date', isRequired: true, isVisible: true, isEditable: true, sortOrder: 3, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_24', moduleName: 'schedule_visit', fieldKey: 'visitStatus', fieldLabel: 'Visit Status', fieldType: 'select', isRequired: true, isVisible: true, isEditable: true, sortOrder: 4, masterTypeId: 'mt_visit_status', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  // Add Follow-up
  { id: 'fs_25', moduleName: 'add_followup', fieldKey: 'lead', fieldLabel: 'Lead', fieldType: 'select', isRequired: true, isVisible: true, isEditable: true, sortOrder: 1, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_26', moduleName: 'add_followup', fieldKey: 'followupType', fieldLabel: 'Follow-up Type', fieldType: 'select', isRequired: true, isVisible: true, isEditable: true, sortOrder: 2, masterTypeId: 'mt_followup_type', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_27', moduleName: 'add_followup', fieldKey: 'scheduledDate', fieldLabel: 'Scheduled Date', fieldType: 'date', isRequired: true, isVisible: true, isEditable: true, sortOrder: 3, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_28', moduleName: 'add_followup', fieldKey: 'status', fieldLabel: 'Status', fieldType: 'select', isRequired: true, isVisible: true, isEditable: true, sortOrder: 4, masterTypeId: 'mt_followup_status', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  // Loan Inquiry
  { id: 'fs_29', moduleName: 'loan_inquiry', fieldKey: 'name', fieldLabel: 'Applicant Name', fieldType: 'text', isRequired: true, isVisible: true, isEditable: true, sortOrder: 1, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_30', moduleName: 'loan_inquiry', fieldKey: 'phone', fieldLabel: 'Mobile Number', fieldType: 'phone', isRequired: true, isVisible: true, isEditable: true, sortOrder: 2, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_31', moduleName: 'loan_inquiry', fieldKey: 'loanAmount', fieldLabel: 'Loan Amount', fieldType: 'number', isRequired: true, isVisible: true, isEditable: true, sortOrder: 3, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_32', moduleName: 'loan_inquiry', fieldKey: 'status', fieldLabel: 'Status', fieldType: 'select', isRequired: true, isVisible: true, isEditable: true, sortOrder: 4, masterTypeId: 'mt_loan_status', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  // Add User
  { id: 'fs_33', moduleName: 'add_user', fieldKey: 'name', fieldLabel: 'Full Name', fieldType: 'text', isRequired: true, isVisible: true, isEditable: true, sortOrder: 1, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_34', moduleName: 'add_user', fieldKey: 'email', fieldLabel: 'Email', fieldType: 'email', isRequired: true, isVisible: true, isEditable: true, sortOrder: 2, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_35', moduleName: 'add_user', fieldKey: 'phone', fieldLabel: 'Mobile', fieldType: 'phone', isRequired: true, isVisible: true, isEditable: true, sortOrder: 3, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_36', moduleName: 'add_user', fieldKey: 'role', fieldLabel: 'Role', fieldType: 'select', isRequired: true, isVisible: true, isEditable: true, sortOrder: 4, masterTypeId: 'mt_user_role', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs_37', moduleName: 'add_user', fieldKey: 'department', fieldLabel: 'Department', fieldType: 'select', isRequired: false, isVisible: true, isEditable: true, sortOrder: 5, masterTypeId: 'mt_department', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
];

// ===================== STORE INTERFACE =====================
interface MasterState {
  masterTypes: MasterType[];
  masterValues: MasterValue[];
  fieldSettings: FieldSetting[];
  auditLogs: MasterAuditLog[];

  // Master Type getters
  getMasterTypes: () => MasterType[];
  getMasterTypeById: (id: string) => MasterType | undefined;
  getMasterTypeBySlug: (slug: string) => MasterType | undefined;

  // Master Value getters
  getValuesByType: (typeId: string, activeOnly?: boolean) => MasterValue[];
  getValuesByParent: (parentId: string, activeOnly?: boolean) => MasterValue[];
  getActiveOptions: (typeSlug: string) => { value: string; label: string; color?: string; parentId?: string }[];
  getValueById: (id: string) => MasterValue | undefined;

  // Master Value CRUD
  addValue: (typeId: string, name: string, data?: Partial<MasterValue>, changedBy?: string, changedByName?: string) => MasterValue;
  updateValue: (id: string, data: Partial<MasterValue>, changedBy?: string, changedByName?: string) => void;
  deactivateValue: (id: string, changedBy?: string, changedByName?: string) => void;
  activateValue: (id: string, changedBy?: string, changedByName?: string) => void;
  deleteValue: (id: string) => { success: boolean; message: string };
  reorderValues: (typeId: string, orderedIds: string[]) => void;

  // Merge
  mergeValues: (sourceId: string, targetId: string, changedBy?: string, changedByName?: string) => { success: boolean; message: string };

  // Field Settings
  getFieldSettings: (moduleName: string) => FieldSetting[];
  updateFieldSetting: (id: string, data: Partial<FieldSetting>) => void;

  // Audit
  getAuditLogs: () => MasterAuditLog[];
}

export const useMasterStore = create<MasterState>((set, get) => ({
  masterTypes: MASTER_TYPES,
  masterValues: [...SEED_MASTER_VALUES],
  fieldSettings: [...SEED_FIELD_SETTINGS],
  auditLogs: [],

  // ===== Getters =====
  getMasterTypes: () => get().masterTypes,
  getMasterTypeById: (id) => get().masterTypes.find(mt => mt.id === id),
  getMasterTypeBySlug: (slug) => get().masterTypes.find(mt => mt.slug === slug),

  getValuesByType: (typeId, activeOnly = true) => {
    return get().masterValues.filter(v => v.masterTypeId === typeId && (!activeOnly || v.isActive));
  },
  getValuesByParent: (parentId, activeOnly = true) => {
    return get().masterValues.filter(v => v.parentId === parentId && (!activeOnly || v.isActive));
  },
  getActiveOptions: (typeSlug) => {
    const type = get().masterTypes.find(mt => mt.slug === typeSlug);
    if (!type) return [];
    return get().masterValues
      .filter(v => v.masterTypeId === type.id && v.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(v => ({ value: v.slug, label: v.name, color: v.color, parentId: v.parentId }));
  },
  getValueById: (id) => get().masterValues.find(v => v.id === id),

  // ===== CRUD =====
  addValue: (typeId, name, data, changedBy = 'system', changedByName = 'System') => {
    const type = get().getMasterTypeById(typeId);
    const existing = get().masterValues.filter(v => v.masterTypeId === typeId);
    const newValue: MasterValue = {
      id: `mv_${Date.now()}`,
      masterTypeId: typeId,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
      description: data?.description,
      color: data?.color,
      icon: data?.icon,
      sortOrder: data?.sortOrder ?? existing.length + 1,
      isActive: true,
      isDefault: false,
      isSystemDefault: false,
      usageCount: 0,
      createdBy: changedBy,
      updatedBy: changedBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    set(s => ({ masterValues: [...s.masterValues, newValue] }));

    // Audit log
    const log: MasterAuditLog = {
      id: `mal_${Date.now()}`,
      action: 'value_added',
      masterTypeId: typeId,
      masterTypeName: type?.name || typeId,
      valueId: newValue.id,
      valueName: newValue.name,
      details: `Added "${name}" to ${type?.name || typeId}`,
      changedBy,
      changedByName,
      createdAt: new Date().toISOString(),
    };
    set(s => ({ auditLogs: [log, ...s.auditLogs] }));

    return newValue;
  },

  updateValue: (id, data, changedBy = 'system', changedByName = 'System') => {
    const oldVal = get().getValueById(id);
    if (!oldVal) return;
    const type = get().getMasterTypeById(oldVal.masterTypeId);

    set(s => ({
      masterValues: s.masterValues.map(v =>
        v.id === id ? { ...v, ...data, updatedAt: new Date().toISOString(), updatedBy: changedBy } : v
      ),
    }));

    const log: MasterAuditLog = {
      id: `mal_${Date.now()}`,
      action: 'value_edited',
      masterTypeId: oldVal.masterTypeId,
      masterTypeName: type?.name || oldVal.masterTypeId,
      valueId: id,
      valueName: oldVal.name,
      oldValue: oldVal.name,
      newValue: data.name || oldVal.name,
      details: `Edited "${oldVal.name}"${data.name && data.name !== oldVal.name ? ` -> "${data.name}"` : ''}`,
      changedBy,
      changedByName,
      createdAt: new Date().toISOString(),
    };
    set(s => ({ auditLogs: [log, ...s.auditLogs] }));
  },

  deactivateValue: (id, changedBy = 'system', changedByName = 'System') => {
    const val = get().getValueById(id);
    if (!val) return;
    const type = get().getMasterTypeById(val.masterTypeId);

    set(s => ({
      masterValues: s.masterValues.map(v => v.id === id ? { ...v, isActive: false, updatedAt: new Date().toISOString() } : v),
    }));

    const log: MasterAuditLog = {
      id: `mal_${Date.now()}`,
      action: 'value_deactivated',
      masterTypeId: val.masterTypeId,
      masterTypeName: type?.name || val.masterTypeId,
      valueId: id,
      valueName: val.name,
      details: `Deactivated "${val.name}"`,
      changedBy,
      changedByName,
      createdAt: new Date().toISOString(),
    };
    set(s => ({ auditLogs: [log, ...s.auditLogs] }));
  },

  activateValue: (id, changedBy = 'system', changedByName = 'System') => {
    const val = get().getValueById(id);
    if (!val) return;
    const type = get().getMasterTypeById(val.masterTypeId);

    set(s => ({
      masterValues: s.masterValues.map(v => v.id === id ? { ...v, isActive: true, updatedAt: new Date().toISOString() } : v),
    }));

    const log: MasterAuditLog = {
      id: `mal_${Date.now()}`,
      action: 'value_activated',
      masterTypeId: val.masterTypeId,
      masterTypeName: type?.name || val.masterTypeId,
      valueId: id,
      valueName: val.name,
      details: `Activated "${val.name}"`,
      changedBy,
      changedByName,
      createdAt: new Date().toISOString(),
    };
    set(s => ({ auditLogs: [log, ...s.auditLogs] }));
  },

  deleteValue: (id) => {
    const val = get().getValueById(id);
    if (!val) return { success: false, message: 'Value not found' };
    if (val.usageCount > 0) {
      return { success: false, message: `Cannot delete "${val.name}" — it is used in ${val.usageCount} record(s). Deactivate or merge it instead.` };
    }
    if (val.isSystemDefault) {
      return { success: false, message: `Cannot delete system default "${val.name}".` };
    }

    set(s => ({
      masterValues: s.masterValues.filter(v => v.id !== id),
      auditLogs: [{
        id: `mal_${Date.now()}`,
        action: 'value_deleted',
        masterTypeId: val.masterTypeId,
        masterTypeName: get().getMasterTypeById(val.masterTypeId)?.name || val.masterTypeId,
        valueId: id,
        valueName: val.name,
        details: `Deleted "${val.name}"`,
        changedBy: 'system',
        changedByName: 'System',
        createdAt: new Date().toISOString(),
      }, ...s.auditLogs],
    }));

    return { success: true, message: `"${val.name}" deleted successfully` };
  },

  reorderValues: (typeId, orderedIds) => {
    set(s => ({
      masterValues: s.masterValues.map(v => {
        const idx = orderedIds.indexOf(v.id);
        if (idx >= 0 && v.masterTypeId === typeId) {
          return { ...v, sortOrder: idx + 1 };
        }
        return v;
      }),
    }));

    const type = get().getMasterTypeById(typeId);
    const log: MasterAuditLog = {
      id: `mal_${Date.now()}`,
      action: 'values_reordered',
      masterTypeId: typeId,
      masterTypeName: type?.name || typeId,
      details: `Reordered values in ${type?.name || typeId}`,
      changedBy: 'system',
      changedByName: 'System',
      createdAt: new Date().toISOString(),
    };
    set(s => ({ auditLogs: [log, ...s.auditLogs] }));
  },

  mergeValues: (sourceId, targetId, changedBy = 'system', changedByName = 'System') => {
    const source = get().getValueById(sourceId);
    const target = get().getValueById(targetId);
    if (!source || !target) return { success: false, message: 'Source or target not found' };
    if (source.masterTypeId !== target.masterTypeId) return { success: false, message: 'Cannot merge across different master types' };

    // Transfer usage count
    set(s => ({
      masterValues: s.masterValues.map(v => {
        if (v.id === targetId) return { ...v, usageCount: v.usageCount + source.usageCount, updatedAt: new Date().toISOString() };
        return v;
      }).filter(v => v.id !== sourceId),
    }));

    const type = get().getMasterTypeById(source.masterTypeId);
    const log: MasterAuditLog = {
      id: `mal_${Date.now()}`,
      action: 'value_merged',
      masterTypeId: source.masterTypeId,
      masterTypeName: type?.name || source.masterTypeId,
      valueId: sourceId,
      valueName: source.name,
      oldValue: source.name,
      newValue: target.name,
      details: `Merged "${source.name}" into "${target.name}"`,
      changedBy,
      changedByName,
      createdAt: new Date().toISOString(),
    };
    set(s => ({ auditLogs: [log, ...s.auditLogs] }));

    return { success: true, message: `"${source.name}" merged into "${target.name}"` };
  },

  // ===== Field Settings =====
  getFieldSettings: (moduleName) => {
    return get().fieldSettings
      .filter(fs => fs.moduleName === moduleName)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
  updateFieldSetting: (id, data) => {
    set(s => ({
      fieldSettings: s.fieldSettings.map(fs =>
        fs.id === id ? { ...fs, ...data, updatedAt: new Date().toISOString() } : fs
      ),
    }));
  },

  // ===== Audit =====
  getAuditLogs: () => [...get().auditLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
}));
