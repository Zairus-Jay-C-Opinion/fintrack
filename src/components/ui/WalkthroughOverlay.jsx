import { createPortal } from "react-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Target,
  TrendingUp,
  LineChart,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import { useWalkthrough } from "../../contexts/WalkthroughContext";

/** Tour step definitions — targetId maps to data-tour attributes on nav items */
const STEPS = [
  {
    targetId: "tour-sidebar",
    icon: LayoutDashboard,
    title: "Your Financial Hub",
    description:
      "FinTrack gives you a complete picture of your finances in one place. Use the sidebar (or bottom nav on mobile) to navigate between sections.",
    placement: "right",
  },
  {
    targetId: "tour-dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
    description:
      "Your financial snapshot at a glance — net worth, income split, savings, investments, and an AI advisor that gives you personalised tips.",
    placement: "right",
  },
  {
    targetId: "tour-expenses",
    icon: Receipt,
    title: "Expenses",
    description:
      "Log every peso you spend, categorise it, and see monthly breakdowns. Spot patterns and trim the fat from your budget.",
    placement: "right",
  },
  {
    targetId: "tour-savings",
    icon: PiggyBank,
    title: "Savings",
    description:
      "Track your savings accounts and deposits. Set targets and watch your balances grow over time.",
    placement: "right",
  },
  {
    targetId: "tour-goals",
    icon: Target,
    title: "Goals",
    description:
      "Define financial milestones — emergency fund, dream vacation, house down-payment — and FinTrack will track your progress automatically.",
    placement: "right",
  },
  {
    targetId: "tour-investments",
    icon: TrendingUp,
    title: "Investments",
    description:
      "Monitor your portfolio in real time. Log stock and ETF purchases, see live prices, and track total portfolio value in PHP.",
    placement: "right",
  },
  {
    targetId: "tour-forecasting",
    icon: LineChart,
    title: "Forecasting",
    description:
      "Project your financial future with income vs. expense forecasts. See where you'll be in 3, 6, or 12 months.",
    placement: "right",
  },
  {
    targetId: "tour-settings",
    icon: Settings,
    title: "Settings",
    description:
      "Configure your monthly income, paydays, allocation percentages (invest / save / spend), currency display, and more. Start here first!",
    placement: "right",
  },
];

function useSpotlightRect(targetId, phase, step) {
  const [rect, setRect] = useState(null);

  const measure = useCallback(() => {
    if (!targetId) { setRect(null); return; }
    const el = document.querySelector(`[data-tour="${targetId}"]`);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [targetId]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, phase, step]);

  return rect;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function TooltipCard({ step, totalSteps, onNext, onPrev, onSkip, currentStep }) {
  const { icon: Icon, title, description } = step;
  const spotlightId = step.targetId;
  const rect = useSpotlightRect(spotlightId, "tour", currentStep);

  const PAD = 16;
  const TOOLTIP_W = 300;
  const TOOLTIP_H = 220;

  // Compute tooltip position based on spotlight rect
  let tooltipStyle = {};
  let arrowClass = "tour-tooltip-arrow-left";

  if (rect) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const spaceRight = vw - (rect.left + rect.width);
    const spaceLeft = rect.left;
    const spaceBelow = vh - (rect.top + rect.height);
    const spaceAbove = rect.top;

    if (spaceRight >= TOOLTIP_W + PAD * 2) {
      // Place right
      tooltipStyle = {
        top: clamp(rect.top + rect.height / 2 - TOOLTIP_H / 2, PAD, vh - TOOLTIP_H - PAD),
        left: rect.left + rect.width + PAD,
      };
      arrowClass = "tour-tooltip-arrow-left";
    } else if (spaceLeft >= TOOLTIP_W + PAD * 2) {
      // Place left
      tooltipStyle = {
        top: clamp(rect.top + rect.height / 2 - TOOLTIP_H / 2, PAD, vh - TOOLTIP_H - PAD),
        left: rect.left - TOOLTIP_W - PAD,
      };
      arrowClass = "tour-tooltip-arrow-right";
    } else if (spaceBelow >= TOOLTIP_H + PAD * 2) {
      // Place below
      tooltipStyle = {
        top: rect.top + rect.height + PAD,
        left: clamp(rect.left + rect.width / 2 - TOOLTIP_W / 2, PAD, vw - TOOLTIP_W - PAD),
      };
      arrowClass = "tour-tooltip-arrow-top";
    } else {
      // Place above
      tooltipStyle = {
        top: rect.top - TOOLTIP_H - PAD,
        left: clamp(rect.left + rect.width / 2 - TOOLTIP_W / 2, PAD, vw - TOOLTIP_W - PAD),
      };
      arrowClass = "tour-tooltip-arrow-bottom";
    }
  } else {
    // Fallback: center of screen
    tooltipStyle = { top: "50%", left: "50%", transform: "translate(-50%,-50%)" };
    arrowClass = "";
  }

  return (
    <motion.div
      className={`tour-tooltip ${arrowClass}`}
      style={{ ...tooltipStyle, width: TOOLTIP_W }}
      key={currentStep}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      {/* Header */}
      <div className="tour-tooltip-header">
        <div className="tour-tooltip-icon">
          <Icon size={16} />
        </div>
        <span className="tour-tooltip-step">
          {currentStep + 1} / {totalSteps}
        </span>
        <button className="tour-close-btn" onClick={onSkip} aria-label="Close tour">
          <X size={14} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="tour-progress-track">
        <motion.div
          className="tour-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Content */}
      <h3 className="tour-tooltip-title">{title}</h3>
      <p className="tour-tooltip-desc">{description}</p>

      {/* Navigation */}
      <div className="tour-tooltip-nav">
        <button
          className="tour-nav-btn tour-nav-prev"
          onClick={onPrev}
          disabled={currentStep === 0}
          aria-label="Previous step"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <button
          className="tour-nav-btn tour-nav-next"
          onClick={onNext}
          aria-label={currentStep === totalSteps - 1 ? "Finish tour" : "Next step"}
        >
          {currentStep === totalSteps - 1 ? (
            <><Check size={16} /> Finish</>
          ) : (
            <>Next <ChevronRight size={16} /></>
          )}
        </button>
      </div>
    </motion.div>
  );
}

