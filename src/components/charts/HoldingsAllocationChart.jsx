import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { chartTheme } from "../../constants/chartTheme";
import { formatUsd } from "../../utils/currency";

const COLORS = ["#5B8FA8", "#4CAF7D", "#D4A843", "#9BA8AB", "#E05C5C", "#8B6BB1"];

export default function HoldingsAllocationChart({ holdings }) {
  const data = holdings
    .filter((h) => h.currentValue > 0)
    .map((h) => ({
      name: h.ticker,
      value: h.currentValue,
    }));

  if (!data.length) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-text-secondary">
        Add holdings to see allocation
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => formatUsd(v)}
          contentStyle={{
            background: chartTheme.tooltipBg,
            border: `1px solid ${chartTheme.tooltipBorder}`,
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
