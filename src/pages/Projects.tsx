import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, Eye, Building2, Share2, MoreVertical, Plus, IndianRupee, Users, MapPin, ExternalLink, Pencil, Trash2, Upload, X } from 'lucide-react';
import { useAuthStore, usePermission } from '@/stores/authStore';
import { useDataStore } from '@/stores/dataStore';
import { useUIStore } from '@/stores/uiStore';
import BottomSheet from '@/components/shared/BottomSheet';
import { Input } from '@/components/ui/input';

export default function Projects() {
  const { projects, deleteProject } = useDataStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();
  const { can } = usePermission();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [actionProjectId, setActionProjectId] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);

  const filtered = projects.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container pt-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-h1-mobile md:text-h1-desktop font-semibold">Projects</h1>
          <span className="text-caption text-muted-foreground">{projects.length} Projects</span>
        </div>
        <button onClick={() => setShowAdd(true)} className="hidden md:flex items-center gap-1.5 h-9 px-4 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold hover:bg-p13-yellow/90">
          <Plus size={14} /> Add Project
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="pl-9 h-10 bg-card" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((project) => (
          <div key={project.id}
            onClick={() => navigate(`/project/${project.slug}`)}
            className="bg-card rounded-xl shadow-xs border border-border overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
            {/* Media */}
            <div className="relative h-44 md:h-52 overflow-hidden">
              <img src={project.coverImage} alt={project.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-1.5">
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${project.status === 'active' ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                  {project.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="absolute top-3 right-3 flex gap-1.5">
                <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(project.shareLink); addToast({ type: 'success', message: 'Link copied!' }); }}
                  className="w-8 h-8 bg-black/40 backdrop-blur rounded-full flex items-center justify-center text-foreground hover:bg-black/60">
                  <Share2 size={14} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setActionProjectId(project.id); setShowActions(true); }}
                  className="w-8 h-8 bg-black/40 backdrop-blur rounded-full flex items-center justify-center text-foreground hover:bg-black/60">
                  <MoreVertical size={14} />
                </button>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-base font-semibold text-foreground">{project.name}</h3>
              </div>
            </div>
            {/* Info */}
            <div className="p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <MapPin size={12} />
                <span className="truncate">{project.location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold mb-2">
                <IndianRupee size={14} />
                <span>Rs.{(project.minPrice / 100000).toFixed(0)}L - Rs.{(project.maxPrice / 100000).toFixed(0)}L</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{project.propertyType.join(', ')}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Users size={12} />{project.leadCount} Leads</span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Eye size={12} />{project.viewCount >= 1000 ? `${(project.viewCount / 1000).toFixed(1)}k` : project.viewCount} views</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); navigate(`/project/${project.slug}`); }}
                  className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">
                  Public Page <ExternalLink size={10} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Building2 size={48} className="text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No projects found</p>
        </div>
      )}

      <button onClick={() => setShowAdd(true)} className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-p13-yellow rounded-full flex items-center justify-center shadow-xl z-40">
        <Plus size={24} className="text-p13-black" />
      </button>

      {/* Project Actions Sheet */}
      <BottomSheet isOpen={showActions} onClose={() => { setShowActions(false); setActionProjectId(null); }} title="Project Actions">
        {(() => {
          const ap = projects.find(p => p.id === actionProjectId);
          if (!ap) return null;
          return (
            <div className="space-y-1 py-2">
              <button onClick={() => { navigate(`/project/${ap.slug}`); setShowActions(false); }}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-muted transition-colors text-left">
                <Eye size={16} className="text-blue-500" />
                <div><p className="text-sm font-medium">View Public Page</p><p className="text-[11px] text-muted-foreground">Open project public listing</p></div>
              </button>
              {can('manage_projects') && (
                <button onClick={() => { navigate(`/projects/${ap.slug}/edit`); setShowActions(false); }}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-muted transition-colors text-left">
                  <Pencil size={16} className="text-p13-yellow" />
                  <div><p className="text-sm font-medium">Edit Project</p><p className="text-[11px] text-muted-foreground">Modify project details</p></div>
                </button>
              )}
              <button onClick={() => { navigator.clipboard.writeText(ap.shareLink); addToast({ type: 'success', message: 'Link copied!' }); setShowActions(false); }}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-muted transition-colors text-left">
                <Share2 size={16} className="text-green-500" />
                <div><p className="text-sm font-medium">Copy Share Link</p><p className="text-[11px] text-muted-foreground">Copy to clipboard</p></div>
              </button>
              {user?.role === 'super_admin' && (
                <button onClick={() => { if (confirm(`Delete "${ap.name}"?`)) { deleteProject(ap.id); setShowActions(false); setActionProjectId(null); addToast({ type: 'success', message: `${ap.name} deleted` }); } }}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-red-50 transition-colors text-left">
                  <Trash2 size={16} className="text-red-500" />
                  <div><p className="text-sm font-medium text-red-600">Delete Project</p><p className="text-[11px] text-muted-foreground">Permanently remove</p></div>
                </button>
              )}
            </div>
          );
        })()}
      </BottomSheet>

      <AddProjectSheet
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={() => addToast({ type: 'success', message: 'Project added!' })}
      />
    </div>
  );
}

