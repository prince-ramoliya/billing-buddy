export interface Seller {
  id: string;
  name: string;
  contact?: string;
  gstNumber?: string;
  paymentNotes?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  pricePerPiece: number;
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  categoryId: string;
  categoryName: string;
  pricePerPiece: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderDate: Date;
  sellerId: string;
  sellerName: string;
  items: OrderItem[];
  totalAmount: number;
  notes?: string;
  createdAt: Date;
}

export interface Return {
  id: string;
  returnDate: Date;
  sellerId: string;
  sellerName: string;
  categoryId: string;
  categoryName: string;
  quantity: number;
  pricePerUnit: number;
  totalDeduction: number;
  reason?: string;
  createdAt: Date;
}

export interface CompanySettings {
  companyName: string;
  gstNumber: string;
  currencySymbol: string;
}

export interface MonthlyReport {
  month: string;
  year: number;
  sellerId: string;
  sellerName: string;
  totalOrders: number;
  totalPieces: number;
  categoryBreakdown: {
    categoryName: string;
    quantity: number;
    pricePerPiece: number;
    subtotal: number;
  }[];
  grossAmount: number;
  totalReturns: {
    quantity: number;
    value: number;
  };
  netPayable: number;
}
