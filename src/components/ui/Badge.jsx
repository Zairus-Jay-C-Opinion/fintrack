const styles = {
  default: "bg-white/5 text-text-primary border-white/10",
  gain: "bg-gain/10 text-gain border-gain/20",
  loss: "bg-loss/10 text-loss border-loss/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  highlight: "bg-highlight/10 text-highlight border-highlight/20",
};

export default function Badge({ children, variant = "default", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
