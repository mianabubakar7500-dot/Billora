import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Printer,
  Share2,
  Download,
  ArrowLeft,
  Check,
  ExternalLink,
  Loader2,
  AlertCircle,
  Pencil,
  Smartphone,
  Monitor,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import {
  printInvoice,
  downloadInvoicePDF,
  openInvoiceInNewTab,
} from '../utils/invoicePrinter';

export const InvoicePrintModal: React.FC = () => {
  const {
    isPrintModalOpen,
    setIsPrintModalOpen,
    setIsSaleModalOpen,
    selectedTransactionForPrint: txn,
    businessProfile,
    updateTransaction,
    updateBusinessProfile,
  } = useApp();

  const [printFormat, setPrintFormat] = useState<'A4' | 'THERMAL'>('A4');
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'info' | 'success' | 'warning' } | null>(null);

  const [manualPhone, setManualPhone] = useState(txn?.businessPhone || businessProfile.phone1 || '');
  const [manualEmail, setManualEmail] = useState(txn?.businessEmail || businessProfile.email || '');
  const [manualAddress, setManualAddress] = useState(txn?.businessAddress || businessProfile.address || '');
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  // Mobile layout mode: 'FIT' (responsive mobile fit) or 'LAPTOP' (exact laptop 760px A4 sheet)
  const [mobileViewMode, setMobileViewMode] = useState<'FIT' | 'LAPTOP'>('FIT');
  const [laptopZoom, setLaptopZoom] = useState<number>(100);

  React.useEffect(() => {
    if (txn) {
      setManualPhone(txn.businessPhone || businessProfile.phone1 || '');
      setManualEmail(txn.businessEmail || businessProfile.email || '');
      setManualAddress(txn.businessAddress || businessProfile.address || '');
    }
  }, [txn, businessProfile]);

  if (!isPrintModalOpen || !txn) return null;

  const handleSaveDetails = (saveToProfile = false) => {
    if (txn) {
      const updatedTxn = {
        ...txn,
        businessPhone: manualPhone.trim(),
        businessEmail: manualEmail.trim(),
        businessAddress: manualAddress.trim(),
      };
      updateTransaction(updatedTxn);
      if (saveToProfile) {
        updateBusinessProfile({
          phone1: manualPhone.trim(),
          email: manualEmail.trim(),
          address: manualAddress.trim(),
        });
      }
      showNotification('Invoice details updated successfully!', 'success', 2500);
      setIsEditingDetails(false);
    }
  };

  const showNotification = (text: string, type: 'info' | 'success' | 'warning' = 'info', duration = 3500) => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, duration);
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    showNotification('Print dialog opening...', 'info', 2500);

    try {
      const result = await printInvoice({
        elementId: 'printable-invoice',
        format: printFormat,
        title: `${businessProfile.name || 'Invoice'} #${txn.invoiceNo}`,
      });
      if (result.success) {
        showNotification(result.message, 'success', 3000);
      }
    } catch (err) {
      console.error('Print trigger failed:', err);
      // Fallback directly
      window.print();
      showNotification('Opening browser print...', 'info', 2500);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    showNotification('Generating high-quality PDF...', 'info', 4000);

    try {
      const filename = `${txn.type}_${txn.invoiceNo}_${txn.partyName.replace(/[^a-zA-Z0-9]/g, '_')}`;
      await downloadInvoicePDF('printable-invoice', filename, printFormat);
      showNotification('PDF downloaded successfully! Check Downloads folder.', 'success', 4000);
    } catch (err) {
      console.error('PDF download failed:', err);
      showNotification('Failed to generate PDF automatically. You can use Print > Save as PDF.', 'warning', 4500);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleOpenInNewTab = () => {
    try {
      openInvoiceInNewTab({
        elementId: 'printable-invoice',
        format: printFormat,
        title: `${businessProfile.name || 'Invoice'} #${txn.invoiceNo}`,
      });
      showNotification('Invoice opened in new tab for direct printing!', 'success', 3500);
    } catch (err) {
      console.error('Open in tab failed:', err);
      window.print();
    }
  };

  const handleShareWhatsApp = () => {
    const text = `*${businessProfile.name}*
------------------------------
*Invoice No:* #${txn.invoiceNo}
*Date:* ${txn.date}
*Billed To:* ${txn.partyName}
------------------------------
*Items:*
${txn.items.map((i) => `• ${i.name} x ${i.quantity} ${i.unit} = Rs ${i.amount.toFixed(2)}`).join('\n')}
------------------------------
*Total Amount:* Rs ${txn.totalAmount.toFixed(2)}
*Amount Paid:* Rs ${txn.amountReceived.toFixed(2)}
*Balance Due:* Rs ${txn.balanceDue.toFixed(2)}
------------------------------
Bank: ${businessProfile.bankName || 'HBL Bank'}
Account: ${businessProfile.accountNumber || '1029384756'}
Phone: ${manualPhone || businessProfile.phone1}
Address: ${manualAddress || businessProfile.address}
Thank you for doing business with us!`;

    const encoded = encodeURIComponent(text);
    const phone = txn.partyPhone ? txn.partyPhone.replace(/\D/g, '') : '';
    const waUrl = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  const isSale = txn.type === 'SALE';
  const isQuotation = txn.type === 'QUOTATION';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-0 sm:p-4 overflow-y-auto print-container-parent">
      <div className="bg-white w-full max-w-4xl min-h-screen sm:min-h-0 sm:rounded-2xl shadow-2xl flex flex-col max-h-screen sm:max-h-[96vh] overflow-hidden">
        {/* Modal Top Control Bar (Hidden during print) */}
        <div className="no-print bg-gray-900 text-white sticky top-0 z-20 shadow-md">
          {/* Main Top Header: Title, Party info, Primary Print button */}
          <div className="px-3 sm:px-4 py-2.5 flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-colors shrink-0"
                title="Close Preview"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white truncate">Invoice Preview</h3>
                  <span className="hidden sm:inline-block px-2 py-0.5 bg-red-600/30 border border-red-500/40 text-red-300 text-[10px] font-bold rounded">
                    {txn.type}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 block truncate">
                  #{txn.invoiceNo} • {txn.partyName}
                </span>
              </div>
            </div>

            {/* Primary Print Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2 bg-[#e52b44] hover:bg-[#d0243b] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-60"
              >
                {isPrinting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Printer className="w-4 h-4" />
                )}
                <span>Print Invoice</span>
              </button>
            </div>
          </div>

          {/* Secondary Action Toolbar: Responsive Scrollable Pills */}
          <div className="px-3 sm:px-4 py-2 bg-gray-950 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            {/* Format toggle: A4 vs Thermal */}
            <div className="flex bg-gray-800 p-0.5 rounded-lg font-semibold shrink-0">
              <button
                onClick={() => setPrintFormat('A4')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  printFormat === 'A4' ? 'bg-sky-600 text-white shadow-xs font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                A4 Standard
              </button>
              <button
                onClick={() => setPrintFormat('THERMAL')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  printFormat === 'THERMAL' ? 'bg-sky-600 text-white shadow-xs font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                3" Thermal
              </button>
            </div>

            {/* Mobile View Toggle (Phone Fit vs Laptop A4 view) */}
            {printFormat === 'A4' && (
              <div className="flex items-center bg-gray-800 p-0.5 rounded-lg shrink-0">
                <button
                  onClick={() => {
                    setMobileViewMode('FIT');
                    setLaptopZoom(100);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                    mobileViewMode === 'FIT' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Optimized for Phone screen"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Phone View</span>
                </button>
                <button
                  onClick={() => {
                    setMobileViewMode('LAPTOP');
                    setLaptopZoom(100);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                    mobileViewMode === 'LAPTOP' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Exact 760px Laptop sheet layout"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Laptop View</span>
                </button>
              </div>
            )}

            {/* Laptop Zoom controls (when in LAPTOP mode) */}
            {printFormat === 'A4' && mobileViewMode === 'LAPTOP' && (
              <div className="flex items-center bg-gray-800 px-1.5 py-0.5 rounded-lg gap-1 shrink-0 text-[11px] text-gray-300">
                <button
                  onClick={() => setLaptopZoom((z) => Math.max(50, z - 15))}
                  className="p-1 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-1 font-bold text-gray-200">{laptopZoom}%</span>
                <button
                  onClick={() => setLaptopZoom((z) => Math.min(150, z + 15))}
                  className="p-1 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLaptopZoom(100)}
                  className="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-[10px] text-gray-200"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Download PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPDF}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-gray-200 rounded-lg font-bold transition-all shrink-0 border border-slate-700"
              title="Download as PDF"
            >
              {isDownloadingPDF ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-sky-400" />
              )}
              <span>PDF</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-lg font-bold transition-all shrink-0"
              title="Share via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Edit Invoice */}
            <button
              id="btn-edit-invoice-from-print"
              onClick={() => {
                setIsPrintModalOpen(false);
                setIsSaleModalOpen(true, txn.type, txn);
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-600/90 hover:bg-amber-600 text-white rounded-lg font-bold transition-all shrink-0"
              title="Edit Invoice"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            {/* Edit Contact Details (Phone, Email, Address) */}
            <button
              type="button"
              id="btn-toggle-manual-contact"
              onClick={() => setIsEditingDetails(!isEditingDetails)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all shrink-0 border ${
                isEditingDetails
                  ? 'bg-amber-500 text-gray-950 border-amber-400'
                  : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Edit Phone, Email and Office Address"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>{isEditingDetails ? 'Close Details' : 'Details'}</span>
            </button>

            {/* Open in New Tab */}
            <button
              onClick={handleOpenInNewTab}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all shrink-0"
              title="Open full page print in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Tab</span>
            </button>
          </div>
        </div>

        {/* Status Notification Bar */}
        {feedbackMsg && (
          <div
            className={`no-print px-4 py-2 text-xs font-medium flex items-center justify-between transition-all ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : feedbackMsg.type === 'warning'
                ? 'bg-amber-50 text-amber-800 border-b border-amber-200'
                : 'bg-sky-50 text-sky-800 border-b border-sky-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMsg.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-sky-600 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMsg(null)}
              className="text-gray-400 hover:text-gray-600 text-xs px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Collapsible Manual Details Editor */}
        {isEditingDetails && (
          <div className="no-print bg-slate-900 border-b border-slate-700 p-3.5 sm:p-4 text-white animate-fadeIn">
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                  <span>✏️</span>
                  <span>Invoice Contact Details (Phone, Email, Office Address)</span>
                </h4>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  GSTIN / TIN Removed
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Phone Number (Manual)</label>
                  <input
                    type="text"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="e.g. 03256181588"
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Email Address (Manual)</label>
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="e.g. support@example.com"
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Office Address (Manual)</label>
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="e.g. Shop #14, Commercial Market"
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSaveDetails(false)}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                >
                  Save for This Invoice
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveDetails(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                >
                  Save & Set as Default
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Printable Sheet Container */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-2 sm:p-6 bg-slate-200/80 flex justify-center items-start">
          {printFormat === 'A4' ? (
            /* A4 Full Tax Invoice - Rendered cleanly for Phone & Laptop */
            <div
              className={`transition-all duration-200 ${
                mobileViewMode === 'LAPTOP' ? 'overflow-x-auto flex justify-center w-full' : 'w-full flex justify-center'
              }`}
            >
              <div
                id="printable-invoice"
                style={
                  mobileViewMode === 'LAPTOP'
                    ? {
                        width: '760px',
                        minWidth: '760px',
                        transform: laptopZoom !== 100 ? `scale(${laptopZoom / 100})` : undefined,
                        transformOrigin: 'top center',
                        marginBottom: laptopZoom < 100 ? `-${(100 - laptopZoom) * 9}px` : undefined,
                      }
                    : undefined
                }
                className={`bg-white w-full max-w-[760px] p-4 sm:p-8 rounded-xl shadow-lg border border-gray-300/80 text-gray-800 text-xs min-h-[850px] flex flex-col justify-between transition-all`}
              >
                <div>
                  {/* Header Row: Company Title & Address on Left, Invoice Badge & Metadata on Right */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-red-600 pb-3.5 sm:pb-4 gap-3 sm:gap-4">
                    <div className="space-y-1 sm:max-w-[62%]">
                      <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                        {businessProfile.name &&
                        businessProfile.name.toLowerCase() !== 'billora store' &&
                        businessProfile.name.toLowerCase() !== 'billora traders'
                          ? businessProfile.name
                          : isQuotation
                          ? 'ESTIMATE / QUOTATION'
                          : 'TAX INVOICE'}
                      </h1>
                      {(manualAddress || businessProfile.address) && (
                        <p className="text-gray-600 font-medium leading-relaxed text-xs">
                          {manualAddress || businessProfile.address}
                        </p>
                      )}
                      {(manualPhone || businessProfile.phone1) && (
                        <p className="text-gray-600 text-xs">
                          <strong className="text-gray-800">Phone:</strong> {manualPhone || businessProfile.phone1}
                        </p>
                      )}
                      {(manualEmail || businessProfile.email) && (
                        <p className="text-gray-600 text-xs">
                          <strong className="text-gray-800">Email:</strong> {manualEmail || businessProfile.email}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-row sm:flex-col justify-between sm:justify-start items-start sm:items-end text-left sm:text-right bg-red-50/60 sm:bg-transparent p-2.5 sm:p-0 rounded-lg sm:rounded-none border sm:border-0 border-red-200/60">
                      <div>
                        <div className="inline-block px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded font-black text-xs sm:text-sm tracking-wider uppercase">
                          {isQuotation ? 'ESTIMATE / QUOTATION' : isSale ? 'TAX INVOICE' : txn.type}
                        </div>
                        <p className="text-[10px] text-gray-500 font-semibold block mt-0.5">ORIGINAL FOR RECIPIENT</p>
                      </div>
                      <div className="sm:pt-2 text-xs text-right sm:text-right">
                        <p className="font-bold text-gray-900">
                          Invoice No: <span className="text-red-600 font-black">#{txn.invoiceNo}</span>
                        </p>
                        <p className="text-gray-600">Date: {txn.date}</p>
                        <p className="text-gray-600">Mode: {txn.paymentMode}</p>
                      </div>
                    </div>
                  </div>

                  {/* Billed To / Party Details & Payment Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 py-3 sm:py-3.5 border-b border-gray-200 bg-gray-50/70 px-3.5 rounded-xl my-3 border border-gray-100">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Billed To (Customer):
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 mt-0.5">{txn.partyName}</h3>
                      {txn.partyPhone && <p className="text-gray-600 text-xs mt-0.5">Phone: {txn.partyPhone}</p>}
                    </div>
                    <div className="flex sm:flex-col sm:items-end justify-between sm:justify-start items-center">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Payment Status:
                      </span>
                      <div className="mt-0.5 sm:mt-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                            txn.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : txn.status === 'PARTIAL'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {txn.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items Table - Clean responsive layout with scroll container for mobile */}
                  <div className="overflow-x-auto -mx-1 sm:mx-0 my-3 rounded-lg border border-gray-200 sm:border-0">
                    <table className="w-full min-w-[500px] sm:min-w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-800 text-white text-[11px]">
                          <th className="py-2.5 px-3 rounded-l">#</th>
                          <th className="py-2.5 px-3">Item Description</th>
                          <th className="py-2.5 px-3 text-center">Qty</th>
                          <th className="py-2.5 px-3 text-right">Rate (Rs)</th>
                          <th className="py-2.5 px-3 text-center">Tax %</th>
                          <th className="py-2.5 px-3 text-right rounded-r">Amount (Rs)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-xs">
                        {txn.items.map((item, index) => (
                          <tr key={item.id || index} className="hover:bg-gray-50/80">
                            <td className="py-2 px-3 text-gray-500 font-medium">{index + 1}</td>
                            <td className="py-2 px-3 font-bold text-gray-900">{item.name}</td>
                            <td className="py-2 px-3 text-center font-semibold text-gray-800 whitespace-nowrap">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-800 whitespace-nowrap">
                              Rs {item.rate.toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-center text-gray-700 whitespace-nowrap">
                              {item.taxPercent || 0}%
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-gray-900 whitespace-nowrap">
                              Rs {item.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Subtotals & Grand Total Breakdown */}
                  <div className="flex justify-end pt-2">
                    <div className="w-full sm:w-72 space-y-1.5 text-xs bg-gray-50/70 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-gray-200">
                      <div className="flex justify-between py-1 border-b border-gray-200 text-gray-600">
                        <span>Sub Total:</span>
                        <span className="font-semibold">Rs {txn.subtotal.toFixed(2)}</span>
                      </div>

                      {txn.discountTotal > 0 && (
                        <div className="flex justify-between py-1 border-b border-gray-200 text-rose-600">
                          <span>Discount:</span>
                          <span className="font-semibold">- Rs {txn.discountTotal.toFixed(2)}</span>
                        </div>
                      )}

                      {txn.taxTotal > 0 && (
                        <div className="flex justify-between py-1 border-b border-gray-200 text-sky-700">
                          <span>GST / Taxes:</span>
                          <span className="font-semibold">+ Rs {txn.taxTotal.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex justify-between py-1.5 border-y-2 border-gray-900 font-black text-sm text-gray-900">
                        <span>Total:</span>
                        <span className="text-red-600">Rs {txn.totalAmount.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between py-1 text-gray-600">
                        <span>Received Amount:</span>
                        <span className="font-bold text-emerald-700">Rs {txn.amountReceived.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between py-1 font-bold text-gray-800 bg-amber-50 px-2 rounded border border-amber-200">
                        <span>Balance Due:</span>
                        <span className="text-amber-800 font-black">Rs {txn.balanceDue.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Section: Bank Details, Terms & Signatory */}
                <div className="pt-6 sm:pt-8 border-t border-gray-200 mt-6 sm:mt-8 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Bank & Payment Info */}
                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-[11px] space-y-1">
                      <span className="font-bold text-gray-800 uppercase tracking-wider block">
                        Bank Details & UPI
                      </span>
                      <p>
                        <strong className="text-gray-700">Bank:</strong> {businessProfile.bankName || 'HBL / Allied Bank'}
                      </p>
                      <p>
                        <strong className="text-gray-700">A/C No:</strong> {businessProfile.accountNumber || '1029384756'}
                      </p>
                      <p>
                        <strong className="text-gray-700">IFSC / Branch:</strong> {businessProfile.ifscCode || 'HBL001'}
                      </p>
                      <p>
                        <strong className="text-gray-700">UPI ID:</strong> {businessProfile.upiId || 'billora@bank'}
                      </p>
                    </div>

                    {/* Signatory */}
                    <div className="flex flex-col justify-end items-center sm:items-end text-center pt-2 sm:pt-0">
                      {businessProfile.signatureUrl ? (
                        <img
                          src={businessProfile.signatureUrl}
                          alt="Signature"
                          className="max-h-14 object-contain mb-1"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="h-10 sm:h-14"></div>
                      )}
                      <div className="w-52 border-t border-gray-400 pt-1 text-center">
                        <span className="font-bold text-gray-900 block text-xs">{businessProfile.name}</span>
                        <span className="text-[10px] text-gray-500">Authorized Signatory</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="text-[10px] text-gray-500 pt-2 border-t border-gray-100">
                    <span className="font-bold text-gray-700">Terms & Conditions:</span>
                    <p className="whitespace-pre-line leading-relaxed mt-0.5">{businessProfile.terms}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 3-Inch Thermal Receipt Format */
            <div
              id="printable-invoice"
              className="bg-white w-[320px] p-4 rounded-xl shadow-lg border border-gray-300 font-mono text-[11px] leading-tight flex flex-col justify-between my-auto"
            >
              <div className="text-center space-y-1 border-b border-dashed border-gray-400 pb-2">
                {businessProfile.name &&
                  businessProfile.name.toLowerCase() !== 'billora store' &&
                  businessProfile.name.toLowerCase() !== 'billora traders' && (
                    <h2 className="text-base font-black uppercase tracking-wider">{businessProfile.name}</h2>
                  )}
                {(manualAddress || businessProfile.address) && (
                  <p>{manualAddress || businessProfile.address}</p>
                )}
                {(manualPhone || businessProfile.phone1) && (
                  <p>Phone: {manualPhone || businessProfile.phone1}</p>
                )}
                {(manualEmail || businessProfile.email) && (
                  <p>Email: {manualEmail || businessProfile.email}</p>
                )}
                <p className="font-bold text-xs uppercase pt-1">
                  *** {isQuotation ? 'ESTIMATE / QUOTATION' : 'CASH / TAX INVOICE'} ***
                </p>
              </div>

              <div className="py-2 border-b border-dashed border-gray-400 space-y-0.5">
                <p>Invoice: #{txn.invoiceNo}</p>
                <p>Date: {txn.date}</p>
                <p>Customer: {txn.partyName}</p>
                <p>Phone: {txn.partyPhone || '-'}</p>
              </div>

              <table className="w-full text-left my-2">
                <thead>
                  <tr className="border-b border-gray-400">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Price</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashed divide-gray-300">
                  {txn.items.map((i, idx) => (
                    <tr key={idx}>
                      <td className="py-1 font-semibold">{i.name}</td>
                      <td className="py-1 text-center">{i.quantity}</td>
                      <td className="py-1 text-right">{i.rate}</td>
                      <td className="py-1 text-right font-bold">{i.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-dashed border-gray-400 pt-1 space-y-1 text-right">
                <p>Subtotal: Rs {txn.subtotal.toFixed(2)}</p>
                {txn.discountTotal > 0 && <p>Discount: -Rs {txn.discountTotal.toFixed(2)}</p>}
                <p className="text-sm font-black">TOTAL: Rs {txn.totalAmount.toFixed(2)}</p>
                <p>Received: Rs {txn.amountReceived.toFixed(2)}</p>
                <p className="font-bold">Balance: Rs {txn.balanceDue.toFixed(2)}</p>
              </div>

              <div className="text-center pt-4 border-t border-dashed border-gray-400 mt-3 space-y-1">
                <p className="font-bold">THANK YOU FOR YOUR VISIT!</p>
                <p className="text-[9px] text-gray-400">Computer Generated Invoice</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
