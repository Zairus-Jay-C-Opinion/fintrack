import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Wallet } from "lucide-react";
import { useWalkthrough } from "../../contexts/WalkthroughContext";
import { useSettingsStore } from "../../store/useSettingsStore";
import AllocationEditor from "../forms/AllocationEditor";

export default function SetupModal() {
  const { phase, startTour } = useWalkthrough();
  const open = phase === "setup";

  const { monthlyIncome, setMonthlyIncome, updateAllocation } = useSettingsStore();

  const [localIncome, setLocalIncome] = useState(monthlyIncome || "");
  const [localAllocation, setLocalAllocation] = useState({
    investments: 0.34,
    savings: 0.33,
    spending: 0.33,
  });

  if (typeof document === "undefined") return null;

  const handleContinue = () => {
    setMonthlyIncome(Number(localIncome) || 0);
    updateAllocation(localAllocation);
    startTour();
  };

  const handleSkip = () => {
    startTour();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="welcome-backdrop"
          style={{ overflowY: "auto", alignItems: "flex-start", padding: "2rem 1rem" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="welcome-card"
            style={{ width: "100%", maxWidth: "28rem", margin: "auto", flexShrink: 0 }}
            initial={{ opacity: 0, scale: 0.88, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 32 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Wallet className="text-primary" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Let's set up your baseline</h2>
              <p className="text-text-secondary text-sm">
                Tell us your monthly income and how you'd like to allocate it. You can always change this later in Settings.
              </p>
            </div>

            <div className="space-y-6 text-left">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Monthly Income (₱)
                </label>
                <input
                  type="number"
                  className="setup-income-input"
                  placeholder="e.g. 50000"
                  value={localIncome}
                  onChange={(e) => setLocalIncome(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Target Allocation
                </label>
                <div className="bg-bg-deeper p-4 rounded-lg border border-border/50">
                  <AllocationEditor
                    allocation={localAllocation}
                    onSave={setLocalAllocation}
                    hideSave
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button
                className="welcome-btn-primary w-full"
                onClick={handleContinue}
              >
                Continue to Dashboard
                <ArrowRight size={16} />
              </button>
              <button
                className="welcome-btn-ghost w-full"
                onClick={handleSkip}
              >
                Skip for now — I'll set this up later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
