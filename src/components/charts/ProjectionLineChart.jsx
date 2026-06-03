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

export default function ProjectionLineChart({ data, lines }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
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
          }}
          formatter={(v) => formatPhp(v)}
        />
        {lines ? (
          lines.map((l) => (
            <Line
              key={l.dataKey}
              type="monotone"
              dataKey={l.dataKey}
              name={l.name}
              stroke={l.color}
              strokeWidth={2}
              dot={false}
            />
          ))
        ) : (
          <Line
            type="monotone"
            dataKey="value"
            stroke={chartTheme.gain}
            strokeWidth={2}
            dot={false}
            animationDuration={1000}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
