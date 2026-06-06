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
  Cpu,
} from "lucide-react";
import { useWalkthrough } from "../../contexts/WalkthroughContext";

/**
 * STEPS — each step can optionally define:
 *   navigateTo: the route to navigate to before spotlighting
 *   targetId:   data-tour attribute to spotlight (null = center tooltip)
 */
const STEPS = [
  // ── 1. Overview
  {
    targetId: "tour-sidebar",
    navigateTo: "/",
    icon: LayoutDashboard,
    title: "Welcome — Here's how FinTrack works",
    description:
      "FinTrack is your personal money command centre. Everything lives in the sidebar on the left (or bottom bar on mobile). Each section of the app has a specific job — this tour will walk you through each one and explain what to do.",
  },

  // ── 2. Dashboard
  {
    targetId: "tour-dashboard",
    navigateTo: "/",
    icon: LayoutDashboard,
    title: "Dashboard — Your Money at a Glance",
    description:
      "The Dashboard is your home screen. It shows your net worth, how your money is split between investing, saving, and spending, upcoming paydays, and an AI advisor that gives you personalised tips based on your real data.",
  },

  // ── 3. Expenses
  {
    targetId: "tour-expenses",
    navigateTo: "/expenses",
    icon: Receipt,
    title: "Expenses — Where Does the Money Go?",
    description:
      "Every time you spend money, log it here. Give it a category (food, transport, shopping…) and a date. FinTrack will build monthly spending charts so you can see patterns and cut back where needed.",
  },

  // ── 4. Savings
  {
    targetId: "tour-savings",
    navigateTo: "/savings",
    icon: PiggyBank,
    title: "Savings — Building Your Safety Net",
    description:
      "Track your savings accounts and deposits over time. You can record how much you've set aside each month, see your total saved balance, and make sure you're hitting the savings percentage you set during setup.",
  },

  // ── 5. Goals
  {
    targetId: "tour-goals",
    navigateTo: "/goals",
    icon: Target,
    title: "Goals — Plan for What Matters",
    description:
      "Goals let you save toward specific targets: an emergency fund, a new phone, a vacation, or a house down-payment. Set the amount you need and the date you want it by — FinTrack tracks your progress automatically.",
  },

  // ── 6. Investments (detailed)
  {
    targetId: "tour-investments",
    navigateTo: "/investments",
    icon: TrendingUp,
    title: "Investments — Your Stock Portfolio",
    description:
      "This is where you log every stock or ETF you own. Add a ticker symbol (e.g. AAPL for Apple), the number of shares you bought, and your buy price. FinTrack will fetch the live market price and calculate your total gain or loss automatically.",
  },

  // ── 7. Investments — portfolio value
  {
    targetId: "tour-investments",
    navigateTo: "/investments",
    icon: TrendingUp,
    title: "Investments — Portfolio Value in PHP",
    description:
      "Because stocks are priced in US Dollars (USD), FinTrack converts your portfolio value to Philippine Pesos (PHP) using the exchange rate you set in Settings. This is why keeping that rate up to date matters — it directly affects the numbers you see here.",
  },

  // ── 8. Forecasting
  {
    targetId: "tour-forecasting",
    navigateTo: "/forecasting",
    icon: LineChart,
    title: "Forecasting — See Your Financial Future",
    description:
      "Forecasting uses your income, expenses, and savings history to project where your money will be in 3, 6, or 12 months. If the projection looks bad, it's a signal to adjust your spending or savings before it's too late.",
  },

  // ── 9. Analytics
  {
    targetId: "tour-analytics",
    navigateTo: "/analytics",
    icon: BarChart3,
    title: "Analytics — Trends Over Time",
    description:
      "Analytics gives you deeper charts: month-by-month expense trends, category breakdowns, savings growth rate, and investment performance over time. Use this to spot long-term patterns that the Dashboard doesn't show.",
  },

  // ── 10. Settings — Exchange Rate (navigate there, spotlight the field)
  {
    targetId: "tour-exchange-rate",
    navigateTo: "/settings",
    icon: DollarSign,
    title: "Exchange Rate — Keeping Your Numbers Accurate",
    description:
      "This setting controls how FinTrack converts between USD and PHP. For example, if 1 USD = 56.50 PHP, enter 56.50. You need to update this manually whenever the rate changes — you can check the current rate on Google by searching 'USD to PHP'.",
  },

  // ── 11. Settings — Live Stock Prices
  {
    targetId: "tour-live-prices",
    navigateTo: "/settings",
    icon: RefreshCcw,
    title: "Live Stock Prices — Auto-Refresh",
    description:
      "FinTrack can automatically refresh your stock prices while you're on the Investments page. Turn on 'Auto-refresh' here and set how often (every 5–60 minutes). This keeps your portfolio value current without you having to reload the page.",
  },

  // ── 12. Settings overview
  {
    targetId: "tour-settings",
    navigateTo: "/settings",
    icon: Settings,
    title: "Settings — Your Control Panel",
    description:
      "Settings is also where you change your monthly income, payday dates, and allocation percentages (how much of your income goes to investing, saving, and spending). If anything feels off in the app, start here.",
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
    // Small delay to let page render before measuring
    const t = setTimeout(measure, 120);
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

function TooltipCard({ step, totalSteps, onNext, onPrev, onSkip, currentStep }) {
  const { icon: Icon, title, description } = step;
  const spotlightId = step.targetId;
  const rect = useSpotlightRect(spotlightId, "tour", currentStep);

  const PAD = 16;
  const TOOLTIP_W = 320;
  const TOOLTIP_H = 240;

  let tooltipStyle = {};
  let arrowClass = "tour-tooltip-arrow-left";

  if (rect) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const spaceRight = vw - (rect.left + rect.width);
    const spaceLeft = rect.left;
    const spaceBelow = vh - (rect.top + rect.height);

    if (spaceRight >= TOOLTIP_W + PAD * 2) {
      tooltipStyle = {
        top: clamp(rect.top + rect.height / 2 - TOOLTIP_H / 2, PAD, vh - TOOLTIP_H - PAD),
        left: rect.left + rect.width + PAD,
      };
      arrowClass = "tour-tooltip-arrow-left";
    } else if (spaceLeft >= TOOLTIP_W + PAD * 2) {
      tooltipStyle = {
        top: clamp(rect.top + rect.height / 2 - TOOLTIP_H / 2, PAD, vh - TOOLTIP_H - PAD),
        left: rect.left - TOOLTIP_W - PAD,
      };
      arrowClass = "tour-tooltip-arrow-right";
    } else if (spaceBelow >= TOOLTIP_H + PAD * 2) {
      tooltipStyle = {
        top: rect.top + rect.height + PAD,
        left: clamp(rect.left + rect.width / 2 - TOOLTIP_W / 2, PAD, vw - TOOLTIP_W - PAD),
      };
      arrowClass = "tour-tooltip-arrow-top";
    } else {
      tooltipStyle = {
        top: clamp(rect.top - TOOLTIP_H - PAD, PAD, vh - TOOLTIP_H - PAD),
        left: clamp(rect.left + rect.width / 2 - TOOLTIP_W / 2, PAD, vw - TOOLTIP_W - PAD),
      };
      arrowClass = "tour-tooltip-arrow-bottom";
    }
  } else {
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
  const navigate = useNavigate();
  const isTour = phase === "tour";
  const isDone = phase === "done";

  const currentStepData = STEPS[step] ?? null;
  const prevStepRef = useRef(step);

  // Navigate to the page required by this step
  useEffect(() => {
    if (!isTour || !currentStepData?.navigateTo) return;
    navigate(currentStepData.navigateTo);
    prevStepRef.current = step;
  }, [isTour, step, currentStepData, navigate]);

  const spotlightRect = useSpotlightRect(
    isTour && currentStepData ? currentStepData.targetId : null,
    phase,
    step
  );

  // Dismiss the "done" toast automatically after 4s
  useEffect(() => {
    if (!isDone) return;
    const t = setTimeout(dismissDone, 4000);
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
              <p className="tour-done-sub">You can replay this tour any time from Settings.</p>
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
