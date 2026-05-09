import { useLocation, Link } from 'react-router';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard, Users, Bell, MapPin, Building2,
  FileText, Zap, BarChart3, Settings, LogOut,
  ChevronLeft, ChevronRight, UserCircle, MessageCircle,
  Shield, ClipboardList, Database,
} from 'lucide-react';
import { getInitials, getAvatarColor } from '@/data/mockData';

interface NavItem { path: string; label: string; icon: React.ElementType; adminOnly?: boolean; }

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/leads', label: 'Leads', icon: Users },
  { path: '/follow-ups', label: 'Follow-ups', icon: Bell },
  { path: '/visits', label: 'Visits', icon: MapPin },
  { path: '/projects', label: 'Projects', icon: Building2 },
  { path: '/loan-inquiry', label: 'Loan', icon: FileText },
  { path: '/whatsapp-templates', label: 'WhatsApp', icon: MessageCircle },
  { path: '/automation', label: 'Automation', icon: Zap },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: UserCircle },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const adminItems: NavItem[] = [
  { path: '/admin/users', label: 'Users', icon: Shield, adminOnly: true },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList, adminOnly: true },
  { path: '/master-database', label: 'Master Database', icon: Database, adminOnly: true },
];

export default function DesktopSidebar() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'manager';
  const initials = user ? getInitials(user.name) : 'U';
  const avatarColor = user ? getAvatarColor(user.name) : '#FBBD08';

  return (
    <aside className={cn(
      'bg-sidebar text-sidebar-foreground h-[100dvh] flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 border-r',
      'border-sidebar-border',
      sidebarCollapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border flex-shrink-0">
        {!sidebarCollapsed && (
          <img src="/logo-website.png" alt="Property1313" className="h-7 w-auto" />
        )}
        {sidebarCollapsed && (
          <img src="/logo-icon.png" alt="P1313" className="h-8 w-auto mx-auto" />
        )}
        <button
          onClick={toggleSidebar}
          className={cn('text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors p-1 rounded-md hover:bg-sidebar-accent', sidebarCollapsed && 'mx-auto')}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg transition-all duration-150',
                sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
                isActive
                  ? 'bg-p13-yellow/10 text-p13-yellow font-medium border-l-2 border-p13-yellow'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground border-l-2 border-transparent'
              )}
            >
              <item.icon size={18} />
              {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}

        {/* Admin Items */}
        {isAdmin && (
          <>
            {!sidebarCollapsed && (
              <div className="pt-4 pb-1 px-3">
                <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider">Admin</p>
              </div>
            )}
            {sidebarCollapsed && <div className="my-2 mx-4 h-px bg-sidebar-border" />}
            {adminItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 rounded-lg transition-all duration-150',
                    sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
                    isActive
                      ? 'bg-p13-yellow/10 text-p13-yellow font-medium border-l-2 border-p13-yellow'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground border-l-2 border-transparent'
                  )}
                >
                  <item.icon size={18} />
                  {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-sidebar-border flex-shrink-0">
        <div className={cn('flex items-center', sidebarCollapsed ? 'justify-center' : 'gap-3 px-1')}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.name}</p>
              <p className="text-[10px] text-sidebar-foreground/50 capitalize truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="text-sidebar-foreground/40 hover:text-red-500 transition-colors p-1"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
