import AllocationDonut from "../charts/AllocationDonut";
import { formatPhp } from "../../utils/currency";
import { formatPercent } from "../../utils/formatters";

export default function AllocationCard({ allocation, amounts }) {
  const items = [
    { key: "investments", label: "Investments", color: "#10B981" },
    { key: "savings", label: "Savings", color: "#84CC16" },
    { key: "spending", label: "Spending", color: "#FBBF24" },
  ];

  return (
    <div className="card h-full">
      <h3 className="font-display text-lg font-semibold text-white">
        Monthly Allocation
      </h3>
      <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
        <AllocationDonut allocation={allocation} />
        <ul className="w-full flex-1 space-y-3">
          {items.map(({ key, label, color }) => (
            <li key={key} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: color }}
                />
                <span className="text-sm text-text-secondary">{label}</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm text-white">
                  {formatPercent(allocation[key])}
                </span>
                <span className="ml-2 font-mono text-xs text-text-secondary">
                  {formatPhp(amounts[key])}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
