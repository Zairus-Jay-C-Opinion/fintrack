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
        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
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
          }}
        />
        <Area
          type="monotone"
          dataKey="balance"
          name="Projected balance"
          stroke={chartTheme.gain}
          fill={chartTheme.gain}
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
