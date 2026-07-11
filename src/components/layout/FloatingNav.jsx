import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Target,
  TrendingUp,
  LineChart,
  BarChart3,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", tourId: "tour-dashboard" },
  { to: "/expenses", icon: Receipt, label: "Expenses", tourId: "tour-expenses" },
  { to: "/savings", icon: PiggyBank, label: "Savings", tourId: "tour-savings" },
  { to: "/goals", icon: Target, label: "Goals", tourId: "tour-goals" },
  { to: "/investments", icon: TrendingUp, label: "Investments", tourId: "tour-investments" },
  { to: "/forecasting", icon: LineChart, label: "Forecasting", tourId: "tour-forecasting" },
  { to: "/analytics", icon: BarChart3, label: "Analytics", tourId: "tour-analytics" },
  { to: "/settings", icon: Settings, label: "Settings", tourId: "tour-settings" },
];

export default function FloatingNav() {
  return (
    <nav
      data-tour="tour-sidebar"
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-40 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-bg-dark/80 p-1.5 shadow-elevated backdrop-blur-xl no-scrollbar sm:gap-1.5 sm:p-2"
    >
      {NAV_ITEMS.map(({ to, icon: Icon, label, tourId }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          data-tour={tourId}
          title={label}
          className={({ isActive }) =>
            `group relative flex shrink-0 items-center justify-center rounded-full p-2.5 transition-all duration-200 sm:p-3 ${
              isActive
                ? "bg-highlight/15 text-highlight shadow-[0_0_14px_rgba(16,185,129,0.35)]"
                : "text-text-secondary hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <Icon size={19} strokeWidth={2.25} />
          <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 scale-90 whitespace-nowrap rounded-lg border border-white/10 bg-bg-dark px-2 py-1 text-xs text-white opacity-0 shadow-elevated transition-all duration-150 group-hover:scale-100 group-hover:opacity-100">
            {label}
          </span>
        </NavLink>
      ))}
    </nav>
  );
}