export default function WalkthroughOverlay() {
  const { phase, step, nextStep, prevStep, skipAll, dismissDone } = useWalkthrough();
  const isTour = phase === "tour";
  const isDone = phase === "done";

  const currentStepData = STEPS[step] ?? null;
  const spotlightRect = useSpotlightRect(
    isTour && currentStepData ? currentStepData.targetId : null,
    phase,
    step
  );

  // Dismiss the "done" toast automatically after 3s
  useEffect(() => {
    if (!isDone) return;
    const t = setTimeout(dismissDone, 3000);
    return () => clearTimeout(t);
  }, [isDone, dismissDone]);

  if (typeof document === "undefined") return null;

  const PAD = 8;

  return createPortal(
    <>
      {/* ── Tour backdrop + spotlight ── */}
      <AnimatePresence>
        {isTour && (
          <motion.div
            key="tour-backdrop"
            className="tour-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={skipAll}
          >
            {/* SVG cutout spotlight */}
            {spotlightRect && (
              <svg
                className="tour-spotlight-svg"
                onClick={(e) => e.stopPropagation()}
              >
                <defs>
                  <mask id="tour-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <rect
                      x={spotlightRect.left - PAD}
                      y={spotlightRect.top - PAD}
                      width={spotlightRect.width + PAD * 2}
                      height={spotlightRect.height + PAD * 2}
                      rx="10"
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill="rgba(6,20,27,0.82)"
                  mask="url(#tour-mask)"
                />
                {/* Pulse ring around spotlight */}
                <motion.rect
                  x={spotlightRect.left - PAD}
                  y={spotlightRect.top - PAD}
                  width={spotlightRect.width + PAD * 2}
                  height={spotlightRect.height + PAD * 2}
                  rx="10"
                  fill="none"
                  stroke="#5b8fa8"
                  strokeWidth="2"
                  animate={{ opacity: [0.9, 0.3, 0.9] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </svg>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tooltip ── */}
      <AnimatePresence mode="wait">
        {isTour && currentStepData && (
          <div className="tour-tooltip-portal" key={step}>
            <TooltipCard
              step={currentStepData}
              currentStep={step}
              totalSteps={STEPS.length}
              onNext={() => nextStep(STEPS.length)}
              onPrev={prevStep}
              onSkip={skipAll}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ── Done toast ── */}
      <AnimatePresence>
        {isDone && (
          <motion.div
            key="tour-done"
            className="tour-done-toast"
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
          >
            <span className="tour-done-icon">🎉</span>
            <div>
              <p className="tour-done-title">You're all set!</p>
              <p className="tour-done-sub">Go to Settings first to configure your income.</p>
            </div>
            <button className="tour-close-btn" onClick={dismissDone} aria-label="Dismiss">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}
