import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FABAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

interface FABProps {
  actions: FABAction[];
  className?: string;
}

export default function FloatingActionButton({ actions, className }: FABProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: Event) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn('fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[55] flex flex-col items-end gap-2', className)}>
      {/* Speed Dial Actions */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="flex flex-col items-end gap-2 mb-1"
          >
            {actions.map((action, i) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.9 }}
                transition={{ duration: 0.12, delay: i * 0.03 }}
                onClick={() => { action.onClick(); setOpen(false); }}
                className="flex items-center gap-2 group"
              >
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm whitespace-nowrap border border-neutral-200 dark:border-slate-700">
                  {action.label}
                </span>
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg text-white text-sm transition-transform active:scale-90"
                  style={{ backgroundColor: action.color || '#FBBD08' }}
                >
                  {action.icon}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'w-14 h-14 rounded-full bg-p13-yellow text-p13-black shadow-lg shadow-p13-yellow/30',
          'flex items-center justify-center transition-all duration-200 active:scale-90',
          open && 'rotate-45 shadow-xl'
        )}
      >
        {open ? <X size={22} /> : <Plus size={24} />}
      </button>
    </div>
  );
}
