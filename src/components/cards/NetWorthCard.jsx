import { motion } from "framer-motion";
import { formatPhp } from "../../utils/currency";

export default function NetWorthCard({ netWorth, breakdown }) {
  return (
    <div className="card-elevated relative overflow-hidden">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-highlight/10 blur-3xl" />
      <p className="relative text-sm text-text-secondary">Total Net Worth</p>
      <motion.p
        key={netWorth}
        className="relative mt-2 break-words font-mono text-3xl font-medium tracking-tight text-white sm:text-4xl md:text-5xl"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {formatPhp(netWorth)}
      </motion.p>
      {breakdown && (
        <div className="relative mt-5 grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
          {breakdown.map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-text-secondary">{label}</p>
              <p className="mt-0.5 font-mono text-sm text-text-primary">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
