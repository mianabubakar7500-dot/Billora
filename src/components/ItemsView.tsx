import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Item } from '../types';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Edit2,
  Trash2,
  Tag,
  Boxes,
  X,
  CheckCircle2,
} from 'lucide-react';

export const ItemsView: React.FC = () => {
  const {
    items,
    deleteItem,
    setIsItemModalOpen,
    setIsStockAdjustModalOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', ...Array.from(new Set(items.map((i) => i.category || 'General')))];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.itemCode && item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalStockValue = items.reduce((sum, item) => sum + item.stockQuantity * item.salePrice, 0);
  const lowStockCount = items.filter((item) => item.stockQuantity <= item.minStockAlert).length;

  return (
    <div className="pb-28 pt-2 px-3 max-w-md mx-auto min-h-[calc(100vh-120px)] space-y-3">
      {/* Top Inventory Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 text-sky-600 mb-1">
            <Boxes className="w-4 h-4" />
            <span className="text-[11px] font-bold text-gray-500 uppercase">Stock Value</span>
          </div>
          <span className="text-base font-black text-gray-900">Rs {totalStockValue.toLocaleString()}</span>
          <p className="text-[10px] text-gray-400 mt-0.5">{items.length} items cataloged</p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[11px] font-bold text-gray-500 uppercase">Low Stock</span>
          </div>
          <span
            className={`text-base font-black ${
              lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {lowStockCount} Items
          </span>
          <p className="text-[10px] text-gray-400 mt-0.5">Need restock</p>
        </div>
      </div>

      {/* Search & Category Pills */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items by name, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 bg-white rounded-xl text-xs sm:text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Category horizontal scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No items found</p>
            <button
              onClick={() => setIsItemModalOpen(true, null)}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#e52b44] text-white text-xs font-bold rounded-full"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isLowStock = item.stockQuantity <= item.minStockAlert;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-xs space-y-2 hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                        {item.category}
                      </span>
                      {item.itemCode && (
                        <span className="text-[10px] text-gray-400">Code: {item.itemCode}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isLowStock
                          ? 'bg-rose-100 text-rose-700 animate-pulse'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {item.stockQuantity} {item.unit}
                    </span>
                    {isLowStock && (
                      <span className="block text-[9px] text-rose-600 font-semibold mt-0.5">
                        Low Stock Alert!
                      </span>
                    )}
                  </div>
                </div>

                {/* Price row and action buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Sale Price</span>
                      <span className="font-bold text-gray-800">Rs {item.salePrice}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Purchase Price</span>
                      <span className="font-medium text-gray-600">Rs {item.purchasePrice}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Stock Adjust button */}
                    <button
                      onClick={() => setIsStockAdjustModalOpen(true, item)}
                      title="Adjust Stock In / Out"
                      className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-[11px] font-bold flex items-center gap-1"
                    >
                      <span>Adjust</span>
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => setIsItemModalOpen(true, item)}
                      title="Edit Item"
                      className="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => {
                        if (confirm(`Delete item "${item.name}"?`)) {
                          deleteItem(item.id);
                        }
                      }}
                      title="Delete Item"
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Add Item Button */}
      <div className="fixed bottom-18 left-0 right-0 max-w-md mx-auto flex justify-center px-4 pointer-events-none z-20">
        <button
          onClick={() => setIsItemModalOpen(true, null)}
          className="pointer-events-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#e52b44] hover:bg-[#d0243b] text-white rounded-full font-bold text-sm shadow-xl active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Add New Item</span>
        </button>
      </div>
    </div>
  );
};
