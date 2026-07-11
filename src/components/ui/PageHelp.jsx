import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function PageHelp({ title = "How this page works", children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 min-w-0 max-w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full min-w-0 max-w-full items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-text-secondary transition-colors hover:border-highlight/40 hover:text-text-primary"
      >
        <span className="flex items-center gap-2">
          <HelpCircle size={18} className="text-highlight" />
          {open ? "Hide help" : title}
        </span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && (
        <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-text-secondary">
          {children}
        </div>
      )}
    </div>
  );
}
