import { Outlet, useLocation } from 'react-router';
import { useIsMobile } from '@/hooks/useMobile';
import { useUIStore } from '@/stores/uiStore';
import DesktopSidebar from './DesktopSidebar';
import TopNavBar from './TopNavBar';
import MobileHeader from './MobileHeader';
import BottomTabBar from './BottomTabBar';
import ImpersonationBanner from '@/components/shared/ImpersonationBanner';

export default function AppLayout() {
  const isMobile = useIsMobile();
  const { sidebarCollapsed } = useUIStore();
  const location = useLocation();

  const showMobileNav = isMobile;
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen bg-p13-white overflow-hidden">
      {!isMobile && <DesktopSidebar />}
      <div
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300"
        style={{ marginLeft: !isMobile ? (sidebarCollapsed ? 64 : 240) : 0 }}
      >
        <ImpersonationBanner />
        {isMobile ? (
          <MobileHeader title={pageTitle} />
        ) : (
          <TopNavBar title={pageTitle} />
        )}
        <main className="flex-1 overflow-y-auto scroll-momentum pb-20 md:pb-0">
          <Outlet />
        </main>
        {showMobileNav && <BottomTabBar />}
      </div>
    </div>
  );
}

function getPageTitle(path: string): string {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/dashboard': 'Dashboard',
    '/leads': 'Leads',
    '/follow-ups': 'Follow-ups',
    '/visits': 'Visits',
    '/projects': 'Projects',
    '/loan-inquiry': 'Loan Inquiry',
    '/whatsapp-templates': 'WhatsApp Templates',
    '/automation': 'Automation',
    '/reports': 'Reports',
    '/admin/users': 'User Management',
    '/admin/audit-logs': 'Audit Logs',
    '/master-database': 'Master Database',
    '/settings': 'Settings',
    '/notifications': 'Notifications',
  };
  return titles[path] || 'Property1313';
}
