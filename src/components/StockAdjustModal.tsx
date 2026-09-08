import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowDownLeft, ArrowUpRight, X, Check } from 'lucide-react';

export const StockAdjustModal: React.FC = () => {
  const {
    isStockAdjustModalOpen,
    setIsStockAdjustModalOpen,
    stockAdjustItem,
    adjustStock,
  } = useApp();

  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  useEffect(() => {
    setAdjustQty(1);
    setAdjustType('IN');
    setAppliedSuccess(false);
  }, [isStockAdjustModalOpen, stockAdjustItem]);

  if (!isStockAdjustModalOpen || !stockAdjustItem) return null;

  const handleApply = () => {
    if (adjustQty <= 0) return;
    adjustStock(stockAdjustItem.id, adjustQty, adjustType);
    setAppliedSuccess(true);
    setTimeout(() => {
      setIsStockAdjustModalOpen(false, null);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b pb-2.5">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Adjust Inventory Stock</h3>
            <p className="text-[10px] text-gray-400">Add or reduce physical inventory quantity</p>
          </div>
          <button
            onClick={() => setIsStockAdjustModalOpen(false, null)}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
          <h4 className="font-bold text-sm text-gray-900">{stockAdjustItem.name}</h4>
          <p className="text-gray-500 mt-0.5">
            Current Stock: <span className="font-bold text-gray-800">{stockAdjustItem.stockQuantity} {stockAdjustItem.unit}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setAdjustType('IN')}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
              adjustType === 'IN'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" /> Stock In (+)
          </button>
          <button
            type="button"
            onClick={() => setAdjustType('OUT')}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
              adjustType === 'OUT'
                ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs'
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" /> Stock Out (-)
          </button>
        </div>

        <div>
          <label className="font-bold text-gray-700 block mb-1">
            Quantity to {adjustType === 'IN' ? 'Add' : 'Deduct'}
          </label>
          <input
            type="number"
            min="1"
            value={adjustQty}
            onChange={(e) => setAdjustQty(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold text-base text-center focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setIsStockAdjustModalOpen(false, null)}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className={`flex-1 py-2.5 text-white rounded-xl font-bold shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
              appliedSuccess ? 'bg-emerald-600' : 'bg-[#e52b44] hover:bg-[#d0243b]'
            }`}
          >
            {appliedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Updated!</span>
              </>
            ) : (
              <span>Apply Adjustment</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
