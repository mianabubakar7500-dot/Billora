import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Transaction,
  Party,
  Item,
  BusinessProfile,
  AppSettings,
  TransactionType,
} from '../types';
import {
  initialBusinessProfile,
  initialSettings,
  initialParties,
  initialItems,
  initialTransactions,
} from '../data/initialData';

interface AppContextType {
  // State
  transactions: Transaction[];
  parties: Party[];
  items: Item[];
  businessProfile: BusinessProfile;
  settings: AppSettings;
  activeTab: 'HOME' | 'DASHBOARD' | 'ITEMS' | 'MENU' | 'GET DESKTOP';
  homeSubTab: 'TRANSACTIONS' | 'PARTIES';
  viewMode: 'MOBILE' | 'DESKTOP';
  isSyncing: boolean;

  // Selected entities for modals
  selectedTransactionForPrint: Transaction | null;
  editingTransaction: Transaction | null;
  editingParty: Party | null;
  editingItem: Item | null;
  stockAdjustItem: Item | null;

  // Modal visibility
  isSaleModalOpen: boolean;
  saleModalType: TransactionType;
  isPartyModalOpen: boolean;
  isItemModalOpen: boolean;
  isStockAdjustModalOpen: boolean;
  isProfileModalOpen: boolean;
  isPartySettingsModalOpen: boolean;
  isPrintModalOpen: boolean;
  isSyncModalOpen: boolean;
  isQuickLinksModalOpen: boolean;

  // Setters & Actions
  setActiveTab: (tab: 'HOME' | 'DASHBOARD' | 'ITEMS' | 'MENU' | 'GET DESKTOP') => void;
  setHomeSubTab: (subTab: 'TRANSACTIONS' | 'PARTIES') => void;
  setViewMode: (mode: 'MOBILE' | 'DESKTOP') => void;
  setIsSaleModalOpen: (open: boolean, type?: TransactionType, editTxn?: Transaction | null) => void;
  setIsPartyModalOpen: (open: boolean, party?: Party | null) => void;
  setIsItemModalOpen: (open: boolean, item?: Item | null) => void;
  setIsStockAdjustModalOpen: (open: boolean, item?: Item | null) => void;
  setIsProfileModalOpen: (open: boolean) => void;
  setIsPartySettingsModalOpen: (open: boolean) => void;
  setIsPrintModalOpen: (open: boolean, txn?: Transaction | null) => void;
  setIsSyncModalOpen: (open: boolean) => void;
  setIsQuickLinksModalOpen: (open: boolean) => void;

  // Business logic
  addTransaction: (txn: Omit<Transaction, 'id'>) => Transaction;
  updateTransaction: (txn: Transaction) => void;
  deleteTransaction: (id: string) => void;
  convertQuotationToSale: (id: string) => Transaction | null;

  addParty: (party: Omit<Party, 'id' | 'createdAt'>) => Party;
  updateParty: (party: Party) => void;
  deleteParty: (id: string) => void;

  addItem: (item: Omit<Item, 'id'>) => Item;
  updateItem: (item: Item) => void;
  adjustStock: (itemId: string, change: number, type: 'IN' | 'OUT') => void;
  deleteItem: (id: string) => void;

