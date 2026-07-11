import {
  AreaChart,
  Area,
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
        <AreaChart data={data}>
          <defs>
            <linearGradient id="portfolioGrowthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartTheme.primary} stopOpacity={0.35} />
              <stop offset="95%" stopColor={chartTheme.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
          <XAxis dataKey="label" stroke={chartTheme.axisColor} tick={{ fill: chartTheme.textColor, fontSize: 12 }} />
          <YAxis stroke={chartTheme.axisColor} tick={{ fill: chartTheme.textColor, fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: chartTheme.tooltipBg,
              border: `1px solid ${chartTheme.tooltipBorder}`,
              borderRadius: 16,
            }}
            formatter={(v) => formatPhp(v)}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={chartTheme.primary}
            strokeWidth={3}
            fill="url(#portfolioGrowthFill)"
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
