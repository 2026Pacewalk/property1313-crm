import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Plus, Phone, MessageCircle, Bell, MoreVertical, LayoutList, LayoutGrid, X } from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';
import { useUIStore } from '@/stores/uiStore';
import { getInitials, getAvatarColor } from '@/data/mockData';
import StatusBadge from '@/components/shared/StatusBadge';
import BottomSheet from '@/components/shared/BottomSheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Lead } from '@/types';
import { cn } from '@/lib/utils';

const statuses = ['new', 'warm', 'hot', 'cold', 'converted', 'lost'];
const sources = ['Website', 'Facebook', 'Instagram', 'Referral', 'Walk-in', 'Call', 'WhatsApp'];

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

  const filtered = leads.filter(l => {
    const matchesSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search);
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
          className="w-8 h-8 rounded-full bg-p13-yellow flex items-center justify-center hover:scale-105 transition-transform">
          <Plus size={16} className="text-p13-black" />
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..." className="pl-9 h-10 bg-white border-neutral-200 text-sm" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"><X size={14} /></button>}
        </div>
        <button onClick={() => setShowFilter(true)}
          className="relative w-10 h-10 bg-white border border-neutral-200 rounded-lg flex items-center justify-center hover:bg-neutral-50">
          <SlidersHorizontal size={16} className="text-neutral-500" />
          {hasFilters && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-p13-yellow rounded-full border-2 border-white" />}
        </button>
        <div className="hidden md:flex bg-neutral-200 rounded-lg p-0.5">
          <button onClick={() => setViewMode('list')} className={cn('p-1.5 rounded', viewMode === 'list' ? 'bg-white shadow-sm' : '')}><LayoutList size={14} /></button>
          <button onClick={() => setViewMode('grid')} className={cn('p-1.5 rounded', viewMode === 'grid' ? 'bg-white shadow-sm' : '')}><LayoutGrid size={14} /></button>
        </div>
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {activeFilters.statuses.map(s => (
            <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-p13-yellow/10 border border-p13-yellow/30 text-xs font-medium text-neutral-800">
              {s} <button onClick={() => toggleStatusFilter(s)}><X size={10} /></button>
            </span>
          ))}
          {activeFilters.sources.map(s => (
            <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-p13-yellow/10 border border-p13-yellow/30 text-xs font-medium text-neutral-800">
              {s} <button onClick={() => toggleSourceFilter(s)}><X size={10} /></button>
            </span>
          ))}
          <button onClick={clearFilters} className="text-xs text-neutral-400 hover:text-neutral-600 px-1">Clear all</button>
        </div>
      )}

      {/* Lead List */}
      <motion.div layout className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-3' : 'space-y-2'}>
        <AnimatePresence>
          {filtered.map((lead, i) => (
            viewMode === 'grid'
              ? <LeadGridCard key={lead.id} lead={lead} index={i} onClick={() => navigate(`/leads/${lead.id}`)} />
              : <LeadListCard key={lead.id} lead={lead} index={i} onClick={() => navigate(`/leads/${lead.id}`)} />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-12 col-span-full">
            <p className="text-sm text-neutral-400">No leads found</p>
          </div>
        )}
      </motion.div>

      {/* Filter Bottom Sheet */}
      <BottomSheet isOpen={showFilter} onClose={() => setShowFilter(false)} title="Filters">
        <div className="space-y-5 py-2">
          <div>
            <p className="text-sm font-semibold mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {statuses.map(s => (
                <button key={s} onClick={() => toggleStatusFilter(s)}
                  className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize',
                    activeFilters.statuses.includes(s) ? 'bg-p13-yellow text-p13-black' : 'bg-neutral-200 text-neutral-500')}
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
                    activeFilters.sources.includes(s) ? 'bg-p13-yellow text-p13-black' : 'bg-neutral-200 text-neutral-500')}
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
      <BottomSheet isOpen={showAddLead} onClose={() => setShowAddLead(false)} title="Add Lead">
        <AddLeadForm onClose={() => setShowAddLead(false)} />
      </BottomSheet>
    </div>
  );
}

