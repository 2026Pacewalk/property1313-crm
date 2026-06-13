import { useState, useRef, useEffect } from 'react';
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
    <div ref={ref} className={cn('fixed bottom-20 right-4 z-[55] flex flex-col items-end gap-2', className)}>
      {/* Speed Dial Actions - CSS transitions only, no spring/bounce */}
      <div
        className={cn(
          'flex flex-col items-end gap-2 mb-1 transition-all duration-200 ease-out',
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
        )}
      >
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => { action.onClick(); setOpen(false); }}
            className="flex items-center gap-2 group active:scale-95 transition-transform"
          >
            <span className={cn(
              'text-xs font-medium px-2.5 py-1 rounded-md shadow-sm whitespace-nowrap border transition-colors',
              'bg-card text-foreground border-border'
            )}>
              {action.label}
            </span>
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg text-p13-black text-sm"
              style={{ backgroundColor: action.color || '#FBBD08' }}
            >
              {action.icon}
            </span>
          </button>
        ))}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'w-14 h-14 rounded-full bg-p13-yellow text-p13-black shadow-xl',
          'flex items-center justify-center transition-all duration-200 active:scale-90',
          open && 'rotate-45'
        )}
      >
        {open ? <X size={22} /> : <Plus size={24} />}
      </button>
    </div>
  );
}