  updateBusinessProfile: (profile: Partial<BusinessProfile>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;

  triggerSync: () => Promise<boolean>;
  exportDataJSON: () => void;
  importDataJSON: (jsonString: string) => boolean;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_TXN = 'billora_transactions_v1';
const STORAGE_KEY_PARTIES = 'billora_parties_v1';
const STORAGE_KEY_ITEMS = 'billora_items_v1';
const STORAGE_KEY_PROFILE = 'billora_profile_v1';
const STORAGE_KEY_SETTINGS = 'billora_settings_v1';
const STORAGE_KEY_VIEWMODE = 'billora_viewmode_v1';
export const STORAGE_KEY_INVOICE_DRAFT = 'billora_active_invoice_draft_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TXN);
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [parties, setParties] = useState<Party[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PARTIES);
    return saved ? JSON.parse(saved) : initialParties;
  });

  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
    return saved ? JSON.parse(saved) : initialItems;
  });

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name === 'Billora Store' || parsed.name === 'BILLORA TRADERS') {
          parsed.name = '';
        }
        return parsed;
      } catch {
        // ignore
      }
    }
    return initialBusinessProfile;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [viewMode, setViewModeState] = useState<'MOBILE' | 'DESKTOP'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_VIEWMODE);
    if (saved === 'MOBILE' || saved === 'DESKTOP') return saved;
    return window.innerWidth >= 1024 ? 'DESKTOP' : 'MOBILE';
  });

  const [activeTab, setActiveTab] = useState<'HOME' | 'DASHBOARD' | 'ITEMS' | 'MENU' | 'GET DESKTOP'>('HOME');
  const [homeSubTab, setHomeSubTab] = useState<'TRANSACTIONS' | 'PARTIES'>('TRANSACTIONS');
  const [isSyncing, setIsSyncing] = useState(false);

  // Check for auto-saved in-progress invoice draft
  const initialDraft = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INVOICE_DRAFT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isOpen) return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  })();

  // Modals state (auto-opens invoice if a draft was in-progress when browser was closed)
  const [isSaleModalOpen, setSaleModalOpen] = useState(Boolean(initialDraft?.isOpen));
  const [saleModalType, setSaleModalType] = useState<TransactionType>(initialDraft?.saleModalType || 'SALE');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(initialDraft?.editingTransaction || null);

  const [isPartyModalOpen, setPartyModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);

  const [isItemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const [isStockAdjustModalOpen, setStockAdjustModalOpen] = useState(false);
  const [stockAdjustItem, setStockAdjustItem] = useState<Item | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPartySettingsModalOpen, setIsPartySettingsModalOpen] = useState(false);

  const [isPrintModalOpen, setPrintModalOpen] = useState(false);
  const [selectedTransactionForPrint, setSelectedTransactionForPrint] = useState<Transaction | null>(null);

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isQuickLinksModalOpen, setIsQuickLinksModalOpen] = useState(false);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TXN, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PARTIES, JSON.stringify(parties));
  }, [parties]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(businessProfile));
  }, [businessProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const setViewMode = (mode: 'MOBILE' | 'DESKTOP') => {
    setViewModeState(mode);
    localStorage.setItem(STORAGE_KEY_VIEWMODE, mode);
  };

  const setIsSaleModalOpen = (open: boolean, type: TransactionType = 'SALE', editTxn: Transaction | null = null) => {
    setSaleModalType(type);
    setEditingTransaction(editTxn);
    setSaleModalOpen(open);
  };

  const setIsPartyModalOpen = (open: boolean, party: Party | null = null) => {
    setEditingParty(party);
    setPartyModalOpen(open);
  };

  const setIsItemModalOpen = (open: boolean, item: Item | null = null) => {
    setEditingItem(item);
    setItemModalOpen(open);
  };

  const setIsStockAdjustModalOpen = (open: boolean, item: Item | null = null) => {
    setStockAdjustItem(item);
    setStockAdjustModalOpen(open);
  };

  const setIsPrintModalOpen = (open: boolean, txn: Transaction | null = null) => {
    setSelectedTransactionForPrint(txn);
    setPrintModalOpen(open);
  };

  // Business operations
  const addTransaction = (txnData: Omit<Transaction, 'id'>): Transaction => {
    const nextId = 'txn-' + Date.now();
    const newTxn: Transaction = {
      ...txnData,
      id: nextId,
    };

    setTransactions((prev) => [newTxn, ...prev]);

    // Update Party balance if party is selected
    if (newTxn.partyId && newTxn.balanceDue > 0) {
      setParties((prev) =>
        prev.map((p) => {
          if (p.id === newTxn.partyId) {
            const addedBal = newTxn.type === 'SALE' ? newTxn.balanceDue : -newTxn.balanceDue;
            return {
              ...p,
              currentBalance: Math.max(0, p.currentBalance + addedBal),
            };
          }
          return p;
        })
      );
    }

    // Adjust inventory stock for SALE & PURCHASE
    if (newTxn.type === 'SALE' || newTxn.type === 'PURCHASE') {
      const isSale = newTxn.type === 'SALE';
      setItems((prevItems) =>
        prevItems.map((item) => {
          const lineItem = newTxn.items.find((li) => li.itemId === item.id || li.name.toLowerCase() === item.name.toLowerCase());
          if (lineItem) {
            const stockDelta = isSale ? -lineItem.quantity : lineItem.quantity;
            return {
              ...item,
              stockQuantity: Math.max(0, item.stockQuantity + stockDelta),
            };
          }
          return item;
        })
      );
    }

    return newTxn;
  };

  const updateTransaction = (updatedTxn: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updatedTxn.id ? updatedTxn : t)));
    setSelectedTransactionForPrint((prev) => (prev?.id === updatedTxn.id ? updatedTxn : prev));
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const convertQuotationToSale = (quotationId: string): Transaction | null => {
    const quotation = transactions.find((t) => t.id === quotationId);
    if (!quotation) return null;

    // Generate new Sale invoice
    const saleTxn: Transaction = {
      ...quotation,
      id: 'txn-' + Date.now(),
      invoiceNo: String(transactions.filter((t) => t.type === 'SALE').length + 1),
      type: 'SALE',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }),
      status: quotation.amountReceived >= quotation.totalAmount ? 'PAID' : quotation.amountReceived > 0 ? 'PARTIAL' : 'UNPAID',
      notes: (quotation.notes ? quotation.notes + ' | ' : '') + `Converted from Quotation #${quotation.invoiceNo}`,
      isQuotationConverted: true,
    };

    // Mark original quotation converted
    setTransactions((prev) =>
      [saleTxn, ...prev.map((t) => (t.id === quotationId ? { ...t, isQuotationConverted: true } : t))]
    );

    // Update item stocks
    setItems((prevItems) =>
      prevItems.map((item) => {
        const lineItem = saleTxn.items.find((li) => li.itemId === item.id || li.name.toLowerCase() === item.name.toLowerCase());
        if (lineItem) {
          return {
            ...item,
            stockQuantity: Math.max(0, item.stockQuantity - lineItem.quantity),
          };
        }
        return item;
      })
    );

    return saleTxn;
  };

  const addParty = (partyData: Omit<Party, 'id' | 'createdAt'>): Party => {
    const newParty: Party = {
      ...partyData,
      id: 'p-' + Date.now(),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setParties((prev) => [...prev, newParty]);
    return newParty;
  };

  const updateParty = (updatedParty: Party) => {
    setParties((prev) => prev.map((p) => (p.id === updatedParty.id ? updatedParty : p)));
  };

  const deleteParty = (id: string) => {
    setParties((prev) => prev.filter((p) => p.id !== id));
  };

  const addItem = (itemData: Omit<Item, 'id'>): Item => {
    const newItem: Item = {
      ...itemData,
      id: 'item-' + Date.now(),
    };
    setItems((prev) => [...prev, newItem]);
    return newItem;
  };

  const updateItem = (updatedItem: Item) => {
    setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
  };

  const adjustStock = (itemId: string, change: number, type: 'IN' | 'OUT') => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const delta = type === 'IN' ? change : -change;
          return {
            ...item,
            stockQuantity: Math.max(0, item.stockQuantity + delta),
          };
        }
        return item;
      })
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateBusinessProfile = (profile: Partial<BusinessProfile>) => {
    setBusinessProfile((prev) => ({ ...prev, ...profile }));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const triggerSync = async (): Promise<boolean> => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 1200));
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today';
    setSettings((prev) => ({ ...prev, lastSyncTime: nowStr }));
    setIsSyncing(false);
    return true;
  };

  const exportDataJSON = () => {
    const backup = {
      appName: 'Billora Billing App',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      businessProfile,
      settings,
      parties,
      items,
      transactions,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Billora_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.businessProfile) setBusinessProfile(data.businessProfile);
      if (data.settings) setSettings(data.settings);
      if (Array.isArray(data.parties)) setParties(data.parties);
      if (Array.isArray(data.items)) setItems(data.items);
      if (Array.isArray(data.transactions)) setTransactions(data.transactions);
      return true;
    } catch {
      return false;
    }
  };

  const resetAllData = () => {
    setTransactions(initialTransactions);
    setParties(initialParties);
    setItems(initialItems);
    setBusinessProfile(initialBusinessProfile);
    setSettings(initialSettings);
  };

  return (
    <AppContext.Provider
      value={{
        transactions,
        parties,
        items,
        businessProfile,
        settings,
        activeTab,
        homeSubTab,
        viewMode,
        isSyncing,
        selectedTransactionForPrint,
        editingTransaction,
        editingParty,
        editingItem,
        stockAdjustItem,
        isSaleModalOpen,
        saleModalType,
        isPartyModalOpen,
        isItemModalOpen,
        isStockAdjustModalOpen,
        isProfileModalOpen,
        isPartySettingsModalOpen,
        isPrintModalOpen,
        isSyncModalOpen,
        isQuickLinksModalOpen,
        setActiveTab,
        setHomeSubTab,
        setViewMode,
        setIsSaleModalOpen,
        setIsPartyModalOpen,
        setIsItemModalOpen,
        setIsStockAdjustModalOpen,
        setIsProfileModalOpen,
        setIsPartySettingsModalOpen,
        setIsPrintModalOpen,
        setIsSyncModalOpen,
        setIsQuickLinksModalOpen,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        convertQuotationToSale,
        addParty,
        updateParty,
        deleteParty,
        addItem,
        updateItem,
        adjustStock,
        deleteItem,
        updateBusinessProfile,
        updateSettings,
        triggerSync,
        exportDataJSON,
        importDataJSON,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
