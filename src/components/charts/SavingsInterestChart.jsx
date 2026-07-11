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

export default function SavingsInterestChart({ data }) {
  if (!data?.length) return null;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="savingsInterestFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartTheme.gain} stopOpacity={0.35} />
            <stop offset="95%" stopColor={chartTheme.gain} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
        <XAxis
          dataKey="label"
          stroke={chartTheme.axisColor}
          tick={{ fill: chartTheme.textColor, fontSize: 11 }}
        />
        <YAxis
          stroke={chartTheme.axisColor}
          tick={{ fill: chartTheme.textColor, fontSize: 11 }}
        />
        <Tooltip
          formatter={(v) => formatPhp(v)}
          contentStyle={{
            background: chartTheme.tooltipBg,
            border: `1px solid ${chartTheme.tooltipBorder}`,
            borderRadius: 16,
          }}
        />
        <Area
          type="monotone"
          dataKey="balance"
          name="Projected balance"
          stroke={chartTheme.gain}
          strokeWidth={2.5}
          fill="url(#savingsInterestFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
