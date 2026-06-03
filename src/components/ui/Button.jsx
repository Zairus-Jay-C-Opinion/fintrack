const variants = {
  primary:
    "bg-highlight text-white hover:opacity-90 border-transparent",
  secondary:
    "bg-bg-mid text-text-primary border-accent hover:bg-bg-dark",
  ghost: "bg-transparent text-text-secondary border-transparent hover:text-white",
  danger: "bg-loss/20 text-loss border-loss/40 hover:bg-loss/30",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border font-medium transition-opacity disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
