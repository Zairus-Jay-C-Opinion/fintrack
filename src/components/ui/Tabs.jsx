export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-accent pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-colors ${
            active === tab.id
              ? "bg-bg-mid text-white"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
