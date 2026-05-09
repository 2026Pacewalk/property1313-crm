import { cn } from '@/lib/utils';
import { getLeadStatusText, getLeadStatusBg } from '@/data/mockData';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const label = getLeadStatusText(status);
  const bgClass = getLeadStatusBg(status);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold uppercase',
        size === 'sm' ? 'text-[10px] px-2.5 py-0.5' : 'text-[11px] px-3 py-1',
        bgClass,
        (status === 'warm' || status === 'cold') ? 'text-foreground' : 'text-foreground'
      )}
    >
      {label}
    </span>
  );
}
