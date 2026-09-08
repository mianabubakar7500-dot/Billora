import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Package, Tag, ArrowLeft, X, Save, Check, Layers, Barcode, DollarSign, AlertTriangle } from 'lucide-react';
import { Item } from '../types';

export const ItemModal: React.FC = () => {
  const {
    isItemModalOpen,
    setIsItemModalOpen,
    editingItem,
    addItem,
    updateItem,
  } = useApp();

  const [name, setName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [category, setCategory] = useState('General');
  const [unit, setUnit] = useState('Pcs');
  const [salePrice, setSalePrice] = useState<number | string>(0);
  const [purchasePrice, setPurchasePrice] = useState<number | string>(0);
  const [stockQuantity, setStockQuantity] = useState<number | string>(0);
  const [minStockAlert, setMinStockAlert] = useState<number | string>(5);
  const [taxPercent, setTaxPercent] = useState<number | string>(0);

  const [nameError, setNameError] = useState<string | null>(null);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setItemCode(editingItem.itemCode || '');
      setCategory(editingItem.category || 'General');
      setUnit(editingItem.unit || 'Pcs');
      setSalePrice(editingItem.salePrice);
      setPurchasePrice(editingItem.purchasePrice);
      setStockQuantity(editingItem.stockQuantity);
      setMinStockAlert(editingItem.minStockAlert ?? 5);
      setTaxPercent(editingItem.taxPercent || 0);
    } else {
      setName('');
      setItemCode('');
      setCategory('General');
      setUnit('Pcs');
      setSalePrice('');
      setPurchasePrice('');
      setStockQuantity('');
      setMinStockAlert(5);
      setTaxPercent(0);
    }
    setNameError(null);
    setIsSavedSuccess(false);
  }, [editingItem, isItemModalOpen]);

  if (!isItemModalOpen) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      setNameError('Please enter item name');
      return;
    }

    const parsedSale = Number(salePrice) || 0;
    const parsedPurchase = Number(purchasePrice) || 0;
    const parsedStock = Number(stockQuantity) || 0;
    const parsedMinStock = Number(minStockAlert) || 5;
    const parsedTax = Number(taxPercent) || 0;

    if (editingItem) {
      updateItem({
        ...editingItem,
        name: name.trim(),
        itemCode: itemCode.trim() || undefined,
        category: category.trim() || 'General',
        unit: unit.trim() || 'Pcs',
        salePrice: parsedSale,
        purchasePrice: parsedPurchase,
        stockQuantity: parsedStock,
        minStockAlert: parsedMinStock,
        taxPercent: parsedTax,
      });
    } else {
      addItem({
        name: name.trim(),
        itemCode: itemCode.trim() || undefined,
        category: category.trim() || 'General',
        unit: unit.trim() || 'Pcs',
        salePrice: parsedSale,
        purchasePrice: parsedPurchase,
        stockQuantity: parsedStock,
        minStockAlert: parsedMinStock,
        taxPercent: parsedTax,
      });
    }

    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsItemModalOpen(false, null);
    }, 250);
  };

  const commonCategories = [
    'General',
    'Electronics',
    'Mobile & Acc',
    'Grocery',
    'Hardware',
    'Apparel',
    'Cosmetics',
    'Pharmacy',
    'Spare Parts',
  ];

  const commonUnits = [
    'Pcs',
    'Box',
    'Kg',
    'Mtr',
    'Ltr',
    'Packet',
    'Dozen',
    'Gram',
    'Bag',
    'Bundle',
    'Roll',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl flex flex-col max-h-screen sm:max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsItemModalOpen(false, null)}
              className="p-1.5 text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {editingItem ? 'Edit Product Item' : 'Add New Product Item'}
              </h2>
              <p className="text-[10px] text-gray-400">Inventory & Pricing Catalog</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsItemModalOpen(false, null)}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {/* Item Name */}
          <div className="space-y-1">
            <label className="font-bold text-gray-700 flex items-center justify-between">
              <span>Item / Product Name <span className="text-rose-600">*</span></span>
              {nameError && <span className="text-rose-600 text-[11px] font-semibold">{nameError}</span>}
            </label>
            <div className="relative">
              <Package className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="e.g. Fast Charger 25W, Sugar 1kg, Cotton Shirt"
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

          {/* Item Code & Category */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="font-bold text-gray-700 flex items-center justify-between">
                <span>Item Code / Barcode</span>
                <span className="text-gray-400 text-[10px] font-normal">Optional</span>
              </label>
              <div className="relative">
                <Barcode className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. CHG-25W"
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Category</label>
              <div className="relative">
                <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  list="category-suggestions"
                  type="text"
                  placeholder="e.g. Electronics"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <datalist id="category-suggestions">
                  {commonCategories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Pricing Box: Sale Price & Purchase Price */}
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2.5">
            <div className="flex items-center gap-1.5 text-gray-700 font-bold text-xs">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Pricing Details</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">
                  Sale Price (Rs) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value === '' ? '' : e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-black text-emerald-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">Purchase Price (Rs)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value === '' ? '' : e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Stock & Unit Details */}
          <div className="p-3 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-2.5">
            <div className="flex items-center gap-1.5 text-sky-800 font-bold text-xs">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Stock & Measurement</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">Opening Stock</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value === '' ? '' : e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-2 py-2 bg-white border border-gray-300 rounded-xl text-gray-800 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {commonUnits.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block flex items-center justify-between">
                  <span>Min Alert</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="5"
                  value={minStockAlert}
                  onChange={(e) => setMinStockAlert(e.target.value === '' ? '' : e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-gray-300 rounded-xl font-bold text-rose-600 text-center focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>
          </div>

          {/* Tax / GST % */}
          <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-200">
            <span className="font-bold text-gray-700">Tax / GST Rate (%)</span>
            <div className="flex items-center gap-1.5 w-28">
              <input
                type="number"
                min="0"
                max="100"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value === '' ? '' : e.target.value)}
                className="w-full px-2 py-1 bg-white border border-gray-300 rounded-lg text-right font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <span className="text-gray-500 font-bold">%</span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-white flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsItemModalOpen(false, null)}
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
                <span>{editingItem ? 'Update Item' : 'Save Item'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
