import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, Save, Image as ImageIcon, Trash2, ExternalLink,
  Copy, Check, AlertTriangle, Plus, X, ChevronDown, ChevronUp, Building2,
  MapPin, IndianRupee, Home, Upload, Search
} from 'lucide-react';
import { useAuthStore, usePermission } from '@/stores/authStore';
import { useDataStore } from '@/stores/dataStore';
import { useUIStore } from '@/stores/uiStore';
import { useRBACStore } from '@/stores/rbacStore';
import { cn } from '@/lib/utils';
import type { Project } from '@/types';

// ===================== MASTER DATA =====================
const PROJECT_TYPES = ['Residential', 'Commercial', 'Mixed Use', 'Villa', 'Plot Development', 'Retail'];
const PROPERTY_CATEGORIES = ['Apartment', 'Villa', 'Plot', 'Penthouse', 'Studio', 'Duplex', 'Row House', 'Commercial Space', 'Shop', 'Office'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Noida', 'Gurgaon', 'Kolkata', 'Ahmedabad'];
const BUILDERS = ['DLF', 'Lodha', 'Prestige', 'Godrej Properties', 'Sobha', 'Brigade', 'L&T Realty', 'Tata Housing', 'Mahindra Lifespaces', 'Local Developer'];
const UNIT_TYPES_LIST = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK', 'Studio', 'Penthouse', 'Duplex', 'Row House', 'Villa', 'Plot', 'Shop', 'Office Space'];
const AMENITIES_LIST = [
  'Swimming Pool', 'Gym', 'Club House', 'Children Play Area', 'Jogging Track',
  '24/7 Security', 'Power Backup', 'Parking', 'Lift', 'Garden', 'Indoor Games',
  'Community Hall', 'Theater', 'Spa', 'Co-working Space', 'Tennis Court',
  'Basketball Court', 'Yoga Deck', 'Senior Citizen Area', 'Pet Park'
];

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ===================== SECTION COMPONENT =====================
function Section({ title, icon, children, defaultOpen = true }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
          {icon}
          {title}
        </div>
        <ChevronDown size={16} className={cn('text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-4">{children}</div>}
    </div>
  );
}

// ===================== INPUT COMPONENTS =====================
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-muted-foreground mb-1">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none transition-all" />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm resize-none focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none transition-all" />
  );
}

function SelectInput({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-11 px-3 pr-10 rounded-lg border border-border bg-card text-sm appearance-none focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none transition-all">
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );
}

// ===================== COMBOBOX INPUT (dropdown + custom text) =====================
function ComboboxInput({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync search when value changes externally
  useEffect(() => {
    setSearch(value);
  }, [value]);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const exactMatch = options.some(o => o.toLowerCase() === search.toLowerCase());
  const showCustom = search.trim() && !exactMatch;

  const handleSelect = (v: string) => {
    onChange(v);
    setSearch(v);
    setOpen(false);
  };

  const handleInputChange = (v: string) => {
    setSearch(v);
    onChange(v); // allow freeform typing directly into the value
    if (!open) setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search.trim()) {
      setOpen(false);
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          value={search}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-11 px-3 pr-10 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none transition-all"
        />
        <button
          onClick={() => setOpen(!open)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-muted-foreground"
        >
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {/* Filtered existing options */}
          {filtered.length > 0 && (
            <div className="py-1">
              {filtered.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={cn('w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2',
                    value === opt && 'bg-p13-yellow/10 text-p13-black font-medium')}
                >
                  {value === opt && <Check size={12} className="text-p13-yellow flex-shrink-0" />}
                  <span className="truncate">{opt}</span>
                </button>
              ))}
            </div>
          )}

          {/* Custom option */}
          {showCustom && (
            <div className="border-t border-border/50">
              <button
                onClick={() => handleSelect(search.trim())}
                className="w-full text-left px-3 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <Plus size={14} />
                <span>Use custom: &quot;{search.trim()}&quot;</span>
              </button>
            </div>
          )}

          {/* Empty state */}
          {filtered.length === 0 && !showCustom && (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
              <Search size={14} className="mx-auto mb-1 text-muted-foreground/50" />
              Type to add custom value
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MultiSelect({ selected, options, onToggle }: {
  selected: string[]; options: string[]; onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button key={opt} onClick={() => onToggle(opt)}
          className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
            selected.includes(opt)
              ? 'bg-p13-yellow text-p13-black border-p13-yellow'
              : 'bg-card text-muted-foreground border-border hover:border-neutral-300')}>
          {opt}
        </button>
      ))}
    </div>
  );
}

