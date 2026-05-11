import { useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

const borderColors = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  warning: 'border-l-yellow-500',
  info: 'border-l-blue-500',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: { id: string; type: string; message: string }; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const Icon = icons[toast.type as keyof typeof icons] || Info;

  return (
    <div
      className={cn(
        'pointer-events-auto bg-card text-foreground rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-[400px] border-l-4',
        borderColors[toast.type as keyof typeof borderColors] || borderColors.info,
        'animate-in slide-in-from-right-2 fade-in duration-200'
      )}
    >
      <Icon size={16} className={colors[toast.type as keyof typeof colors] || colors.info} />
      <span className="text-sm flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="text-muted-foreground hover:text-foreground p-0.5">
        <X size={14} />
      </button>
    </div>
  );
}
