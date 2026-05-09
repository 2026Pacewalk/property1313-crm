import { useNavigate } from 'react-router';
import { Settings } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getInitials, getAvatarColor } from '@/data/mockData';
import NotificationDropdown from '@/components/shared/NotificationDropdown';

interface TopNavBarProps {
  title: string;
}

export default function TopNavBar({ title }: TopNavBarProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const initials = user ? getInitials(user.name) : 'U';
  const avatarColor = user ? getAvatarColor(user.name) : '#FBBD08';

  return (
    <header className="h-14 bg-p13-black flex items-center px-4 border-b border-white/[0.06] flex-shrink-0 z-10">
      <h1 className="text-white text-base font-semibold">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <NotificationDropdown />
        <button
          onClick={() => navigate('/settings')}
          className="text-neutral-400 hover:text-white transition-colors p-1.5"
        >
          <Settings size={18} />
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer ml-1"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