// Add Project Bottom Sheet with Image Upload
interface AddProjectSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function AddProjectSheet({ isOpen, onClose, onSaved }: AddProjectSheetProps) {
  const { addProject, projects } = useDataStore();
  const [projectName, setProjectName] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [description, setDescription] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [coverData, setCoverData] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useUIStore();

  const propertyTypes = ['Apartment', 'Villa', 'Plot', 'Commercial', 'Penthouse', 'Studio'];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast({ type: 'error', message: 'Please select an image file' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast({ type: 'error', message: 'Image must be less than 5MB' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setCoverPreview(result);
      setCoverData(result);
    };
    reader.readAsDataURL(file);
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSave = () => {
    if (!projectName.trim()) { addToast({ type: 'error', message: 'Project name is required' }); return; }
    if (!projectLocation.trim()) { addToast({ type: 'error', message: 'Location is required' }); return; }

    // Generate a unique slug (avoid collisions with same-named projects)
    const baseSlug = projectName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    let slug = baseSlug;
    let n = 2;
    while (projects.some(p => p.slug === slug)) {
      slug = `${baseSlug}-${n++}`;
    }

    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : 0;

    addProject({
      id: `p_${Date.now()}`,
      name: projectName.trim(),
      location: projectLocation.trim(),
      description: description.trim() || projectName.trim(),
      propertyType: selectedTypes.length > 0 ? selectedTypes : ['Apartment'],
      coverImage: coverData || '',
      status: 'active',
      minPrice: min,
      maxPrice: max,
      galleryImages: coverData ? [coverData] : [''],
      slug,
      shareLink: `https://p1313.xyz/project/${slug}`,
      amenities: [],
      viewCount: 0,
      leadCount: 0,
      conversionCount: 0,
      createdAt: new Date().toISOString(),
    });

    onSaved();
    onClose();
    // Reset form
    setProjectName('');
    setProjectLocation('');
    setDescription('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedTypes([]);
    setCoverPreview('');
    setCoverData('');
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Add Project">
      <div className="space-y-4 py-2">
        {/* Project Name */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Project Name *</label>
          <input
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            placeholder="e.g. Sunset Residences"
            className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow outline-none transition-all"
          />
        </div>

        {/* Location */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Location *</label>
          <input
            value={projectLocation}
            onChange={e => setProjectLocation(e.target.value)}
            placeholder="e.g. Zirakpur, Punjab"
            className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow outline-none transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="Brief description of the project"
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm resize-none focus:border-p13-yellow outline-none transition-all"
          />
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Min Price (₹)</label>
            <input
              type="number"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              placeholder="e.g. 4500000"
              className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Max Price (₹)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              placeholder="e.g. 9500000"
              className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow outline-none transition-all"
            />
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Property Type</label>
          <div className="flex flex-wrap gap-2">
            {propertyTypes.map(t => (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedTypes.includes(t)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Cover Image Upload */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Cover Image</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {coverPreview ? (
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img src={coverPreview} alt="Cover preview" className="w-full h-32 object-cover" />
              <button
                onClick={() => { setCoverPreview(''); setCoverData(''); }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X size={14} />
              </button>
              <p className="absolute bottom-2 left-2 text-[10px] text-white bg-black/50 px-2 py-0.5 rounded">Image selected</p>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-lg h-24 flex flex-col items-center justify-center gap-1.5 hover:border-p13-yellow hover:bg-p13-yellow/5 transition-all cursor-pointer"
            >
              <Upload size={20} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Click to upload cover image</span>
              <span className="text-[10px] text-muted-foreground/60">JPG, PNG up to 5MB</span>
            </button>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!projectName.trim() || !projectLocation.trim()}
          className="w-full h-11 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Save Project
        </button>
      </div>
    </BottomSheet>
  );
}
