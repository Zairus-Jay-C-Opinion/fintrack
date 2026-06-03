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
import { formatUsd } from "../../utils/currency";

export default function StockPriceChart({ data, ticker }) {
  if (!data?.length) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-text-secondary">
        No chart data — refresh live prices
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
        <XAxis
          dataKey="label"
          stroke={chartTheme.axisColor}
          tick={{ fill: chartTheme.textColor, fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke={chartTheme.axisColor}
          tick={{ fill: chartTheme.textColor, fontSize: 11 }}
          domain={["auto", "auto"]}
        />
        <Tooltip
          contentStyle={{
            background: chartTheme.tooltipBg,
            border: `1px solid ${chartTheme.tooltipBorder}`,
          }}
          formatter={(v) => [formatUsd(v), `${ticker} close`]}
          labelFormatter={(_, payload) =>
            payload?.[0]?.payload?.date ?? ""
          }
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke={chartTheme.primary}
          strokeWidth={2}
          dot={false}
          animationDuration={600}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
