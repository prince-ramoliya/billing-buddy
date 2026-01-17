import { useState, useMemo } from 'react';
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
import { useSellers } from '@/hooks/useSellers';
import { useSettings } from '@/hooks/useSettings';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generatePDF } from '@/lib/pdfGenerator';
import { format } from 'date-fns';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function Reports() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
  const [selectedSeller, setSelectedSeller] = useState('all');

  const { data: sellers } = useSellers();
  const { data: settings } = useSettings();

  // Fetch orders and returns for the selected period
  const { data: reportData } = useQuery({
    queryKey: ['report', selectedMonth, selectedYear, selectedSeller],
    queryFn: async () => {
      const startDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 1);
      const endDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) + 1, 0);

      let ordersQuery = supabase
        .from('orders')
        .select('*, sellers(*)')
        .gte('order_date', format(startDate, 'yyyy-MM-dd'))
        .lte('order_date', format(endDate, 'yyyy-MM-dd'));

      let returnsQuery = supabase
        .from('returns')
        .select('*, sellers(*), product_categories(*)')
        .gte('return_date', format(startDate, 'yyyy-MM-dd'))
        .lte('return_date', format(endDate, 'yyyy-MM-dd'));

      if (selectedSeller !== 'all') {
        ordersQuery = ordersQuery.eq('seller_id', selectedSeller);
        returnsQuery = returnsQuery.eq('seller_id', selectedSeller);
      }

      const [{ data: orders }, { data: returns }, { data: orderItems }] = await Promise.all([
        ordersQuery,
        returnsQuery,
        supabase.from('order_items').select('*, product_categories(*)'),
      ]);

      // Filter order items by order IDs
      const orderIds = orders?.map((o) => o.id) || [];
      const filteredItems = orderItems?.filter((item) => orderIds.includes(item.order_id)) || [];

      return { orders: orders || [], returns: returns || [], orderItems: filteredItems };
    },
  });

  // Calculate report summary
  const summary = useMemo(() => {
    if (!reportData) return null;

    const { orders, returns, orderItems } = reportData;

    const totalOrders = orders.length;
    const totalPieces = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const grossAmount = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const totalReturnValue = returns.reduce((sum, ret) => sum + Number(ret.total_deduction), 0);
    const totalReturnQty = returns.reduce((sum, ret) => sum + ret.quantity, 0);
    const netPayable = grossAmount - totalReturnValue;

    // Category breakdown
    const categoryMap: Record<string, { name: string; pricePerPiece: number; quantity: number; subtotal: number }> = {};
    orderItems.forEach((item) => {
      const name = item.product_categories?.name || 'Unknown';
      if (!categoryMap[name]) {
        categoryMap[name] = {
          name,
          pricePerPiece: Number(item.price_per_piece),
          quantity: 0,
          subtotal: 0,
        };
      }
      categoryMap[name].quantity += item.quantity;
      categoryMap[name].subtotal += Number(item.subtotal);
    });

    return {
      totalOrders,
      totalPieces,
      grossAmount,
      totalReturnValue,
      totalReturnQty,
      netPayable,
      categoryBreakdown: Object.values(categoryMap),
    };
  }, [reportData]);

  const handleDownloadPDF = () => {
    if (!summary || !settings) return;

    const sellerName = selectedSeller === 'all'
      ? 'All Sellers'
      : sellers?.find((s) => s.id === selectedSeller)?.name || 'Unknown';

    generatePDF({
      companyName: settings.company_name,
      gstNumber: settings.gst_number || '',
      month: months[parseInt(selectedMonth)],
      year: parseInt(selectedYear),
      sellerName,
      categoryBreakdown: summary.categoryBreakdown,
      grossAmount: summary.grossAmount,
      totalReturns: summary.totalReturnValue,
      totalReturnQty: summary.totalReturnQty,
      netPayable: summary.netPayable,
    });
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Monthly Reports</h1>
          <p className="text-muted-foreground mt-1">Generate supplier-wise billing reports</p>
        </div>
        <Button onClick={handleDownloadPDF} disabled={!summary}>
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
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Year</label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
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
              {sellers?.map((seller) => (
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
              <h2 className="text-xl font-bold">{settings?.company_name || 'WorldWave'}</h2>
              {settings?.gst_number && (
                <p className="text-sm text-muted-foreground mt-1">
                  GST: {settings.gst_number}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-primary">
                <FileText className="h-5 w-5" />
                <span className="font-semibold">Monthly Report</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Period: {months[parseInt(selectedMonth)]} {selectedYear}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{summary?.totalOrders || 0}</p>
          </div>
          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Total Pieces</p>
            <p className="text-2xl font-bold">{(summary?.totalPieces || 0).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Gross Amount</p>
            <p className="text-2xl font-bold">₹{(summary?.grossAmount || 0).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-primary/10 rounded-md">
            <p className="text-sm text-primary">Net Payable</p>
            <p className="text-2xl font-bold text-primary">
              ₹{(summary?.netPayable || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        {summary && summary.categoryBreakdown.length > 0 && (
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
                {summary.categoryBreakdown.map((cat) => (
                  <tr key={cat.name}>
                    <td className="font-medium">{cat.name}</td>
                    <td className="numeric">₹{cat.pricePerPiece.toLocaleString()}</td>
                    <td className="numeric">{cat.quantity}</td>
                    <td className="numeric font-medium">₹{cat.subtotal.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="bg-muted/50">
                  <td colSpan={2} className="font-semibold">
                    Total
                  </td>
                  <td className="numeric font-semibold">{summary.totalPieces}</td>
                  <td className="numeric font-semibold">
                    ₹{summary.grossAmount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Returns Section */}
        {summary && summary.totalReturnValue > 0 && (
          <div className="mb-6">
            <h3 className="section-title text-destructive">Returns / Deductions</h3>
            <div className="p-4 bg-destructive/10 rounded-md flex justify-between items-center">
              <div>
                <p className="text-sm text-destructive">Total Returned Pieces</p>
                <p className="text-lg font-semibold">{summary.totalReturnQty} pieces</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-destructive">Amount Deducted</p>
                <p className="text-xl font-bold text-destructive">
                  -₹{summary.totalReturnValue.toLocaleString()}
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
              ₹{(summary?.netPayable || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
