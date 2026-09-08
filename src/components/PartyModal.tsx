import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Save, UserCheck, Phone, MapPin, Building, ShieldCheck, X, Check } from 'lucide-react';
import { Party } from '../types';

export const PartyModal: React.FC = () => {
  const {
    isPartyModalOpen,
    setIsPartyModalOpen,
    editingParty,
    addParty,
    updateParty,
  } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState<'Customer' | 'Supplier'>('Customer');
  const [gstin, setGstin] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [openingBalance, setOpeningBalance] = useState<number | string>(0);
  const [balanceType, setBalanceType] = useState<'to_receive' | 'to_pay'>('to_receive');
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  useEffect(() => {
    if (editingParty) {
      setName(editingParty.name);
      setPhone(editingParty.phone || '');
      setEmail(editingParty.email || '');
      setType(editingParty.type);
      setGstin(editingParty.gstin || '');
      setBillingAddress(editingParty.billingAddress || '');
      setOpeningBalance(editingParty.openingBalance || 0);
      setBalanceType(editingParty.balanceType || 'to_receive');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setType('Customer');
      setGstin('');
      setBillingAddress('');
      setOpeningBalance(0);
      setBalanceType('to_receive');
    }
    setNameError(null);
    setIsSavedSuccess(false);
  }, [editingParty, isPartyModalOpen]);

  if (!isPartyModalOpen) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      setNameError('Please enter party or customer name');
      return;
    }

    const parsedOpeningBalance = Number(openingBalance) || 0;

    if (editingParty) {
      updateParty({
        ...editingParty,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        type,
        gstin: gstin.trim(),
        billingAddress: billingAddress.trim(),
        openingBalance: parsedOpeningBalance,
        balanceType,
        currentBalance: parsedOpeningBalance,
      });
    } else {
      addParty({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        type,
        gstin: gstin.trim(),
        billingAddress: billingAddress.trim(),
        openingBalance: parsedOpeningBalance,
        balanceType,
        currentBalance: parsedOpeningBalance,
      });
    }

    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsPartyModalOpen(false);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl flex flex-col max-h-screen sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPartyModalOpen(false)}
              className="p-1.5 text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <h2 className="text-base font-bold text-gray-900">
              {editingParty ? 'Edit Party' : 'Add New Party'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsPartyModalOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {/* Party Type Radio: Customer vs Supplier */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('Customer')}
              className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                type === 'Customer' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setType('Supplier')}
              className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                type === 'Supplier' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600'
              }`}
            >
              Supplier
            </button>
          </div>

          {/* Party Name */}
          <div className="space-y-1">
            <label className="font-bold text-gray-700 flex items-center justify-between">
              <span>Party / Customer Name <span className="text-rose-600">*</span></span>
              {nameError && <span className="text-rose-600 text-[11px] font-semibold">{nameError}</span>}
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="e.g. Ali Traders, Ahmed Khan"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-xl font-semibold text-sm text-gray-900 focus:outline-none transition-all ${
                  nameError
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-200'
                    : 'border-gray-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500'
                }`}
              />
            </div>
          </div>

          {/* Phone Number (Optional) */}
          <div className="space-y-1">
            <label className="font-bold text-gray-700 flex items-center justify-between">
              <span>Contact Number</span>
              <span className="text-gray-400 text-[10px] font-normal">Optional</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="0300-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl font-semibold text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="font-bold text-gray-700 flex items-center justify-between">
              <span>Email Address</span>
              <span className="text-gray-400 text-[10px] font-normal">Optional</span>
            </label>
            <input
              type="email"
              placeholder="party@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Billing Address */}
          <div className="space-y-1">
            <label className="font-bold text-gray-700 flex items-center justify-between">
              <span>Billing Address / City</span>
              <span className="text-gray-400 text-[10px] font-normal">Optional</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <textarea
                rows={2}
                placeholder="Shop #, Market, City"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* GSTIN / TIN */}
          <div className="space-y-1">
            <label className="font-bold text-gray-700 flex items-center justify-between">
              <span>GSTIN / Tax ID</span>
              <span className="text-gray-400 text-[10px] font-normal">Optional</span>
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. NTN or STRN"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Opening Balance */}
          <div className="p-3 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-2">
            <label className="font-bold text-gray-800 block">Opening Balance (Rs)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value === '' ? '' : Number(e.target.value))}
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <select
                value={balanceType}
                onChange={(e) => setBalanceType(e.target.value as any)}
                className="px-2 py-2 bg-white border border-gray-200 rounded-xl font-semibold text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="to_receive">To Receive (You'll Get)</option>
                <option value="to_pay">To Pay (You'll Pay)</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-white flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsPartyModalOpen(false)}
            className="flex-1 py-2.5 text-center text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            className={`flex-1 py-2.5 text-center text-xs font-bold text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
              isSavedSuccess ? 'bg-emerald-600' : 'bg-[#e52b44] hover:bg-[#d0243b]'
            }`}
          >
            {isSavedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{editingParty ? 'Update Party' : 'Save Party'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
