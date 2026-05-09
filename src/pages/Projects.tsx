import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Search, Eye, Building2, Share2, MoreVertical, Plus, IndianRupee, Users, MapPin, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useAuthStore, usePermission } from '@/stores/authStore';
import { useDataStore } from '@/stores/dataStore';
import { useUIStore } from '@/stores/uiStore';
import BottomSheet from '@/components/shared/BottomSheet';
import { Input } from '@/components/ui/input';

export default function Projects() {
  const { projects } = useDataStore();
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
        {filtered.map((project, i) => (
          <motion.div key={project.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.06, 0.5) }}
            className="bg-card rounded-xl shadow-xs border border-neutral-200/50 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
            {/* Media */}
            <div className="relative h-44 md:h-52 overflow-hidden">
              <img src={project.coverImage} alt={project.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-1.5">
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${project.status === 'active' ? 'bg-green-500 text-foreground' : 'bg-muted/500 text-foreground'}`}>
                  {project.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="absolute top-3 right-3 flex gap-1.5">
                <button onClick={() => { navigator.clipboard.writeText(project.shareLink); addToast({ type: 'success', message: 'Link copied!' }); }}
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
                <button onClick={() => navigate(`/project/${project.slug}`)}
                  className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">
                  Public Page <ExternalLink size={10} />
                </button>
              </div>
            </div>
          </motion.div>
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
                <button onClick={() => { if (confirm(`Delete "${ap.name}"?`)) { setShowActions(false); addToast({ type: 'success', message: `${ap.name} deleted` }); } }}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-red-50 transition-colors text-left">
                  <Trash2 size={16} className="text-red-500" />
                  <div><p className="text-sm font-medium text-red-600">Delete Project</p><p className="text-[11px] text-muted-foreground">Permanently remove</p></div>
                </button>
              )}
            </div>
          );
        })()}
      </BottomSheet>

      <BottomSheet isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Project">
        <div className="space-y-4 py-2">
          {['Project Name', 'Location', 'Description'].map(label => (
            <div key={label}><label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
              {label === 'Description' ? (
                <textarea rows={3} placeholder={`Enter ${label.toLowerCase()}`} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm resize-none" />
              ) : (
                <input placeholder={`Enter ${label.toLowerCase()}`} className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm" />
              )}
            </div>
          ))}
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Property Type</label>
            <div className="flex flex-wrap gap-2">
              {['Apartment', 'Villa', 'Plot', 'Commercial'].map(t => (
                <button key={t} className="px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-200 text-muted-foreground">{t}</button>
              ))}
            </div>
          </div>
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Cover Image</label>
            <div className="border-2 border-dashed border-neutral-300 rounded-lg h-24 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Drag & drop or click to upload</span>
            </div>
          </div>
          <button onClick={() => { addToast({ type: 'success', message: 'Project added!' }); setShowAdd(false); }}
            className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold">Save Project</button>
        </div>
      </BottomSheet>
    </div>
  );
}
