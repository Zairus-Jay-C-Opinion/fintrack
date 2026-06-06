import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, PiggyBank, Target, Receipt, LineChart, BarChart3, Settings, X, ArrowRight } from "lucide-react";
import { useWalkthrough } from "../../contexts/WalkthroughContext";

const features = [
  { icon: TrendingUp, label: "Portfolio tracking" },
  { icon: PiggyBank, label: "Savings goals" },
  { icon: Receipt, label: "Expense logging" },
  { icon: Target, label: "Financial goals" },
  { icon: LineChart, label: "Forecasting" },
  { icon: BarChart3, label: "Analytics" },
];

export default function WelcomeModal() {
  const { phase, startSetup, skipAll } = useWalkthrough();
  const open = phase === "welcome";

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="welcome-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Animated background orbs */}
          <div className="welcome-orb welcome-orb-1" />
          <div className="welcome-orb welcome-orb-2" />
          <div className="welcome-orb welcome-orb-3" />

          {/* Skip button */}
          <button
            className="welcome-skip-btn"
            onClick={skipAll}
            aria-label="Skip tour"
          >
            <X size={18} />
            Skip
          </button>

          {/* Card */}
          <motion.div
            className="welcome-card"
            initial={{ opacity: 0, scale: 0.88, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 32 }}
            transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
          >
            {/* Icon */}
            <motion.div
              className="welcome-icon-wrap"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.25 }}
            >
              <img src="/icon.png" alt="FinTrack" className="welcome-logo-img" />
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h1 className="welcome-title">Welcome to FinTrack</h1>
              <p className="welcome-subtitle">
                Your all-in-one personal finance dashboard — built to give you
                complete clarity over your money.
              </p>
            </motion.div>

            {/* Feature grid */}
            <motion.div
              className="welcome-features"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="welcome-feature-chip">
                  <Icon size={14} className="welcome-feature-icon" />
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              className="welcome-actions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <button className="welcome-btn-primary" onClick={startSetup}>
                Start the tour
                <ArrowRight size={16} />
              </button>
              <button className="welcome-btn-ghost" onClick={skipAll}>
                I'll explore on my own
              </button>
            </motion.div>

            {/* Step hint */}
            <p className="welcome-hint">12 guided steps · takes about 2 minutes</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
