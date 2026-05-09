import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Star, Clock, MessageCircle, Filter,
  Copy, Pencil, Archive, Trash2, X, Flame,
  Snowflake, Sun, Zap, Bot, Send, CheckCircle,
  AlertCircle, Eye,
} from 'lucide-react';
import { useWhatsAppStore } from '@/stores/whatsappStore';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import type { WhatsAppTemplate, AITone, TemplateStatus } from '@/types';
import MessagePreview from '@/components/shared/MessagePreview';

const toneConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  hot: { icon: <Flame size={12} />, color: 'text-orange-500 bg-orange-50', label: 'HOT' },
  warm: { icon: <Sun size={12} />, color: 'text-yellow-600 bg-yellow-50', label: 'WARM' },
  cold: { icon: <Snowflake size={12} />, color: 'text-blue-500 bg-blue-50', label: 'COLD' },
};

const messageTypeIcons: Record<string, string> = {
  text: 'Aa',
  image: '\uD83D\uDDBC\uFE0F',
  pdf: 'PDF',
  video: '\uD83C\uDFA5',
  brochure: '\uD83D\uDCC4',
  link: '\uD83D\uDD17',
  voice: '\uD83C\uDFA4',
};

export default function WhatsAppTemplates() {
  const {
    templates, categories, filter, setFilter, toggleFavorite,
    getFilteredTemplates, getAnalytics, openEditor,
    cloneTemplate, archiveTemplate, deleteTemplate,
    getLogsForTemplate,
  } = useWhatsAppStore();
  const { addToast } = useUIStore();
  const { user } = useAuthStore();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'recent'>('recent');

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  const filtered = getFilteredTemplates();
  const analytics = getAnalytics();

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortBy === 'name') arr.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'usage') arr.sort((a, b) => b.usageCount - a.usageCount);
    if (sortBy === 'recent') arr.sort((a, b) => new Date(b.lastUsed || b.createdAt).getTime() - new Date(a.lastUsed || a.createdAt).getTime());
    return arr;
  }, [filtered, sortBy]);

  const selectedTemplate = selectedId ? templates.find((t) => t.id === selectedId) : null;
  const selectedLogs = selectedId ? getLogsForTemplate(selectedId) : [];

  // Preview context
  const previewContext: Record<string, string> = {
    customer_name: 'Rahul Sharma',
    project_name: 'Sunset Residences',
    project_location: 'Sector 62, Noida',
    sales_person_name: user?.name || 'Amit Kumar',
    company_name: 'Property1313',
    company_mobile: '8910001313',
    visit_date: 'May 10, 2026',
    visit_time: '10:30 AM',
    loan_amount: 'Rs.50 Lakhs',
    emi_amount: 'Rs.45,000/month',
    public_project_link: 'https://p1313.com/p/sunset-residences',
    callback_time: '2:00 PM today',
    otp_code: '131313',
    device: 'Chrome on Windows',
    location: 'Mumbai, IN',
    login_time: '09:30 AM',
    lead_link: 'https://p1313.com/leads/l1',
    customer_phone: '+91 98765 11111',
    lead_source: 'Website',
    assigned_by: 'Priya Sharma',
  };

  const handleClone = (id: string) => {
    cloneTemplate(id);
    addToast({ type: 'success', message: 'Template cloned!' });
  };

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    if (selectedId === id) setSelectedId(null);
    addToast({ type: 'success', message: 'Template deleted!' });
  };

  const handleArchive = (id: string) => {
    archiveTemplate(id);
    if (selectedId === id) setSelectedId(null);
    addToast({ type: 'success', message: 'Template archived!' });
  };

  const allCategories = [{ id: 'all', name: 'All Categories' }, ...categories.map((c) => ({ id: c.name, name: c.name }))];

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* LEFT: Template List */}
      <div className={cn('flex-1 flex flex-col min-w-0', selectedId ? 'hidden md:flex' : 'flex')}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-p13-black">WhatsApp Templates</h1>
              <p className="text-xs text-muted-foreground">{templates.filter(t => t.status === 'active').length} active templates</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn('h-9 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all',
                  showFilters ? 'bg-p13-yellow border-p13-yellow text-p13-black' : 'bg-card border-border text-muted-foreground')}
              >
                <Filter size={13} /> Filters
              </button>
              <button
                onClick={() => openEditor()}
                className="h-9 px-3 bg-card text-foreground rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-neutral-800 transition-all"
              >
                <Plus size={13} /> Create
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-2">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={filter.search}
              onChange={(e) => setFilter({ search: e.target.value })}
              placeholder="Search templates by name, category, content..."
              className="w-full h-10 pl-9 pr-9 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none"
            />
            {filter.search && (
              <button onClick={() => setFilter({ search: '' })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="pt-2 space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    <select
                      value={filter.category}
                      onChange={(e) => setFilter({ category: e.target.value })}
                      className="h-8 px-2 rounded-lg border border-border bg-card text-xs outline-none focus:border-p13-yellow"
                    >
                      {allCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select
                      value={filter.aiTone}
                      onChange={(e) => setFilter({ aiTone: e.target.value as AITone | 'all' })}
                      className="h-8 px-2 rounded-lg border border-border bg-card text-xs outline-none focus:border-p13-yellow"
                    >
                      <option value="all">All Tones</option>
                      <option value="hot">HOT</option>
                      <option value="warm">WARM</option>
                      <option value="cold">COLD</option>
                    </select>
                    <select
                      value={filter.status}
                      onChange={(e) => setFilter({ status: e.target.value as TemplateStatus | 'all' })}
                      className="h-8 px-2 rounded-lg border border-border bg-card text-xs outline-none focus:border-p13-yellow"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                      <option value="pending">Pending</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="h-8 px-2 rounded-lg border border-border bg-card text-xs outline-none focus:border-p13-yellow"
                    >
                      <option value="recent">Recent</option>
                      <option value="usage">Most Used</option>
                      <option value="name">Name</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input type="checkbox" checked={filter.favoritesOnly} onChange={(e) => setFilter({ favoritesOnly: e.target.checked })} className="accent-p13-yellow" />
                      Favorites only
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input type="checkbox" checked={filter.automationOnly} onChange={(e) => setFilter({ automationOnly: e.target.checked })} className="accent-p13-yellow" />
                      Automation only
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick category pills */}
          <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
            {allCategories.slice(0, 10).map((c) => (
              <button
                key={c.id}
                onClick={() => setFilter({ category: c.id })}
                className={cn('flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border',
                  filter.category === c.id ? 'bg-p13-yellow text-p13-black border-p13-yellow' : 'bg-card text-muted-foreground border-border')}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics strip */}
        <div className="grid grid-cols-4 gap-px bg-neutral-200 border-b border-border">
          {[
            { label: 'Total', value: analytics.totalSent, icon: Send, color: 'text-blue-500' },
            { label: 'Confirmed', value: analytics.totalConfirmed, icon: CheckCircle, color: 'text-green-500' },
            { label: 'Pending', value: analytics.totalOpened, icon: Eye, color: 'text-purple-500' },
            { label: 'Auto %', value: `${analytics.automationRate}%`, icon: Bot, color: 'text-orange-500' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card px-3 py-2 text-center">
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              <p className="text-sm font-bold text-p13-black">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto">
          {sorted.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle size={40} className="text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-1">No templates found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {sorted.map((template) => (
                <TemplateRow
                  key={template.id}
                  template={template}
                  isSelected={selectedId === template.id}
                  onClick={() => setSelectedId(template.id)}
                  onToggleFavorite={() => toggleFavorite(template.id)}
                  onClone={() => handleClone(template.id)}
                  onArchive={() => handleArchive(template.id)}
                  onDelete={() => handleDelete(template.id)}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Preview Panel (Desktop) / Full screen (Mobile) */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className={cn('flex-1 min-w-0 bg-card border-l border-border flex flex-col',
              'fixed inset-0 z-40 md:static md:z-auto')}
          >
            {/* Mobile back button */}
            <div className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-border">
              <button onClick={() => setSelectedId(null)} className="text-muted-foreground">
                <X size={18} />
              </button>
              <span className="text-sm font-semibold">Template Details</span>
            </div>

            {/* Header */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {selectedTemplate.aiTone && (
                    <span className={cn('flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold', toneConfig[selectedTemplate.aiTone].color)}>
                      {toneConfig[selectedTemplate.aiTone].icon}
                      {toneConfig[selectedTemplate.aiTone].label}
                    </span>
                  )}
                  <div>
                    <h2 className="text-sm font-bold">{selectedTemplate.name}</h2>
                    <p className="text-[11px] text-muted-foreground">{selectedTemplate.category}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleFavorite(selectedTemplate.id)} className={cn('p-1.5 rounded-lg', selectedTemplate.isFavorite ? 'text-p13-yellow' : 'text-muted-foreground')}>
                    <Star size={15} fill={selectedTemplate.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  {isAdmin && (
                    <>
                      <button onClick={() => handleClone(selectedTemplate.id)} className="p-1.5 text-muted-foreground hover:text-muted-foreground rounded-lg">
                        <Copy size={15} />
                      </button>
                      <button onClick={() => openEditor(selectedTemplate.id)} className="p-1.5 text-muted-foreground hover:text-muted-foreground rounded-lg">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleArchive(selectedTemplate.id)} className="p-1.5 text-muted-foreground hover:text-muted-foreground rounded-lg">
                        <Archive size={15} />
                      </button>
                      <button onClick={() => handleDelete(selectedTemplate.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded-lg">
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 mt-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Send size={11} /> {selectedTemplate.usageCount} sent</span>
                {selectedTemplate.lastUsed && <span className="flex items-center gap-1"><Clock size={11} /> {new Date(selectedTemplate.lastUsed).toLocaleDateString()}</span>}
                {selectedTemplate.automationEnabled && <span className="flex items-center gap-1 text-blue-500"><Zap size={11} /> Auto</span>}
                <span className="flex items-center gap-1 capitalize"><AlertCircle size={11} /> {selectedTemplate.status}</span>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* WhatsApp Preview */}
              <div className="p-4">
                <p className="text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">WhatsApp Preview</p>
                <div className="bg-[#E5DDD5] rounded-xl p-4">
                  <MessagePreview
                    message={useWhatsAppStore.getState().renderMessage(selectedTemplate, previewContext)}
                    mediaType={selectedTemplate.messageType !== 'text' ? selectedTemplate.messageType : undefined}
                    mediaUrl={selectedTemplate.mediaUrl}
                    status="read"
                  />
                </div>
              </div>

              {/* Variables */}
              {selectedTemplate.variables.length > 0 && (
                <div className="px-4 pb-4">
                  <p className="text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Variables</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTemplate.variables.map((v) => (
                      <span key={v} className="px-2 py-1 bg-p13-yellow/10 text-p13-black text-[11px] font-medium rounded-md">
                        {'{{'}{v}{'}}'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedTemplate.description && (
                <div className="px-4 pb-4">
                  <p className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Description</p>
                  <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
                </div>
              )}

              {/* Automation triggers */}
              {selectedTemplate.automationTriggers && selectedTemplate.automationTriggers.length > 0 && (
                <div className="px-4 pb-4">
                  <p className="text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Automation Triggers</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTemplate.automationTriggers.map((t) => (
                      <span key={t} className="px-2 py-1 bg-blue-50 text-blue-600 text-[11px] font-medium rounded-md flex items-center gap-1">
                        <Zap size={10} />{t.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Message log for this template */}
              {selectedLogs.length > 0 && (
                <div className="px-4 pb-4">
                  <p className="text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Recent Activity ({selectedLogs.length})</p>
                  <div className="space-y-2">
                    {selectedLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="bg-muted/50 rounded-lg p-2.5 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{log.sentTo.leadName}</span>
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full capitalize',
                            log.status === 'sent_confirmed' ? 'bg-green-100 text-green-600' :
                            log.status === 'opened' ? 'bg-blue-100 text-blue-600' :
                            log.status === 'manual_sent_unconfirmed' ? 'bg-yellow-100 text-yellow-600' :
                            log.status === 'failed' ? 'bg-red-100 text-red-600' :
                            'bg-muted text-muted-foreground')}>
                            {log.status === 'manual_sent_unconfirmed' ? 'Unconfirmed' : log.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-[11px] line-clamp-2">{log.content}</p>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                          <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                          <span className={cn(log.sendMethod === 'automation' ? 'text-blue-500' : 'text-muted-foreground')}>
                            {log.sendMethod.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TemplateRow({
  template, isSelected, onClick, onToggleFavorite, onClone, onArchive, onDelete, isAdmin,
}: {
  template: WhatsAppTemplate;
  isSelected: boolean;
  onClick: () => void;
  onToggleFavorite: () => void;
  onClone: () => void;
  onArchive: () => void;
  onDelete: () => void;
  isAdmin: boolean;
}) {
  return (
    <div
      className={cn('px-4 py-3 cursor-pointer transition-all hover:bg-muted/50 group relative',
        isSelected ? 'bg-p13-yellow/5 border-l-[3px] border-l-p13-yellow' : 'border-l-[3px] border-l-transparent')}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Message type indicator */}
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-xs">
          {messageTypeIcons[template.messageType] || 'Aa'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-semibold truncate">{template.name}</span>
            {template.aiTone && (
              <span className={cn('flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-bold', toneConfig[template.aiTone]?.color)}>
                {toneConfig[template.aiTone]?.icon}
              </span>
            )}
            {template.isFavorite && <Star size={10} className="text-p13-yellow flex-shrink-0" fill="currentColor" />}
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-1 mb-1">{template.content.slice(0, 80)}...</p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>{template.category}</span>
            <span>{template.usageCount} uses</span>
            {template.automationEnabled && <span className="text-blue-500 flex items-center gap-0.5"><Zap size={8} />Auto</span>}
            <span className={cn('capitalize', template.status === 'active' ? 'text-green-500' : template.status === 'archived' ? 'text-muted-foreground' : 'text-yellow-500')}>
              {template.status}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} className={cn('p-1 rounded', template.isFavorite ? 'text-p13-yellow' : 'text-muted-foreground')}>
            <Star size={13} fill={template.isFavorite ? 'currentColor' : 'none'} />
          </button>
          {isAdmin && (
            <>
              <button onClick={(e) => { e.stopPropagation(); onClone(); }} className="p-1 text-muted-foreground hover:text-muted-foreground rounded"><Copy size={13} /></button>
              <button onClick={(e) => { e.stopPropagation(); onArchive(); }} className="p-1 text-muted-foreground hover:text-muted-foreground rounded"><Archive size={13} /></button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-red-400 hover:text-red-600 rounded"><Trash2 size={13} /></button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
