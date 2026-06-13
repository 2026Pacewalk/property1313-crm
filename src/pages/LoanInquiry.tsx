import { useState } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Building2, MoreVertical } from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';
import type { LoanInquiry } from '@/types';

export default function LoanInquiry() {
  const { loanInquiries } = useDataStore();
  const [activeTab, setActiveTab] = useState<string>('all');

  const tabs = ['all', 'new', 'contacted', 'in_progress', 'approved', 'closed'];
  const filtered = activeTab === 'all' ? loanInquiries : loanInquiries.filter(l => l.status === activeTab);

  const statusColors: Record<string, string> = {
    new: 'border-l-blue-500', contacted: 'border-l-yellow-500', 'in_progress': 'border-l-purple-500', approved: 'border-l-green-500', closed: 'border-l-neutral-400',
  };
  const statusBg: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700', contacted: 'bg-yellow-100 text-yellow-700', 'in_progress': 'bg-purple-100 text-purple-700', approved: 'bg-green-100 text-green-700', closed: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="page-container pt-4 pb-6">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-h1-mobile md:text-h1-desktop font-semibold">Loan Inquiries</h1>
        <span className="w-6 h-6 rounded-full bg-p13-yellow text-p13-black text-[10px] font-bold flex items-center justify-center">{loanInquiries.length}</span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-colors ${activeTab === t ? 'bg-p13-yellow text-p13-black' : 'bg-muted text-muted-foreground'}`}>
            {t === 'all' ? `All (${loanInquiries.length})` : `${t.replace('_', ' ')} (${loanInquiries.filter(l => l.status === t).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((inquiry, i) => (
          <motion.div key={inquiry.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className={`bg-card rounded-lg p-3.5 shadow-xs border border-border ${statusColors[inquiry.status] || ''} border-l-[3px]`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">{inquiry.name}</p>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${statusBg[inquiry.status] || ''}`}>
                  {inquiry.status.replace('_', ' ')}
                </span>
                <MoreVertical size={14} className="text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-1.5">
              <span>{inquiry.phone}</span>
              {inquiry.email && <span>{inquiry.email}</span>}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <IndianRupee size={12} className="text-muted-foreground" />
                <span className="text-sm font-medium">{(inquiry.loanAmount).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 size={12} />
                <span>{inquiry.linkedProject || 'N/A'}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
