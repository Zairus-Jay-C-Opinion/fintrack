import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PiggyBank,
  TrendingUp,
  LineChart,
  BarChart3,
  Settings,
  Receipt,
  Target,
} from "lucide-react";
import { userProfile } from "../../constants/userProfile";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/expenses", icon: Receipt, label: "Expenses" },
  { to: "/savings", icon: PiggyBank, label: "Savings" },
  { to: "/goals", icon: Target, label: "Goals" },
  { to: "/investments", icon: TrendingUp, label: "Investments" },
  { to: "/forecasting", icon: LineChart, label: "Forecasting" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar({ collapsed }) {
  return (
    <aside
      className={`hidden h-full flex-shrink-0 flex-col border-r border-accent bg-bg-deepest md:flex ${
        collapsed ? "w-[72px]" : "w-60"
      }`}
    >
      <div className={`border-b border-accent p-6 ${collapsed ? "px-3" : ""}`}>
        <div
          className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}
        >
          <img
            src="/icon.png"
            alt="FinTrack"
            className={`rounded-lg object-cover ${collapsed ? "h-9 w-9" : "h-11 w-11"}`}
          />
          {!collapsed && (
            <div>
              <h1 className="font-display text-xl font-bold text-white">
                FinTrack
              </h1>
              <p className="mt-0.5 text-xs text-text-secondary">
                {userProfile.tagline}
              </p>
            </div>
          )}
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "border-l-[3px] border-highlight bg-bg-mid pl-[9px] text-white"
                  : "border-l-[3px] border-transparent text-text-secondary hover:bg-bg-dark hover:text-text-primary"
              }`
            }
          >
            <Icon size={20} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
