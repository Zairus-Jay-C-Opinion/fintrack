import {
  LineChart,
  Line,
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

export default function ProjectionLineChart({ data, lines }) {
  const sharedAxes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
      <XAxis
        dataKey="year"
        stroke={chartTheme.axisColor}
        tick={{ fill: chartTheme.textColor, fontSize: 12 }}
        label={{ value: "Years", position: "insideBottom", offset: -5 }}
      />
      <YAxis
        stroke={chartTheme.axisColor}
        tick={{ fill: chartTheme.textColor, fontSize: 12 }}
      />
      <Tooltip
        contentStyle={{
          background: chartTheme.tooltipBg,
          border: `1px solid ${chartTheme.tooltipBorder}`,
          borderRadius: 16,
        }}
        formatter={(v) => formatPhp(v)}
      />
    </>
  );

  if (lines) {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          {sharedAxes}
          {lines.map((l) => (
            <Line
              key={l.dataKey}
              type="monotone"
              dataKey={l.dataKey}
              name={l.name}
              stroke={l.color}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="projectionFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartTheme.gain} stopOpacity={0.4} />
            <stop offset="95%" stopColor={chartTheme.gain} stopOpacity={0} />
          </linearGradient>
        </defs>
        {sharedAxes}
        <Area
          type="monotone"
          dataKey="value"
          stroke={chartTheme.gain}
          strokeWidth={3}
          fill="url(#projectionFill)"
          animationDuration={1000}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
