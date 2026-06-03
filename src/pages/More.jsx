import { Link } from "react-router-dom";
import { LineChart, BarChart3, Settings, ChevronRight } from "lucide-react";
import TopBar from "../components/layout/TopBar";

const links = [
  {
    to: "/forecasting",
    icon: LineChart,
    title: "Forecasting",
    description: "Project savings and investments over time",
  },
  {
    to: "/analytics",
    icon: BarChart3,
    title: "Analytics",
    description: "Savings rate, allocation, and net worth trends",
  },
  {
    to: "/settings",
    icon: Settings,
    title: "Settings",
    description: "Income, allocation, paydays, and data",
  },
];

export default function More() {
  return (
    <div className="page-shell">
      <TopBar title="More" subtitle="Forecasting, analytics, and settings" />
      <ul className="space-y-3">
        {links.map(({ to, icon: Icon, title, description }) => (
          <li key={to}>
            <Link
              to={to}
              className="card flex items-center gap-4 transition-colors hover:border-highlight/50"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-bg-mid text-highlight">
                <Icon size={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-white">{title}</span>
                <span className="block text-sm text-text-secondary">
                  {description}
                </span>
              </span>
              <ChevronRight className="shrink-0 text-text-secondary" size={20} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
