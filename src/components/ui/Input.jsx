export default function Input({ label, error, className = "", type, ...props }) {
  const isDate = type === "date" || type === "datetime-local";

  return (
    <label className="block w-full min-w-0 max-w-full">
      {label && (
        <span className="mb-1.5 block text-sm text-text-secondary">{label}</span>
      )}
      <input
        type={type}
        className={`field-input w-full min-w-0 max-w-full ${isDate ? "field-date" : ""} ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-loss">{error}</span>}
    </label>
  );
}
