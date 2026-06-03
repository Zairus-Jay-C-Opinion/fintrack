export default function FormSelect({
  label,
  value,
  onChange,
  children,
  className = "",
}) {
  return (
    <label className="block w-full min-w-0 max-w-full">
      {label && (
        <span className="mb-1.5 block text-sm text-text-secondary">{label}</span>
      )}
      <select
        className={`field-input field-select w-full min-w-0 max-w-full ${className}`}
        value={value}
        onChange={onChange}
      >
        {children}
      </select>
    </label>
  );
}
