import { motion } from "framer-motion";
import { formatPhp } from "../../utils/currency";

export default function NetWorthCard({ netWorth, breakdown }) {
  return (
    <div className="card-elevated">
      <p className="text-sm text-text-secondary">Total Net Worth</p>
      <motion.p
        key={netWorth}
        className="mt-2 font-mono text-4xl font-medium text-white"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {formatPhp(netWorth)}
      </motion.p>
      {breakdown && (
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-accent pt-4">
          {breakdown.map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-text-secondary">{label}</p>
              <p className="font-mono text-sm text-text-primary">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
