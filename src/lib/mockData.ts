import { Seller, ProductCategory, Order, Return, CompanySettings } from '@/types/billing';

export const mockSellers: Seller[] = [
  {
    id: '1',
    name: 'Fashion Hub Supplier',
    contact: '+91 98765 43210',
    gstNumber: '27AABCU9603R1ZM',
    paymentNotes: 'Net 30 days',
    isActive: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Textile World',
    contact: '+91 87654 32109',
    gstNumber: '27AABCU9604R1ZN',
    paymentNotes: 'Net 15 days',
    isActive: true,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '3',
    name: 'Urban Threads',
    contact: '+91 76543 21098',
    gstNumber: '27AABCU9605R1ZO',
    isActive: true,
    createdAt: new Date('2024-03-10'),
  },
];

export const mockCategories: ProductCategory[] = [
  { id: '1', name: 'Hoodie', pricePerPiece: 230, isActive: true },
  { id: '2', name: 'Half-sleeve Shirt', pricePerPiece: 130, isActive: true },
  { id: '3', name: 'Double-pocket Shirt', pricePerPiece: 160, isActive: true },
  { id: '4', name: 'Full-sleeve Shirt', pricePerPiece: 150, isActive: true },
];

export const mockOrders: Order[] = [
  {
    id: '1',
    orderDate: new Date('2025-01-15'),
    sellerId: '1',
    sellerName: 'Fashion Hub Supplier',
    items: [
      { id: '1a', categoryId: '1', categoryName: 'Hoodie', pricePerPiece: 230, quantity: 50, subtotal: 11500 },
      { id: '1b', categoryId: '2', categoryName: 'Half-sleeve Shirt', pricePerPiece: 130, quantity: 100, subtotal: 13000 },
    ],
    totalAmount: 24500,
    notes: 'Urgent delivery needed',
    createdAt: new Date('2025-01-15'),
  },
  {
    id: '2',
    orderDate: new Date('2025-01-16'),
    sellerId: '2',
    sellerName: 'Textile World',
    items: [
      { id: '2a', categoryId: '3', categoryName: 'Double-pocket Shirt', pricePerPiece: 160, quantity: 75, subtotal: 12000 },
      { id: '2b', categoryId: '4', categoryName: 'Full-sleeve Shirt', pricePerPiece: 150, quantity: 60, subtotal: 9000 },
    ],
    totalAmount: 21000,
    createdAt: new Date('2025-01-16'),
  },
  {
    id: '3',
    orderDate: new Date('2025-01-17'),
    sellerId: '1',
    sellerName: 'Fashion Hub Supplier',
    items: [
      { id: '3a', categoryId: '1', categoryName: 'Hoodie', pricePerPiece: 230, quantity: 30, subtotal: 6900 },
    ],
    totalAmount: 6900,
    createdAt: new Date('2025-01-17'),
  },
  {
    id: '4',
    orderDate: new Date('2025-01-17'),
    sellerId: '3',
    sellerName: 'Urban Threads',
    items: [
      { id: '4a', categoryId: '2', categoryName: 'Half-sleeve Shirt', pricePerPiece: 130, quantity: 200, subtotal: 26000 },
      { id: '4b', categoryId: '4', categoryName: 'Full-sleeve Shirt', pricePerPiece: 150, quantity: 80, subtotal: 12000 },
    ],
    totalAmount: 38000,
    createdAt: new Date('2025-01-17'),
  },
];

export const mockReturns: Return[] = [
  {
    id: '1',
    returnDate: new Date('2025-01-16'),
    sellerId: '1',
    sellerName: 'Fashion Hub Supplier',
    categoryId: '1',
    categoryName: 'Hoodie',
    quantity: 5,
    pricePerUnit: 230,
    totalDeduction: 1150,
    reason: 'Defective stitching',
    createdAt: new Date('2025-01-16'),
  },
  {
    id: '2',
    returnDate: new Date('2025-01-17'),
    sellerId: '2',
    sellerName: 'Textile World',
    categoryId: '3',
    categoryName: 'Double-pocket Shirt',
    quantity: 10,
    pricePerUnit: 160,
    totalDeduction: 1600,
    reason: 'Wrong size batch',
    createdAt: new Date('2025-01-17'),
  },
];

export const mockCompanySettings: CompanySettings = {
  companyName: 'StyleCraft Apparels',
  gstNumber: '27AABCS1234R1ZX',
  currencySymbol: '₹',
};

// Dashboard stats
export const getDashboardStats = () => {
  const today = new Date();
  const todayStr = today.toDateString();
  
  const todaysOrders = mockOrders.filter(
    order => order.orderDate.toDateString() === todayStr
  ).length;
  
  const monthlyPieces = mockOrders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);
  
  const monthlyAmount = mockOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const monthlyReturns = mockReturns.reduce((sum, ret) => sum + ret.totalDeduction, 0);
  
  const sellerVolume = mockOrders.reduce((acc, order) => {
    acc[order.sellerName] = (acc[order.sellerName] || 0) + order.totalAmount;
    return acc;
  }, {} as Record<string, number>);
  
  const topSeller = Object.entries(sellerVolume).sort((a, b) => b[1] - a[1])[0];
  
  return {
    todaysOrders,
    monthlyPieces,
    monthlyPayable: monthlyAmount - monthlyReturns,
    topSeller: topSeller ? { name: topSeller[0], amount: topSeller[1] } : null,
  };
};

// Chart data
export const getOrdersOverTime = () => [
  { date: 'Jan 10', orders: 3, amount: 15000 },
  { date: 'Jan 11', orders: 5, amount: 28000 },
  { date: 'Jan 12', orders: 2, amount: 12000 },
  { date: 'Jan 13', orders: 7, amount: 42000 },
  { date: 'Jan 14', orders: 4, amount: 25000 },
  { date: 'Jan 15', orders: 6, amount: 35000 },
  { date: 'Jan 16', orders: 8, amount: 48000 },
  { date: 'Jan 17', orders: 5, amount: 32000 },
];

export const getPiecesByCategory = () => [
  { category: 'Hoodie', pieces: 80, fill: 'hsl(var(--chart-1))' },
  { category: 'Half-sleeve', pieces: 300, fill: 'hsl(var(--chart-2))' },
  { category: 'Double-pocket', pieces: 75, fill: 'hsl(var(--chart-3))' },
  { category: 'Full-sleeve', pieces: 140, fill: 'hsl(var(--chart-4))' },
];

export const getRevenueBySupplier = () => [
  { seller: 'Fashion Hub', revenue: 31400, returns: 1150 },
  { seller: 'Textile World', revenue: 21000, returns: 1600 },
  { seller: 'Urban Threads', revenue: 38000, returns: 0 },
];

export const getMonthlyTrend = () => [
  { month: 'Oct', payable: 85000 },
  { month: 'Nov', payable: 92000 },
  { month: 'Dec', payable: 78000 },
  { month: 'Jan', payable: 87650 },
];
