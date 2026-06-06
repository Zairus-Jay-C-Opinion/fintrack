import { createPortal } from "react-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  RefreshCcw,
  DollarSign,
} from "lucide-react";
import { useWalkthrough } from "../../contexts/WalkthroughContext";

/**
 * STEPS — logically grouped:
 *   Group A: Navigation overview
 *   Group B: Core tabs (Dashboard → Goals)
 *   Group C: Investments + all related settings (exchange rate, live prices)
 *   Group D: Analysis tools (Forecasting, Analytics)
 *   Group E: Settings wrap-up
 *
 * Each step:
 *   navigateTo  – route to visit before showing this step
 *   targetId    – data-tour attribute to spotlight (null = center)
 *   preferSide  – "right" | "left" | "auto" — preferred tooltip side
 */
const STEPS = [
  // ── A: Overview ───────────────────────────────────────
  {
    targetId: "tour-sidebar",
    navigateTo: "/",
    preferSide: "right",
    icon: LayoutDashboard,
    title: "Welcome — Here's how FinTrack works",
    description:
      "FinTrack is your personal money command centre. Everything lives in the sidebar on the left. Each section has a specific job — this tour walks you through each one and explains what to do.",
  },

  // ── B: Core tabs ──────────────────────────────────────
  {
    targetId: "tour-dashboard",
    navigateTo: "/",
    preferSide: "right",
    icon: LayoutDashboard,
    title: "Dashboard — Your Money at a Glance",
    description:
      "Your home screen. It shows your net worth, how your income is split between investing, saving, and spending, upcoming paydays, and an AI advisor that gives you personalised tips based on your real data.",
  },
  {
    targetId: "tour-expenses",
    navigateTo: "/expenses",
    preferSide: "right",
    icon: Receipt,
    title: "Expenses — Where Does the Money Go?",
    description:
      "Every time you spend money, log it here. Give it a category (food, transport, shopping…) and a date. FinTrack builds monthly charts so you can spot patterns and cut back where needed.",
  },
  {
    targetId: "tour-savings",
    navigateTo: "/savings",
    preferSide: "right",
    icon: PiggyBank,
    title: "Savings — Building Your Safety Net",
    description:
      "Track your savings accounts and deposits over time. Record how much you set aside each month, see your total saved balance, and make sure you're hitting the savings percentage you set during setup.",
  },
  {
    targetId: "tour-goals",
    navigateTo: "/goals",
    preferSide: "right",
    icon: Target,
    title: "Goals — Plan for What Matters",
    description:
      "Save toward specific targets: an emergency fund, a new phone, a vacation, or a house down-payment. Set the amount you need and the date you want it — FinTrack tracks progress automatically.",
  },

  // ── C: Investments cluster ────────────────────────────
  {
    targetId: "tour-investments",
    navigateTo: "/investments",
    preferSide: "right",
    icon: TrendingUp,
    title: "Investments — Your Stock Portfolio",
    description:
      "Log every stock or ETF you own. Add a ticker symbol (e.g. AAPL for Apple), the number of shares, and your buy price. FinTrack fetches the live market price and calculates your total gain or loss automatically.",
  },
  {
    targetId: "tour-investments",
    navigateTo: "/investments",
    preferSide: "right",
    icon: TrendingUp,
    title: "Investments — Portfolio Value in PHP",
    description:
      "Stocks are priced in US Dollars (USD). FinTrack converts your portfolio to Philippine Pesos (PHP) using an exchange rate you set yourself. Keeping that rate up to date is important — it directly affects every number you see here.",
  },
  {
    targetId: "tour-exchange-rate",
    navigateTo: "/settings",
    preferSide: "left",
    icon: DollarSign,
    title: "Exchange Rate — Connected to Investments",
    description:
      "This is where you set how many Pesos equal one US Dollar. For example, if 1 USD = 56.50 PHP, enter 56.50. Check the current rate on Google (search 'USD to PHP') and update it here whenever it changes.",
  },
  {
    targetId: "tour-live-prices",
    navigateTo: "/settings",
    preferSide: "left",
    icon: RefreshCcw,
    title: "Live Stock Prices — Auto-Refresh",
    description:
      "FinTrack can automatically refresh your stock prices while you're on the Investments page. Turn on Auto-refresh and set how often (every 5–60 minutes). Your portfolio value stays current without you doing anything.",
  },

  // ── D: Analysis tools ─────────────────────────────────
  {
    targetId: "tour-forecasting",
    navigateTo: "/forecasting",
    preferSide: "right",
    icon: LineChart,
    title: "Forecasting — See Your Financial Future",
    description:
      "Forecasting uses your income, expenses, and savings history to project where your money will be in 3, 6, or 12 months. If the projection looks bad, that's a signal to adjust your spending or savings now.",
  },
  {
    targetId: "tour-analytics",
    navigateTo: "/analytics",
    preferSide: "right",
    icon: BarChart3,
    title: "Analytics — Trends Over Time",
    description:
      "Deeper charts: month-by-month expense trends, category breakdowns, savings growth rate, and investment performance. Use this to spot long-term patterns that the Dashboard's quick summary doesn't show.",
  },

  // ── E: Settings wrap-up ───────────────────────────────
  {
    targetId: "tour-settings",
    navigateTo: "/settings",
    preferSide: "right",
    icon: Settings,
    title: "Settings — Your Control Panel",
    description:
      "Change your monthly income, payday dates, and allocation split (how much goes to investing, saving, and spending) any time here. You can also export or import all your data as a backup file.",
  },
];

