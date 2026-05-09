import { NavLink } from 'react-router';
import { Users, Bell, MapPin, Building2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/leads', label: 'Leads', icon: Users },
  { path: '/follow-ups', label: 'Follow-ups', icon: Bell },
  { path: '/visits', label: 'Visits', icon: MapPin },
  { path: '/projects', label: 'Projects', icon: Building2 },
  { path: '/more', label: 'More', icon: MoreHorizontal },
];

export default function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-14 bg-p13-black border-t border-white/[0.08] z-50 flex items-center justify-around px-2">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-colors',
              isActive ? 'text-p13-yellow' : 'text-neutral-400'
            )
          }
        >
          <tab.icon size={20} />
          <span className="text-[10px] font-medium">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
