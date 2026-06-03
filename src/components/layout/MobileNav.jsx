import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PiggyBank,
  TrendingUp,
  Receipt,
  Target,
  Settings,
} from "lucide-react";

const items = [
  { to: "/", icon: LayoutDashboard, label: "Home" },
  { to: "/expenses", icon: Receipt, label: "Spend" },
  { to: "/goals", icon: Target, label: "Goals" },
  { to: "/investments", icon: TrendingUp, label: "Invest" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-accent bg-bg-deepest pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] ${
              isActive ? "text-highlight" : "text-text-secondary"
            }`
          }
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
