import { useNavigate, useLocation } from 'react-router';
import { Bell, Home } from 'lucide-react';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  title: string;
}

export default function MobileHeader({ title }: MobileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

  return (
    <header className={cn(
      'sticky top-0 z-30 flex items-center gap-2 px-4 h-12',
      'bg-background/90 backdrop-blur-md border-b border-border',
      'transition-colors duration-200'
    )}>
      {/* Home Icon */}
      <button
        onClick={() => navigate('/dashboard')}
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0',
          isDashboard
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
        )}
        title="Dashboard"
      >
        <Home size={18} />
      </button>

      <h1 className="flex-1 text-sm font-semibold text-foreground truncate">{title}</h1>

      {/* Theme Toggle */}
      <ThemeToggle className="w-8 h-8" />

      {/* Notification */}
      <button
        onClick={() => navigate('/notifications')}
        className="relative w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
      >
        <Bell size={18} />
      </button>
    </header>
  );
}
