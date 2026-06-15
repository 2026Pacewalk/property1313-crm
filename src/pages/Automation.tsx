import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { MessageCircle, Bell, AlertTriangle, MapPin, Flame, Clock, UserPlus, RefreshCw, Zap } from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

const MODE_LABELS: Record<string, string> = { manual: 'Manual', semi: 'Semi Automatic', full: 'Full Auto' };
const MODE_DESC: Record<string, string> = {
  manual: 'You trigger every action yourself.',
  semi: 'Rules are suggested; you approve before they run.',
  full: 'Enabled rules run automatically when triggered.',
};

export default function Automation() {
  const { automationRules, toggleAutomationRule } = useDataStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'manual' | 'semi' | 'full'>('semi');

  const iconMap: Record<string, React.ElementType> = {
    MessageCircle, Bell, AlertTriangle, MapPin, Flame, Clock, UserPlus, RefreshCw, Zap,
  };

  return (
    <div className="page-container pt-4 pb-6">
      <h1 className="text-h1-mobile md:text-h1-desktop font-semibold mb-4">Automation Center</h1>

      {/* Mode Selector */}
      <div className="flex bg-muted rounded-lg p-0.5 mb-2">
        {(['manual', 'semi', 'full'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); addToast({ type: 'success', message: `Automation mode: ${MODE_LABELS[m]}` }); }}
            className={`flex-1 py-2.5 px-3 rounded-md text-xs font-semibold capitalize transition-all ${
              mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground/80'
            }`}>
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mb-5">{MODE_DESC[mode]}</p>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {automationRules.map((rule, i) => {
          const Icon = iconMap[rule.icon] || Zap;
          return (
            <motion.div key={rule.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={cn('bg-card rounded-xl p-4 shadow-xs border transition-all',
                rule.enabled ? 'border-l-[3px]' : 'border-border',
                rule.enabled ? '' : 'opacity-75'
              )}
              style={rule.enabled ? { borderLeftColor: rule.iconColor } : {}}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${rule.iconColor}15` }}>
                    <Icon size={18} style={{ color: rule.iconColor }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{rule.name}</h3>
                    <p className="text-xs text-muted-foreground">{rule.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => { const next = !rule.enabled; toggleAutomationRule(rule.id); addToast({ type: 'success', message: `${rule.name} ${next ? 'enabled' : 'disabled'}` }); }}
                  className={cn('w-11 h-6 rounded-full transition-colors relative flex-shrink-0', rule.enabled ? 'bg-p13-yellow' : 'bg-muted')}>
                  <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform', rule.enabled ? 'left-[22px]' : 'left-0.5')} />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2">
                <span className="font-medium">Trigger:</span> {rule.trigger.replace(/_/g, ' ')}
                {rule.triggerCondition && ` (${rule.triggerCondition})`}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  {rule.lastRunAt ? `Last run: ${new Date(rule.lastRunAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Never run'}
                  {'  '} Runs: {rule.runCount}
                </span>
                <button onClick={() => navigate('/whatsapp-templates')} className="text-[11px] text-p13-yellow font-medium hover:underline">Configure</button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
