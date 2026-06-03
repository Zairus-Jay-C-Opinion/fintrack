import { useState, useEffect } from "react";
import Button from "../ui/Button";
import CustomRangeSlider from "../ui/CustomRangeSlider";
import { formatPercent } from "../../utils/formatters";

const KEYS = ["investments", "savings", "spending"];
const LABELS = {
  investments: "Investments",
  savings: "Savings",
  spending: "Spending",
};

export default function AllocationEditor({ allocation, onSave }) {
  const [local, setLocal] = useState({
    investments: allocation.investments * 100,
    savings: allocation.savings * 100,
    spending: allocation.spending * 100,
  });

  useEffect(() => {
    setLocal({
      investments: allocation.investments * 100,
      savings: allocation.savings * 100,
      spending: allocation.spending * 100,
    });
  }, [allocation]);

  const total = local.investments + local.savings + local.spending;
  const valid = Math.abs(total - 100) < 0.5;

  const handleChange = (key, value) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!valid) return;
    onSave({
      investments: local.investments / 100,
      savings: local.savings / 100,
      spending: local.spending / 100,
    });
  };

  return (
    <div className="space-y-4">
      {KEYS.map((key) => (
        <div key={key}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-text-secondary">{LABELS[key]}</span>
            <span className="font-mono text-white">{local[key].toFixed(0)}%</span>
          </div>
          <CustomRangeSlider
            min={0}
            max={100}
            value={local[key]}
            onChange={(v) => handleChange(key, v)}
          />
        </div>
      ))}
      <p
        className={`text-sm font-mono ${valid ? "text-gain" : "text-loss"}`}
      >
        Total: {total.toFixed(1)}% {valid ? "✓" : "(must equal 100%)"}
      </p>
      <p className="text-xs text-text-secondary">
        Target: {formatPercent(allocation.investments)} inv /{" "}
        {formatPercent(allocation.savings)} save
      </p>
      <Button onClick={handleSave} disabled={!valid}>
        Save allocation
      </Button>
    </div>
  );
}
