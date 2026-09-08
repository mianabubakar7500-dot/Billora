import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Save, UserCheck, Phone, MapPin, Building, ShieldCheck } from 'lucide-react';
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
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [balanceType, setBalanceType] = useState<'to_receive' | 'to_pay'>('to_receive');

  useEffect(() => {
    if (editingParty) {
      setName(editingParty.name);
      setPhone(editingParty.phone);
      setEmail(editingParty.email || '');
      setType(editingParty.type);
      setGstin(editingParty.gstin || '');
      setBillingAddress(editingParty.billingAddress || '');
      setOpeningBalance(editingParty.openingBalance);
      setBalanceType(editingParty.balanceType);
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
  }, [editingParty, isPartyModalOpen]);

  if (!isPartyModalOpen) return null;

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter party name');
      return;
    }
    if (!phone.trim()) {
      alert('Please enter party phone number');
      return;
    }

    if (editingParty) {
      updateParty({
        ...editingParty,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        type,
        gstin: gstin.trim(),
        billingAddress: billingAddress.trim(),
        openingBalance,
        balanceType,
        currentBalance: openingBalance,
      });
    } else {
      addParty({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        type,
        gstin: gstin.trim(),
        billingAddress: billingAddress.trim(),
        openingBalance,
        balanceType,
        currentBalance: openingBalance,
      });
    }

    setIsPartyModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl flex flex-col max-h-screen sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPartyModalOpen(false)}
              className="p-1 text-gray-700 hover:text-gray-900 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <h2 className="text-base font-bold text-gray-900">
              {editingParty ? 'Edit Party' : 'Add New Party'}
            </h2>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
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
            <label className="font-bold text-gray-700">Party Name *</label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Ali or Khan Traders"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl font-semibold text-sm text-gray-900 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="font-bold text-gray-700">Contact Number *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="03256181588"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl font-semibold text-sm text-gray-900 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="font-bold text-gray-700">Email Address</label>
            <input
              type="email"
              placeholder="party@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Billing Address */}
          <div className="space-y-1">
            <label className="font-bold text-gray-700">Billing Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <textarea
                rows={2}
                placeholder="Street address, City, Market"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* GSTIN / TIN */}
          <div className="space-y-1">
            <label className="font-bold text-gray-700">GSTIN / TIN (Optional)</label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tax Identification Number"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800"
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
                onChange={(e) => setOpeningBalance(Number(e.target.value))}
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-900"
              />
              <select
                value={balanceType}
                onChange={(e) => setBalanceType(e.target.value as any)}
                className="px-2 py-2 bg-white border border-gray-200 rounded-xl font-semibold text-xs text-gray-800"
              >
                <option value="to_receive">To Receive (You'll Get)</option>
                <option value="to_pay">To Pay (You'll Pay)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-white flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsPartyModalOpen(false)}
            className="flex-1 py-2.5 text-center text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 text-center text-xs font-bold text-white bg-[#e52b44] hover:bg-[#d0243b] rounded-xl shadow-md transition-all active:scale-95"
          >
            Save Party
          </button>
        </div>
      </div>
    </div>
  );
};
