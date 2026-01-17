import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

const COLORS = [
  'hsl(217, 91%, 50%)',
  'hsl(142, 76%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(280, 68%, 50%)',
  'hsl(340, 75%, 55%)',
  'hsl(0, 84%, 60%)',
];

interface DonutChartProps {
  data: { category: string; pieces: number }[];
}

export function DonutChart({ data }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.pieces, 0);

  return (
    <div className="kpi-card">
      <h3 className="section-title">Category Contribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              dataKey="pieces"
              nameKey="category"
              label={({ category, percent }) =>
                `${category}: ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              formatter={(value: number) => [
                `${value} pcs (${((value / total) * 100).toFixed(1)}%)`,
                'Pieces',
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
