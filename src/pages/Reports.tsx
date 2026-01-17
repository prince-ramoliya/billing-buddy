import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockSellers, mockOrders, mockReturns, mockCompanySettings } from '@/lib/mockData';

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState('2025-01');
  const [selectedSeller, setSelectedSeller] = useState('all');

  // Calculate report data
  const filteredOrders = mockOrders.filter((order) => {
    const matchesSeller = selectedSeller === 'all' || order.sellerId === selectedSeller;
    return matchesSeller;
  });

  const filteredReturns = mockReturns.filter((ret) => {
    const matchesSeller = selectedSeller === 'all' || ret.sellerId === selectedSeller;
    return matchesSeller;
  });

  const totalOrders = filteredOrders.length;
  const totalPieces = filteredOrders.reduce(
    (sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0),
    0
  );
  const grossAmount = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalReturnValue = filteredReturns.reduce((sum, ret) => sum + ret.totalDeduction, 0);
  const totalReturnQty = filteredReturns.reduce((sum, ret) => sum + ret.quantity, 0);
  const netPayable = grossAmount - totalReturnValue;

  // Category breakdown
  const categoryBreakdown = filteredOrders.reduce((acc, order) => {
    order.items.forEach((item) => {
      if (!acc[item.categoryName]) {
        acc[item.categoryName] = { quantity: 0, pricePerPiece: item.pricePerPiece, subtotal: 0 };
      }
      acc[item.categoryName].quantity += item.quantity;
      acc[item.categoryName].subtotal += item.subtotal;
    });
    return acc;
  }, {} as Record<string, { quantity: number; pricePerPiece: number; subtotal: number }>);

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Monthly Reports</h1>
          <p className="text-muted-foreground mt-1">
            Generate supplier-wise billing reports
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Month</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-01">January 2025</SelectItem>
              <SelectItem value="2024-12">December 2024</SelectItem>
              <SelectItem value="2024-11">November 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Seller</label>
          <Select value={selectedSeller} onValueChange={setSelectedSeller}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sellers</SelectItem>
              {mockSellers.map((seller) => (
                <SelectItem key={seller.id} value={seller.id}>
                  {seller.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-card rounded-md border shadow-sm p-8 max-w-4xl">
        {/* Header */}
        <div className="border-b pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">{mockCompanySettings.companyName}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                GST: {mockCompanySettings.gstNumber}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-primary">
                <FileText className="h-5 w-5" />
                <span className="font-semibold">Monthly Report</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Period: January 2025
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{totalOrders}</p>
          </div>
          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Total Pieces</p>
            <p className="text-2xl font-bold">{totalPieces.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Gross Amount</p>
            <p className="text-2xl font-bold">₹{grossAmount.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-primary/10 rounded-md">
            <p className="text-sm text-primary">Net Payable</p>
            <p className="text-2xl font-bold text-primary">₹{netPayable.toLocaleString()}</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mb-6">
          <h3 className="section-title">Category Breakdown</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th className="numeric">Price/Piece</th>
                <th className="numeric">Quantity</th>
                <th className="numeric">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categoryBreakdown).map(([name, data]) => (
                <tr key={name}>
                  <td className="font-medium">{name}</td>
                  <td className="numeric">₹{data.pricePerPiece}</td>
                  <td className="numeric">{data.quantity}</td>
                  <td className="numeric font-medium">₹{data.subtotal.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-muted/50">
                <td colSpan={2} className="font-semibold">Total</td>
                <td className="numeric font-semibold">{totalPieces}</td>
                <td className="numeric font-semibold">₹{grossAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Returns Section */}
        {totalReturnValue > 0 && (
          <div className="mb-6">
            <h3 className="section-title text-destructive">Returns / Deductions</h3>
            <div className="p-4 bg-destructive/10 rounded-md flex justify-between items-center">
              <div>
                <p className="text-sm text-destructive">Total Returned Pieces</p>
                <p className="text-lg font-semibold">{totalReturnQty} pieces</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-destructive">Amount Deducted</p>
                <p className="text-xl font-bold text-destructive">
                  -₹{totalReturnValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Final Amount */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Net Payable Amount</span>
            <span className="text-2xl font-bold text-success">
              ₹{netPayable.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
