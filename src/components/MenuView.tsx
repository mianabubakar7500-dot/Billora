import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Coins,
  ShoppingCart,
  Receipt,
  Store,
  BarChart3,
  Building2,
  Wallet,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Monitor,
  Cloud,
  UserCircle2,
  FileCheck2,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

export const MenuView: React.FC = () => {
  const {
    setIsSaleModalOpen,
    setIsProfileModalOpen,
    setIsPartySettingsModalOpen,
    setIsSyncModalOpen,
    setViewMode,
    setActiveTab,
    transactions,
  } = useApp();

  const [expandedSection, setExpandedSection] = useState<string | null>('sale');

  const toggleSection = (sec: string) => {
    setExpandedSection(expandedSection === sec ? null : sec);
  };

  const salesCount = transactions.filter((t) => t.type === 'SALE').length;
  const quotationCount = transactions.filter((t) => t.type === 'QUOTATION').length;
  const purchaseCount = transactions.filter((t) => t.type === 'PURCHASE').length;

  return (
    <div className="pb-28 pt-2 px-3 max-w-md mx-auto min-h-[calc(100vh-120px)] space-y-3">
      {/* Top Banner: "Join 10,000+ Store Owners Already Using Our Desktop App" (Screenshot 4 exact replication) */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between relative overflow-hidden shadow-xs">
        <div className="z-10 max-w-[62%]">
          <h3 className="font-bold text-gray-900 text-sm leading-snug">
            Join 10,000+ Store Owners Already Using Our Desktop App
          </h3>
          <button
            id="btn-try-desktop-free"
            onClick={() => setViewMode('DESKTOP')}
            className="mt-2.5 px-4 py-1.5 bg-[#e52b44] hover:bg-[#d0243b] text-white text-xs font-bold rounded-full shadow-sm active:scale-95 transition-all"
          >
            Try for Free
          </button>
        </div>

        {/* Desktop Monitor illustration */}
        <div className="w-24 h-20 bg-white border-2 border-gray-800 rounded-lg shadow-md flex flex-col items-center justify-center relative p-1 z-10">
          <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded">
            {/* Red & yellow Vyapar-styled logo mark */}
            <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-black text-xs shadow-xs">
              B
            </div>
          </div>
          {/* Monitor stand */}
          <div className="absolute -bottom-2 w-5 h-2 bg-gray-800"></div>
          <div className="absolute -bottom-3 w-10 h-1 bg-gray-800 rounded-full"></div>
        </div>
        {/* Soft yellow decorative circle in background */}
        <div className="absolute -right-4 -bottom-6 w-32 h-32 bg-amber-200/40 rounded-full pointer-events-none"></div>
      </div>

      {/* Business Profile Shortcut Card */}
      <div
        id="btn-menu-business-profile"
        onClick={() => setIsProfileModalOpen(true)}
        className="bg-white rounded-2xl p-3.5 border border-gray-200/80 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-[#e52b44] flex items-center justify-center">
            <UserCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Business Profile & Visiting Card</h4>
            <p className="text-xs text-gray-500">Edit business details, logo, signature</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>

      {/* My Business Section (Screenshot 4 exact match) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">My Business</h4>
        </div>

        <div className="divide-y divide-gray-100">
          {/* Sale */}
          <div>
            <div
              id="menu-item-sale"
              onClick={() => toggleSection('sale')}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="text-sky-600">
                  <Coins className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-sm font-semibold text-gray-800">Sale</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">{salesCount} bills</span>
                {expandedSection === 'sale' ? (
                  <ChevronDown className="w-4 h-4 text-sky-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-sky-600" />
                )}
              </div>
            </div>

            {/* Sub-menu items for Sale */}
            {expandedSection === 'sale' && (
              <div className="bg-sky-50/40 px-4 py-2 space-y-1.5 pl-12 text-xs">
                <button
                  onClick={() => setIsSaleModalOpen(true, 'SALE')}
                  className="w-full text-left py-1.5 text-gray-700 hover:text-sky-600 flex items-center justify-between font-medium"
                >
                  <span>+ Sale Invoices</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {salesCount}
                  </span>
                </button>
                <button
                  onClick={() => setIsSaleModalOpen(true, 'QUOTATION')}
                  className="w-full text-left py-1.5 text-gray-700 hover:text-sky-600 flex items-center justify-between font-medium"
                >
                  <span>+ Estimate / Quotation</span>
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {quotationCount}
                  </span>
                </button>
                <button
                  onClick={() => setIsSaleModalOpen(true, 'PAYMENT_IN')}
                  className="w-full text-left py-1.5 text-gray-700 hover:text-sky-600 flex items-center justify-between font-medium"
                >
                  <span>+ Payment-In (Receipt)</span>
                  <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                </button>
              </div>
            )}
          </div>

          {/* Purchase */}
          <div>
            <div
              id="menu-item-purchase"
              onClick={() => toggleSection('purchase')}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="text-sky-600">
                  <ShoppingCart className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-sm font-semibold text-gray-800">Purchase</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">{purchaseCount} bills</span>
                {expandedSection === 'purchase' ? (
                  <ChevronDown className="w-4 h-4 text-sky-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-sky-600" />
                )}
              </div>
            </div>

            {expandedSection === 'purchase' && (
              <div className="bg-sky-50/40 px-4 py-2 space-y-1.5 pl-12 text-xs">
                <button
                  onClick={() => setIsSaleModalOpen(true, 'PURCHASE')}
                  className="w-full text-left py-1.5 text-gray-700 hover:text-sky-600 flex items-center justify-between font-medium"
                >
                  <span>+ Purchase Bill</span>
                  <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {purchaseCount}
                  </span>
                </button>
                <button
                  onClick={() => setIsSaleModalOpen(true, 'PAYMENT_OUT')}
                  className="w-full text-left py-1.5 text-gray-700 hover:text-sky-600 flex items-center justify-between font-medium"
                >
                  <span>+ Payment-Out</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                </button>
              </div>
            )}
          </div>

          {/* Expenses */}
          <div
            id="menu-item-expenses"
            onClick={() => setIsSaleModalOpen(true, 'EXPENSE')}
            className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-sky-600">
                <Receipt className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Expenses</span>
            </div>
            <ChevronRight className="w-4 h-4 text-sky-600" />
          </div>

          {/* My Online Store */}
          <div
            id="menu-item-online-store"
            onClick={() => alert('Online Store: Your catalog is synchronized and ready to share on WhatsApp!')}
            className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-sky-600">
                <Store className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-sm font-semibold text-gray-800">My Online Store</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>

          {/* Reports */}
          <div
            id="menu-item-reports"
            onClick={() => setActiveTab('DASHBOARD')}
            className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-sky-600">
                <BarChart3 className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Reports</span>
            </div>
            <ChevronRight className="w-4 h-4 text-sky-600" />
          </div>
        </div>
      </div>

      {/* Cash & Bank Section (Screenshot 4 exact match) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Cash & Bank</h4>
        </div>

        <div className="divide-y divide-gray-100">
          <div
            onClick={() => alert('Bank Accounts: HBL Main Branch Balance: Rs 24,500.00')}
            className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-sky-600">
                <Building2 className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Bank Accounts</span>
            </div>
            <ChevronRight className="w-4 h-4 text-sky-600" />
          </div>

          <div
            onClick={() => alert('Cash In-Hand: Rs 15,200.00')}
            className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-sky-600">
                <Wallet className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Cash In-Hand</span>
            </div>
            <ChevronRight className="w-4 h-4 text-sky-600" />
          </div>

          <div
            onClick={() => alert('Cheques: 0 pending cheques')}
            className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-sky-600">
                <CreditCard className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Cheques</span>
            </div>
            <ChevronRight className="w-4 h-4 text-sky-600" />
          </div>
        </div>
      </div>

      {/* Cloud Sync & Cross Platform */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Sync & Settings</h4>
        </div>

        <div className="divide-y divide-gray-100">
          <div
            id="menu-cloud-sync"
            onClick={() => setIsSyncModalOpen(true)}
            className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-sky-600">
                <Cloud className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-800 block">Backup & Data Sync</span>
                <span className="text-[11px] text-gray-500">Auto-sync mobile & laptop</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-sky-600" />
          </div>

          <div
            onClick={() => setViewMode('DESKTOP')}
            className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-sky-600">
                <Monitor className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-800 block">Desktop ERP Mode</span>
                <span className="text-[11px] text-gray-500">Full screen laptop accounting</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-sky-600" />
          </div>

          <div
            onClick={() => setIsPartySettingsModalOpen(true)}
            className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-sky-600">
                <FileCheck2 className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Taxes, GST & Party Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-sky-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
