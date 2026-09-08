import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction, Party, Item, TransactionType } from '../types';
import {
  Home,
  Coins,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  Cloud,
  Plus,
  Printer,
  Share2,
  MoreVertical,
  Search,
  Filter,
  Download,
  Smartphone,
  Edit2,
  Trash2,
  ArrowRightLeft,
  Eye,
  AlertTriangle,
  FileSpreadsheet,
  Boxes,
  Clock,
  RefreshCw,
} from 'lucide-react';

export const DesktopERPView: React.FC = () => {
  const {
    transactions,
    parties,
    items,
    businessProfile,
    settings,
    setIsSaleModalOpen,
    setIsPartyModalOpen,
    setIsItemModalOpen,
    setIsPrintModalOpen,
    setIsProfileModalOpen,
    setIsPartySettingsModalOpen,
    setIsSyncModalOpen,
    setViewMode,
    deleteTransaction,
    convertQuotationToSale,
    triggerSync,
    isSyncing,
  } = useApp();

  const [desktopNav, setDesktopNav] = useState<'TRANSACTIONS' | 'ITEMS' | 'PARTIES' | 'REPORTS'>('TRANSACTIONS');
  const [txnFilter, setTxnFilter] = useState<'ALL' | 'SALE' | 'QUOTATION' | 'PURCHASE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut listener for F2 (Sale), F3 (Purchase), F4 (Item)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setIsSaleModalOpen(true, 'SALE');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setIsSaleModalOpen(true, 'PURCHASE');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setIsItemModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalSales = transactions
    .filter((t) => t.type === 'SALE')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalPurchases = transactions
    .filter((t) => t.type === 'PURCHASE')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalReceivable = parties
    .filter((p) => p.balanceType === 'to_receive')
    .reduce((sum, p) => sum + p.currentBalance, 0);

  const totalPayable = parties
    .filter((p) => p.balanceType === 'to_pay')
    .reduce((sum, p) => sum + p.currentBalance, 0);

  const totalStockValue = items.reduce((sum, i) => sum + i.stockQuantity * i.salePrice, 0);

  const filteredTxns = transactions.filter((t) => {
    const matchesFilter = txnFilter === 'ALL' || t.type === txnFilter;
    const matchesSearch =
      t.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f3f5f9] flex flex-col font-sans text-gray-800">
      {/* Top Application Ribbon (Vyapar Desktop Software Bar) */}
      <header className="bg-[#1e293b] text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-700 shadow-md">
        <div className="flex items-center gap-4">
          {/* Logo & Software Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#e52b44] to-amber-500 flex items-center justify-center font-black text-sm text-white shadow-xs">
              B
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight leading-tight flex items-center gap-1.5">
                <span>Billora Billing App</span>
                <span className="text-[10px] bg-red-600/80 text-white px-1.5 py-0.2 rounded font-semibold uppercase">
                  Vyapar Edition
                </span>
              </h1>
              <span className="text-[10px] text-slate-400">Desktop ERP & GST Billing Software</span>
            </div>
          </div>

          {/* Quick F-Keys Ribbon */}
          <div className="hidden lg:flex items-center gap-2 pl-6 border-l border-slate-700 text-xs">
            <button
              onClick={() => setIsSaleModalOpen(true, 'SALE')}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold shadow-xs transition-colors"
            >
              <span className="bg-red-800 text-[10px] px-1 rounded">F2</span>
              <span>+ Add Sale</span>
            </button>
            <button
              onClick={() => setIsSaleModalOpen(true, 'PURCHASE')}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded font-semibold transition-colors"
            >
              <span className="bg-slate-800 text-[10px] px-1 rounded">F3</span>
              <span>+ Add Purchase</span>
            </button>
            <button
              onClick={() => setIsItemModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded font-semibold transition-colors"
            >
              <span className="bg-slate-800 text-[10px] px-1 rounded">F4</span>
              <span>+ Add Item</span>
            </button>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {/* Sync status */}
          <button
            onClick={() => {
              triggerSync();
              setIsSyncModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3 py-1 rounded-full border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync: {settings.lastSyncTime || 'Online'}</span>
          </button>

          {/* Switch to Mobile View Toggle */}
          <button
            id="btn-switch-to-mobile"
            onClick={() => setViewMode('MOBILE')}
            className="flex items-center gap-1.5 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-full shadow-xs transition-all"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App View</span>
          </button>

          {/* Company Profile Avatar */}
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 pl-2 border-l border-slate-700"
          >
            <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center font-bold text-xs">
              {businessProfile.name ? businessProfile.name.charAt(0) : 'B'}
            </div>
            <span className="text-xs font-semibold hidden md:inline truncate max-w-[120px]">
              {businessProfile.name || 'Billora Store'}
            </span>
          </div>
        </div>
      </header>

      {/* Body: Left Sidebar + Main ERP Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 shadow-xs">
          <div className="p-3 space-y-1">
            <button
              onClick={() => setDesktopNav('TRANSACTIONS')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors ${
                desktopNav === 'TRANSACTIONS'
                  ? 'bg-red-50 text-[#e52b44] border border-red-200/80'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Sale & Invoices</span>
            </button>

            <button
              onClick={() => setDesktopNav('ITEMS')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors ${
                desktopNav === 'ITEMS'
                  ? 'bg-red-50 text-[#e52b44] border border-red-200/80'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Items & Inventory</span>
            </button>

            <button
              onClick={() => setDesktopNav('PARTIES')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors ${
                desktopNav === 'PARTIES'
                  ? 'bg-red-50 text-[#e52b44] border border-red-200/80'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Parties & Ledgers</span>
            </button>

            <button
              onClick={() => setDesktopNav('REPORTS')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors ${
                desktopNav === 'REPORTS'
                  ? 'bg-red-50 text-[#e52b44] border border-red-200/80'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Reports & Analytics</span>
            </button>
          </div>

          {/* Bottom Settings in Sidebar */}
          <div className="p-3 border-t border-gray-100 space-y-1">
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
            >
              <Cloud className="w-4 h-4 text-sky-600" />
              <span>Data Sync & Backup</span>
            </button>

            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
            >
              <Settings className="w-4 h-4 text-gray-500" />
              <span>Company Profile</span>
            </button>

            <button
              onClick={() => setIsPartySettingsModalOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
            >
              <Filter className="w-4 h-4 text-gray-500" />
              <span>GST & Tax Settings</span>
            </button>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top KPI Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase block">Total Sales</span>
              <span className="text-xl font-black text-gray-900">Rs {totalSales.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                {transactions.filter((t) => t.type === 'SALE').length} Invoices
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase block">Total Purchases</span>
              <span className="text-xl font-black text-gray-900">Rs {totalPurchases.toLocaleString()}</span>
              <span className="text-[10px] text-sky-600 font-semibold block mt-0.5">
                {transactions.filter((t) => t.type === 'PURCHASE').length} Bills
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase block">You'll Receive</span>
              <span className="text-xl font-black text-emerald-600">Rs {totalReceivable.toLocaleString()}</span>
              <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">Customer balance</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase block">You'll Pay</span>
              <span className="text-xl font-black text-rose-600">Rs {totalPayable.toLocaleString()}</span>
              <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">Supplier payables</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase block">Stock Valuation</span>
              <span className="text-xl font-black text-indigo-700">Rs {totalStockValue.toLocaleString()}</span>
              <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">{items.length} Products</span>
            </div>
          </div>

          {desktopNav === 'TRANSACTIONS' && (
            /* Transactions Data Grid */
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              {/* Table Action Header */}
              <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div className="flex bg-gray-200 p-0.5 rounded-xl text-xs font-bold">
                    {(['ALL', 'SALE', 'QUOTATION', 'PURCHASE'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setTxnFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          txnFilter === filter ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {filter === 'ALL' ? 'All Transactions' : filter}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search party or invoice..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 w-56"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSaleModalOpen(true, 'QUOTATION')}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Quotation</span>
                  </button>

                  <button
                    id="btn-desktop-add-sale"
                    onClick={() => setIsSaleModalOpen(true, 'SALE')}
                    className="px-4 py-2 bg-[#e52b44] hover:bg-[#d0243b] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ New Sale Invoice</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100/80 text-gray-600 font-bold border-b border-gray-200">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Party Name</th>
                      <th className="py-3 px-4">Txn Type</th>
                      <th className="py-3 px-4">Payment Mode</th>
                      <th className="py-3 px-4 text-right">Total Amount</th>
                      <th className="py-3 px-4 text-right">Balance Due</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTxns.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-gray-400">
                          No transactions found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredTxns.map((t) => (
                        <tr key={t.id} className="hover:bg-sky-50/40 transition-colors">
                          <td className="py-3 px-4 text-gray-500 font-medium">{t.date}</td>
                          <td className="py-3 px-4 font-bold text-gray-900">#{t.invoiceNo}</td>
                          <td className="py-3 px-4 font-bold text-gray-800">
                            {t.partyName}
                            {t.partyPhone && (
                              <span className="block text-[10px] text-gray-400 font-normal">{t.partyPhone}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                t.type === 'SALE'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : t.type === 'QUOTATION'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-sky-50 text-sky-700 border border-sky-200'
                              }`}
                            >
                              {t.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-600">{t.paymentMode}</td>
                          <td className="py-3 px-4 text-right font-black text-gray-900">
                            Rs {t.totalAmount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold">
                            <span className={t.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                              Rs {t.balanceDue.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                t.status === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : t.status === 'PARTIAL'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setIsSaleModalOpen(true, t.type, t)}
                                title="Edit Invoice"
                                className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-colors flex items-center gap-1 text-xs font-bold"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => setIsPrintModalOpen(true, t)}
                                title="Print Invoice"
                                className="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-gray-100 rounded-md"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              {t.type === 'QUOTATION' && !t.isQuotationConverted && (
                                <button
                                  onClick={() => convertQuotationToSale(t.id)}
                                  title="Convert to Sale"
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-bold text-[10px] flex items-center gap-1"
                                >
                                  <ArrowRightLeft className="w-3 h-3" />
                                  <span>Convert</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  if (confirm(`Delete transaction #${t.invoiceNo}?`)) {
                                    deleteTransaction(t.id);
                                  }
                                }}
                                title="Delete"
                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {desktopNav === 'ITEMS' && (
            /* Items Inventory Grid */
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Inventory Stock Catalog</h3>
                  <p className="text-xs text-gray-500">Manage products, stock quantity, prices and low stock limits</p>
                </div>
                <button
                  onClick={() => setIsItemModalOpen(true)}
                  className="px-4 py-2 bg-[#e52b44] hover:bg-[#d0243b] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Item</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {items.map((i) => (
                  <div key={i.id} className="p-4 rounded-xl border border-gray-200 hover:border-sky-400 transition-colors">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-sm text-gray-900">{i.name}</h4>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          i.stockQuantity <= i.minStockAlert
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {i.stockQuantity} {i.unit}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {i.category} • Code: {i.itemCode || 'N/A'}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t text-xs">
                      <span className="font-bold text-gray-800">Sale: Rs {i.salePrice}</span>
                      <span className="text-gray-500">Purchase: Rs {i.purchasePrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {desktopNav === 'PARTIES' && (
            /* Parties Grid */
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Customer & Supplier Directory</h3>
                  <p className="text-xs text-gray-500">Manage parties, ledgers, and contact numbers</p>
                </div>
                <button
                  onClick={() => setIsPartyModalOpen(true)}
                  className="px-4 py-2 bg-[#e52b44] hover:bg-[#d0243b] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Party</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {parties.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl border border-gray-200 hover:border-sky-400 transition-colors">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-sm text-gray-900">{p.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                        {p.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{p.phone}</p>
                    <p className="text-xs text-gray-400 truncate">{p.billingAddress || 'No address'}</p>
                    <div className="mt-3 pt-2 border-t flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-700">Balance:</span>
                      <span
                        className={`font-black ${
                          p.balanceType === 'to_receive' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        Rs {p.currentBalance.toLocaleString()}{' '}
                        <small className="text-[10px] font-normal">
                          ({p.balanceType === 'to_receive' ? "You'll Get" : "You'll Pay"})
                        </small>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {desktopNav === 'REPORTS' && (
            /* Reports Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-gray-800">Sales & Purchase Summary</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b">
                    <span>Total Sales Invoiced:</span>
                    <span className="font-bold text-gray-900">Rs {totalSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span>Total Purchases Billed:</span>
                    <span className="font-bold text-gray-900">Rs {totalPurchases.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span>Gross Profit / Margin:</span>
                    <span className="font-bold text-emerald-600">
                      Rs {(totalSales - totalPurchases).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-gray-800">Cash Flow & Outstanding</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b">
                    <span>Customer Receivables (Market Debt):</span>
                    <span className="font-bold text-emerald-600">Rs {totalReceivable.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span>Supplier Payables:</span>
                    <span className="font-bold text-rose-600">Rs {totalPayable.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span>Current Stock Asset Value:</span>
                    <span className="font-bold text-indigo-700">Rs {totalStockValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
