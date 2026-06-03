import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { chartTheme } from "../../constants/chartTheme";
import { formatPhp } from "../../utils/currency";

export default function PortfolioGrowthChart({ data }) {
  if (!data?.length) {
    return (
      <div className="card flex min-h-[280px] items-center justify-center text-text-secondary">
        Add investment purchases to see growth
      </div>
    );
  }

  return (
    <div className="card min-h-[280px]">
      <h3 className="mb-4 font-display text-lg font-semibold text-white">
        Portfolio Performance
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
          <XAxis dataKey="label" stroke={chartTheme.axisColor} tick={{ fill: chartTheme.textColor, fontSize: 12 }} />
          <YAxis stroke={chartTheme.axisColor} tick={{ fill: chartTheme.textColor, fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: chartTheme.tooltipBg,
              border: `1px solid ${chartTheme.tooltipBorder}`,
            }}
            formatter={(v) => formatPhp(v)}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={chartTheme.primary}
            strokeWidth={2}
            dot={{ fill: chartTheme.primary, r: 4 }}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
