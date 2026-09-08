import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  TrendingDown,
  Coins,
  ShoppingCart,
  Boxes,
  Users,
  Wallet,
  Building2,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { transactions, parties, items, setIsSaleModalOpen, setIsPartyModalOpen, setIsPrintModalOpen } = useApp();

  const salesTxns = transactions.filter((t) => t.type === 'SALE');
  const purchaseTxns = transactions.filter((t) => t.type === 'PURCHASE');

  const totalSalesAmount = salesTxns.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalPurchasesAmount = purchaseTxns.reduce((sum, t) => sum + t.totalAmount, 0);

  const totalReceivables = parties
    .filter((p) => p.balanceType === 'to_receive')
    .reduce((sum, p) => sum + p.currentBalance, 0);

  const totalPayables = parties
    .filter((p) => p.balanceType === 'to_pay')
    .reduce((sum, p) => sum + p.currentBalance, 0);

  const totalStockValue = items.reduce((sum, i) => sum + i.stockQuantity * i.salePrice, 0);

  return (
    <div className="pb-28 pt-2 px-3 max-w-md mx-auto min-h-[calc(100vh-120px)] space-y-3.5">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 text-white rounded-3xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-200">Business Net Position</span>
          <span className="text-[10px] bg-sky-500/30 px-2 py-0.5 rounded-full border border-sky-400/40">
            Live Vyapar Sync
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-xs text-sky-200">Net Sales Volume</span>
          <h2 className="text-2xl font-black tracking-tight">Rs {totalSalesAmount.toLocaleString()}</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-sky-500/30 text-xs">
          <div>
            <span className="text-sky-200 block text-[11px]">Total Receivables</span>
            <span className="font-bold text-emerald-300">Rs {totalReceivables.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-sky-200 block text-[11px]">Total Payables</span>
            <span className="font-bold text-rose-300">Rs {totalPayables.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Metric Tiles 2x2 */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Sales Card */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-sky-600 mb-1">
            <Coins className="w-5 h-5" />
            <span className="text-[10px] font-bold bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded">
              {salesTxns.length} Bills
            </span>
          </div>
          <span className="text-xs text-gray-500 font-medium block">Total Sales</span>
          <span className="text-base font-black text-gray-900">Rs {totalSalesAmount.toLocaleString()}</span>
        </div>

        {/* Purchases Card */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <ShoppingCart className="w-5 h-5" />
            <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
              {purchaseTxns.length} Bills
            </span>
          </div>
          <span className="text-xs text-gray-500 font-medium block">Total Purchases</span>
          <span className="text-base font-black text-gray-900">Rs {totalPurchasesAmount.toLocaleString()}</span>
        </div>

        {/* Stock Value */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-indigo-600 mb-1">
            <Boxes className="w-5 h-5" />
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
              {items.length} Items
            </span>
          </div>
          <span className="text-xs text-gray-500 font-medium block">Stock Valuation</span>
          <span className="text-base font-black text-gray-900">Rs {totalStockValue.toLocaleString()}</span>
        </div>

        {/* Parties Card */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
              {parties.length} Parties
            </span>
          </div>
          <span className="text-xs text-gray-500 font-medium block">Active Parties</span>
          <span className="text-base font-black text-emerald-600">
            {parties.filter((p) => p.type === 'Customer').length} Customers
          </span>
        </div>
      </div>

      {/* Cash & Bank Balances */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-2.5">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Cash & Bank Balances</h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl">
            <Wallet className="w-5 h-5 text-sky-600 shrink-0" />
            <div>
              <span className="text-gray-500 text-[10px] block">Cash In-Hand</span>
              <span className="font-bold text-gray-900">Rs 15,200.00</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl">
            <Building2 className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <span className="text-gray-500 text-[10px] block">Bank Account</span>
              <span className="font-bold text-gray-900">Rs 24,500.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Recent Activity</h4>
          <span className="text-[10px] text-sky-600 font-semibold">{transactions.length} Total</span>
        </div>

        <div className="divide-y divide-gray-100 text-xs">
          {transactions.slice(0, 5).map((txn) => (
            <div
              key={txn.id}
              onClick={() => setIsPrintModalOpen(true, txn)}
              className="py-2.5 flex items-center justify-between hover:bg-gray-50 cursor-pointer rounded-lg px-1 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    txn.type === 'SALE'
                      ? 'bg-emerald-50 text-emerald-600'
                      : txn.type === 'PURCHASE'
                      ? 'bg-sky-50 text-sky-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {txn.type === 'SALE' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h5 className="font-bold text-gray-900">{txn.partyName}</h5>
                  <p className="text-[10px] text-gray-400">
                    #{txn.invoiceNo} • {txn.date}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-black text-gray-900 block">Rs {txn.totalAmount.toFixed(2)}</span>
                <span
                  className={`text-[10px] font-bold ${
                    txn.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {txn.balanceDue > 0 ? `Bal: Rs ${txn.balanceDue}` : 'Fully Paid'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
