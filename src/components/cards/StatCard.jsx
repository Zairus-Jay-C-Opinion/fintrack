import { motion } from "framer-motion";

export default function StatCard({ label, value, sub, trend, index = 0 }) {
  const trendColor =
    trend > 0 ? "text-gain" : trend < 0 ? "text-loss" : "text-text-secondary";

  return (
    <motion.div
      className="card min-w-0 overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <p className="truncate text-xs text-text-secondary sm:text-sm">{label}</p>
      <p className="mt-1 break-words font-mono text-lg font-medium leading-tight text-white sm:mt-2 sm:text-2xl">
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 truncate text-[10px] text-text-secondary sm:mt-1 sm:text-xs">
          {sub}
        </p>
      )}
      {trend !== undefined && (
        <p className={`mt-1 font-mono text-xs sm:mt-2 sm:text-sm ${trendColor}`}>
          {trend > 0 ? "+" : ""}
          {trend}%
        </p>
      )}
    </motion.div>
  );
}
