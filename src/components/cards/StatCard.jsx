import { motion } from "framer-motion";

export default function StatCard({ label, value, sub, trend, index = 0 }) {
  const trendColor =
    trend > 0 ? "text-gain" : trend < 0 ? "text-loss" : "text-text-secondary";

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="mt-2 font-mono text-2xl font-medium text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-text-secondary">{sub}</p>}
      {trend !== undefined && (
        <p className={`mt-2 font-mono text-sm ${trendColor}`}>
          {trend > 0 ? "+" : ""}
          {trend}%
        </p>
      )}
    </motion.div>
  );
}
