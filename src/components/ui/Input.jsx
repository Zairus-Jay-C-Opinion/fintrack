export default function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block w-full">
      {label && (
        <span className="mb-1.5 block text-sm text-text-secondary">{label}</span>
      )}
      <input
        className={`w-full rounded-[var(--radius-sm)] border border-accent bg-bg-deepest px-3 py-2.5 font-body text-base text-text-primary placeholder:text-text-secondary/60 focus:border-highlight focus:outline-none focus:ring-1 focus:ring-highlight md:text-sm ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-loss">{error}</span>}
    </label>
  );
}
