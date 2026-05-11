import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { Home, Users, Bell, MapPin, Building2, MoreHorizontal, LogOut, Settings, User, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/leads', label: 'Leads', icon: Users },
  { path: '/follow-ups', label: 'Follow-ups', icon: Bell },
  { path: '/visits', label: 'Visits', icon: MapPin },
  { path: '/projects', label: 'Projects', icon: Building2 },
];

export default function BottomTabBar() {
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'manager';

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 h-14 bg-card border-t border-white/[0.08] z-50 flex items-center justify-around px-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-colors',
                isActive ? 'text-p13-yellow' : 'text-muted-foreground'
              )
            }
          >
            <tab.icon size={20} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => setShowMore(!showMore)}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-colors',
            showMore ? 'text-p13-yellow' : 'text-muted-foreground'
          )}
        >
          <MoreHorizontal size={20} />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>

      {/* More Menu */}
      {showMore && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
          <div className="fixed bottom-16 left-2 right-2 bg-card dark:bg-[#1E293B] rounded-xl shadow-2xl border border-border dark:border-slate-700 z-50 overflow-hidden">
            {isAdmin && (
              <button onClick={() => { navigate('/admin/users'); setShowMore(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-muted/50 dark:hover:bg-white/5 transition-colors text-left">
                <Shield size={16} className="text-p13-yellow" />
                <span className="text-sm font-medium dark:text-foreground">Users</span>
              </button>
            )}
            {isAdmin && (
              <button onClick={() => { navigate('/master-database'); setShowMore(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-muted/50 dark:hover:bg-white/5 transition-colors text-left border-t border-border/50 dark:border-slate-700">
                <Settings size={16} className="text-p13-yellow" />
                <span className="text-sm font-medium dark:text-foreground">Master Database</span>
              </button>
            )}
            <button onClick={() => { navigate('/settings'); setShowMore(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-muted/50 dark:hover:bg-white/5 transition-colors text-left border-t border-border/50 dark:border-slate-700">
              <Settings size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium dark:text-foreground">Settings</span>
            </button>
            <button onClick={() => { navigate('/profile'); setShowMore(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-muted/50 dark:hover:bg-white/5 transition-colors text-left border-t border-border/50 dark:border-slate-700">
              <User size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium dark:text-foreground">Profile</span>
            </button>
            <button onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left border-t border-border/50 dark:border-slate-700">
              <LogOut size={16} className="text-red-500" />
              <span className="text-sm font-medium text-red-500">Logout</span>
            </button>
          </div>
        </>
      )}
    </>
  );
}
