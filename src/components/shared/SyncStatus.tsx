import { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { isSupabaseReady } from '@/lib/supabase';
import { useDataStore } from '@/stores/dataStore';

export function SyncStatus() {
  const [isOnline, setIsOnline] = useState(isSupabaseReady());
  const [isSyncing, setIsSyncing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const isLoading = useDataStore((s) => s.isLoading);

  useEffect(() => {
    const check = () => setIsOnline(isSupabaseReady());
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    try {
      await useDataStore.getState().syncFromSupabase();
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={handleSync}
        disabled={!isOnline || isSyncing}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
          isOnline
            ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
            : 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading || isSyncing ? (
          <RefreshCw className="w-3 h-3 animate-spin" />
        ) : isOnline ? (
          <Cloud className="w-3 h-3" />
        ) : (
          <CloudOff className="w-3 h-3" />
        )}
        <span className="hidden lg:inline">
          {isOnline ? 'Cloud' : 'Local'}
        </span>
      </button>

      {showTooltip && (
        <div className="absolute right-0 bottom-full mb-2 w-56 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs z-50">
          <p className="font-medium text-gray-900 dark:text-white mb-1">
            {isOnline ? 'Cloud Database Connected' : 'Local Storage Mode'}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            {isOnline
              ? 'Data syncs automatically to Supabase cloud database. Your data is backed up and accessible from any device.'
              : 'Data is stored in browser localStorage only. To enable cloud sync, add your Supabase API key in Vercel environment variables.'}
          </p>
          {isOnline && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="mt-2 flex items-center gap-1 text-p13-yellow hover:text-p13-gold transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync now
            </button>
          )}
        </div>
      )}
    </div>
  );
}
