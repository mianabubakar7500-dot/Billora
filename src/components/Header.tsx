import React from 'react';
import { useApp } from '../context/AppContext';
import { Store, Edit2, Bell, Settings, Monitor, Smartphone, RefreshCw } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    businessProfile,
    setIsProfileModalOpen,
    setIsPartySettingsModalOpen,
    setIsSyncModalOpen,
    viewMode,
    setViewMode,
    isSyncing,
    triggerSync,
  } = useApp();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-3 py-2.5 shadow-xs">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Company profile selector */}
        <div
          id="btn-header-profile"
          onClick={() => setIsProfileModalOpen(true)}
          className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 p-1.5 rounded-xl transition-all group flex-1 min-w-0"
        >
          <div className="w-10 h-10 rounded-full border-2 border-sky-400 bg-sky-50 flex items-center justify-center text-sky-600 shrink-0 shadow-xs">
            {businessProfile.logoUrl ? (
              <img
                src={businessProfile.logoUrl}
                alt="Logo"
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Store className="w-5 h-5 stroke-[2.2]" />
            )}
          </div>
          <div className="min-w-0 flex items-center gap-1.5">
            <span className="font-bold text-gray-800 text-[15px] sm:text-base truncate tracking-tight">
              {businessProfile.name || 'Enter Company Name...'}
            </span>
            <Edit2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500 shrink-0 transition-colors" />
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* View Mode Switcher (Cross-platform support) */}
          <button
            id="btn-switch-view-mode"
            onClick={() => setViewMode(viewMode === 'MOBILE' ? 'DESKTOP' : 'MOBILE')}
            title={viewMode === 'MOBILE' ? 'Switch to Laptop/Desktop ERP View' : 'Switch to Mobile App View'}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 transition-all shadow-xs"
          >
            {viewMode === 'MOBILE' ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Laptop Mode</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile Mode</span>
              </>
            )}
          </button>

          {/* Sync Button */}
          <button
            id="btn-quick-sync"
            onClick={() => {
              triggerSync();
              setIsSyncModalOpen(true);
            }}
            title="Cloud Data Sync"
            className="p-2 text-gray-600 hover:text-sky-600 hover:bg-gray-100 rounded-full transition-colors relative"
          >
            <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin text-sky-600' : ''}`} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Notification bell */}
          <button
            id="btn-notifications"
            onClick={() => setIsSyncModalOpen(true)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Settings cog */}
          <button
            id="btn-header-settings"
            onClick={() => setIsPartySettingsModalOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>
      </div>
    </header>
  );
};
