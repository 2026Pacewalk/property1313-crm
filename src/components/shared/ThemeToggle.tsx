import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { cn } from '@/lib/utils';

export default function ThemeToggle({ className }: { className?: string }) {
  const { mode, toggle } = useThemeStore();
  const isDark = mode === 'dark';

  return (
    <button
      onClick={toggle}
      className={cn(
        'relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200',
        'hover:bg-neutral-100 dark:hover:bg-white/10',
        isDark ? 'text-p13-yellow' : 'text-neutral-500',
        className
      )}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <Sun size={16} className={cn('transition-all duration-200', isDark ? 'rotate-90 opacity-0 scale-75' : 'rotate-0 opacity-100')} />
      <Moon size={16} className={cn('absolute transition-all duration-200', isDark ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0 scale-75')} />
    </button>
  );
}
