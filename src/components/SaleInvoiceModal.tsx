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
  Building2,
  Mail,
  MapPin,
} from 'lucide-react';

const STORAGE_KEY_LAST_CUSTOMER = 'billora_last_customer_v1';

export interface EditableTransactionItem {
  id: string;
  itemId?: string;
  name: string;
  quantity: number | string;
  unit: string;
  rate: number | string;
  discountPercent?: number | string;
  taxPercent?: number;
  amount: number;
}

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
    businessProfile,
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
  const [businessPhone, setBusinessPhone] = useState(businessProfile?.phone1 || '');
  const [businessEmail, setBusinessEmail] = useState(businessProfile?.email || '');
  const [businessAddress, setBusinessAddress] = useState(businessProfile?.address || '');
  const [showOfficeDetails, setShowOfficeDetails] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [notes, setNotes] = useState('');
  const [customerError, setCustomerError] = useState<string | null>(null);

  const [lineItems, setLineItems] = useState<EditableTransactionItem[]>([
    {
      id: 'li-1',
      itemId: '',
      name: '',
      quantity: 1,
      unit: 'Pcs',
      rate: '',
      discountPercent: '',
      taxPercent: 0,
      amount: 0,
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
      setBusinessPhone(editingTransaction.businessPhone || businessProfile?.phone1 || '');
      setBusinessEmail(editingTransaction.businessEmail || businessProfile?.email || '');
      setBusinessAddress(editingTransaction.businessAddress || businessProfile?.address || '');
      setPaymentMode(editingTransaction.paymentMode);
      setNotes(editingTransaction.notes || '');
      setLineItems(
        editingTransaction.items && editingTransaction.items.length > 0
          ? editingTransaction.items.map((it) => ({
              ...it,
              quantity: it.quantity,
              rate: it.rate,
              discountPercent: it.discountPercent || '',
            }))
          : [
              {
                id: 'li-1',
                itemId: '',
                name: '',
                quantity: 1,
                unit: 'Pcs',
                rate: '',
                discountPercent: '',
                taxPercent: 0,
                amount: 0,
              },
            ]
      );
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
          if (draft.businessPhone !== undefined) setBusinessPhone(draft.businessPhone);
          if (draft.businessEmail !== undefined) setBusinessEmail(draft.businessEmail);
          if (draft.businessAddress !== undefined) setBusinessAddress(draft.businessAddress);
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

    setBusinessPhone(businessProfile?.phone1 || '');
    setBusinessEmail(businessProfile?.email || '');
    setBusinessAddress(businessProfile?.address || '');

    // Default empty item row so customer can directly write item name and price manually
    setLineItems([
      {
        id: 'li-1',
        itemId: '',
        name: '',
        quantity: 1,
        unit: 'Pcs',
        rate: '',
        discountPercent: '',
        taxPercent: 0,
        amount: 0,
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
      businessPhone,
      businessEmail,
      businessAddress,
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
    businessPhone,
    businessEmail,
    businessAddress,
    paymentMode,
    notes,
    lineItems,
    amountReceived,
  ]);

  // Recalculate line amounts
  const updateItemRow = (index: number, field: keyof EditableTransactionItem, value: any) => {
    const updated = [...lineItems];
    const item = { ...updated[index], [field]: value };

    const qty = parseFloat(String(item.quantity)) || 0;
    const rate = parseFloat(String(item.rate)) || 0;
    const discount = parseFloat(String(item.discountPercent)) || 0;
    const tax = parseFloat(String(item.taxPercent)) || 0;

    const baseAmount = qty * rate;
    const discountAmount = (baseAmount * discount) / 100;
    const taxableAmount = baseAmount - discountAmount;
    const taxAmount = (taxableAmount * tax) / 100;

    item.amount = Math.round((taxableAmount + taxAmount) * 100) / 100;
    updated[index] = item;
    setLineItems(updated);
  };

  const addLineItem = () => {
    const newItem: EditableTransactionItem = {
      id: 'li-' + Date.now(),
      itemId: '',
      name: '',
      quantity: 1,
      unit: 'Pcs',
      rate: '',
      discountPercent: '',
      taxPercent: 0,
      amount: 0,
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
    setLineItems([
      {
        id: 'li-1',
        itemId: '',
        name: '',
        quantity: 1,
        unit: 'Pcs',
        rate: '',
        discountPercent: '',
        taxPercent: 0,
        amount: 0,
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

    const cleanedItems: TransactionItem[] = lineItems.map((item, idx) => {
      const qty = parseFloat(String(item.quantity)) || 1;
      const rate = parseFloat(String(item.rate)) || 0;
      const discount = parseFloat(String(item.discountPercent)) || 0;
      const tax = parseFloat(String(item.taxPercent)) || 0;
      const baseAmount = qty * rate;
      const discountAmount = (baseAmount * discount) / 100;
      const taxableAmount = baseAmount - discountAmount;
      const taxAmount = (taxableAmount * tax) / 100;
      const finalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

      return {
        id: item.id || `li-${idx + 1}`,
        itemId: item.itemId || undefined,
        name: item.name.trim() || `Item ${idx + 1}`,
        quantity: qty,
        rate: rate,
        discountPercent: discount,
        taxPercent: tax,
        unit: item.unit || 'Pcs',
        amount: finalAmount,
      };
    });

    const payload = {
      invoiceNo,
      type: saleModalType,
      date,
      partyId: activePartyId || undefined,
      partyName: partyName.trim(),
      partyPhone: partyPhone.trim(),
      businessPhone: businessPhone.trim(),
      businessEmail: businessEmail.trim(),
      businessAddress: businessAddress.trim(),
      items: cleanedItems,
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

              {/* Office & Contact Details (Printed on Tax Invoice - Manually Editable) */}
              <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-700 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-gray-800 block">
                        Office & Contact Details (Printed on Tax Invoice)
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Phone: {businessPhone || 'None'} • Email: {businessEmail || 'None'} • Office: {businessAddress ? (businessAddress.length > 30 ? businessAddress.slice(0, 30) + '...' : businessAddress) : 'None'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOfficeDetails(!showOfficeDetails)}
                    className="text-xs font-bold text-[#e52b44] hover:text-[#c42036] flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-lg shadow-2xs transition-all shrink-0"
                  >
                    {showOfficeDetails ? 'Hide' : '✏️ Edit Manual Details'}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showOfficeDetails ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {showOfficeDetails && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 mt-3 border-t border-slate-200 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-gray-700 block mb-1">
                        Phone Number (Manual)
                      </label>
                      <input
                        type="text"
                        value={businessPhone}
                        onChange={(e) => setBusinessPhone(e.target.value)}
                        placeholder="e.g. 03256181588"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium text-gray-800 focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-700 block mb-1">
                        Email Address (Manual)
                      </label>
                      <input
                        type="email"
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                        placeholder="e.g. support@example.com"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium text-gray-800 focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-700 block mb-1">
                        Office Address (Manual)
                      </label>
                      <input
                        type="text"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        placeholder="e.g. Shop #14, Commercial Market"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium text-gray-800 focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Items / Products</h3>
                <p className="text-[10px] text-gray-500 font-medium">Customer can write item name and price manually</p>
              </div>
              <button
                type="button"
                id="btn-add-item-row"
                onClick={addLineItem}
                className="flex items-center gap-1 text-xs font-bold text-[#e52b44] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>

            <div className="space-y-2">
              {lineItems.map((row, idx) => (
                <div
                  key={row.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 space-y-2 relative"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Write item name (e.g. Rice 5kg, T-Shirt, Repair)"
                        value={row.name}
                        onChange={(e) => updateItemRow(idx, 'name', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:font-normal placeholder:text-gray-400 text-xs"
                      />
                    </div>

                    <div className="w-24">
                      <select
                        value={row.unit || 'Pcs'}
                        onChange={(e) => updateItemRow(idx, 'unit', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="Pcs">Pcs</option>
                        <option value="Kg">Kg</option>
                        <option value="Gram">Gram</option>
                        <option value="Ltr">Ltr</option>
                        <option value="Box">Box</option>
                        <option value="Pack">Pack</option>
                        <option value="Mtr">Mtr</option>
                        <option value="Dozen">Dozen</option>
                        <option value="Service">Service</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeLineItem(idx)}
                      disabled={lineItems.length === 1}
                      className="text-gray-400 hover:text-rose-600 p-1.5 disabled:opacity-30 rounded hover:bg-rose-50"
                      title="Remove row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-500 block font-medium">Quantity</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={row.quantity ?? ''}
                        placeholder="1"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^[0-9]*\.?[0-9]*$/.test(val)) {
                            updateItemRow(idx, 'quantity', val);
                          }
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-center font-bold text-gray-800 focus:ring-2 focus:ring-sky-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-700 block font-bold">Price / Rate (Rs)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={row.rate ?? ''}
                        placeholder="0"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^[0-9]*\.?[0-9]*$/.test(val)) {
                            updateItemRow(idx, 'rate', val);
                          }
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 focus:border-sky-500 rounded-lg text-right font-bold text-gray-900 focus:ring-2 focus:ring-sky-500 text-xs shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 block font-medium">Discount %</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={row.discountPercent ?? ''}
                        placeholder="0"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^[0-9]*\.?[0-9]*$/.test(val)) {
                            updateItemRow(idx, 'discountPercent', val);
                          }
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-right font-medium text-gray-700 focus:ring-2 focus:ring-sky-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 block font-medium">Total Amount (Rs)</label>
                      <div className="px-2.5 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-right font-bold text-gray-900 text-xs flex items-center justify-end h-8">
                        Rs {row.amount.toFixed(2)}
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
        <div className="p-3 border-t border-gray-200 bg-white flex items-center justify-between gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-3 sm:px-4 py-2 sm:py-2.5 text-gray-600 text-xs font-semibold hover:bg-gray-100 rounded-xl shrink-0"
          >
            Cancel
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              id="btn-save-and-print"
              onClick={() => handleSaveInvoice(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 border border-sky-600 text-sky-600 hover:bg-sky-50 rounded-xl font-bold text-[11px] sm:text-xs shadow-xs transition-colors whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isEditing ? 'Update & Print' : 'Save & Print'}</span>
            </button>

            <button
              type="button"
              id="btn-save-invoice"
              onClick={() => handleSaveInvoice(false)}
              className="flex items-center gap-1.5 px-3.5 sm:px-6 py-2 sm:py-2.5 bg-[#e52b44] hover:bg-[#d0243b] text-white rounded-xl font-bold text-[11px] sm:text-xs shadow-md transition-all active:scale-95 whitespace-nowrap"
            >
              <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isEditing ? 'Update Invoice' : 'Save Invoice'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
