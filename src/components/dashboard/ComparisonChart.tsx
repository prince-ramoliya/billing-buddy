import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ComparisonChartProps {
  ordersAmount: number;
  returnsAmount: number;
}

export function ComparisonChart({ ordersAmount, returnsAmount }: ComparisonChartProps) {
  const data = [
    {
      name: 'Orders',
      value: ordersAmount,
      fill: 'hsl(142, 76%, 36%)',
    },
    {
      name: 'Returns',
      value: returnsAmount,
      fill: 'hsl(0, 84%, 60%)',
    },
  ];

  const netAmount = ordersAmount - returnsAmount;

  return (
    <div className="kpi-card">
      <h3 className="section-title">Orders vs Returns</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Bar key={index} dataKey="value" fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex justify-between items-center p-3 bg-primary/10 rounded-md">
        <span className="text-sm font-medium">Net Amount</span>
        <span className="text-lg font-bold text-primary">
          ₹{netAmount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
