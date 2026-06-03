import { Menu } from "lucide-react";

export default function TopBar({ title, subtitle, onMenuClick, actions }) {
  return (
    <header className="mb-4 flex min-w-0 items-start justify-between gap-2 sm:mb-6 sm:gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {onMenuClick && (
          <button
            type="button"
            className="mt-1 shrink-0 text-text-secondary md:hidden"
            onClick={onMenuClick}
          >
            <Menu size={24} />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-xl font-bold text-white sm:text-2xl md:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary sm:mt-1 sm:text-sm">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}