// ─── Spotlight measurement hook ──────────────────────────
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
    // Allow navigation + page paint before measuring
    const t = setTimeout(measure, 180);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, [measure, phase, step]);

  return rect;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// ─── Zone-based tooltip positioning ──────────────────────
/**
 * Strategy:
 *  - Elements on the LEFT third of the screen (sidebar nav)  → tooltip goes RIGHT
 *  - Elements on the RIGHT two-thirds (main content)         → tooltip goes LEFT
 *  - Vertical position is always clamped firmly inside viewport
 *  - If neither side has room, fall back to center-top of screen (always safe)
 */
function computeTooltipPosition(rect, preferSide) {
  const TOOLTIP_W = 320;
  const TOOLTIP_H = 300; // generous over-estimate to keep clamping safe
  const EDGE_PAD = 20;
  const GAP = 16;       // gap between spotlight edge and tooltip

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const elemCenterY = rect.top + rect.height / 2;
  const elemCenterX = rect.left + rect.width / 2;

  // Attempt RIGHT placement
  const rightLeft = rect.left + rect.width + GAP;
  const rightFits = rightLeft + TOOLTIP_W + EDGE_PAD <= vw;

  // Attempt LEFT placement
  const leftLeft = rect.left - GAP - TOOLTIP_W;
  const leftFits = leftLeft >= EDGE_PAD;

  let chosenSide = null;
  if (preferSide === "right" && rightFits) chosenSide = "right";
  else if (preferSide === "left" && leftFits) chosenSide = "left";
  else if (rightFits) chosenSide = "right";
  else if (leftFits) chosenSide = "left";

  if (chosenSide === "right") {
    return {
      style: {
        top: clamp(elemCenterY - TOOLTIP_H / 2, EDGE_PAD, vh - TOOLTIP_H - EDGE_PAD),
        left: rightLeft,
        width: TOOLTIP_W,
      },
      arrowClass: "tour-tooltip-arrow-left",
    };
  }

  if (chosenSide === "left") {
    return {
      style: {
        top: clamp(elemCenterY - TOOLTIP_H / 2, EDGE_PAD, vh - TOOLTIP_H - EDGE_PAD),
        left: leftLeft,
        width: TOOLTIP_W,
      },
      arrowClass: "tour-tooltip-arrow-right",
    };
  }

  // Fallback: fixed position at top-center of screen — always visible
  return {
    style: {
      top: EDGE_PAD,
      left: clamp(elemCenterX - TOOLTIP_W / 2, EDGE_PAD, vw - TOOLTIP_W - EDGE_PAD),
      width: TOOLTIP_W,
    },
    arrowClass: "",
  };
}

