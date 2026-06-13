import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRBACStore } from '@/stores/rbacStore';
import { cn } from '@/lib/utils';

export default function ImpersonationBanner() {
  const { isImpersonating, originalUser, exitImpersonation, user } = useAuthStore();
  const { endImpersonation } = useRBACStore();

  if (!isImpersonating || !originalUser || !user) return null;

  const handleExit = () => {
    // Clear RBAC-side impersonation state + write the audit log entry, then restore auth state
    endImpersonation(originalUser.id);
    exitImpersonation();
    window.location.reload();
  };

  return (
    <div className={cn(
      'w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2',
      'flex items-center justify-between gap-3 z-[60] relative'
    )}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-bold bg-white/20 px-1.5 py-0.5 rounded">IMPERSONATING</span>
        <p className="text-xs font-medium truncate">
          You are viewing as <span className="font-bold">{user.name}</span>
          <span className="opacity-70 hidden sm:inline"> ({user.role.replace('_', ' ')})</span>
        </p>
      </div>
      <button
        onClick={handleExit}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-md text-xs font-semibold transition-colors"
      >
        <LogOut size={12} />
        Exit View
      </button>
    </div>
  );
}
