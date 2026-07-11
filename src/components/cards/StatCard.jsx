import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({
  label,
  value,
  sub,
  trend,
  icon: Icon,
  progress,
  index = 0,
}) {
  const showTopRow = Icon || trend !== undefined;
  const trendPositive = trend > 0;
  const trendNegative = trend < 0;

  return (
    <motion.div
      className="card min-w-0 overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      {showTopRow && (
        <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
          {Icon ? (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-text-secondary sm:h-10 sm:w-10">
              <Icon size={17} />
            </span>
          ) : (
            <span />
          )}
          {trend !== undefined && (
            <span
              className={`flex shrink-0 items-center gap-0.5 rounded-full px-2 py-1 text-xs font-medium ${
                trendPositive
                  ? "bg-gain/10 text-gain"
                  : trendNegative
                    ? "bg-loss/10 text-loss"
                    : "bg-white/5 text-text-secondary"
              }`}
            >
              {trendPositive && <ArrowUpRight size={12} />}
              {trendNegative && <ArrowDownRight size={12} />}
              {trend > 0 ? "+" : ""}
              {typeof trend === "number" ? trend.toFixed(1) : trend}%
            </span>
          )}
        </div>
      )}
      <p className="truncate text-xs text-text-secondary sm:text-sm">{label}</p>
      <p className="mt-1 break-words font-mono text-lg font-medium leading-tight text-white sm:mt-2 sm:text-2xl">
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 truncate text-[10px] text-text-secondary sm:mt-1 sm:text-xs">
          {sub}
        </p>
      )}
      {progress !== undefined && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full transition-all ${progress > 100 ? "bg-loss" : "bg-highlight"}`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}
