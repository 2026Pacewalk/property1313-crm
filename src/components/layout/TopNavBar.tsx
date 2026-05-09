import { useNavigate } from 'react-router';
import { Bell } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { cn } from '@/lib/utils';
import { getInitials, getAvatarColor } from '@/data/mockData';

interface TopNavBarProps {
  title: string;
}

export default function TopNavBar({ title }: TopNavBarProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const initials = user ? getInitials(user.name) : 'U';
  const avatarColor = user ? getAvatarColor(user.name) : '#FBBD08';

  return (
    <header className={cn(
      'h-12 flex items-center gap-4 px-6 border-b backdrop-blur-md flex-shrink-0 z-30',
      'bg-background/90 border-border transition-colors duration-200'
    )}>
      <h1 className="text-sm font-semibold text-foreground">{title}</h1>
      <div className="flex-1" />

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Notification */}
      <button
        onClick={() => navigate('/notifications')}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
      >
        <Bell size={18} />
      </button>

      {/* Profile */}
      <button
        onClick={() => navigate('/profile')}
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
        style={{ backgroundColor: avatarColor }}
      >
        {initials}
      </button>
    </header>
  );
}
