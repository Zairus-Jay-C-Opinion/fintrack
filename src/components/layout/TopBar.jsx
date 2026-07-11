import { Menu } from "lucide-react";

export default function TopBar({ title, subtitle, onMenuClick, actions }) {
  return (
    <header className="mb-6 w-full max-w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {onMenuClick && (
            <button
              type="button"
              className="mt-2 shrink-0 text-text-secondary md:hidden"
              onClick={onMenuClick}
            >
              <Menu size={24} />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 line-clamp-2 text-sm text-text-secondary md:text-base">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto sm:justify-end">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
