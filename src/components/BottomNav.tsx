import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, BarChart2, Package, Menu as MenuIcon } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setViewMode } = useApp();

  return (
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto shadow-lg">
      <div className="flex items-center justify-around h-15 px-1">
        {/* HOME */}
        <button
          id="tab-home"
          onClick={() => setActiveTab('HOME')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'HOME' ? 'text-sky-600 font-bold' : 'text-gray-500 font-medium hover:text-gray-700'
          }`}
        >
          <Home className={`w-5 h-5 mb-0.5 ${activeTab === 'HOME' ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight uppercase">HOME</span>
        </button>

        {/* DASHBOARD */}
        <button
          id="tab-dashboard"
          onClick={() => setActiveTab('DASHBOARD')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'DASHBOARD' ? 'text-sky-600 font-bold' : 'text-gray-500 font-medium hover:text-gray-700'
          }`}
        >
          <BarChart2 className={`w-5 h-5 mb-0.5 ${activeTab === 'DASHBOARD' ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight uppercase">DASHBOARD</span>
        </button>

        {/* ITEMS */}
        <button
          id="tab-items"
          onClick={() => setActiveTab('ITEMS')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'ITEMS' ? 'text-sky-600 font-bold' : 'text-gray-500 font-medium hover:text-gray-700'
          }`}
        >
          <Package className={`w-5 h-5 mb-0.5 ${activeTab === 'ITEMS' ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight uppercase">ITEMS</span>
        </button>

        {/* MENU */}
        <button
          id="tab-menu"
          onClick={() => setActiveTab('MENU')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'MENU' ? 'text-sky-600 font-bold' : 'text-gray-500 font-medium hover:text-gray-700'
          }`}
        >
          <MenuIcon className={`w-5 h-5 mb-0.5 ${activeTab === 'MENU' ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight uppercase">MENU</span>
        </button>

        {/* GET DESKTOP (Vyapar signature Windows 4-color squares icon) */}
        <button
          id="tab-get-desktop"
          onClick={() => {
            setViewMode('DESKTOP');
            setActiveTab('GET DESKTOP');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'GET DESKTOP' ? 'text-sky-600 font-bold' : 'text-gray-500 font-medium hover:text-gray-700'
          }`}
        >
          <div className="grid grid-cols-2 gap-0.5 w-4 h-4 mb-1">
            <span className="bg-amber-500 rounded-[1px] w-1.5 h-1.5"></span>
            <span className="bg-sky-500 rounded-[1px] w-1.5 h-1.5"></span>
            <span className="bg-emerald-500 rounded-[1px] w-1.5 h-1.5"></span>
            <span className="bg-red-500 rounded-[1px] w-1.5 h-1.5"></span>
          </div>
          <span className="text-[9px] tracking-tight uppercase">GET DESKTOP</span>
        </button>
      </div>
    </nav>
  );
};
