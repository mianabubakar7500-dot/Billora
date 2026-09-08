export type TransactionType = 'SALE' | 'PURCHASE' | 'QUOTATION' | 'EXPENSE' | 'PAYMENT_IN' | 'PAYMENT_OUT';

export type PaymentMode = 'Cash' | 'Online' | 'Cheque' | 'Credit';

export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID';

export interface TransactionItem {
  id: string;
  itemId?: string;
  name: string;
  quantity: number;
  unit: string;
  rate: number;
  discountPercent?: number;
  taxPercent?: number;
  amount: number;
}

export interface Transaction {
  id: string;
  invoiceNo: string;
  type: TransactionType;
  date: string;
  partyId?: string;
  partyName: string;
  partyPhone?: string;
  items: TransactionItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  totalAmount: number;
  amountReceived: number;
  balanceDue: number;
  paymentMode: PaymentMode;
  notes?: string;
  status: PaymentStatus;
  isQuotationConverted?: boolean;
}

export interface Party {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: 'Customer' | 'Supplier';
  gstin?: string;
  tin?: string;
  billingAddress?: string;
  shippingAddress?: string;
  openingBalance: number;
  balanceType: 'to_receive' | 'to_pay';
  currentBalance: number;
  loyaltyPoints?: number;
  createdAt: string;
}

export interface Item {
  id: string;
  name: string;
  itemCode?: string;
  hsnCode?: string;
  category: string;
  unit: string;
  salePrice: number;
  purchasePrice: number;
  stockQuantity: number;
  minStockAlert: number;
  taxPercent: number;
}

export interface BusinessProfile {
  name: string;
  phone1: string;
  phone2?: string;
  email: string;
  address: string;
  pincode: string;
  description: string;
  gstin?: string;
  logoUrl?: string;
  signatureUrl?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  terms?: string;
}

export interface AppSettings {
  currencySymbol: string;
  tinEnabled: boolean;
  partyGrouping: boolean;
  partyAdditionalFields: boolean;
  partyShippingAddress: boolean;
  invitePartiesEnabled: boolean;
  loyaltyPointsEnabled: boolean;
  autoSync: boolean;
  lastSyncTime: string;
}
