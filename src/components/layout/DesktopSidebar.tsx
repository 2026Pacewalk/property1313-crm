import { NavLink, useLocation } from 'react-router';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import ThemeToggle from '@/components/shared/ThemeToggle';
import {
  LayoutDashboard, Users, Bell, MapPin, Building2, FileText, Zap, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, UserCircle, MessageCircle, Shield, ClipboardList, Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInitials, getAvatarColor } from '@/data/mockData';

const allNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { path: '/leads', label: 'Leads', icon: Users, adminOnly: false },
  { path: '/follow-ups', label: 'Follow-ups', icon: Bell, adminOnly: false },
  { path: '/visits', label: 'Visits', icon: MapPin, adminOnly: false },
  { path: '/projects', label: 'Projects', icon: Building2, adminOnly: false },
  { path: '/loan-inquiry', label: 'Loan Inquiry', icon: FileText, adminOnly: false },
  { path: '/whatsapp-templates', label: 'WhatsApp', icon: MessageCircle, adminOnly: false },
  { path: '/automation', label: 'Automation', icon: Zap, adminOnly: false },
  { path: '/reports', label: 'Reports', icon: BarChart3, adminOnly: false },
  { path: '/admin/users', label: 'Users', icon: Shield, adminOnly: true },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList, adminOnly: true },
  { path: '/profile', label: 'Profile', icon: UserCircle, adminOnly: false },
  { path: '/settings', label: 'Settings', icon: Settings, adminOnly: false },
  { path: '/master-database', label: 'Master Database', icon: Database, adminOnly: true },
];

export default function DesktopSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const location = useLocation();

  // Filter nav items by role (admin-only items hidden from non-admins)
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'manager';
  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

  const initials = user ? getInitials(user.name) : 'U';
  const avatarColor = user ? getAvatarColor(user.name) : '#FBBD08';

  return (
    <aside
      className="fixed left-0 top-0 h-full bg-p13-black z-30 flex flex-col transition-all duration-300 border-r border-white/[0.06]"
      style={{ width: sidebarCollapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-white/[0.06]">
        {sidebarCollapsed ? (
          <span className="text-p13-yellow font-bold text-lg">P</span>
        ) : (
          <img src="/logo-website.png" alt="Property1313" className="h-6 w-auto" />
        )}
        <button
          onClick={toggleSidebar}
          className="ml-auto text-neutral-400 hover:text-white transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center h-10 px-4 transition-all duration-150 relative group',
                isActive
                  ? 'text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 h-full w-[3px] bg-p13-yellow rounded-r" />
              )}
              <item.icon
                size={18}
                className={cn(
                  'flex-shrink-0 transition-colors',
                  isActive ? 'text-p13-yellow' : 'text-neutral-400 group-hover:text-white'
                )}
              />
              {!sidebarCollapsed && (
                <span className="ml-3 text-xs font-medium truncate">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className={cn('px-3 py-2 border-t border-white/[0.06]',
        sidebarCollapsed && 'flex justify-center'
      )}>
        <ThemeToggle className={cn('w-full', sidebarCollapsed && 'w-9 h-9')} />
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors w-full rounded-lg hover:bg-red-500/10 py-2',
            sidebarCollapsed ? 'justify-center px-0' : 'px-3'
          )}
        >
          <LogOut size={18} />
          {!sidebarCollapsed && <span className="text-xs font-medium">Logout</span>}
        </button>
      </div>

      {/* User */}
      <div className="p-3 border-t border-white/[0.06]">
        <div
          className={cn(
            'flex items-center text-neutral-400 w-full',
            sidebarCollapsed ? 'justify-center' : 'px-2'
          )}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </div>
          {!sidebarCollapsed && (
            <div className="ml-2 flex-1 min-w-0 text-left">
              <p className="text-xs font-medium text-neutral-300 truncate">{user?.name}</p>
              <p className="text-[10px] text-neutral-500 capitalize truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
          )}
          {!sidebarCollapsed && <LogOut size={14} className="text-neutral-500" />}
        </div>
      </div>
    </aside>
  );
}
