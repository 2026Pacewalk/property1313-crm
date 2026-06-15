import { useState } from 'react';

import { MapPin, Calendar, Phone, Clock, List, CalendarDays } from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { getAvatarColor, getInitials } from '@/data/mockData';
import { normalizeMobile } from '@/lib/phone-validation';
import BottomSheet from '@/components/shared/BottomSheet';
import type { Visit } from '@/types';

export default function Visits() {
  const { visits, leads, projects, addVisit, updateVisit } = useDataStore();
  const { addToast } = useUIStore();
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showSchedule, setShowSchedule] = useState(false);
  const [activeStatus, setActiveStatus] = useState<string>('all');

  // Schedule-visit form state
  const [fLeadId, setFLeadId] = useState('');
  const [fProject, setFProject] = useState('');
  const [fDate, setFDate] = useState('');
  const [fTime, setFTime] = useState('10:00');
  const [fDuration, setFDuration] = useState('1 hour');
  const [fType, setFType] = useState<'first_visit' | 'revisit'>('first_visit');
  const [fNotes, setFNotes] = useState('');

  const resetForm = () => {
    setFLeadId(''); setFProject(''); setFDate(''); setFTime('10:00');
    setFDuration('1 hour'); setFType('first_visit'); setFNotes('');
  };

  const handleSchedule = () => {
    const lead = leads.find(l => l.id === fLeadId);
    if (!lead) { addToast({ type: 'error', message: 'Please select a lead' }); return; }
    if (!fDate) { addToast({ type: 'error', message: 'Please select a date' }); return; }
    addVisit({
      id: `v_${Date.now()}`,
      leadId: lead.id,
      leadName: lead.name,
      leadPhone: lead.phone || '',
      projectName: fProject || lead.projectInterest || '',
      visitDate: fDate,
      visitTime: fTime,
      duration: fDuration,
      visitType: fType,
      status: 'scheduled',
      assignedTo: user?.id || '',
      notes: fNotes.trim(),
      createdAt: new Date().toISOString(),
    } as Visit);
    addToast({ type: 'success', message: 'Visit scheduled!' });
    resetForm();
    setShowSchedule(false);
  };

  const handleStartVisit = (v: Visit) => {
    updateVisit(v.id, { status: 'in_progress' });
    addToast({ type: 'success', message: `Visit started for ${v.leadName}` });
  };

  const handleCallLead = (v: Visit) => {
    if (v.leadPhone) window.location.href = `tel:+91${normalizeMobile(v.leadPhone)}`;
    else addToast({ type: 'error', message: 'No phone number available' });
  };

  const filtered = activeStatus === 'all' ? visits : visits.filter(v => v.status === activeStatus);
  const today = new Date().toISOString().split('T')[0];

  // Compute a visit's end time from its start time + duration (e.g. "1 hour", "1.5 hours", "30 mins")
  const getEndTime = (visitTime: string, duration: string) => {
    const [h, m] = visitTime.split(':').map(Number);
    let durationMins = 60;
    const lower = (duration || '').toLowerCase();
    const numMatch = lower.match(/[\d.]+/);
    if (numMatch) {
      const val = parseFloat(numMatch[0]);
      durationMins = lower.includes('min') ? val : val * 60;
    }
    const total = h * 60 + m + durationMins;
    const endH = Math.floor(total / 60) % 24;
    const endM = total % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  const statusColors: Record<string, string> = {
    scheduled: 'border-l-blue-500', 'in_progress': 'border-l-yellow-500', completed: 'border-l-green-500', cancelled: 'border-l-red-500',
  };
  const statusBg: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700', 'in_progress': 'bg-yellow-100 text-yellow-700', completed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
  };

  const grouped = filtered.reduce((acc, v) => {
    if (!acc[v.visitDate]) acc[v.visitDate] = [];
    acc[v.visitDate].push(v);
    return acc;
  }, {} as Record<string, Visit[]>);

  return (
    <div className="page-container pt-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-h1-mobile md:text-h1-desktop font-semibold">Visits</h1>
          <div className="flex gap-1">
            <span className="px-2 py-0.5 bg-p13-yellow text-p13-black rounded-full text-[10px] font-bold">Today: {visits.filter(v => v.visitDate === today).length}</span>
          </div>
        </div>
        <div className="flex bg-muted rounded-lg p-0.5">
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-card shadow-sm' : ''}`}><List size={14} /></button>
          <button onClick={() => setViewMode('calendar')} className={`p-1.5 rounded ${viewMode === 'calendar' ? 'bg-card shadow-sm' : ''}`}><CalendarDays size={14} /></button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {['all', 'scheduled', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setActiveStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors ${activeStatus === s ? 'bg-p13-yellow text-p13-black' : 'bg-muted text-muted-foreground'}`}>
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <button onClick={() => setShowSchedule(true)} className="w-full h-10 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold mb-4 flex items-center justify-center gap-2 hover:bg-p13-yellow/90">
        <Calendar size={16} /> Schedule Visit
      </button>

      <div>
        {viewMode === 'list' ? (
          <div>
            {Object.keys(grouped).sort().map(date => (
              <div key={date}>
                <div className="sticky top-0 bg-background z-[5] py-2 border-b border-border mb-2">
                  <p className="text-sm font-semibold">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                  <p className="text-xs text-muted-foreground">{grouped[date].length} visits</p>
                </div>
                {grouped[date].map((v) => (
                  <div key={v.id}
                    className={`bg-card rounded-xl p-4 shadow-xs border border-border/50 mb-3 ${statusColors[v.status] || ''} border-l-[3px]`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${statusBg[v.status] || ''}`}>{v.status.replace('_', ' ')}</span>
                      <span className="text-xs text-muted-foreground">{v.visitType === 'first_visit' ? 'First Visit' : 'Revisit'}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={14} className="text-muted-foreground" />
                      <span className="text-sm font-semibold">{v.visitTime} - {getEndTime(v.visitTime, v.duration)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-foreground text-xs font-bold flex-shrink-0" style={{ backgroundColor: getAvatarColor(v.leadName) }}>
                        {getInitials(v.leadName)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{v.leadName}</p>
                        <p className="text-xs text-muted-foreground">{v.leadPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <MapPin size={12} className="text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{v.projectName}</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {v.status === 'scheduled' && <button onClick={() => handleStartVisit(v)} className="flex-1 h-8 bg-p13-yellow text-p13-black rounded-lg text-xs font-semibold hover:bg-p13-yellow/90">Start Visit</button>}
                      <button onClick={() => handleCallLead(v)} className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center hover:bg-green-100"><Phone size={12} className="text-green-500" /></button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="bg-card rounded-xl p-4 shadow-xs border border-border">
              <div className="grid grid-cols-7 gap-1 text-center">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <div key={d} className="text-[10px] font-medium text-muted-foreground py-1">{d}</div>
                ))}
                {(() => {
                  const nowDate = new Date();
                  const year = nowDate.getFullYear();
                  const month = nowDate.getMonth();
                  const todayDay = nowDate.getDate();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  // Monday-first offset: getDay() returns 0 (Sun)..6 (Sat)
                  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
                  return Array.from({ length: 42 }, (_, i) => {
                    const day = i - firstWeekday + 1;
                    const inMonth = day > 0 && day <= daysInMonth;
                    const hasVisit = inMonth && visits.some(v => {
                      const d = new Date(v.visitDate);
                      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
                    });
                    return (
                      <div key={i} className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs ${
                        inMonth && day === todayDay ? 'bg-p13-yellow text-p13-black font-bold' : inMonth ? 'bg-muted text-foreground/80 hover:bg-muted' : ''
                      }`}>
                        {inMonth ? day : ''}
                        {hasVisit && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-0.5" />}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomSheet isOpen={showSchedule} onClose={() => setShowSchedule(false)} title="Schedule Visit" maxHeight="90vh">
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Lead *</label>
            <select value={fLeadId} onChange={e => setFLeadId(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-p13-yellow">
              <option value="">Select lead...</option>
              {leads.map(l => <option key={l.id} value={l.id}>{l.name} — {l.phone}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Project / Property</label>
            <select value={fProject} onChange={e => setFProject(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-p13-yellow">
              <option value="">Select project...</option>
              {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Date *</label>
              <input type="date" value={fDate} onChange={e => setFDate(e.target.value)} className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-p13-yellow" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Time</label>
              <input type="time" value={fTime} onChange={e => setFTime(e.target.value)} className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-p13-yellow" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Duration</label>
              <select value={fDuration} onChange={e => setFDuration(e.target.value)} className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-p13-yellow">
                <option>30 mins</option><option>1 hour</option><option>1.5 hours</option><option>2 hours</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Visit Type</label>
              <select value={fType} onChange={e => setFType(e.target.value as 'first_visit' | 'revisit')} className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-p13-yellow">
                <option value="first_visit">First Visit</option><option value="revisit">Revisit</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
            <textarea rows={3} value={fNotes} onChange={e => setFNotes(e.target.value)} placeholder="Enter notes..." className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm resize-none outline-none focus:border-p13-yellow" />
          </div>
          <button onClick={handleSchedule}
            className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold hover:bg-p13-yellow/90">Schedule Visit</button>
        </div>
      </BottomSheet>
    </div>
  );
}
