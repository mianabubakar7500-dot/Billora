import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { MobileHome } from './components/MobileHome';
import { ItemsView } from './components/ItemsView';
import { DashboardView } from './components/DashboardView';
import { MenuView } from './components/MenuView';
import { DesktopERPView } from './components/DesktopERPView';
import { SaleInvoiceModal } from './components/SaleInvoiceModal';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { PartyModal } from './components/PartyModal';
import { BusinessProfileModal } from './components/BusinessProfileModal';
import { PartySettingsModal } from './components/PartySettingsModal';
import { DataSyncModal } from './components/DataSyncModal';

const MainLayout: React.FC = () => {
  const { viewMode, activeTab } = useApp();

  return (
    <div className="min-h-screen bg-[#f5f6fa] text-gray-900 flex flex-col font-sans selection:bg-red-100 selection:text-red-700">
      {viewMode === 'DESKTOP' ? (
        /* Laptop / Desktop ERP software view */
        <DesktopERPView />
      ) : (
        /* Mobile App identical to Vyapar Mobile */
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-[#f8f9fc] min-h-screen relative shadow-2xl border-x border-gray-200">
          <Header />

          <main className="flex-1 overflow-y-auto">
            {activeTab === 'HOME' && <MobileHome />}
            {activeTab === 'DASHBOARD' && <DashboardView />}
            {activeTab === 'ITEMS' && <ItemsView />}
            {activeTab === 'MENU' && <MenuView />}
          </main>

          <BottomNav />
        </div>
      )}

      {/* Global Modals */}
      <SaleInvoiceModal />
      <InvoicePrintModal />
      <PartyModal />
      <BusinessProfileModal />
      <PartySettingsModal />
      <DataSyncModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
