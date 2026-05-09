import { useNavigate } from 'react-router';
import { ArrowLeft, Bell, Search } from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';

interface MobileHeaderProps {
  title: string;
}

export default function MobileHeader({ title }: MobileHeaderProps) {
  const navigate = useNavigate();
  const { notifications } = useDataStore();
  const unreadCount = notifications.filter((n) => !n.read && !n.deleted).length;

  return (
    <header className="h-12 bg-p13-black flex items-center px-4 sticky top-0 z-10 flex-shrink-0">
      <button onClick={() => navigate(-1)} className="text-neutral-400 hover:text-white mr-3">
        <ArrowLeft size={20} />
      </button>
      <h1 className="text-white text-[15px] font-semibold flex-1 text-center">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="text-neutral-400 hover:text-white">
          <Search size={18} />
        </button>
        <button
          onClick={() => navigate('/notifications')}
          className="text-neutral-400 hover:text-white relative"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-p13-yellow text-p13-black rounded-full flex items-center justify-center font-bold text-[8px] w-3.5 h-3.5">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
