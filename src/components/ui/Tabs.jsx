export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-full border border-white/10 bg-white/5 p-1.5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            active === tab.id
              ? "bg-highlight text-bg-deepest shadow-[0_0_12px_rgba(16,185,129,0.35)]"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
