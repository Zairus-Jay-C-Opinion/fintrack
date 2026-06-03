import { useMemo, useRef, useState, useLayoutEffect } from "react";
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

function enrichForColoredLine(data) {
  const rows = data.map((d) => ({ ...d, up: null, down: null }));
  for (let i = 0; i < rows.length; i++) {
    if (i === 0) {
      rows[0].up = rows[0].price;
      continue;
    }
    const prev = rows[i - 1].price;
    const curr = rows[i].price;
    if (curr >= prev) {
      rows[i].up = curr;
      if (rows[i - 1].up == null) rows[i - 1].up = prev;
    } else {
      rows[i].down = curr;
      if (rows[i - 1].down == null) rows[i - 1].down = prev;
    }
  }
  return rows;
}

export default function StockPriceChart({ data, ticker }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const chartData = useMemo(
    () => (data?.length ? enrichForColoredLine(data.map((d) => ({ ...d }))) : []),
    [data]
  );

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setContainerWidth(w);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const id = requestAnimationFrame(measure);

    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
    };
  }, [ticker, chartData.length]);

  if (!chartData.length) {
    return (
      <div className="flex h-[200px] min-w-0 items-center justify-center text-sm text-text-secondary sm:h-[220px]">
        No chart data — refresh live prices
      </div>
    );
  }

  if (containerWidth < 2) {
    return (
      <div
        ref={containerRef}
        className="h-[200px] min-w-0 w-full sm:h-[220px]"
        aria-hidden
      />
    );
  }

  return (
    <div ref={containerRef} className="min-w-0 w-full">
      <ResponsiveContainer width={containerWidth} height={200}>
        <LineChart data={chartData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
          <XAxis
            dataKey="label"
            stroke={chartTheme.axisColor}
            tick={{ fill: chartTheme.textColor, fontSize: 9 }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            stroke={chartTheme.axisColor}
            tick={{ fill: chartTheme.textColor, fontSize: 10 }}
            domain={["auto", "auto"]}
            width={48}
            tickFormatter={(v) => `$${v}`}
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
            dataKey="up"
            stroke={chartTheme.gain}
            strokeWidth={2.5}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="down"
            stroke={chartTheme.loss}
            strokeWidth={2.5}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-[10px] text-text-secondary">
        <span className="text-gain">Green</span> = up day ·{" "}
        <span className="text-loss">Red</span> = down day
      </p>
    </div>
  );
}
