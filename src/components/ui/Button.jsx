const variants = {
  primary:
    "bg-highlight text-bg-deepest border-transparent shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_22px_rgba(16,185,129,0.5)] hover:bg-highlight/90",
  secondary:
    "bg-white/5 text-text-primary border-white/10 hover:bg-white/10 hover:border-white/20",
  ghost:
    "bg-transparent text-text-secondary border-transparent hover:bg-white/5 hover:text-white",
  danger:
    "bg-loss/15 text-loss border-loss/30 hover:bg-loss/25",
};

const sizes = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-5 py-2 text-sm",
  lg: "px-7 py-3 text-base",
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
      className={`inline-flex items-center justify-center gap-2 rounded-full border font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
