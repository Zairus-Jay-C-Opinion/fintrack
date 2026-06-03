const styles = {
  default: "bg-bg-mid text-text-primary",
  gain: "bg-gain/15 text-gain",
  loss: "bg-loss/15 text-loss",
  warning: "bg-warning/15 text-warning",
  highlight: "bg-highlight/15 text-highlight",
};

export default function Badge({ children, variant = "default", className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