function LeadListCard({ lead, index, onClick }: { lead: Lead; index: number; onClick: () => void }) {
  const color = getAvatarColor(lead.name);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.15 }}
      onClick={onClick}
      className="bg-neutral-100 rounded-lg p-3 shadow-xs flex items-center gap-3 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
      style={{ borderLeft: `3px solid ${getLeadStatusColor(lead.status)}` }}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: color }}>
        {getInitials(lead.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{lead.name}</p>
        <p className="text-xs text-neutral-400">{lead.phone}</p>
      </div>
      <StatusBadge status={lead.status} />
      <MoreVertical size={16} className="text-neutral-400 flex-shrink-0" />
    </motion.div>
  );
}

function LeadGridCard({ lead, index, onClick }: { lead: Lead; index: number; onClick: () => void }) {
  const color = getAvatarColor(lead.name);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.15 }}
      onClick={onClick} className="bg-white rounded-xl p-4 shadow-xs border border-neutral-200/50 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between mb-2">
        <StatusBadge status={lead.status} />
        <MoreVertical size={14} className="text-neutral-400" />
      </div>
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto mb-2" style={{ backgroundColor: color }}>
        {getInitials(lead.name)}
      </div>
      <p className="text-sm font-semibold text-center truncate">{lead.name}</p>
      <p className="text-xs text-neutral-400 text-center">{lead.phone}</p>
      {lead.projectInterest && <p className="text-[11px] text-neutral-400 text-center mt-1 truncate">{lead.projectInterest}</p>}
      <div className="flex justify-center gap-3 mt-3">
        <button className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center"><Phone size={12} className="text-green-500" /></button>
        <button className="w-8 h-8 rounded-full bg-p13-yellow/10 flex items-center justify-center"><MessageCircle size={12} className="text-green-600" /></button>
        <button className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><Bell size={12} className="text-blue-500" /></button>
      </div>
    </motion.div>
  );
}

function AddLeadForm({ onClose }: { onClose: () => void }) {
  const { addLead } = useDataStore();
  const { addToast } = useUIStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Lead['status']>('new');
  const [source, setSource] = useState('Website');

  const handleSubmit = () => {
    if (!name || !phone) { addToast({ type: 'error', message: 'Name and phone are required' }); return; }
    addLead({
      id: `l${Date.now()}`, name, phone, email, status, source,
      assignedTo: 'u3', leadScore: status === 'hot' ? 'hot' : 'warm',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastActivityAt: new Date().toISOString(),
    });
    addToast({ type: 'success', message: 'Lead added successfully' });
    onClose();
  };

  return (
    <div className="space-y-4 py-2">
      <div><label className="text-xs font-medium text-neutral-500 mb-1 block">Name *</label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="h-11" /></div>
      <div><label className="text-xs font-medium text-neutral-500 mb-1 block">Phone *</label>
        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="h-11" /></div>
      <div><label className="text-xs font-medium text-neutral-500 mb-1 block">Email</label>
        <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className="h-11" /></div>
      <div><label className="text-xs font-medium text-neutral-500 mb-1 block">Status</label>
        <div className="flex flex-wrap gap-2">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatus(s as Lead['status'])}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors', status === s ? 'bg-p13-yellow text-p13-black' : 'bg-neutral-200 text-neutral-500')}>
              {s}</button>
          ))}
        </div></div>
      <div><label className="text-xs font-medium text-neutral-500 mb-1 block">Source</label>
        <div className="flex flex-wrap gap-2">
          {sources.map(s => (
            <button key={s} onClick={() => setSource(s)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors', source === s ? 'bg-p13-yellow text-p13-black' : 'bg-neutral-200 text-neutral-500')}>
              {s}</button>
          ))}
        </div></div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button className="flex-1 bg-p13-yellow text-p13-black hover:bg-p13-yellow/90 font-semibold" onClick={handleSubmit}>Add Lead</Button>
      </div>
    </div>
  );
}

function getLeadStatusColor(status: string) {
  const colors: Record<string, string> = { new: '#F59E0B', warm: '#FBBD08', hot: '#FF6B35', cold: '#D1D5DB', converted: '#22C55E', lost: '#9CA3AF' };
  return colors[status] || '#9CA3AF';
}
