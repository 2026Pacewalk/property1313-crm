import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useIsMobile } from '@/hooks/useMobile';
import { useUIStore } from '@/stores/uiStore';
import DesktopSidebar from './DesktopSidebar';
import TopNavBar from './TopNavBar';
import MobileHeader from './MobileHeader';
import BottomTabBar from './BottomTabBar';
import ImpersonationBanner from '@/components/shared/ImpersonationBanner';
import Login from '@/pages/Login';
import { cn } from '@/lib/utils';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/leads': 'Leads',
  '/projects': 'Projects',
  '/visits': 'Visits',
  '/follow-ups': 'Follow-ups',
  '/loan-inquiry': 'Loan',
  '/whatsapp-templates': 'WhatsApp',
  '/automation': 'Automation',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/notifications': 'Notifications',
  '/profile': 'Profile',
  '/master-database': 'Master DB',
  '/admin/users': 'Users',
  '/admin/audit-logs': 'Audit',
};

function getPageTitle(path: string): string {
  if (pageTitles[path]) return pageTitles[path];
  if (path.startsWith('/leads/')) return 'Lead Details';
  if (path.startsWith('/projects/') && path.endsWith('/edit')) return 'Edit Project';
  if (path.startsWith('/project/')) return 'Project';
  return 'Property1313';
}

export default function AppLayout() {
  const isMobile = useIsMobile();
  const { sidebarCollapsed } = useUIStore();
  const { user, isAuthenticated } = useAuthStore();
  const { init: initTheme } = useThemeStore();
  const location = useLocation();

  useEffect(() => { initTheme(); }, []);

  // Redirect to login if not authenticated
  if (!user || !isAuthenticated) {
    return <Login />;
  }

  const showMobileNav = isMobile;
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="flex h-[100dvh] bg-background text-foreground overflow-hidden transition-colors duration-200">
      {/* Desktop Sidebar */}
      {!isMobile && <DesktopSidebar />}

      {/* Main Content */}
      <div
        className={cn(
          'flex-1 flex flex-col overflow-hidden transition-all duration-300',
          !isMobile && (sidebarCollapsed ? 'ml-16' : 'ml-60')
        )}
      >
        <ImpersonationBanner />

        {isMobile ? (
          <MobileHeader title={pageTitle} />
        ) : (
          <TopNavBar title={pageTitle} />
        )}

        <main className={cn('flex-1 overflow-y-auto scroll-momentum', isMobile && 'pb-20')}>
          <Outlet />
        </main>

        {showMobileNav && <BottomTabBar />}
      </div>
    </div>
  );
}
