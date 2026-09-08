import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Search, Info, ChevronRight, Crown } from 'lucide-react';

export const PartySettingsModal: React.FC = () => {
  const { settings, updateSettings, isPartySettingsModalOpen, setIsPartySettingsModalOpen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  if (!isPartySettingsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl flex flex-col max-h-screen sm:max-h-[90vh] overflow-hidden">
        {/* Header (Screenshot 2 exact match) */}
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between bg-sky-50/40">
          <div className="flex items-center gap-3">
            <button
              id="btn-close-party-settings-back"
              onClick={() => setIsPartySettingsModalOpen(false)}
              className="p-1 text-gray-700 hover:text-gray-900 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <h2 className="text-base font-bold text-gray-900">Party</h2>
          </div>

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-1 text-gray-600 hover:text-gray-900 rounded-full"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar toggle */}
        {showSearch && (
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <input
              type="text"
              placeholder="Search party settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        )}

        {/* Settings List (Screenshot 2 exact match) */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 text-sm">
          {/* TIN number */}
          <div className="flex items-center justify-between px-4 py-4 hover:bg-gray-50/70 transition-colors">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-800 text-[14px]">TIN number</span>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <button
              type="button"
              onClick={() => updateSettings({ tinEnabled: !settings.tinEnabled })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.tinEnabled ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
            </button>
          </div>

          {/* Party Grouping */}
          <div className="flex items-center justify-between px-4 py-4 hover:bg-gray-50/70 transition-colors">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-800 text-[14px]">Party Grouping</span>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <button
              type="button"
              onClick={() => updateSettings({ partyGrouping: !settings.partyGrouping })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.partyGrouping ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
            </button>
          </div>

          {/* Party Additional Fields */}
          <div
            onClick={() => alert('Party Additional Fields: Custom fields configured for party registration.')}
            className="flex items-center justify-between px-4 py-4 hover:bg-gray-50/70 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-800 text-[14px]">Party Additional Fields</span>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>

          {/* Party Shipping Address */}
          <div className="flex items-center justify-between px-4 py-4 hover:bg-gray-50/70 transition-colors">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-800 text-[14px]">Party Shipping Address</span>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <button
              type="button"
              onClick={() => updateSettings({ partyShippingAddress: !settings.partyShippingAddress })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.partyShippingAddress ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
            </button>
          </div>

          {/* Invite parties to add themselves (Active blue switch in screenshot 2) */}
          <div className="flex items-center justify-between px-4 py-4 hover:bg-gray-50/70 transition-colors">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-800 text-[14px]">
                Invite parties to add themselves
              </span>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <button
              type="button"
              onClick={() => updateSettings({ invitePartiesEnabled: !settings.invitePartiesEnabled })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.invitePartiesEnabled ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
            </button>
          </div>

          {/* Loyalty Points (With crown icon) */}
          <div className="flex items-center justify-between px-4 py-4 hover:bg-gray-50/70 transition-colors">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-800 text-[14px]">Loyalty Points</span>
              <Info className="w-4 h-4 text-gray-400" />
              <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Crown className="w-2.5 h-2.5 fill-purple-600" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => updateSettings({ loyaltyPointsEnabled: !settings.loyaltyPointsEnabled })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.loyaltyPointsEnabled ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
            </button>
          </div>
        </div>

        {/* Done Button */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={() => setIsPartySettingsModalOpen(false)}
            className="px-5 py-2 bg-[#e52b44] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#d0243b]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
