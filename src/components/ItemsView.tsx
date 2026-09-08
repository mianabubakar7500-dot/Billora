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
    addItem,
    updateItem,
    deleteItem,
    adjustStock,
    isItemModalOpen,
    setIsItemModalOpen,
    editingItem,
    isStockAdjustModalOpen,
    setIsStockAdjustModalOpen,
    stockAdjustItem,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Item Form State
  const [itemName, setItemName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [unit, setUnit] = useState('Pcs');
  const [salePrice, setSalePrice] = useState<number>(100);
  const [purchasePrice, setPurchasePrice] = useState<number>(70);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [taxPercent, setTaxPercent] = useState<number>(0);

  // Stock Adjust State
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');

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

  const openAddItemModal = (itemToEdit: Item | null = null) => {
    if (itemToEdit) {
      setItemName(itemToEdit.name);
      setItemCode(itemToEdit.itemCode || '');
      setCategory(itemToEdit.category || 'Electronics');
      setUnit(itemToEdit.unit || 'Pcs');
      setSalePrice(itemToEdit.salePrice);
      setPurchasePrice(itemToEdit.purchasePrice);
      setStockQuantity(itemToEdit.stockQuantity);
      setMinStockAlert(itemToEdit.minStockAlert);
      setTaxPercent(itemToEdit.taxPercent || 0);
    } else {
      setItemName('');
      setItemCode('');
      setCategory('Electronics');
      setUnit('Pcs');
      setSalePrice(0);
      setPurchasePrice(0);
      setStockQuantity(0);
      setMinStockAlert(5);
      setTaxPercent(0);
    }
    setIsItemModalOpen(true, itemToEdit);
  };

  const handleSaveItem = () => {
    if (!itemName.trim()) {
      alert('Please enter item name');
      return;
    }

    if (editingItem) {
      updateItem({
        ...editingItem,
        name: itemName.trim(),
        itemCode: itemCode.trim(),
        category,
        unit,
        salePrice: Number(salePrice),
        purchasePrice: Number(purchasePrice),
        stockQuantity: Number(stockQuantity),
        minStockAlert: Number(minStockAlert),
        taxPercent: Number(taxPercent),
      });
    } else {
      addItem({
        name: itemName.trim(),
        itemCode: itemCode.trim(),
        category,
        unit,
        salePrice: Number(salePrice),
        purchasePrice: Number(purchasePrice),
        stockQuantity: Number(stockQuantity),
        minStockAlert: Number(minStockAlert),
        taxPercent: Number(taxPercent),
      });
    }

    setIsItemModalOpen(false);
  };

  const handleApplyStockAdjust = () => {
    if (!stockAdjustItem || adjustQty <= 0) return;
    adjustStock(stockAdjustItem.id, adjustQty, adjustType);
    setIsStockAdjustModalOpen(false);
  };

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
              onClick={() => openAddItemModal(null)}
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
                      onClick={() => openAddItemModal(item)}
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
          onClick={() => openAddItemModal(null)}
          className="pointer-events-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#e52b44] hover:bg-[#d0243b] text-white rounded-full font-bold text-sm shadow-xl active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Add / Edit Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl flex flex-col max-h-screen sm:max-h-[92vh] overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-base font-bold text-gray-900">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Item Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Samsung 25W Fast Charger"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Item Code / Barcode</label>
                  <input
                    type="text"
                    placeholder="e.g. CHG-25W"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Electronics"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Sale Price (Rs) *</label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl font-bold text-emerald-700 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Purchase Price (Rs)</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl font-bold text-gray-700 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Opening Stock</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl font-bold text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-2 py-2 border border-gray-200 rounded-xl text-gray-800 font-semibold"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Box">Box</option>
                    <option value="Kg">Kg</option>
                    <option value="Mtr">Mtr</option>
                    <option value="Ltr">Ltr</option>
                    <option value="Packet">Packet</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Min Alert</label>
                  <input
                    type="number"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl font-bold text-rose-600"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-gray-200 bg-white flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="flex-1 py-2.5 text-center text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="flex-1 py-2.5 text-center text-xs font-bold text-white bg-[#e52b44] hover:bg-[#d0243b] rounded-xl shadow-md"
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock In / Out Adjustment Modal */}
      {isStockAdjustModalOpen && stockAdjustItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-gray-900">Adjust Inventory Stock</h3>
              <button onClick={() => setIsStockAdjustModalOpen(false)}>✕</button>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900">{stockAdjustItem.name}</h4>
              <p className="text-gray-500">
                Current Stock: {stockAdjustItem.stockQuantity} {stockAdjustItem.unit}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('IN')}
                className={`py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border ${
                  adjustType === 'IN'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" /> Stock In (+)
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('OUT')}
                className={`py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border ${
                  adjustType === 'OUT'
                    ? 'bg-rose-50 border-rose-500 text-rose-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" /> Stock Out (-)
              </button>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Adjustment Quantity</label>
              <input
                type="number"
                min="1"
                value={adjustQty}
                onChange={(e) => setAdjustQty(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold text-sm text-center"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setIsStockAdjustModalOpen(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyStockAdjust}
                className="flex-1 py-2 bg-[#e52b44] text-white rounded-xl font-bold shadow-xs"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
