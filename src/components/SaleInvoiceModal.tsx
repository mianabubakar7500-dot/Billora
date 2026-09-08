import React, { useState, useEffect, useRef } from 'react';
import { useApp, STORAGE_KEY_INVOICE_DRAFT } from '../context/AppContext';
import { TransactionItem, PaymentMode, TransactionType, Party } from '../types';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  CreditCard,
  Printer,
  Save,
  CheckCircle2,
  Percent,
  Pencil,
  RotateCcw,
  Search,
  User,
  Phone,
  Clock,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

const STORAGE_KEY_LAST_CUSTOMER = 'billora_last_customer_v1';

export const SaleInvoiceModal: React.FC = () => {
  const {
    isSaleModalOpen,
    saleModalType,
    setIsSaleModalOpen,
    editingTransaction,
    updateTransaction,
    parties,
    items: stockItems,
    addTransaction,
    addParty,
    setIsPrintModalOpen,
    transactions,
    setIsPartyModalOpen,
    setIsItemModalOpen,
  } = useApp();

  const isQuotation = saleModalType === 'QUOTATION';
  const isPurchase = saleModalType === 'PURCHASE';
  const isExpense = saleModalType === 'EXPENSE';
  const isEditing = Boolean(editingTransaction);

  // Invoice number calculation
  const defaultInvoiceNo = isQuotation
    ? `QT-${100 + transactions.filter((t) => t.type === 'QUOTATION').length + 1}`
    : isPurchase
    ? `PB-${200 + transactions.filter((t) => t.type === 'PURCHASE').length + 1}`
    : isExpense
    ? `EXP-${300 + transactions.filter((t) => t.type === 'EXPENSE').length + 1}`
    : `${transactions.filter((t) => t.type === 'SALE').length + 1}`;

  const [invoiceNo, setInvoiceNo] = useState(defaultInvoiceNo);
  const [date, setDate] = useState(() => {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  });
  const [selectedPartyId, setSelectedPartyId] = useState<string>('');
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [notes, setNotes] = useState('');
  const [customerError, setCustomerError] = useState<string | null>(null);

  const [lineItems, setLineItems] = useState<TransactionItem[]>([
    {
      id: 'li-1',
      itemId: stockItems[0]?.id || '',
      name: stockItems[0]?.name || 'Standard Item',
      quantity: 1,
      unit: stockItems[0]?.unit || 'Pcs',
      rate: isPurchase ? stockItems[0]?.purchasePrice || 60 : stockItems[0]?.salePrice || 100,
      discountPercent: 0,
      taxPercent: stockItems[0]?.taxPercent || 0,
      amount: isPurchase ? stockItems[0]?.purchasePrice || 60 : stockItems[0]?.salePrice || 100,
    },
  ]);

  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [lastDraftSavedTime, setLastDraftSavedTime] = useState<string>('');
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  // Close customer dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize or restore state when modal opens
  useEffect(() => {
    if (!isSaleModalOpen) return;

    // 1. If we are editing an existing saved invoice:
    if (editingTransaction) {
      setInvoiceNo(editingTransaction.invoiceNo);
      setDate(editingTransaction.date);
      setSelectedPartyId(editingTransaction.partyId || '');
      setPartyName(editingTransaction.partyName);
      setPartyPhone(editingTransaction.partyPhone || '');
      setPaymentMode(editingTransaction.paymentMode);
      setNotes(editingTransaction.notes || '');
      setLineItems(editingTransaction.items && editingTransaction.items.length > 0 ? editingTransaction.items : [
        {
          id: 'li-1',
          itemId: stockItems[0]?.id || '',
          name: stockItems[0]?.name || 'Standard Item',
          quantity: 1,
          unit: stockItems[0]?.unit || 'Pcs',
          rate: 100,
          discountPercent: 0,
          taxPercent: 0,
          amount: 100,
        },
      ]);
      setAmountReceived(editingTransaction.amountReceived);
      setIsDraftRestored(false);
      return;
    }

    // 2. Check if an active un-saved draft was stored before browser close/reload
    try {
      const savedDraftStr = localStorage.getItem(STORAGE_KEY_INVOICE_DRAFT);
      if (savedDraftStr) {
        const draft = JSON.parse(savedDraftStr);
        if (draft && draft.isOpen && (!draft.saleModalType || draft.saleModalType === saleModalType)) {
          if (draft.invoiceNo) setInvoiceNo(draft.invoiceNo);
          if (draft.date) setDate(draft.date);
          if (draft.selectedPartyId) setSelectedPartyId(draft.selectedPartyId);
          if (draft.partyName) setPartyName(draft.partyName);
          if (draft.partyPhone) setPartyPhone(draft.partyPhone);
          if (draft.paymentMode) setPaymentMode(draft.paymentMode);
          if (draft.notes) setNotes(draft.notes);
          if (Array.isArray(draft.lineItems) && draft.lineItems.length > 0) {
            setLineItems(draft.lineItems);
          }
          if (typeof draft.amountReceived === 'number') {
            setAmountReceived(draft.amountReceived);
          }
          setIsDraftRestored(true);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not restore draft:', e);
    }

    // 3. Brand New Invoice: Auto-attach last customer or first customer so user doesn't have to re-enter
    setInvoiceNo(defaultInvoiceNo);
    setDate(
      new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
      })
    );
    setNotes('');

    // Check last used customer from localStorage
    const lastCustomerId = localStorage.getItem(STORAGE_KEY_LAST_CUSTOMER);
    const matchedCustomer =
      (lastCustomerId ? parties.find((p) => p.id === lastCustomerId) : null) ||
      (isPurchase ? parties.find((p) => p.type === 'Supplier') : parties.find((p) => p.type === 'Customer')) ||
      parties[0];

    if (matchedCustomer) {
      setSelectedPartyId(matchedCustomer.id);
      setPartyName(matchedCustomer.name);
      setPartyPhone(matchedCustomer.phone);
    } else {
      setSelectedPartyId('');
      setPartyName('');
      setPartyPhone('');
    }

    // Default item
    const firstStock = stockItems[0];
    const initialRate = isPurchase ? firstStock?.purchasePrice || 60 : firstStock?.salePrice || 100;
    setLineItems([
      {
        id: 'li-1',
        itemId: firstStock?.id || '',
        name: firstStock?.name || 'Standard Item',
        quantity: 1,
        unit: firstStock?.unit || 'Pcs',
        rate: initialRate,
        discountPercent: 0,
        taxPercent: firstStock?.taxPercent || 0,
        amount: initialRate,
      },
    ]);
    setIsDraftRestored(false);
  }, [isSaleModalOpen, saleModalType, editingTransaction]);

  // AUTO-SAVE in-progress invoice to localStorage in real time
  useEffect(() => {
    if (!isSaleModalOpen) return;

    const draftData = {
      isOpen: true,
      saleModalType,
      editingTransaction,
      invoiceNo,
      date,
      selectedPartyId,
      partyName,
      partyPhone,
      paymentMode,
      notes,
      lineItems,
      amountReceived,
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    localStorage.setItem(STORAGE_KEY_INVOICE_DRAFT, JSON.stringify(draftData));
    setLastDraftSavedTime(draftData.savedAt);
  }, [
    isSaleModalOpen,
    saleModalType,
    editingTransaction,
    invoiceNo,
    date,
    selectedPartyId,
    partyName,
    partyPhone,
    paymentMode,
    notes,
    lineItems,
    amountReceived,
  ]);

  // Recalculate line amounts
  const updateItemRow = (index: number, field: keyof TransactionItem, value: any) => {
    const updated = [...lineItems];
    const item = { ...updated[index], [field]: value };

    // If changing stock item
    if (field === 'itemId') {
      const matched = stockItems.find((s) => s.id === value);
      if (matched) {
        item.name = matched.name;
        item.unit = matched.unit;
        item.rate = isPurchase ? matched.purchasePrice : matched.salePrice;
        item.taxPercent = matched.taxPercent;
      }
    }

    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const discount = Number(item.discountPercent) || 0;
    const tax = Number(item.taxPercent) || 0;

    const baseAmount = qty * rate;
    const discountAmount = (baseAmount * discount) / 100;
    const taxableAmount = baseAmount - discountAmount;
    const taxAmount = (taxableAmount * tax) / 100;

    item.amount = Math.round((taxableAmount + taxAmount) * 100) / 100;
    updated[index] = item;
    setLineItems(updated);
  };

  const addLineItem = () => {
    const defaultStock = stockItems[0];
    const newItem: TransactionItem = {
      id: 'li-' + Date.now(),
      itemId: defaultStock?.id || '',
      name: defaultStock?.name || 'New Item',
      quantity: 1,
      unit: defaultStock?.unit || 'Pcs',
      rate: isPurchase ? defaultStock?.purchasePrice || 50 : defaultStock?.salePrice || 100,
      discountPercent: 0,
      taxPercent: defaultStock?.taxPercent || 0,
      amount: isPurchase ? defaultStock?.purchasePrice || 50 : defaultStock?.salePrice || 100,
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);
  const discountTotal = lineItems.reduce((sum, item) => {
    const base = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
    return sum + (base * (Number(item.discountPercent) || 0)) / 100;
  }, 0);
  const totalAmount = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const taxTotal = Math.max(0, totalAmount - (subtotal - discountTotal));

  // Auto update amount received if full cash sale
  useEffect(() => {
    if (paymentMode === 'Cash' || paymentMode === 'Online') {
      setAmountReceived(totalAmount);
    } else if (paymentMode === 'Credit') {
      setAmountReceived(0);
    }
  }, [totalAmount, paymentMode]);

  const balanceDue = Math.max(0, totalAmount - amountReceived);

  // Filter parties for quick search
  const filteredParties = parties.filter((p) => {
    if (!partyName.trim()) return true;
    return (
      p.name.toLowerCase().includes(partyName.toLowerCase()) ||
      p.phone.includes(partyName)
    );
  });

  const handleSelectCustomer = (party: Party) => {
    setSelectedPartyId(party.id);
    setPartyName(party.name);
    setPartyPhone(party.phone);
    setShowCustomerDropdown(false);
    localStorage.setItem(STORAGE_KEY_LAST_CUSTOMER, party.id);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(STORAGE_KEY_INVOICE_DRAFT);
    setIsDraftRestored(false);
    // Reset to defaults
    setInvoiceNo(defaultInvoiceNo);
    const firstStock = stockItems[0];
    const initialRate = isPurchase ? firstStock?.purchasePrice || 60 : firstStock?.salePrice || 100;
    setLineItems([
      {
        id: 'li-1',
        itemId: firstStock?.id || '',
        name: firstStock?.name || 'Standard Item',
        quantity: 1,
        unit: firstStock?.unit || 'Pcs',
        rate: initialRate,
        discountPercent: 0,
        taxPercent: firstStock?.taxPercent || 0,
        amount: initialRate,
      },
    ]);
  };

  const handleClose = () => {
    // When manually closing, clear the active draft
    localStorage.removeItem(STORAGE_KEY_INVOICE_DRAFT);
    setIsSaleModalOpen(false, saleModalType, null);
  };

  const handleSaveInvoice = (andPrint: boolean = false) => {
    if (!partyName.trim()) {
      setCustomerError('Please enter or select a customer name');
      return;
    }

    // Auto-save new party if not existing in parties
    let activePartyId = selectedPartyId;
    const existing = parties.find(
      (p) => p.name.trim().toLowerCase() === partyName.trim().toLowerCase()
    );

    if (existing) {
      activePartyId = existing.id;
      localStorage.setItem(STORAGE_KEY_LAST_CUSTOMER, existing.id);
    } else {
      // Automatically add customer so user never has to add them again
      const newParty = addParty({
        name: partyName.trim(),
        phone: partyPhone.trim() || '',
        type: isPurchase ? 'Supplier' : 'Customer',
        billingAddress: '',
        openingBalance: 0,
        balanceType: 'to_receive',
        currentBalance: balanceDue,
        loyaltyPoints: 0,
      });
      activePartyId = newParty.id;
      localStorage.setItem(STORAGE_KEY_LAST_CUSTOMER, newParty.id);
    }

    const payload = {
      invoiceNo,
      type: saleModalType,
      date,
      partyId: activePartyId || undefined,
      partyName: partyName.trim(),
      partyPhone: partyPhone.trim(),
      items: lineItems,
      subtotal,
      discountTotal,
      taxTotal,
      totalAmount,
      amountReceived,
      balanceDue,
      paymentMode,
      notes,
      status: (balanceDue <= 0 ? 'PAID' : amountReceived > 0 ? 'PARTIAL' : 'UNPAID') as 'PAID' | 'PARTIAL' | 'UNPAID',
    };

    let savedTxn;
    if (isEditing && editingTransaction) {
      // Update existing invoice in place
      savedTxn = {
        ...editingTransaction,
        ...payload,
      };
      updateTransaction(savedTxn);
    } else {
      // Create new invoice
      savedTxn = addTransaction(payload);
    }

    // Clear active draft since invoice is successfully saved
    localStorage.removeItem(STORAGE_KEY_INVOICE_DRAFT);

    setIsSaleModalOpen(false, saleModalType, null);

    if (andPrint) {
      setIsPrintModalOpen(true, savedTxn);
    }
  };

  if (!isSaleModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-0 sm:p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl flex flex-col max-h-screen sm:max-h-[96vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
          <div className="flex items-center gap-3">
            <button
              id="btn-close-sale-back"
              onClick={handleClose}
              className="p-1 text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">
                  {isEditing
                    ? `Edit ${isQuotation ? 'Quotation' : isPurchase ? 'Purchase' : 'Invoice'} #${invoiceNo}`
                    : isQuotation
                    ? 'Estimate / Quotation'
                    : isPurchase
                    ? 'Purchase Bill'
                    : isExpense
                    ? 'Record Expense'
                    : 'New Sale Invoice'}
                </h2>
                {isEditing && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px] uppercase">
                    Editing Mode
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Auto-Saving in Real-Time
                </span>
                {lastDraftSavedTime && (
                  <span className="text-[10px] text-gray-400">({lastDraftSavedTime})</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <label className="text-[10px] text-gray-400 uppercase font-bold block">Invoice #</label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-24 px-2 py-1 text-xs font-bold text-gray-800 border border-gray-200 rounded-lg text-right focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Draft Restored Banner (If browser was closed and reopened) */}
        {isDraftRestored && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Draft Restored:</strong> Aapka in-progress bill restore kar diya gaya hai jahan aapne chhora tha.
              </span>
            </div>
            <button
              onClick={handleDiscardDraft}
              className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline ml-2 shrink-0 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Naya Bill Banayein
            </button>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Party & Date Details */}
          <div className="bg-sky-50/60 p-3.5 rounded-2xl border border-sky-100 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Smart Customer Selector & Autocomplete */}
              <div className="relative" ref={customerDropdownRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-sky-600" />
                    {isPurchase ? 'Supplier / Party *' : 'Customer Name *'}
                  </label>
                  <span className="text-[10px] text-sky-600 font-semibold">
                    Auto-saved & remembered
                  </span>
                </div>

                {/* Customer Input with Searchable Dropdown */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type or select customer (e.g. Ali)"
                    value={partyName}
                    onFocus={() => setShowCustomerDropdown(true)}
                    onChange={(e) => {
                      setPartyName(e.target.value);
                      if (customerError) setCustomerError(null);
                      setShowCustomerDropdown(true);
                      // If typing matches existing party exactly, auto-fill phone
                      const match = parties.find(
                        (p) => p.name.toLowerCase() === e.target.value.toLowerCase()
                      );
                      if (match) {
                        setSelectedPartyId(match.id);
                        setPartyPhone(match.phone);
                      } else {
                        setSelectedPartyId('');
                      }
                    }}
                    className={`w-full px-3 py-2 bg-white border rounded-xl font-bold text-gray-800 focus:outline-none pr-8 transition-all ${
                      customerError
                        ? 'border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : 'border-gray-200 focus:ring-2 focus:ring-sky-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                {customerError && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1">{customerError}</p>
                )}

                {/* Customer Dropdown Menu */}
                {showCustomerDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-gray-100 text-xs">
                    <div className="p-2 bg-gray-50 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      <span>Saved Customers ({filteredParties.length})</span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomerDropdown(false);
                          setIsPartyModalOpen(true);
                        }}
                        className="text-sky-600 hover:text-sky-800 font-bold lowercase first-letter:uppercase"
                      >
                        + Add Details
                      </button>
                    </div>
                    {filteredParties.length > 0 ? (
                      filteredParties.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectCustomer(p)}
                          className="p-2.5 hover:bg-sky-50 cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div>
                            <p className="font-bold text-gray-900">{p.name}</p>
                            <p className="text-[11px] text-gray-500">{p.phone}</p>
                          </div>
                          {p.currentBalance > 0 && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Bal: Rs {p.currentBalance}
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-gray-400">
                        No customer found. Typing will save <span className="font-bold text-gray-700">"{partyName}"</span> automatically!
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomerDropdown(false);
                        setIsPartyModalOpen(true);
                      }}
                      className="w-full py-2 bg-gray-50 hover:bg-sky-50 text-sky-700 font-bold text-center block transition-colors text-xs"
                    >
                      + Add New Customer / Party
                    </button>
                  </div>
                )}

                {/* Customer Phone Input */}
                <div className="mt-2">
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Customer Phone (e.g. 03256181588)"
                      value={partyPhone}
                      onChange={(e) => setPartyPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium"
                    />
                  </div>
                </div>

                {/* Quick Customer Selection Chips */}
                {parties.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
                    <span className="text-[10px] font-bold text-gray-400 shrink-0">Quick Select:</span>
                    {parties.slice(0, 4).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectCustomer(p)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 transition-colors border ${
                          selectedPartyId === p.id
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date & Payment Mode */}
              <div className="space-y-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Invoice Date</label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl font-medium text-gray-800 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Payment Mode</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['Cash', 'Online', 'Cheque', 'Credit'] as PaymentMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPaymentMode(mode)}
                        className={`py-1.5 px-1 text-center font-bold text-[11px] rounded-lg transition-colors ${
                          paymentMode === mode
                            ? 'bg-[#e52b44] text-white shadow-xs'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Items / Products</h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(true, null)}
                  className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-800 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> + New Item
                </button>
                <button
                  type="button"
                  id="btn-add-item-row"
                  onClick={addLineItem}
                  className="flex items-center gap-1 text-xs font-bold text-[#e52b44] hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {lineItems.map((row, idx) => (
                <div
                  key={row.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 space-y-2 relative"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <select
                        value={row.itemId}
                        onChange={(e) => updateItemRow(idx, 'itemId', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg font-semibold text-gray-800"
                      >
                        <option value="">-- Choose Stock Item or Type --</option>
                        {stockItems.map((si) => (
                          <option key={si.id} value={si.id}>
                            {si.name} (Stock: {si.stockQuantity} {si.unit} • Price: Rs {si.salePrice})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeLineItem(idx)}
                      disabled={lineItems.length === 1}
                      className="text-gray-400 hover:text-rose-600 p-1.5 disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-500 block">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) => updateItemRow(idx, 'quantity', Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-center font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 block">Rate (Rs)</label>
                      <input
                        type="number"
                        value={row.rate}
                        onChange={(e) => updateItemRow(idx, 'rate', Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-right font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 block">Discount %</label>
                      <input
                        type="number"
                        value={row.discountPercent}
                        onChange={(e) => updateItemRow(idx, 'discountPercent', Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-right"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 block">Total (Rs)</label>
                      <div className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-lg text-right font-bold text-gray-900">
                        {row.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Summary Card */}
          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-semibold">Rs {subtotal.toFixed(2)}</span>
            </div>

            {discountTotal > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Total Discount:</span>
                <span className="font-semibold">- Rs {discountTotal.toFixed(2)}</span>
              </div>
            )}

            {taxTotal > 0 && (
              <div className="flex justify-between text-sky-700">
                <span>Taxes / GST:</span>
                <span className="font-semibold">+ Rs {taxTotal.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Grand Total:</span>
              <span className="text-[#e52b44] text-base">Rs {totalAmount.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[10px] font-bold text-emerald-700 block mb-1">
                  Amount Received (Rs)
                </label>
                <input
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-amber-700 block mb-1">
                  Balance Due (Rs)
                </label>
                <div className="px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-lg font-bold text-amber-800">
                  Rs {balanceDue.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] font-bold text-gray-600 block mb-1">Notes / Terms</label>
            <input
              type="text"
              placeholder="e.g. Thanks for your business!"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-gray-200 bg-white flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 text-gray-600 text-xs font-semibold hover:bg-gray-100 rounded-xl"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-save-and-print"
              onClick={() => handleSaveInvoice(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-sky-600 text-sky-600 hover:bg-sky-50 rounded-xl font-bold text-xs shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{isEditing ? 'Update & Print' : 'Save & Print'}</span>
            </button>

            <button
              type="button"
              id="btn-save-invoice"
              onClick={() => handleSaveInvoice(false)}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#e52b44] hover:bg-[#d0243b] text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Update Invoice' : 'Save Invoice'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
