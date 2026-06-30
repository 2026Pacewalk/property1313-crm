import { useState } from 'react';
import { useNavigate } from 'react-router';

import {
  Search, SlidersHorizontal, Plus, Phone, MessageCircle, Bell,
  LayoutList, LayoutGrid, X, User, Home, Users,
  Calendar, Clock, ChevronDown, MapPin
} from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';
import { useUIStore } from '@/stores/uiStore';
import { useMasterStore } from '@/stores/masterStore';
import { useWhatsAppConnectionStore } from '@/stores/whatsappConnectionStore';
import { validateMobile, handleMobileInputChange, handleMobileInputBlur, mobileInputProps, mobileInputClasses, normalizeMobile } from '@/lib/phone-validation';
import { getInitials, getAvatarColor } from '@/data/mockData';
import { useRBACStore } from '@/stores/rbacStore';
import StatusBadge from '@/components/shared/StatusBadge';
import BottomSheet from '@/components/shared/BottomSheet';
import FloatingActionButton from '@/components/shared/FloatingActionButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Lead } from '@/types';
import { cn } from '@/lib/utils';

const statuses = ['new', 'warm', 'hot', 'cold', 'converted', 'lost'];
const sources = ['Website', 'Facebook', 'Instagram', 'Referral', 'Walk-in', 'Call', 'WhatsApp'];

/* ============================================================
   SECTION HEADER
   ============================================================ */
function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-border/50 mb-3">
      <Icon size={14} className="text-p13-yellow" />
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}

/* ============================================================
   LABEL
   ============================================================ */
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

/* ============================================================
   TEXT INPUT
   ============================================================ */
function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground/50 focus:border-p13-yellow focus:ring-1 focus:ring-p13-yellow/20 outline-none transition-all"
    />
  );
}

/* ============================================================
   COMBOBOX INPUT (dropdown + custom text + add new)
   ============================================================ */
function ComboboxInput({ value, onChange, options, placeholder, allowAddNew, onAddNew }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
  allowAddNew?: boolean; onAddNew?: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const filtered = options.filter(o => o.toLowerCase().includes(value.toLowerCase()));
  const isNew = value.trim() && !options.some(o => o.toLowerCase() === value.toLowerCase());

  return (
    <div className="relative">
      <div className="relative">
        <input
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full h-10 px-3 pr-16 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground/50 focus:border-p13-yellow focus:ring-1 focus:ring-p13-yellow/20 outline-none transition-all"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {allowAddNew && isNew && (
            <button
              onClick={() => { onAddNew?.(value.trim()); setOpen(false); }}
              className="h-7 px-2 bg-p13-yellow text-p13-black rounded-md text-[10px] font-bold hover:bg-p13-yellow/80 transition-all"
            >
              + Add
            </button>
          )}
          <button onClick={() => setOpen(!open)} className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-muted-foreground">
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {filtered.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={cn('w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors', value === opt && 'bg-p13-yellow/10 font-medium text-p13-black')}
            >
              {opt}
            </button>
          ))}
          {filtered.length === 0 && !isNew && (
            <p className="px-3 py-3 text-xs text-muted-foreground text-center">Type to search or add new</p>
          )}
        </div>
      )}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}

/* ============================================================
   TOGGLE BUTTON GROUP (2 options)
   ============================================================ */
