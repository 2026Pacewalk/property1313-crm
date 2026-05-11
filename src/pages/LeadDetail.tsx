import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Phone, MessageCircle, Bell, MapPin, Pencil,
  User, Calendar, Tag, IndianRupee, Flame, Sparkles, Building2, Save, Search, X, Check
} from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';
import { useUIStore } from '@/stores/uiStore';
import { useWhatsAppStore } from '@/stores/whatsappStore';
import { validateMobile, handleMobileInputChange, handleMobileInputBlur, mobileInputProps } from '@/lib/phone-validation';
import { getInitials, getAvatarColor } from '@/data/mockData';
import StatusBadge from '@/components/shared/StatusBadge';
import BottomSheet from '@/components/shared/BottomSheet';
import { cn } from '@/lib/utils';

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { leads, followups, visits, updateLead, projects } = useDataStore();
  const { addToast } = useUIStore();
  const { openPicker, getFavorites, getSuggested } = useWhatsAppStore();
  const lead = leads.find(l => l.id === id);

  // Edit lead state
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState<'new' | 'warm' | 'hot' | 'cold' | 'converted' | 'lost'>('new');
  const [editLeadScore, setEditLeadScore] = useState<'hot' | 'warm' | 'cold'>('warm');
  const [editSource, setEditSource] = useState('');
  const [editProject, setEditProject] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editNotes, setEditNotes] = useState('');
  // Project interest combobox state
  const [projDropdownOpen, setProjDropdownOpen] = useState(false);
  const [projQuery, setProjQuery] = useState('');

  const [showFollowup, setShowFollowup] = useState(false);
  const [followupNote, setFollowupNote] = useState('');
  const [followupDate, setFollowupDate] = useState('');

  if (!lead) return <div className="p-4 text-center">Lead not found</div>;

  const color = getAvatarColor(lead.name);
  const leadFollowups = followups.filter(f => f.leadId === lead.id);
  const leadVisits = visits.filter(v => v.leadId === lead.id);

  const timeline = [
    ...leadFollowups.map(f => ({ type: 'followup', title: 'Follow-up scheduled', desc: f.note, time: f.scheduledAt, color: '#3B82F6' })),
    ...leadVisits.map(v => ({ type: 'visit', title: 'Visit scheduled', desc: `${v.projectName} - ${v.visitDate}`, time: v.createdAt, color: '#22C55E' })),
    { type: 'status', title: `Lead marked as ${lead.status}`, desc: 'Status updated', time: lead.updatedAt, color: '#8B5CF6' },
    { type: 'created', title: 'Lead created', desc: `From ${lead.source}`, time: lead.createdAt, color: '#FBBD08' },
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const aiSuggestions = [
    lead.status === 'hot' && !leadVisits.length ? { title: 'Schedule a visit soon', desc: 'This lead has shown high interest but no visit is scheduled.', action: 'Schedule Now' } : null,
    { title: 'Follow up today', desc: 'Last contact was 3 days ago.', action: 'Add Follow-up' },
    { title: 'Share project brochure', desc: 'Lead inquired about amenities.', action: 'Send via WhatsApp' },
  ].filter(Boolean) as { title: string; desc: string; action: string }[];

  const openEditForm = () => {
    if (!lead) return;
    setEditName(lead.name);
    setEditPhone(lead.phone);
    setEditEmail(lead.email || '');
    setEditStatus(lead.status);
    setEditLeadScore(lead.leadScore);
    setEditSource(lead.source);
    setEditProject(lead.projectInterest || '');
    setEditBudget(lead.budget ? String(lead.budget) : '');
    setEditNotes(lead.notes || '');
    setProjQuery(lead.projectInterest || '');
    setProjDropdownOpen(false);
    setShowEdit(true);
  };

  const handleSaveLead = () => {
    if (!lead) return;
    if (!editName.trim()) { addToast({ type: 'error', message: 'Name is required' }); return; }
    if (!editPhone.trim()) { addToast({ type: 'error', message: 'Phone is required' }); return; }
    
    // Validate mobile number
    const phoneResult = validateMobile(editPhone);
    if (!phoneResult.valid) { addToast({ type: 'error', message: phoneResult.error || 'Invalid mobile number' }); return; }

    updateLead(lead.id, {
      name: editName.trim(),
      phone: phoneResult.normalized,
      email: editEmail.trim() || undefined,
      status: editStatus,
      leadScore: editLeadScore,
      source: editSource.trim(),
      projectInterest: editProject.trim() || undefined,
      budget: editBudget ? Number(editBudget) : undefined,
      notes: editNotes.trim() || undefined,
    });

    addToast({ type: 'success', message: 'Lead updated successfully!' });
    setShowEdit(false);
  };

  const handleAddFollowup = () => {
    if (!followupNote || !followupDate) { addToast({ type: 'error', message: 'Please fill all fields' }); return; }
    addToast({ type: 'success', message: 'Follow-up added!' });
    setShowFollowup(false);
  };

  return (
    <div className="pb-24">
      {/* Sticky Top Action Bar */}
      <div className="sticky top-0 z-10 bg-p13-white/95 backdrop-blur-sm border-b border-border px-4 py-2 flex items-center gap-3">
        <button onClick={() => navigate('/leads')} className="text-muted-foreground"><ArrowLeft size={18} /></button>
        <span className="text-[15px] font-semibold truncate flex-1">{lead.name}</span>
        <div className="flex gap-2">
          {[{ icon: Phone, bg: 'bg-green-500' }, { icon: MessageCircle, bg: 'bg-p13-yellow' }, { icon: Bell, bg: 'bg-blue-500' }, { icon: MapPin, bg: 'bg-orange-500' }].map((a, i) => (
            <motion.button key={i} whileTap={{ scale: 0.9 }} className={`w-8 h-8 ${a.bg} rounded-full flex items-center justify-center`}>
              <a.icon size={13} className="text-foreground" />
            </motion.button>
          ))}
        </div>
      </div>

      <div className="page-container pt-4 space-y-4">
        {/* Lead Info Card */}
        <div className="bg-card rounded-xl p-4 shadow-xs border border-neutral-200/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-foreground text-base font-bold" style={{ backgroundColor: color }}>
                {getInitials(lead.name)}
              </div>
              <div>
                <h2 className="text-[17px] font-semibold">{lead.name}</h2>
                <StatusBadge status={lead.status} />
              </div>
            </div>
            <button onClick={openEditForm} className="text-muted-foreground p-1 hover:text-p13-yellow transition-colors"><Pencil size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <InfoRow icon={<Phone size={14} className="text-muted-foreground" />} label="Phone" value={lead.phone} />
            {lead.email && <InfoRow icon={<MessageCircle size={14} className="text-muted-foreground" />} label="Email" value={lead.email} />}
            <InfoRow icon={<Tag size={14} className="text-muted-foreground" />} label="Source" value={lead.source} />
            <InfoRow icon={<Calendar size={14} className="text-muted-foreground" />} label="Date Added" value={new Date(lead.createdAt).toLocaleDateString()} />
            <InfoRow icon={<User size={14} className="text-muted-foreground" />} label="Assigned To" value="Rahul Verma" />
            <InfoRow icon={<Building2 size={14} className="text-muted-foreground" />} label="Project" value={lead.projectInterest || 'N/A'} />
            {lead.budget && <InfoRow icon={<IndianRupee size={14} className="text-muted-foreground" />} label="Budget" value={`Rs.${(lead.budget / 100000).toFixed(1)}L`} />}
            <InfoRow icon={<Flame size={14} className="text-muted-foreground" />} label="Lead Score" value={<span className={`text-xs font-semibold ${lead.leadScore === 'hot' ? 'text-orange-500' : lead.leadScore === 'warm' ? 'text-p13-yellow' : 'text-muted-foreground'}`}>{lead.leadScore.toUpperCase()}</span>} />
          </div>
          {lead.notes && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-muted-foreground">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2510 100%)', border: '1px solid rgba(251,189,8,0.15)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-p13-yellow" />
              <span className="text-[13px] font-semibold text-p13-yellow">AI Suggestions</span>
            </div>
            {aiSuggestions.map((s, i) => (
              <div key={i} className="border-l-2 border-p13-yellow pl-3 mb-2.5 last:mb-0">
                <p className="text-[13px] font-medium text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
                <span className="text-xs text-p13-yellow cursor-pointer font-medium">{s.action}</span>
              </div>
            ))}
          </div>
        )}

        {/* Quick Templates */}
        <div>
          <h3 className="text-h3-mobile font-semibold mb-2">Quick Templates</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
            {getFavorites().slice(0, 4).map(t => (
              <button
                key={t.id}
                onClick={() => openPicker({
                  leadId: lead.id,
                  leadName: lead.name,
                  leadPhone: lead.phone,
                  projectName: lead.projectInterest,
                })}
                className="snap-start flex-shrink-0 flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:border-p13-yellow transition-colors"
              >
                <MessageCircle size={14} className="text-green-600" />{t.name}
              </button>
            ))}
          </div>
          {/* Suggested templates */}
          {getSuggested(lead.leadScore).length > 0 && (
            <div className="mt-2">
              <p className="text-[11px] text-muted-foreground mb-1.5 flex items-center gap-1">
                <Sparkles size={10} className="text-p13-yellow" /> Suggested for {lead.leadScore.toUpperCase()} lead
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
                {getSuggested(lead.leadScore).slice(0, 3).map(t => (
                  <button
                    key={t.id}
                    onClick={() => openPicker({
                      leadId: lead.id,
                      leadName: lead.name,
                      leadPhone: lead.phone,
                      projectName: lead.projectInterest,
                    })}
                    className="snap-start flex-shrink-0 bg-gradient-to-br from-p13-black to-neutral-800 text-foreground rounded-lg px-3 py-2 text-left min-w-[140px]"
                  >
                    <span className="text-[11px] font-medium block truncate">{t.name}</span>
                    <span className="text-[9px] text-muted-foreground">{t.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-h3-mobile font-semibold mb-2">Activity Timeline</h3>
          <div className="space-y-0">
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-neutral-200 min-h-[30px]" />}
                </div>
                <div className="pb-4 flex-1">
                  <p className="text-[13px] font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(item.time).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-14 bg-card flex items-center gap-3 px-4 z-40" style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.3)' }}>
        <button onClick={() => setShowFollowup(true)} className="flex-1 h-10 bg-p13-yellow text-p13-black rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5">
          <Bell size={14} /> Schedule Follow-up
        </button>
        <button
          onClick={() => openPicker({
            leadId: lead.id,
            leadName: lead.name,
            leadPhone: lead.phone,
            projectName: lead.projectInterest,
          })}
          className="flex-1 h-10 bg-white/10 text-foreground rounded-lg text-[13px] font-medium flex items-center justify-center gap-1.5 hover:bg-white/20 transition-colors"
        >
          <MessageCircle size={14} /> Send WhatsApp
        </button>
      </div>

      {/* Add Follow-up Sheet */}
      <BottomSheet isOpen={showFollowup} onClose={() => setShowFollowup(false)} title="Add Follow-up">
        <div className="space-y-4 py-2">
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Date &amp; Time</label>
            <input type="datetime-local" value={followupDate} onChange={e => setFollowupDate(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none" /></div>
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Note</label>
            <textarea value={followupNote} onChange={e => setFollowupNote(e.target.value)} rows={3} placeholder="Add a note..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none resize-none" /></div>
          <button onClick={handleAddFollowup} className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold hover:bg-p13-yellow/90">Add Follow-up</button>
        </div>
      </BottomSheet>

      {/* Edit Lead Bottom Sheet */}
      <BottomSheet isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Lead" maxHeight="92vh">
        {lead && (
          <div className="space-y-4 py-2 pb-6">
            {/* Name */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name *</label>
              <input value={editName} onChange={(e) => setEditName(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone *</label>
              <div className="flex">
                <span className="h-11 px-2 flex items-center bg-muted border border-r-0 border-border rounded-l-lg text-xs text-muted-foreground font-medium">+91</span>
                <input
                  {...mobileInputProps}
                  value={editPhone}
                  onChange={(e) => handleMobileInputChange(e.target.value, setEditPhone)}
                  onBlur={() => handleMobileInputBlur(editPhone, setEditPhone)}
                  className="flex-1 h-11 px-3 rounded-r-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none font-mono tracking-wide"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
              <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Lead Status</label>
              <div className="flex gap-1.5 flex-wrap">
                {(['new', 'warm', 'hot', 'cold', 'converted', 'lost'] as const).map((s) => (
                  <button key={s} onClick={() => setEditStatus(s)}
                    className={cn('px-3 py-1.5 rounded-full text-[11px] font-medium border capitalize transition-all',
                      editStatus === s
                        ? 'bg-p13-yellow border-p13-yellow text-p13-black'
                        : 'bg-card border-border text-muted-foreground')}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Lead Score */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Lead Score</label>
              <div className="flex gap-2">
                {(['hot', 'warm', 'cold'] as const).map((score) => (
                  <button key={score} onClick={() => setEditLeadScore(score)}
                    className={cn('flex-1 py-2 rounded-lg text-xs font-medium border capitalize transition-all',
                      editLeadScore === score
                        ? score === 'hot' ? 'bg-orange-100 border-orange-300 text-orange-700'
                          : score === 'warm' ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                          : 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-card border-border text-muted-foreground')}>
                    {score === 'hot' && <Flame size={12} className="inline mr-1" />}
                    {score === 'warm' && <SunIcon />}
                    {score === 'cold' && <SnowIcon />}
                    {score}
                  </button>
                ))}
              </div>
            </div>

            {/* Source */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Source</label>
              <select value={editSource} onChange={(e) => setEditSource(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow outline-none">
                <option value="Website">Website</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Referral">Referral</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Justdial">Justdial</option>
                <option value="99acres">99acres</option>
                <option value="MagicBricks">MagicBricks</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Project Interest - Searchable Dropdown */}
            <div className="relative">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Project Interest</label>
              {/* Search input + selected value display */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={projDropdownOpen ? projQuery : editProject}
                  onChange={(e) => {
                    setProjQuery(e.target.value);
                    setEditProject(e.target.value);
                    if (!projDropdownOpen) setProjDropdownOpen(true);
                  }}
                  onFocus={() => { setProjQuery(editProject); setProjDropdownOpen(true); }}
                  placeholder="Search or type project name..."
                  className="w-full h-11 pl-9 pr-9 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none"
                />
                {/* Clear button */}
                {editProject && (
                  <button
                    onClick={() => { setEditProject(''); setProjQuery(''); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Dropdown list */}
              {projDropdownOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {/* Filtered projects */}
                  {projects
                    .filter(p => p.name.toLowerCase().includes(projQuery.toLowerCase()))
                    .map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setEditProject(p.name);
                          setProjQuery(p.name);
                          setProjDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-p13-yellow/10 transition-colors border-b border-border/50 last:border-0',
                          editProject === p.name && 'bg-p13-yellow/20'
                        )}
                      >
                        <Building2 size={14} className="text-p13-yellow flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.location}</p>
                        </div>
                        {editProject === p.name && <Check size={12} className="text-p13-yellow" />}
                      </button>
                    ))}

                  {/* No results - show custom text option */}
                  {projects.filter(p => p.name.toLowerCase().includes(projQuery.toLowerCase())).length === 0 && projQuery.trim() && (
                    <button
                      onClick={() => {
                        setEditProject(projQuery.trim());
                        setProjDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-p13-yellow/10 transition-colors"
                    >
                      <Pencil size={14} className="text-muted-foreground flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">Use &quot;<span className="font-medium">{projQuery.trim()}</span>&quot; as custom text</p>
                    </button>
                  )}

                  {/* Empty state when no query */}
                  {projects.length > 0 && !projQuery.trim() && (
                    <div className="px-3 py-2 text-[10px] text-muted-foreground">
                      Type to search projects or enter custom name
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Budget */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Budget (INR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">&#8377;</span>
                <input type="number" value={editBudget} onChange={(e) => setEditBudget(e.target.value)}
                  placeholder="5000000"
                  className="w-full h-11 pl-8 pr-3 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
              <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3}
                placeholder="Add any notes about this lead..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:border-p13-yellow focus:ring-2 focus:ring-p13-yellow/20 outline-none resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowEdit(false)}
                className="flex-1 h-11 bg-muted text-foreground/80 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-all">
                Cancel
              </button>
              <button onClick={handleSaveLead}
                className="flex-1 h-11 bg-card text-foreground rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2">
                <Save size={14} /> Save Changes
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

function SunIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}
function SnowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
      <path d="M12 2v20M2 12h20m-3.5-6.5L8.5 17.5m0-12 8 8M4.93 4.93l14.14 14.14"/>
    </svg>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      {icon}
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm text-neutral-800 font-medium">{value}</p>
      </div>
    </div>

  );
}
