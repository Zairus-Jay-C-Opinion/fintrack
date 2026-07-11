import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { chartTheme } from "../../constants/chartTheme";
import { formatPhp } from "../../utils/currency";
import { subMonths, format } from "date-fns";

export default function MonthlyBarChart({ monthlyIncome, transactions = [] }) {
  const data = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i);
    const key = format(d, "yyyy-MM");
    const label = format(d, "MMM");
    const spent = transactions
      .filter((t) => t.date?.startsWith(key) && t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    return {
      month: label,
      income: monthlyIncome,
      expenses: spent || monthlyIncome * 0.13,
    };
  });

  return (
    <div className="card">
      <h3 className="mb-4 font-display text-lg font-semibold text-white">
        Income vs Expenses
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
          <XAxis dataKey="month" stroke={chartTheme.axisColor} tick={{ fill: chartTheme.textColor, fontSize: 12 }} />
          <YAxis stroke={chartTheme.axisColor} tick={{ fill: chartTheme.textColor, fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: chartTheme.tooltipBg,
              border: `1px solid ${chartTheme.tooltipBorder}`,
            }}
            formatter={(v) => formatPhp(v)}
          />
          <Legend />
          <Bar dataKey="income" fill={chartTheme.gain} name="Income" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" fill={chartTheme.loss} name="Expenses" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
