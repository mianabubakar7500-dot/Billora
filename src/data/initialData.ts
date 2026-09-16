import { BusinessProfile, Item, Party, Transaction, AppSettings } from '../types';

export const initialBusinessProfile: BusinessProfile = {
  name: '',
  phone1: '3256181588',
  phone2: '03001234567',
  email: 'support@billora.com',
  address: 'Commercial Market, Shop #14, Main Road',
  pincode: '46000',
  description: 'Wholesale & Retail Billing and Electronics Solution',
  bankName: 'HBL / Allied Bank',
  accountNumber: '10293847561029',
  ifscCode: 'HBLPK0021',
  upiId: 'billora@bank',
  terms: '1. Goods once sold will only be replaced within 7 days.\n2. Warranty as per manufacturer terms.\n3. Payment due within 15 days.',
};

export const initialSettings: AppSettings = {
  currencySymbol: 'Rs',
  tinEnabled: false,
  partyGrouping: false,
  partyAdditionalFields: false,
  partyShippingAddress: false,
  invitePartiesEnabled: true,
  loyaltyPointsEnabled: false,
  autoSync: true,
  lastSyncTime: 'Just now',
};

export const initialParties: Party[] = [];

export const initialItems: Item[] = [];

export const initialTransactions: Transaction[] = [];

