import { ShoppingCart, Package, IndianRupee, TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { OrdersChart } from '@/components/dashboard/OrdersChart';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { SupplierChart } from '@/components/dashboard/SupplierChart';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { getDashboardStats } from '@/lib/mockData';

export default function Dashboard() {
  const stats = getDashboardStats();

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your billing and orders
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <KPICard
          title="Today's Orders"
          value={stats.todaysOrders}
          icon={<ShoppingCart className="h-5 w-5" />}
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title="Monthly Pieces"
          value={stats.monthlyPieces.toLocaleString()}
          subtitle="Total units ordered"
          icon={<Package className="h-5 w-5" />}
        />
        <KPICard
          title="Monthly Payable"
          value={`₹${stats.monthlyPayable.toLocaleString()}`}
          subtitle="After returns"
          icon={<IndianRupee className="h-5 w-5" />}
          trend={{ value: 8, isPositive: true }}
        />
        <KPICard
          title="Top Seller"
          value={stats.topSeller?.name || '-'}
          subtitle={stats.topSeller ? `₹${stats.topSeller.amount.toLocaleString()}` : undefined}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <OrdersChart />
        <CategoryChart />
        <SupplierChart />
        <TrendChart />
      </div>
    </AppLayout>
  );
}