// ===================== MAIN PAGE =====================
export default function EditProject() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { can } = usePermission();
  const { projects, updateProject } = useDataStore();
  const { addToast } = useUIStore();
  const { addAuditLog } = useRBACStore();

  const project = useMemo(() => projects.find(p => p.slug === slug), [projects, slug]);

  // Form state
  const [name, setName] = useState('');
  const [projectType, setProjectType] = useState('');
  const [propertyCategory, setPropertyCategory] = useState<string[]>([]);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [builderName, setBuilderName] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [unitTypes, setUnitTypes] = useState<string[]>([]);
  const [propertySize, setPropertySize] = useState('');
  const [possessionDate, setPossessionDate] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [publicEnabled, setPublicEnabled] = useState(true);
  const [publicSlug, setPublicSlug] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [longDesc, setLongDesc] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [totalUnits, setTotalUnits] = useState('');
  const [reraId, setReraId] = useState('');
  const [landArea, setLandArea] = useState('');
  const [floors, setFloors] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showGalleryManage, setShowGalleryManage] = useState(false);

  // Prefill form from project
  useEffect(() => {
    if (project) {
      setName(project.name);
      setProjectType('Residential'); // derived
      setPropertyCategory(project.propertyType);
      setStatus(project.status);
      setBuilderName('');
      setCity(project.location.split(',').pop()?.trim() || '');
      setArea(project.location);
      setAddress(project.location);
      setMapLink('');
      setMinPrice(String(project.minPrice));
      setMaxPrice(String(project.maxPrice));
      setUnitTypes(project.propertyType);
      setPropertySize('');
      setPossessionDate(project.possession || '');
      setCoverImage(project.coverImage);
      setGalleryImages(project.galleryImages);
      setYoutubeUrl(project.youtubeUrl || '');
      setInstagramUrl(project.instagramUrl || '');
      setPublicEnabled(true);
      setPublicSlug(project.slug);
      setShortDesc(project.description.slice(0, 120));
      setLongDesc(project.description);
      setHighlights(project.amenities);
      setTotalUnits(String(project.totalUnits || ''));
      setReraId(project.reraId || '');
      setLandArea(project.landArea || '');
      setFloors(project.floors || '');
    }
  }, [project]);

  // Permission check
  if (!user || !can('manage_projects')) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <h2 className="text-lg font-semibold">Access Denied</h2>
        <p className="text-sm text-muted-foreground mt-1">You do not have permission to edit projects.</p>
        <button onClick={() => navigate('/projects')} className="mt-4 h-10 px-6 bg-p13-yellow text-p13-black rounded-lg text-sm font-medium">
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <Building2 size={48} className="text-muted-foreground/50 mb-4" />
        <h2 className="text-lg font-semibold">Project Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1">The project you are trying to edit does not exist.</p>
        <button onClick={() => navigate('/projects')} className="mt-4 h-10 px-6 bg-p13-yellow text-p13-black rounded-lg text-sm font-medium">
          Back to Projects
        </button>
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/project/${publicSlug}`;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Project name is required';
    if (!projectType) e.projectType = 'Project type is required';
    if (propertyCategory.length === 0) e.propertyCategory = 'Select at least one property category';
    if (!city) e.city = 'City is required';
    if (!status) e.status = 'Status is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      addToast({ type: 'error', message: 'Please fill all required fields' });
      return;
    }
    setSaving(true);

    const updated: Partial<Project> = {
      name: name.trim(),
      description: longDesc || shortDesc,
      location: area ? `${area}${city ? `, ${city}` : ''}` : city,
      propertyType: unitTypes.length > 0 ? unitTypes : propertyCategory,
      minPrice: Number(minPrice) || 0,
      maxPrice: Number(maxPrice) || 0,
      status,
      coverImage,
      galleryImages,
      youtubeUrl: youtubeUrl || undefined,
      instagramUrl: instagramUrl || undefined,
      totalUnits: totalUnits ? Number(totalUnits) : undefined,
      possession: possessionDate || undefined,
      reraId: reraId || undefined,
      landArea: landArea || undefined,
      floors: floors || undefined,
      amenities: highlights,
      slug: publicSlug,
      shareLink: publicUrl,
    };

    // Track changes for audit log
    const changes: string[] = [];
    if (name.trim() !== project.name) changes.push(`name: "${project.name}" -> "${name.trim()}"`);
    if (status !== project.status) changes.push(`status: "${project.status}" -> "${status}"`);
    if ((Number(minPrice) || 0) !== project.minPrice) changes.push(`minPrice changed`);
    if ((Number(maxPrice) || 0) !== project.maxPrice) changes.push(`maxPrice changed`);

    updateProject(project.id, updated);

    // Audit log
    addAuditLog({
      userId: user.id,
      userName: user.name,
      targetUserId: project.id,
      targetUserName: project.name,
      action: 'user_updated',
      entityType: 'project',
      entityId: project.id,
      details: `Edited project "${project.name}"${changes.length > 0 ? ` — Changes: ${changes.join('; ')}` : ''}`,
      ipAddress: '103.21.58.192',
      performedBy: user.id,
    });

    setTimeout(() => {
      setSaving(false);
      addToast({ type: 'success', message: `Project "${name}" updated successfully` });
      navigate(`/project/${publicSlug}`);
    }, 400);
  };

  const toggleUnitType = (t: string) => {
    setUnitTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const toggleHighlight = (a: string) => {
    setHighlights(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRegenerateSlug = () => {
    if (!name.trim()) return;
    const newSlug = slugify(name);
    setPublicSlug(newSlug);
    addToast({ type: 'success', message: 'Slug regenerated' });
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddGalleryImage = () => {
    // Mock: add a placeholder image. In production, this would be an upload
    const placeholders = [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&q=80',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=400&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80',
    ];
    const random = placeholders[Math.floor(Math.random() * placeholders.length)];
    if (!galleryImages.includes(random)) {
      setGalleryImages(prev => [...prev, random]);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-muted/50 flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground p-1 -ml-1">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-semibold truncate">Edit Project</h1>
            <p className="text-[11px] text-muted-foreground truncate">{project.name}</p>
          </div>
          <button onClick={handleSave} disabled={saving}
            className={cn('h-9 px-4 bg-p13-yellow text-p13-black rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all',
              saving && 'opacity-70')}>
            {saving ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save</>}
          </button>
        </div>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-28">

          {/* Basic Details */}
          <Section title="Basic Details" icon={<Building2 size={16} className="text-p13-yellow" />}>
            <div>
              <Label required>Project Name</Label>
              <TextInput value={name} onChange={setName} placeholder="e.g., Sunset Residences" />
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label required>Project Type</Label>
                <SelectInput value={projectType} onChange={setProjectType} options={PROJECT_TYPES} />
                {errors.projectType && <p className="text-[11px] text-red-500 mt-1">{errors.projectType}</p>}
              </div>
              <div>
                <Label required>Status</Label>
                <div className="relative">
                  <select value={status} onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full h-11 px-3 pr-10 rounded-lg border border-border bg-card text-sm appearance-none focus:border-p13-yellow outline-none">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
                {errors.status && <p className="text-[11px] text-red-500 mt-1">{errors.status}</p>}
              </div>
            </div>
            <div>
              <Label required>Property Category</Label>
              <MultiSelect selected={propertyCategory} options={PROPERTY_CATEGORIES} onToggle={(v) => {
                setPropertyCategory(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
              }} />
              {errors.propertyCategory && <p className="text-[11px] text-red-500 mt-1">{errors.propertyCategory}</p>}
            </div>
            <div>
              <Label>Builder Name</Label>
              <ComboboxInput value={builderName} onChange={setBuilderName} options={BUILDERS} placeholder="Search or type builder name..." />
            </div>
          </Section>

          {/* Location */}
          <Section title="Location" icon={<MapPin size={16} className="text-p13-yellow" />}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label required>City</Label>
                <ComboboxInput value={city} onChange={setCity} options={CITIES} placeholder="Search or type city name..." />
                {errors.city && <p className="text-[11px] text-red-500 mt-1">{errors.city}</p>}
              </div>
              <div>
                <Label>Area/Location</Label>
                <TextInput value={area} onChange={setArea} placeholder="e.g., Sector 62, Noida" />
              </div>
            </div>
            <div>
              <Label>Full Address</Label>
              <TextArea value={address} onChange={setAddress} placeholder="Complete project address" rows={2} />
            </div>
            <div>
              <Label>Google Map Link</Label>
              <TextInput value={mapLink} onChange={setMapLink} placeholder="https://maps.google.com/..." />
            </div>
          </Section>

          {/* Pricing & Configuration */}
          <Section title="Pricing & Configuration" icon={<IndianRupee size={16} className="text-p13-yellow" />}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label required>Min Price (in Rs.)</Label>
                <TextInput value={minPrice} onChange={setMinPrice} placeholder="4500000" type="number" />
              </div>
              <div>
                <Label required>Max Price (in Rs.)</Label>
                <TextInput value={maxPrice} onChange={setMaxPrice} placeholder="15000000" type="number" />
              </div>
            </div>
            <div>
              <Label>Unit Types Available</Label>
              <MultiSelect selected={unitTypes} options={UNIT_TYPES_LIST} onToggle={toggleUnitType} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Total Units</Label>
                <TextInput value={totalUnits} onChange={setTotalUnits} placeholder="240" type="number" />
              </div>
              <div>
                <Label>Property Size</Label>
                <TextInput value={propertySize} onChange={setPropertySize} placeholder="e.g., 1200-3500 sqft" />
              </div>
              <div>
                <Label>Possession Date</Label>
                <TextInput value={possessionDate} onChange={setPossessionDate} placeholder="e.g., Dec 2026" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>RERA ID</Label>
                <TextInput value={reraId} onChange={setReraId} placeholder="UPRERAPRJ..." />
              </div>
              <div>
                <Label>Land Area</Label>
                <TextInput value={landArea} onChange={setLandArea} placeholder="e.g., 5 Acres" />
              </div>
            </div>
            <div>
              <Label>Floors</Label>
              <TextInput value={floors} onChange={setFloors} placeholder="e.g., G+15" />
            </div>
          </Section>

          {/* Media */}
          <Section title="Media" icon={<ImageIcon size={16} className="text-p13-yellow" />}>
            {/* Cover Image */}
            <div>
              <Label>Cover Image</Label>
              {coverImage ? (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img src={coverImage} alt="Cover" className="w-full h-40 object-cover" />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <label className="h-8 px-3 bg-black/60 backdrop-blur text-foreground rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer hover:bg-black/80">
                      <Upload size={12} /> Replace
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => { setCoverImage(ev.target?.result as string); addToast({ type: 'success', message: 'Cover image updated' }); };
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </label>
                    <button onClick={() => setCoverImage('')}
                      className="h-8 w-8 bg-red-500/80 backdrop-blur text-foreground rounded-lg flex items-center justify-center hover:bg-red-600">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-neutral-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-p13-yellow hover:bg-p13-yellow/5 transition-all">
                  <Upload size={20} className="text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Click to upload cover image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => { setCoverImage(ev.target?.result as string); addToast({ type: 'success', message: 'Cover image uploaded' }); };
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              )}
            </div>

            {/* Gallery */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Gallery Images ({galleryImages.length})</Label>
                <button onClick={() => setShowGalleryManage(!showGalleryManage)}
                  className="text-[11px] text-p13-yellow font-medium flex items-center gap-1">
                  {showGalleryManage ? 'Done' : 'Manage'}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {galleryImages.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                    {showGalleryManage && (
                      <button onClick={() => handleRemoveGalleryImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 text-foreground rounded-full flex items-center justify-center hover:bg-red-600">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={handleAddGalleryImage}
                  className="aspect-square rounded-lg border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center hover:border-p13-yellow hover:bg-p13-yellow/5 transition-all">
                  <Plus size={20} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground mt-0.5">Add</span>
                </button>
              </div>
            </div>

            {/* Social URLs */}
            <div>
              <Label>YouTube URL</Label>
              <TextInput value={youtubeUrl} onChange={setYoutubeUrl} placeholder="https://youtube.com/..." />
            </div>
            <div>
              <Label>Instagram URL</Label>
              <TextInput value={instagramUrl} onChange={setInstagramUrl} placeholder="https://instagram.com/..." />
            </div>
          </Section>

          {/* Public Listing */}
          <Section title="Public Listing" icon={<ExternalLink size={16} className="text-p13-yellow" />}>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Public Page Enabled</p>
                <p className="text-[11px] text-muted-foreground">Make this project visible on the public site</p>
              </div>
              <button onClick={() => setPublicEnabled(!publicEnabled)}
                className={cn('w-12 h-7 rounded-full transition-all relative', publicEnabled ? 'bg-p13-yellow' : 'bg-neutral-300')}>
                <div className={cn('w-5 h-5 bg-card rounded-full absolute top-1 transition-all shadow-sm', publicEnabled ? 'left-6' : 'left-1')} />
              </button>
            </div>
            <div>
              <Label>Public Slug</Label>
              <div className="flex gap-2">
                <TextInput value={publicSlug} onChange={setPublicSlug} placeholder="project-slug" />
                <button onClick={handleRegenerateSlug}
                  className="h-11 px-3 bg-muted text-muted-foreground rounded-lg text-xs font-medium whitespace-nowrap hover:bg-neutral-200 transition-all">
                  Regenerate
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">URL: {publicUrl}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCopyLink}
                className="flex-1 h-10 bg-muted text-foreground/80 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-neutral-200 transition-all">
                {copiedLink ? <><Check size={14} className="text-green-500" /> Copied</> : <><Copy size={14} /> Copy Link</>}
              </button>
              <a href={`/project/${publicSlug}`} target="_blank" rel="noopener noreferrer"
                className="flex-1 h-10 bg-muted text-foreground/80 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-neutral-200 transition-all">
                <ExternalLink size={14} /> Open Page
              </a>
            </div>
          </Section>

          {/* Description */}
          <Section title="Description & Highlights" icon={<Home size={16} className="text-p13-yellow" />}>
            <div>
              <Label>Short Description</Label>
              <TextArea value={shortDesc} onChange={setShortDesc} placeholder="Brief 1-line description" rows={2} />
              <p className="text-[10px] text-muted-foreground mt-1">{shortDesc.length}/120 characters</p>
            </div>
            <div>
              <Label>Long Description</Label>
              <TextArea value={longDesc} onChange={setLongDesc} placeholder="Detailed project description" rows={5} />
            </div>
            <div>
              <Label>Amenities & Highlights</Label>
              <MultiSelect selected={highlights} options={AMENITIES_LIST} onToggle={toggleHighlight} />
            </div>
          </Section>

        </div>
      </div>

      {/* Sticky Bottom Save Bar */}
      <div className="sticky bottom-0 z-50 bg-card border-t border-border px-4 py-3 md:hidden">
        <button onClick={handleSave} disabled={saving}
          className={cn('w-full h-12 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all',
            saving && 'opacity-70')}>
          {saving ? <><Check size={16} /> Project Saved</> : <><Save size={16} /> Save Changes</>}
        </button>
        {Object.keys(errors).length > 0 && (
          <p className="text-[11px] text-red-500 text-center mt-2">Please fix the errors above</p>
        )}
      </div>
    </div>
  );
}
