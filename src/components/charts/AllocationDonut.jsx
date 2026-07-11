import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { chartTheme } from "../../constants/chartTheme";

const COLORS = ["#10B981", "#84CC16", "#FBBF24"];

export default function AllocationDonut({ allocation, size = 160 }) {
  const data = [
    { name: "Investments", value: allocation.investments * 100 },
    { name: "Savings", value: allocation.savings * 100 },
    { name: "Spending", value: allocation.spending * 100 },
  ];

  return (
    <ResponsiveContainer width={size} height={size}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={70}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: chartTheme.tooltipBg,
            border: `1px solid ${chartTheme.tooltipBorder}`,
            borderRadius: 8,
            color: chartTheme.textColor,
          }}
          formatter={(v) => [`${v.toFixed(1)}%`, ""]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
