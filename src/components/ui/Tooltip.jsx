export default function Tooltip({ children, text }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-sm)] border border-accent bg-bg-dark px-2 py-1 text-xs text-text-primary opacity-0 transition-opacity group-hover:opacity-100">
        {text}
      </span>
    </span>
  );
}
