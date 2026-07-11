/** Div-based slider — avoids Opera/Chrome painting range inputs as solid white bars. */
export default function CustomRangeSlider({ value, min = 0, max = 100, onChange }) {
  const pct =
    max === min ? 0 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className="relative h-7 w-full">
      <div
        className="pointer-events-none absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full border border-[#213631] bg-[#1c2e29]"
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-[#10b981]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div
        className="pointer-events-none absolute top-1/2 z-[1] h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-[#10b981] shadow-md shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        style={{ left: `calc(${pct}% - 10px)` }}
        aria-hidden
      />
      <input
        type="range"
        min={min}
        max={max}
        step="1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="absolute inset-0 z-[2] h-full w-full cursor-pointer opacity-0"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
      />
    </div>
  );
}
