import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Cloud,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  Smartphone,
  Monitor,
  Database,
  RotateCcw,
  Wifi,
} from 'lucide-react';

export const DataSyncModal: React.FC = () => {
  const {
    isSyncModalOpen,
    setIsSyncModalOpen,
    settings,
    updateSettings,
    triggerSync,
    isSyncing,
    exportDataJSON,
    importDataJSON,
    resetAllData,
    transactions,
    parties,
    items,
  } = useApp();

  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  if (!isSyncModalOpen) return null;

  const handleManualSync = async () => {
    const ok = await triggerSync();
    if (ok) {
      setSyncSuccessMsg('All invoices, inventory & party records synchronized successfully!');
      setTimeout(() => setSyncSuccessMsg(null), 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const success = importDataJSON(text);
        if (success) {
          alert('Backup data successfully restored!');
          setIsSyncModalOpen(false);
        } else {
          alert('Failed to parse backup file. Please ensure it is a valid Billora JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl flex flex-col max-h-screen sm:max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSyncModalOpen(false)}
              className="p-1 text-gray-700 hover:text-gray-900 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <h2 className="text-base font-bold text-gray-900">Data Sync & Backup</h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Wifi className="w-3.5 h-3.5" /> Online
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Sync Status Banner */}
          <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white p-4 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                <span className="font-bold text-sm">Vyapar Auto Sync Engine</span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
                Real-time
              </span>
            </div>

            <p className="text-sky-100 leading-relaxed text-[11px]">
              Your billing records, stock levels, and party ledgers are safely synchronized across your
              Mobile and Laptop.
            </p>

            <div className="flex items-center justify-between pt-1 text-[11px] text-sky-200">
              <span>Last Synced:</span>
              <span className="font-bold text-white">{settings.lastSyncTime || 'Just now'}</span>
            </div>

            <button
              id="btn-trigger-sync-now"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="w-full py-2.5 bg-white text-blue-800 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-sky-50 active:scale-98 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
              <span>{isSyncing ? 'Synchronizing records...' : 'Sync Now'}</span>
            </button>
          </div>

          {syncSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncSuccessMsg}</span>
            </div>
          )}

          {/* Cross-Platform Device Pairing Simulation */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-2.5">
            <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
              Connected Devices
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-5 h-5 text-sky-600" />
                  <div>
                    <span className="font-bold text-gray-900 block">Mobile Phone</span>
                    <span className="text-[10px] text-gray-400">Current Device • Active</span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Synced
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center gap-2.5">
                  <Monitor className="w-5 h-5 text-indigo-600" />
                  <div>
                    <span className="font-bold text-gray-900 block">Laptop / Desktop ERP</span>
                    <span className="text-[10px] text-gray-400">Windows / Mac • Ready</span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Paired
                </span>
              </div>
            </div>
          </div>

          {/* Local Backup & Restore */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-3">
            <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
              Backup & Restore
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={exportDataJSON}
                className="p-3 bg-white border border-gray-200 hover:border-sky-500 rounded-xl flex flex-col items-center justify-center gap-1.5 group transition-colors"
              >
                <Download className="w-5 h-5 text-sky-600 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-gray-800">Export Backup</span>
                <span className="text-[10px] text-gray-400">Save JSON file</span>
              </button>

              <label className="p-3 bg-white border border-gray-200 hover:border-sky-500 rounded-xl flex flex-col items-center justify-center gap-1.5 group transition-colors cursor-pointer">
                <Upload className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-gray-800">Restore Backup</span>
                <span className="text-[10px] text-gray-400">Load JSON file</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div className="text-[11px] text-gray-500 text-center">
              Current database: <strong>{transactions.length}</strong> transactions,{' '}
              <strong>{items.length}</strong> items, <strong>{parties.length}</strong> parties.
            </div>
          </div>

          {/* Reset button */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (
                  confirm(
                    'Reset to default sample data? This will restore initial Ali party, sample stock, and invoices.'
                  )
                ) {
                  resetAllData();
                  alert('Reset successfully to default Vyapar dataset!');
                  setIsSyncModalOpen(false);
                }
              }}
              className="w-full py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default Vyapar Sample Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
