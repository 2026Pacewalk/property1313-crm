import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Phone, Clock, List, CalendarDays } from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';
import { useUIStore } from '@/stores/uiStore';
import { getAvatarColor, getInitials } from '@/data/mockData';
import BottomSheet from '@/components/shared/BottomSheet';
import type { Visit } from '@/types';

export default function Visits() {
  const { visits } = useDataStore();
  const { addToast } = useUIStore();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showSchedule, setShowSchedule] = useState(false);
  const [activeStatus, setActiveStatus] = useState<string>('all');

  const filtered = activeStatus === 'all' ? visits : visits.filter(v => v.status === activeStatus);

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
            <span className="px-2 py-0.5 bg-p13-yellow text-p13-black rounded-full text-[10px] font-bold">Today: {visits.filter(v => v.visitDate === '2026-05-08').length}</span>
          </div>
        </div>
        <div className="flex bg-neutral-200 rounded-lg p-0.5">
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-card shadow-sm' : ''}`}><List size={14} /></button>
          <button onClick={() => setViewMode('calendar')} className={`p-1.5 rounded ${viewMode === 'calendar' ? 'bg-card shadow-sm' : ''}`}><CalendarDays size={14} /></button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {['all', 'scheduled', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setActiveStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors ${activeStatus === s ? 'bg-p13-yellow text-p13-black' : 'bg-neutral-200 text-muted-foreground'}`}>
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <button onClick={() => setShowSchedule(true)} className="w-full h-10 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold mb-4 flex items-center justify-center gap-2 hover:bg-p13-yellow/90">
        <Calendar size={16} /> Schedule Visit
      </button>

      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {Object.keys(grouped).sort().map(date => (
              <div key={date}>
                <div className="sticky top-0 bg-p13-white z-[5] py-2 border-b border-border mb-2">
                  <p className="text-sm font-semibold">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                  <p className="text-xs text-muted-foreground">{grouped[date].length} visits</p>
                </div>
                {grouped[date].map((v, i) => (
                  <motion.div key={v.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`bg-card rounded-xl p-4 shadow-xs border border-neutral-200/50 mb-3 ${statusColors[v.status] || ''} border-l-[3px]`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${statusBg[v.status] || ''}`}>{v.status.replace('_', ' ')}</span>
                      <span className="text-xs text-muted-foreground">{v.visitType === 'first_visit' ? 'First Visit' : 'Revisit'}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={14} className="text-muted-foreground" />
                      <span className="text-sm font-semibold">{v.visitTime} - {String(Number(v.visitTime.split(':')[0]) + (v.duration.includes('1.5') ? 1 : 1)).padStart(2, '0')}:{v.visitTime.split(':')[1]}</span>
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
                      {v.status === 'scheduled' && <button className="flex-1 h-8 bg-p13-yellow text-p13-black rounded-lg text-xs font-semibold">Start Visit</button>}
                      <button className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center"><Phone size={12} className="text-green-500" /></button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-card rounded-xl p-4 shadow-xs border border-neutral-200/50">
              <div className="grid grid-cols-7 gap-1 text-center">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <div key={d} className="text-[10px] font-medium text-muted-foreground py-1">{d}</div>
                ))}
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 4;
                  const hasVisit = day > 0 && day < 32 && visits.some(v => {
                    const d = new Date(v.visitDate).getDate();
                    return d === day;
                  });
                  return (
                    <div key={i} className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs ${
                      day === 8 ? 'bg-p13-yellow text-p13-black font-bold' : day > 0 && day < 32 ? 'bg-muted text-foreground/80 hover:bg-neutral-200' : ''
                    }`}>
                      {day > 0 && day < 32 ? day : ''}
                      {hasVisit && day > 0 && day < 32 && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-0.5" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomSheet isOpen={showSchedule} onClose={() => setShowSchedule(false)} title="Schedule Visit">
        <div className="space-y-4 py-2">
          {['Lead', 'Project/Property', 'Date', 'Time', 'Duration', 'Visit Type', 'Notes'].map(label => (
            <div key={label}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
              {label === 'Notes' ? (
                <textarea rows={3} placeholder={`Enter ${label.toLowerCase()}...`} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm resize-none" />
              ) : label === 'Date' ? (
                <input type="date" className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm" />
              ) : label === 'Time' ? (
                <input type="time" className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm" />
              ) : (
                <input placeholder={`Enter ${label.toLowerCase()}...`} className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm" />
              )}
            </div>
          ))}
          <button onClick={() => { addToast({ type: 'success', message: 'Visit scheduled!' }); setShowSchedule(false); }}
            className="w-full h-11 bg-p13-yellow text-p13-black rounded-lg text-sm font-semibold">Schedule Visit</button>
        </div>
      </BottomSheet>
    </div>
  );
}
