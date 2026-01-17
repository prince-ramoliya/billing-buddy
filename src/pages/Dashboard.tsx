import { ShoppingCart, Package, IndianRupee, TrendingUp, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { OrdersChart } from '@/components/dashboard/OrdersChart';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { SupplierChart } from '@/components/dashboard/SupplierChart';
import { DonutChart } from '@/components/dashboard/DonutChart';
import { ComparisonChart } from '@/components/dashboard/ComparisonChart';
import { useDashboardStats, useDashboardCharts } from '@/hooks/useDashboard';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: charts, isLoading: chartsLoading } = useDashboardCharts();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your billing and orders
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <KPICard
          title="Today's Orders"
          value={statsLoading ? '...' : stats?.todaysOrders || 0}
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <KPICard
          title="Monthly Pieces"
          value={statsLoading ? '...' : (stats?.monthlyPieces || 0).toLocaleString()}
          subtitle="Total units ordered"
          icon={<Package className="h-5 w-5" />}
        />
        <KPICard
          title="Monthly Payable"
          value={statsLoading ? '...' : `₹${(stats?.monthlyPayable || 0).toLocaleString()}`}
          subtitle="After returns"
          icon={<IndianRupee className="h-5 w-5" />}
        />
        <KPICard
          title="Top Seller"
          value={statsLoading ? '...' : stats?.topSeller?.name || 'No data'}
          subtitle={stats?.topSeller ? `₹${stats.topSeller.amount.toLocaleString()}` : undefined}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <OrdersChart data={charts?.ordersOverTime || []} />
        <CategoryChart data={charts?.piecesByCategory || []} />
        <DonutChart data={charts?.piecesByCategory || []} />
        <SupplierChart data={charts?.revenueBySupplier || []} />
        <ComparisonChart 
          ordersAmount={stats?.totalMonthlyAmount || 0} 
          returnsAmount={stats?.totalReturns || 0} 
        />
      </div>
    </AppLayout>
  );
}
