import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction, Party } from '../types';
import {
  Printer,
  Share2,
  MoreVertical,
  Plus,
  UserPlus,
  FileText,
  Settings,
  ChevronRight,
  Search,
  CheckCircle2,
  Trash2,
  ArrowRightLeft,
  Eye,
  Edit2,
} from 'lucide-react';

export const MobileHome: React.FC = () => {
  const {
    transactions,
    parties,
    homeSubTab,
    setHomeSubTab,
    setIsSaleModalOpen,
    setIsPartyModalOpen,
    setIsPrintModalOpen,
    setIsPartySettingsModalOpen,
    deleteTransaction,
    convertQuotationToSale,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuTxnId, setActiveMenuTxnId] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [selectedPartyForDetail, setSelectedPartyForDetail] = useState<Party | null>(null);

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.partyName.toLowerCase().includes(q) ||
      t.invoiceNo.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q)
    );
  });

  // Filter parties
  const filteredParties = parties.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q) ||
      (p.billingAddress && p.billingAddress.toLowerCase().includes(q))
    );
  });

  const handleShare = (txn: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `Billora Invoice #${txn.invoiceNo}\nParty: ${txn.partyName}\nAmount: Rs ${txn.totalAmount.toFixed(
      2
    )}\nBalance Due: Rs ${txn.balanceDue.toFixed(2)}\nThank you for doing business with us!`;

    if (navigator.share) {
      navigator.share({ title: `Invoice #${txn.invoiceNo}`, text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedNotification(`Invoice #${txn.invoiceNo} details copied to clipboard!`);
      setTimeout(() => setCopiedNotification(null), 2500);
    }
  };

  return (
    <div className="pb-28 pt-2 px-3 max-w-md mx-auto min-h-[calc(100vh-120px)]">
      {/* Copied notification alert */}
      {copiedNotification && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Top Segmented Tabs (Screenshots 1 & 3 exact replication) */}
      <div className="flex items-center justify-center gap-3 my-2">
        <button
          id="btn-tab-transaction-details"
          onClick={() => {
            setHomeSubTab('TRANSACTIONS');
            setSelectedPartyForDetail(null);
          }}
          className={`flex-1 py-2 px-3 text-center text-sm font-semibold rounded-full transition-all border ${
            homeSubTab === 'TRANSACTIONS'
              ? 'border-[#e52b44] text-[#e52b44] bg-white shadow-xs'
              : 'border-gray-300 text-gray-600 bg-white hover:border-gray-400'
          }`}
        >
          Transaction Details
        </button>
        <button
          id="btn-tab-party-details"
          onClick={() => {
            setHomeSubTab('PARTIES');
            setSelectedPartyForDetail(null);
          }}
          className={`flex-1 py-2 px-3 text-center text-sm font-semibold rounded-full transition-all border ${
            homeSubTab === 'PARTIES'
              ? 'border-[#e52b44] text-[#e52b44] bg-white shadow-xs'
              : 'border-gray-300 text-gray-600 bg-white hover:border-gray-400'
          }`}
        >
          Party Details
        </button>
      </div>

      {/* Search bar */}
      <div className="relative my-2">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={homeSubTab === 'TRANSACTIONS' ? 'Search by name, invoice no...' : 'Search party by name, phone...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9.5 pr-4 py-2 bg-white rounded-xl text-xs sm:text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Quick Links Card (Exact replication from screenshots 1 & 3) */}
      <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-xs mb-3">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Quick Links</h3>
          <span className="text-[10px] text-sky-600 font-medium">Fast Actions</span>
        </div>

        {homeSubTab === 'TRANSACTIONS' ? (
          <div className="grid grid-cols-4 gap-2 text-center">
            {/* Add Txn */}
            <div
              id="ql-add-txn"
              onClick={() => setIsSaleModalOpen(true, 'SALE')}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="w-12 h-11 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center text-[#e52b44] shadow-xs group-hover:bg-rose-100 transition-colors">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-semibold text-gray-700 mt-1.5 leading-tight">Add Txn</span>
            </div>

            {/* Sale Report */}
            <div
              id="ql-sale-report"
              onClick={() => {
                const totalSales = transactions
                  .filter((t) => t.type === 'SALE')
                  .reduce((sum, t) => sum + t.totalAmount, 0);
                alert(`Total Sales: Rs ${totalSales.toLocaleString()}\nTotal Invoices: ${transactions.filter(t => t.type === 'SALE').length}`);
              }}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="w-12 h-11 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-center text-sky-600 shadow-xs group-hover:bg-sky-100 transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-gray-700 mt-1.5 leading-tight">Sale Report</span>
            </div>

            {/* Txn Settings */}
            <div
              id="ql-txn-settings"
              onClick={() => setIsPartySettingsModalOpen(true)}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="w-12 h-11 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-center text-sky-600 shadow-xs group-hover:bg-sky-100 transition-colors">
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-gray-700 mt-1.5 leading-tight">Txn Settings</span>
            </div>

            {/* Show All */}
            <div
              id="ql-show-all-txn"
              onClick={() => setIsSaleModalOpen(true, 'QUOTATION')}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="w-12 h-11 bg-sky-100 border border-sky-200 rounded-full flex items-center justify-center text-sky-700 shadow-xs group-hover:bg-sky-200 transition-colors">
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-semibold text-gray-700 mt-1.5 leading-tight">Show All</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 text-center">
            {/* Import Party */}
            <div
              id="ql-import-party"
              onClick={() => setIsPartyModalOpen(true)}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="w-12 h-11 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-center text-sky-600 shadow-xs group-hover:bg-sky-100 transition-colors">
                <UserPlus className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-gray-700 mt-1.5 leading-tight">Import Party</span>
            </div>

            {/* Party Statement */}
            <div
              id="ql-party-statement"
              onClick={() => {
                if (parties.length > 0) setSelectedPartyForDetail(parties[0]);
              }}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="w-12 h-11 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-center text-sky-600 shadow-xs group-hover:bg-sky-100 transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-gray-700 mt-1.5 leading-tight">Party State...</span>
            </div>

            {/* Party Settings */}
            <div
              id="ql-party-settings"
              onClick={() => setIsPartySettingsModalOpen(true)}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="w-12 h-11 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-center text-sky-600 shadow-xs group-hover:bg-sky-100 transition-colors">
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-gray-700 mt-1.5 leading-tight">Party Settings</span>
            </div>

            {/* Show All */}
            <div
              id="ql-show-all-party"
              onClick={() => setIsPartyModalOpen(true)}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="w-12 h-11 bg-sky-100 border border-sky-200 rounded-full flex items-center justify-center text-sky-700 shadow-xs group-hover:bg-sky-200 transition-colors">
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-semibold text-gray-700 mt-1.5 leading-tight">Show All</span>
            </div>
          </div>
        )}
      </div>

      {/* Main List Section */}
      {homeSubTab === 'TRANSACTIONS' ? (
        <div className="space-y-2.5">
          {filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <p className="text-gray-500 text-sm">No transactions found</p>
              <button
                onClick={() => setIsSaleModalOpen(true, 'SALE')}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#e52b44] text-white text-xs font-semibold rounded-full"
              >
                <Plus className="w-4 h-4" /> Create First Sale
              </button>
            </div>
          ) : (
            filteredTransactions.map((txn) => {
              const isSale = txn.type === 'SALE';
              const isQuotation = txn.type === 'QUOTATION';
              const isPurchase = txn.type === 'PURCHASE';

              return (
                <div
                  key={txn.id}
                  id={`txn-card-${txn.id}`}
                  className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all relative"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">{txn.partyName}</h4>
                      <div className="mt-0.5">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            isSale
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : isQuotation
                              ? 'bg-amber-50 text-amber-600 border border-amber-200'
                              : isPurchase
                              ? 'bg-sky-50 text-sky-600 border border-sky-200'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {txn.type}
                        </span>
                        {txn.isQuotationConverted && (
                          <span className="ml-1 text-[9px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded border border-purple-200">
                            Converted
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-gray-500">#{txn.invoiceNo}</span>
                      <p className="text-[11px] text-gray-400 mt-0.5">{txn.date}</p>
                    </div>
                  </div>

                  {/* Middle row: Total and Balance (Screenshot 1 exact match) */}
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-[11px] text-gray-500 block">Total</span>
                        <span className="text-sm font-bold text-gray-800">
                          Rs {txn.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500 block">Balance</span>
                        <span
                          className={`text-sm font-bold ${
                            txn.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        >
                          Rs {txn.balanceDue.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons on card: Edit, Print, Share, 3 dots */}
                    <div className="flex items-center gap-1.5">
                      <button
                        id={`btn-edit-txn-${txn.id}`}
                        onClick={() => setIsSaleModalOpen(true, txn.type, txn)}
                        title="Edit Invoice"
                        className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 stroke-[2]" />
                      </button>

                      <button
                        id={`btn-print-txn-${txn.id}`}
                        onClick={() => setIsPrintModalOpen(true, txn)}
                        title="Print Invoice"
                        className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Printer className="w-4 h-4 stroke-[1.8]" />
                      </button>

                      <button
                        id={`btn-share-txn-${txn.id}`}
                        onClick={(e) => handleShare(txn, e)}
                        title="Share via WhatsApp / Clipboard"
                        className="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                      >
                        <Share2 className="w-4 h-4 stroke-[1.8]" />
                      </button>

                      <div className="relative">
                        <button
                          id={`btn-menu-txn-${txn.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuTxnId(activeMenuTxnId === txn.id ? null : txn.id);
                          }}
                          className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 stroke-[1.8]" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuTxnId === txn.id && (
                          <div className="absolute right-0 bottom-full mb-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-1 text-xs text-gray-700">
                            <button
                              onClick={() => {
                                setIsSaleModalOpen(true, txn.type, txn);
                                setActiveMenuTxnId(null);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-amber-50 text-amber-800 flex items-center gap-2 font-medium"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-amber-600" /> Edit Invoice
                            </button>

                            <button
                              onClick={() => {
                                setIsPrintModalOpen(true, txn);
                                setActiveMenuTxnId(null);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5 text-sky-600" /> View & Print
                            </button>

                            {txn.type === 'QUOTATION' && !txn.isQuotationConverted && (
                              <button
                                onClick={() => {
                                  convertQuotationToSale(txn.id);
                                  setActiveMenuTxnId(null);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-emerald-50 text-emerald-700 flex items-center gap-2 font-medium"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" /> Convert to Sale
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (confirm(`Delete transaction #${txn.invoiceNo}?`)) {
                                  deleteTransaction(txn.id);
                                }
                                setActiveMenuTxnId(null);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 border-t border-gray-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Party List Section (Screenshot 3 exact match) */
        <div className="space-y-2.5">
          {filteredParties.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <p className="text-gray-500 text-sm">No parties found</p>
              <button
                onClick={() => setIsPartyModalOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#e52b44] text-white text-xs font-semibold rounded-full"
              >
                <UserPlus className="w-4 h-4" /> Add New Party
              </button>
            </div>
          ) : (
            filteredParties.map((party) => {
              const isToReceive = party.balanceType === 'to_receive';
              return (
                <div
                  key={party.id}
                  id={`party-card-${party.id}`}
                  onClick={() => setSelectedPartyForDetail(party)}
                  className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{party.name}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">{party.createdAt || '05 Sep, 26'}</p>
                    <span className="text-[10px] text-gray-500 font-medium">{party.phone}</span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-base font-bold ${
                        isToReceive && party.currentBalance > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      Rs {party.currentBalance.toLocaleString()}
                    </span>
                    <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                      {isToReceive ? "You'll Get" : "You'll Pay"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Selected Party Detail Drawer / Modal */}
      {selectedPartyForDetail && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedPartyForDetail.name}</h3>
                <p className="text-xs text-gray-500">{selectedPartyForDetail.phone}</p>
              </div>
              <button
                onClick={() => setSelectedPartyForDetail(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-3 flex items-center justify-between bg-sky-50 rounded-xl p-3 my-3">
              <div>
                <span className="text-xs text-sky-800">Balance</span>
                <p className="text-lg font-bold text-emerald-700">
                  Rs {selectedPartyForDetail.currentBalance.toLocaleString()}
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                {selectedPartyForDetail.balanceType === 'to_receive' ? "You'll Get" : "You'll Pay"}
              </span>
            </div>

            <div className="space-y-2 text-xs text-gray-600">
              <p>
                <strong>Address:</strong> {selectedPartyForDetail.billingAddress || 'Not set'}
              </p>
              {selectedPartyForDetail.gstin && (
                <p>
                  <strong>GSTIN/TIN:</strong> {selectedPartyForDetail.gstin}
                </p>
              )}
            </div>

            <h4 className="font-bold text-xs text-gray-700 mt-4 mb-2">Transactions History</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {transactions
                .filter((t) => t.partyId === selectedPartyForDetail.id || t.partyName === selectedPartyForDetail.name)
                .map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setIsPrintModalOpen(true, t);
                    }}
                    className="p-2.5 border rounded-xl flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-gray-800">
                        #{t.invoiceNo} • {t.type}
                      </span>
                      <p className="text-[10px] text-gray-400">{t.date}</p>
                    </div>
                    <span className="font-bold text-xs text-gray-900">Rs {t.totalAmount.toFixed(2)}</span>
                  </div>
                ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setIsSaleModalOpen(true, 'SALE');
                  setSelectedPartyForDetail(null);
                }}
                className="flex-1 py-2.5 bg-[#e52b44] text-white rounded-xl text-xs font-bold"
              >
                + New Sale for {selectedPartyForDetail.name}
              </button>
              <button
                onClick={() => {
                  setIsPartyModalOpen(true, selectedPartyForDetail);
                  setSelectedPartyForDetail(null);
                }}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Red Pill Button (Screenshot 1 & 3 exact replication) */}
      <div className="fixed bottom-18 left-0 right-0 max-w-md mx-auto flex justify-center px-4 pointer-events-none z-20">
        {homeSubTab === 'TRANSACTIONS' ? (
          <button
            id="btn-add-new-sale"
            onClick={() => setIsSaleModalOpen(true, 'SALE')}
            className="pointer-events-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#e52b44] hover:bg-[#d0243b] text-white rounded-full font-bold text-sm shadow-xl active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Add New Sale</span>
          </button>
        ) : (
          <button
            id="btn-add-new-party"
            onClick={() => setIsPartyModalOpen(true)}
            className="pointer-events-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#e52b44] hover:bg-[#d0243b] text-white rounded-full font-bold text-sm shadow-xl active:scale-95 transition-all"
          >
            <UserPlus className="w-5 h-5 stroke-[2]" />
            <span>Add New Party</span>
          </button>
        )}
      </div>
    </div>
  );
};