function ToggleGroup({ options, value, onChange }: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-border">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn('flex-1 h-10 text-xs font-semibold transition-all', value === opt.value ? 'bg-p13-yellow text-p13-black' : 'bg-card text-muted-foreground hover:bg-muted/50')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   LEAD SCORE TOGGLE (HOT / WARM / COLD)
   ============================================================ */
function LeadScoreToggle({ value, onChange }: { value: string; onChange: (v: 'hot' | 'warm' | 'cold') => void }) {
  return (
    <div className="flex gap-2">
      {[
        { key: 'hot' as const, label: 'HOT', color: 'bg-red-500 text-white' },
        { key: 'warm' as const, label: 'WARM', color: 'bg-p13-yellow text-p13-black' },
        { key: 'cold' as const, label: 'COLD', color: 'bg-muted text-muted-foreground' },
      ].map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={cn('flex-1 h-10 rounded-lg text-xs font-bold transition-all', value === opt.key ? opt.color : 'bg-card border border-border text-muted-foreground')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   SELECT DROPDOWN
   ============================================================ */
function SelectInput({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-10 px-3 pr-8 rounded-lg border border-border bg-card text-sm appearance-none focus:border-p13-yellow outline-none transition-all"
      >
        <option value="">{placeholder || 'Select...'}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function Leads() {
  const { leads } = useDataStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilter, setShowFilter] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ statuses: [] as string[], sources: [] as string[] });

  const toggleStatusFilter = (s: string) => {
    setActiveFilters(p => ({ ...p, statuses: p.statuses.includes(s) ? p.statuses.filter(x => x !== s) : [...p.statuses, s] }));
  };
  const toggleSourceFilter = (s: string) => {
    setActiveFilters(p => ({ ...p, sources: p.sources.includes(s) ? p.sources.filter(x => x !== s) : [...p.sources, s] }));
  };
  const clearFilters = () => setActiveFilters({ statuses: [], sources: [] });

  let digitsSearch = search.replace(/\D/g, '');
  if (digitsSearch.length > 10 && digitsSearch.startsWith('91')) digitsSearch = digitsSearch.slice(2);

  const filtered = leads.filter(l => {
    const matchesSearch = !search
      || l.name.toLowerCase().includes(search.toLowerCase())
      || (digitsSearch.length > 0 && l.phone.replace(/\D/g, '').includes(digitsSearch));
    const matchesStatus = activeFilters.statuses.length === 0 || activeFilters.statuses.includes(l.status);
    const matchesSource = activeFilters.sources.length === 0 || activeFilters.sources.includes(l.source);
    return matchesSearch && matchesStatus && matchesSource;
  });

  const hasFilters = activeFilters.statuses.length > 0 || activeFilters.sources.length > 0;

  return (
    <div className="page-container pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-h1-mobile md:text-h1-desktop font-semibold">Leads</h1>
          <span className="w-6 h-6 rounded-full bg-p13-yellow text-p13-black text-[10px] font-bold flex items-center justify-center">{filtered.length}</span>
        </div>
        <button onClick={() => setShowAddLead(true)}
          className="h-9 px-3 bg-p13-yellow text-p13-black rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-p13-yellow/90 transition-all">
          <Plus size={14} /> Add Lead
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..." className="pl-9 h-10 bg-card border-border text-sm" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X size={14} /></button>}
        </div>
        <button onClick={() => setShowFilter(true)}
          className="relative w-10 h-10 bg-card border border-border rounded-lg flex items-center justify-center hover:bg-muted/50">
          <SlidersHorizontal size={16} className="text-muted-foreground" />
          {hasFilters && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-p13-yellow rounded-full border-2 border-white" />}
        </button>
        <div className="hidden md:flex bg-muted rounded-lg p-0.5">
          <button onClick={() => setViewMode('list')} className={cn('p-1.5 rounded', viewMode === 'list' ? 'bg-card shadow-sm' : '')}><LayoutList size={14} /></button>
          <button onClick={() => setViewMode('grid')} className={cn('p-1.5 rounded', viewMode === 'grid' ? 'bg-card shadow-sm' : '')}><LayoutGrid size={14} /></button>
        </div>
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {activeFilters.statuses.map(s => (
            <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-p13-yellow/10 border border-p13-yellow/30 text-xs font-medium text-foreground">
              {s} <button onClick={() => toggleStatusFilter(s)}><X size={10} /></button>
            </span>
          ))}
          {activeFilters.sources.map(s => (
            <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-p13-yellow/10 border border-p13-yellow/30 text-xs font-medium text-foreground">
              {s} <button onClick={() => toggleSourceFilter(s)}><X size={10} /></button>
            </span>
          ))}
          <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-muted-foreground px-1">Clear all</button>
        </div>
      )}

      {/* Lead List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-3' : 'space-y-2'}>
        {filtered.map((lead, i) => (
          viewMode === 'grid'
            ? <LeadGridCard key={lead.id} lead={lead} index={i} onClick={() => navigate(`/leads/${lead.id}`)} />
            : <LeadListCard key={lead.id} lead={lead} index={i} onClick={() => navigate(`/leads/${lead.id}`)} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 col-span-full">
            <p className="text-sm text-muted-foreground">No leads found</p>
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet */}
      <BottomSheet isOpen={showFilter} onClose={() => setShowFilter(false)} title="Filters">
        <div className="space-y-5 py-2">
          <div>
            <p className="text-sm font-semibold mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {statuses.map(s => (
                <button key={s} onClick={() => toggleStatusFilter(s)}
                  className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize',
                    activeFilters.statuses.includes(s) ? 'bg-p13-yellow text-p13-black' : 'bg-muted text-muted-foreground')}
                >{s}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">Source</p>
            <div className="flex flex-wrap gap-2">
              {sources.map(s => (
                <button key={s} onClick={() => toggleSourceFilter(s)}
                  className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                    activeFilters.sources.includes(s) ? 'bg-p13-yellow text-p13-black' : 'bg-muted text-muted-foreground')}
                >{s}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={clearFilters}>Reset</Button>
            <Button className="flex-1 bg-p13-yellow text-p13-black hover:bg-p13-yellow/90" onClick={() => setShowFilter(false)}>Apply</Button>
          </div>
        </div>
      </BottomSheet>

      {/* Add Lead Bottom Sheet */}
      <BottomSheet isOpen={showAddLead} onClose={() => setShowAddLead(false)} title="Create New Lead" maxHeight="90vh">
        <AddLeadForm onClose={() => setShowAddLead(false)} />
      </BottomSheet>

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={[
          { id: 'add-lead', label: 'Add Lead', icon: <User size={16} />, onClick: () => setShowAddLead(true), color: '#FBBD08' },
          { id: 'add-followup', label: 'Add Follow-up', icon: <Calendar size={16} />, onClick: () => navigate('/follow-ups'), color: '#3B82F6' },
          { id: 'schedule-visit', label: 'Schedule Visit', icon: <MapPin size={16} />, onClick: () => navigate('/visits'), color: '#22C55E' },
        ]}
      />
    </div>
  );
}

/* ============================================================
   ADD LEAD FORM
   ============================================================ */
function AddLeadForm({ onClose }: { onClose: () => void }) {
  const { addLead } = useDataStore();
  const { addToast } = useUIStore();
  const masterStore = useMasterStore();
  const { autoIntro, renderIntro } = useWhatsAppConnectionStore();

  // Get master values for dropdowns
  const cityOptions = masterStore.masterValues.filter(v => v.masterTypeId === 'mt_city' && v.isActive).map(v => v.name);
  const lookingForOptions = masterStore.masterValues.filter(v => v.masterTypeId === 'mt_looking_for' && v.isActive).map(v => v.name);
  const inquirySourceOptions = masterStore.masterValues.filter(v => v.masterTypeId === 'mt_lead_source' && v.isActive).map(v => v.name);

  // Live users from the RBAC store (reflects deletes/disables), filtered by role for assignments
  const rbacUsers = useRBACStore(s => s.users);
  const activeUsers = rbacUsers.filter(u => u.isActive && u.accountStatus !== 'disabled' && u.accountStatus !== 'archived');
  const telecallerOptions = activeUsers.filter(u => u.role === 'telecaller').map(u => u.name);
  const salesOptions = activeUsers.filter(u => u.role === 'sales_person').map(u => u.name);
  const managerOptions = activeUsers.filter(u => u.role === 'manager' || u.role === 'admin' || u.role === 'super_admin').map(u => u.name);
  const teamOptions = activeUsers.filter(u => u.role !== 'super_admin').map(u => u.name);

  // Customer Details
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [alternateMobile, setAlternateMobile] = useState('');

  // Requirements
  const [targetCity, setTargetCity] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [typeDetails, setTypeDetails] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [intendedPurpose, setIntendedPurpose] = useState<'self_use' | 'investment'>('self_use');
  const [customerBudget, setCustomerBudget] = useState('');

  // Assignment & Flow
  const [inquirySource, setInquirySource] = useState('');
  const [assignTelecaller, setAssignTelecaller] = useState('');
  const [assignSalesExpert, setAssignSalesExpert] = useState('');
  // Default assignments (only if those users still exist/active)
  const [assignManager, setAssignManager] = useState(() => managerOptions.find(n => n === 'Adamya Khosla') || '');
  const [projectTeamMembers, setProjectTeamMembers] = useState<string[]>(() => teamOptions.includes('Suhail Pratap Malik') ? ['Suhail Pratap Malik'] : []);

  // First Step
  const [nextCallDate, setNextCallDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextCallTime, setNextCallTime] = useState('');
  const [leadScore, setLeadScore] = useState<'hot' | 'warm' | 'cold'>('warm');
  const [initialRemark, setInitialRemark] = useState('');

  // Type Details cascades from the selected Looking For (sub-categories whose parent matches it)
  const selectedLookingForVal = masterStore.masterValues.find(v => v.masterTypeId === 'mt_looking_for' && v.name === lookingFor);
  const typeDetailsOptions = masterStore.masterValues
    .filter(v => v.masterTypeId === 'mt_property_sub_category' && v.isActive && (!selectedLookingForVal || v.parentId === selectedLookingForVal.id))
    .map(v => v.name);

  // Handle add new master value
  const handleAddNewCity = (val: string) => {
    masterStore.addValue('mt_city', val, { color: '#3B82F6' });
    setTargetCity(val);
    addToast({ type: 'success', message: `Added "${val}" to cities` });
  };
  const handleAddNewLookingFor = (val: string) => {
    masterStore.addValue('mt_looking_for', val, { color: '#10B981' });
    setLookingFor(val);
    addToast({ type: 'success', message: `Added "${val}" to looking for` });
  };
  const handleAddNewTypeDetail = (val: string) => {
    // Link the new sub-category to the currently selected Looking For so it maps correctly
    const parent = masterStore.masterValues.find(v => v.masterTypeId === 'mt_looking_for' && v.name === lookingFor);
    masterStore.addValue('mt_property_sub_category', val, { color: '#8B5CF6', parentId: parent?.id });
    setTypeDetails(val);
    addToast({ type: 'success', message: `Added "${val}" to property types` });
  };
  const handleAddNewSource = (val: string) => {
    masterStore.addValue('mt_lead_source', val, { color: '#F59E0B' });
    setInquirySource(val);
    addToast({ type: 'success', message: `Added "${val}" to sources` });
  };

  const [mobileError, setMobileError] = useState('');
  const [altMobileError, setAltMobileError] = useState('');

  const handleMobileBlur = () => {
    const normalized = handleMobileInputBlur(mobileNumber, setMobileNumber);
    const result = validateMobile(normalized);
    setMobileError(result.valid ? '' : (result.error || ''));
  };

  const handleAltMobileBlur = () => {
    if (!alternateMobile.trim()) { setAltMobileError(''); return; }
    const normalized = handleMobileInputBlur(alternateMobile, setAlternateMobile);
    const result = validateMobile(normalized);
    setAltMobileError(result.valid ? '' : (result.error || ''));
  };

  const handleSubmit = () => {
    if (!fullName.trim()) { addToast({ type: 'error', message: 'Full Name is required' }); return; }
    if (!mobileNumber.trim()) { addToast({ type: 'error', message: 'Mobile Number is required' }); return; }
    
    // Validate mobile number
    const mobileResult = validateMobile(mobileNumber);
    if (!mobileResult.valid) {
      addToast({ type: 'error', message: mobileResult.error || 'Please enter a valid 10-digit mobile number' });
      setMobileError(mobileResult.error || '');
      return;
    }
    
    // Validate alternate mobile if provided
    if (alternateMobile.trim()) {
      const altResult = validateMobile(alternateMobile);
      if (!altResult.valid) {
        addToast({ type: 'error', message: 'Alternate mobile: ' + (altResult.error || 'Invalid number') });
        setAltMobileError(altResult.error || '');
        return;
      }
    }
    
    if (!targetCity.trim()) { addToast({ type: 'error', message: 'Target City is required' }); return; }
    if (!lookingFor.trim()) { addToast({ type: 'error', message: 'Looking For is required' }); return; }
    if (!inquirySource.trim()) { addToast({ type: 'error', message: 'Inquiry Source is required' }); return; }

    const now = new Date().toISOString();
    addLead({
      id: `l${Date.now()}`,
      name: fullName.trim(),
      phone: mobileResult.normalized,
      alternateMobile: alternateMobile.trim() ? validateMobile(alternateMobile).normalized : undefined,
      status: 'new',
      source: inquirySource,
      inquirySource,
      targetCity,
      lookingFor,
      typeDetails: typeDetails || undefined,
      preferredLocation: preferredLocation || undefined,
      intendedPurpose,
      customerBudget: customerBudget || undefined,
      assignedTo: assignSalesExpert || assignTelecaller || assignManager || 'u1',
      assignTelecaller: assignTelecaller || undefined,
      assignSalesExpert: assignSalesExpert || undefined,
      assignManager: assignManager || undefined,
      projectTeamMembers: projectTeamMembers.length > 0 ? projectTeamMembers : undefined,
      nextCallDate: nextCallDate || undefined,
      nextCallTime: nextCallTime || undefined,
      initialRemark: initialRemark || undefined,
      leadScore,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    });
    addToast({ type: 'success', message: `Lead "${fullName}" created successfully` });

    // Auto-share the company introduction on WhatsApp (opens pre-filled, ready to send)
    if (autoIntro) {
      const num = mobileResult.normalized.replace(/\D/g, '');
      const text = encodeURIComponent(renderIntro(fullName.trim()));
      window.open(`https://wa.me/91${num}?text=${text}`, '_blank');
    }

    onClose();
  };

  return (
    <div className="space-y-1 pb-4">
      {/* ===== CUSTOMER DETAILS ===== */}
      <SectionHeader icon={User} label="Customer Details" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <Label required>Full Name</Label>
          <TextInput value={fullName} onChange={setFullName} placeholder="John Doe" />
        </div>
        <div>
          <Label required>Mobile Number</Label>
          <div className="flex">
            <span className="h-10 px-2 flex items-center bg-muted border border-r-0 border-border rounded-l-lg text-xs text-muted-foreground font-medium">+91</span>
            <input
              {...mobileInputProps}
              value={mobileNumber}
              onChange={e => handleMobileInputChange(e.target.value, setMobileNumber)}
              onBlur={handleMobileBlur}
              className={cn(
                'flex-1 h-10 px-3 rounded-r-lg border bg-card text-sm placeholder:text-muted-foreground/50 focus:border-p13-yellow outline-none transition-all',
                mobileInputClasses,
                mobileError ? 'border-red-400 focus:border-red-400' : 'border-border'
              )}
            />
          </div>
          {mobileError && <p className="text-[10px] text-red-500 mt-0.5">{mobileError}</p>}
        </div>
        <div>
          <Label>Alternate Mobile</Label>
          <div className="flex">
            <span className="h-10 px-2 flex items-center bg-muted border border-r-0 border-border rounded-l-lg text-xs text-muted-foreground font-medium">+91</span>
            <input
              {...mobileInputProps}
              value={alternateMobile}
              onChange={e => handleMobileInputChange(e.target.value, setAlternateMobile)}
              onBlur={handleAltMobileBlur}
              placeholder="Optional"
              className={cn(
                'flex-1 h-10 px-3 rounded-r-lg border bg-card text-sm placeholder:text-muted-foreground/50 focus:border-p13-yellow outline-none transition-all',
                mobileInputClasses,
                altMobileError ? 'border-red-400 focus:border-red-400' : 'border-border'
              )}
            />
          </div>
          {altMobileError && <p className="text-[10px] text-red-500 mt-0.5">{altMobileError}</p>}
        </div>
      </div>

      {/* ===== REQUIREMENTS ===== */}
      <SectionHeader icon={Home} label="Requirements" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div>
          <Label required>Target City</Label>
          <ComboboxInput value={targetCity} onChange={setTargetCity} options={cityOptions} placeholder="Select option..." allowAddNew onAddNew={handleAddNewCity} />
        </div>
        <div>
          <Label required>Looking For</Label>
          <ComboboxInput value={lookingFor} onChange={(v) => { setLookingFor(v); setTypeDetails(''); }} options={lookingForOptions} placeholder="Select option..." allowAddNew onAddNew={handleAddNewLookingFor} />
        </div>
        <div>
          <Label>Type Details</Label>
          <ComboboxInput value={typeDetails} onChange={setTypeDetails} options={typeDetailsOptions} placeholder="Select option..." allowAddNew onAddNew={handleAddNewTypeDetail} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <Label>Preferred Location</Label>
          <TextInput value={preferredLocation} onChange={setPreferredLocation} placeholder="e.g. Near Station" />
        </div>
        <div>
          <Label>Intended Purpose</Label>
          <ToggleGroup
            options={[{ value: 'self_use', label: 'SELF USE' }, { value: 'investment', label: 'INVESTMENT' }]}
            value={intendedPurpose}
            onChange={(v) => setIntendedPurpose(v as 'self_use' | 'investment')}
          />
        </div>
        <div>
          <Label>Customer Budget</Label>
          <TextInput value={customerBudget} onChange={setCustomerBudget} placeholder="e.g. 50L - 1Cr" />
        </div>
      </div>

      {/* ===== ASSIGNMENT & FLOW ===== */}
      <SectionHeader icon={Users} label="Assignment & Flow" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div>
          <Label required>Inquiry Source</Label>
          <ComboboxInput value={inquirySource} onChange={setInquirySource} options={inquirySourceOptions} placeholder="Select option..." allowAddNew onAddNew={handleAddNewSource} />
        </div>
        <div>
          <Label>Assign Telecaller</Label>
          <SelectInput value={assignTelecaller} onChange={setAssignTelecaller} options={telecallerOptions} placeholder={telecallerOptions.length ? 'Select option...' : 'No telecallers'} />
        </div>
        <div>
          <Label>Assign Sales Expert</Label>
          <SelectInput value={assignSalesExpert} onChange={setAssignSalesExpert} options={salesOptions} placeholder={salesOptions.length ? 'Select option...' : 'No sales experts'} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <Label>Assign Manager</Label>
          <SelectInput value={assignManager} onChange={setAssignManager} options={managerOptions} placeholder={managerOptions.length ? 'Select option...' : 'No managers'} />
        </div>
        <div>
          <Label>Project Team Members</Label>
          <SelectInput value={projectTeamMembers[0] || ''} onChange={(v) => setProjectTeamMembers(v ? [v] : [])} options={teamOptions} placeholder={teamOptions.length ? 'Select options...' : 'No team members'} />
        </div>
      </div>

      {/* ===== FIRST STEP ===== */}
      <SectionHeader icon={Calendar} label="First Step" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div>
          <Label>Next Call Date</Label>
          <input
            type="date"
            value={nextCallDate}
            onChange={e => setNextCallDate(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow outline-none transition-all"
          />
        </div>
        <div>
          <Label>Next Call Time</Label>
          <div className="relative">
            <input
              type="time"
              value={nextCallTime}
              onChange={e => setNextCallTime(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow outline-none transition-all"
            />
            <Clock size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div>
          <Label>Lead Score</Label>
          <LeadScoreToggle value={leadScore} onChange={setLeadScore} />
        </div>
      </div>
      <div className="mb-4">
        <Label>Initial Remark</Label>
        <textarea
          value={initialRemark}
          onChange={e => setInitialRemark(e.target.value)}
          placeholder="e.g. Interested in High Rise apartments with balcony..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground/50 resize-none focus:border-p13-yellow focus:ring-1 focus:ring-p13-yellow/20 outline-none transition-all"
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2 border-t border-border/50">
        <Button variant="outline" className="flex-1 h-11" onClick={onClose}>Cancel</Button>
        <Button className="flex-1 h-11 bg-p13-yellow text-p13-black hover:bg-p13-yellow/90 font-semibold" onClick={handleSubmit}>
          Create Lead
        </Button>
      </div>
    </div>
  );
}

/* ============================================================
   LEAD CARDS
   ============================================================ */
function LeadListCard({ lead, onClick }: { lead: Lead; index: number; onClick: () => void }) {
  const color = getAvatarColor(lead.name);
  return (
    <div
      onClick={onClick}
      className="bg-card rounded-lg p-3 shadow-xs border border-border/50 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
      style={{ borderLeft: `3px solid ${getLeadStatusColor(lead.leadScore)}` }}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-foreground text-xs font-bold flex-shrink-0" style={{ backgroundColor: color }}>
        {getInitials(lead.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{lead.name}</p>
        <p className="text-xs text-muted-foreground">{lead.phone}</p>
        {lead.targetCity && <p className="text-[10px] text-muted-foreground">{lead.targetCity} {lead.lookingFor && `| ${lead.lookingFor}`}</p>}
      </div>
      <div className="flex flex-col items-end gap-1">
        <StatusBadge status={lead.status} />
        {lead.leadScore && (
          <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase',
            lead.leadScore === 'hot' ? 'bg-red-100 text-red-600' : lead.leadScore === 'warm' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600')}>
            {lead.leadScore}
          </span>
        )}
      </div>
    </div>
  );
}

function LeadGridCard({ lead, onClick }: { lead: Lead; index: number; onClick: () => void }) {
  const color = getAvatarColor(lead.name);
  const navigate = useNavigate();
  const phone = normalizeMobile(lead.phone || '');
  const callLead = (e: React.MouseEvent) => { e.stopPropagation(); if (phone) window.location.href = `tel:+91${phone}`; };
  const whatsappLead = (e: React.MouseEvent) => { e.stopPropagation(); if (phone) window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(`Hi ${lead.name}, `)}`, '_blank'); };
  const followLead = (e: React.MouseEvent) => { e.stopPropagation(); navigate(`/leads/${lead.id}`); };
  return (
    <div
      onClick={onClick} className="bg-card rounded-xl p-4 shadow-xs border border-border/50 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
    >
      <div className="flex items-start justify-between mb-2">
        <StatusBadge status={lead.status} />
        {lead.leadScore && (
          <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase',
            lead.leadScore === 'hot' ? 'bg-red-100 text-red-600' : lead.leadScore === 'warm' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600')}>
            {lead.leadScore}
          </span>
        )}
      </div>
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-foreground text-sm font-bold mx-auto mb-2" style={{ backgroundColor: color }}>
        {getInitials(lead.name)}
      </div>
      <p className="text-sm font-semibold text-center truncate">{lead.name}</p>
      <p className="text-xs text-muted-foreground text-center">{lead.phone}</p>
      {lead.targetCity && <p className="text-[11px] text-muted-foreground text-center mt-1 truncate">{lead.targetCity}</p>}
      <div className="flex justify-center gap-3 mt-3">
        <button onClick={callLead} title="Call" className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center hover:bg-green-100"><Phone size={12} className="text-green-500" /></button>
        <button onClick={whatsappLead} title="WhatsApp" className="w-8 h-8 rounded-full bg-p13-yellow/10 flex items-center justify-center hover:bg-p13-yellow/20"><MessageCircle size={12} className="text-green-600" /></button>
        <button onClick={followLead} title="Follow-up" className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100"><Bell size={12} className="text-blue-500" /></button>
      </div>
    </div>
  );
}

function getLeadStatusColor(status: string) {
  const colors: Record<string, string> = { new: '#F59E0B', warm: '#FBBD08', hot: '#FF6B35', cold: '#D1D5DB', converted: '#22C55E', lost: '#9CA3AF' };
  return colors[status] || '#9CA3AF';
}