// ─── Tooltip card ─────────────────────────────────────────
function TooltipCard({ stepData, totalSteps, onNext, onPrev, onSkip, currentStep }) {
  const { icon: Icon, title, description, targetId, preferSide } = stepData;
  const rect = useSpotlightRect(targetId, "tour", currentStep);

  let positionResult;
  if (rect) {
    positionResult = computeTooltipPosition(rect, preferSide ?? "right");
  } else {
    positionResult = {
      style: { top: 20, left: "50%", width: 320, transform: "translateX(-50%)" },
      arrowClass: "",
    };
  }

  const { style: tooltipStyle, arrowClass } = positionResult;

  return (
    <motion.div
      className={`tour-tooltip ${arrowClass}`}
      style={tooltipStyle}
      key={currentStep}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
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
          animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
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

// ─── Main overlay ─────────────────────────────────────────
export default function WalkthroughOverlay() {
  const { phase, step, nextStep, prevStep, skipAll, dismissDone } = useWalkthrough();
  const navigate = useNavigate();
  const isTour = phase === "tour";
  const isDone = phase === "done";

  const currentStepData = STEPS[step] ?? null;

  // Navigate to the route required by this step
  useEffect(() => {
    if (!isTour || !currentStepData?.navigateTo) return;
    navigate(currentStepData.navigateTo);
  }, [isTour, step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Spotlight for the backdrop SVG (uses the outer overlay's measurement)
  const spotlightRect = useSpotlightRect(
    isTour && currentStepData ? currentStepData.targetId : null,
    phase,
    step
  );

  // Auto-dismiss done toast
  useEffect(() => {
    if (!isDone) return;
    const t = setTimeout(dismissDone, 4000);
    return () => clearTimeout(t);
  }, [isDone, dismissDone]);

  if (typeof document === "undefined") return null;

  const SVG_PAD = 8;

  return createPortal(
    <>
      {/* ── Backdrop + spotlight cutout ── */}
      <AnimatePresence>
        {isTour && (
          <motion.div
            key="tour-backdrop"
            className="tour-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={skipAll}
          >
            <svg
              className="tour-spotlight-svg"
              onClick={(e) => e.stopPropagation()}
            >
              <defs>
                <mask id="tour-mask">
                  <rect width="100%" height="100%" fill="white" />
                  {spotlightRect && (
                    <rect
                      x={spotlightRect.left - SVG_PAD}
                      y={spotlightRect.top - SVG_PAD}
                      width={spotlightRect.width + SVG_PAD * 2}
                      height={spotlightRect.height + SVG_PAD * 2}
                      rx="10"
                      fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(6,20,27,0.80)"
                mask="url(#tour-mask)"
              />
              {spotlightRect && (
                <motion.rect
                  x={spotlightRect.left - SVG_PAD}
                  y={spotlightRect.top - SVG_PAD}
                  width={spotlightRect.width + SVG_PAD * 2}
                  height={spotlightRect.height + SVG_PAD * 2}
                  rx="10"
                  fill="none"
                  stroke="#5b8fa8"
                  strokeWidth="2"
                  animate={{ opacity: [0.9, 0.25, 0.9] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tooltip ── */}
      <AnimatePresence mode="wait">
        {isTour && currentStepData && (
          <div className="tour-tooltip-portal" key={step}>
            <TooltipCard
              stepData={currentStepData}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <span className="tour-done-icon">🎉</span>
            <div>
              <p className="tour-done-title">You're all set!</p>
              <p className="tour-done-sub">Replay this tour any time from Settings.</p>
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
