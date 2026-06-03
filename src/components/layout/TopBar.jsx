import { Menu } from "lucide-react";

export default function TopBar({ title, subtitle, onMenuClick }) {
  return (
    <header className="mb-4 flex min-w-0 items-start justify-between gap-3 sm:mb-6">
      <div className="flex items-start gap-3">
        {onMenuClick && (
          <button
            type="button"
            className="mt-1 text-text-secondary md:hidden"
            onClick={onMenuClick}
          >
            <Menu size={24} />
          </button>
        )}
        <div>
          <h1 className="font-display text-xl font-bold text-white sm:text-2xl md:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
}
