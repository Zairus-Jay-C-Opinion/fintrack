import { formatPhp } from "../../utils/currency";
import { formatDate } from "../../utils/formatters";
import Button from "../ui/Button";

export default function GoalCard({ goal, onDelete, onUpdateProgress }) {
  const progress =
    goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0;
  const isComplete = progress >= 100;

  return (
    <div
      className={`rounded-2xl border p-4 backdrop-blur-sm transition-colors ${
        isComplete
          ? "border-highlight/40 bg-highlight/5 shadow-[0_0_18px_rgba(16,185,129,0.15)]"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-medium text-white">{goal.name}</h4>
          <p className="text-xs text-text-secondary">
            Target {formatDate(goal.targetDate)}
          </p>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(goal.id)}
            className="text-xs text-text-secondary hover:text-loss"
          >
            Remove
          </button>
        )}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${isComplete ? "bg-highlight" : "bg-gain"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-xs">
        <span className="text-text-primary">
          {formatPhp(goal.current)} / {formatPhp(goal.target)}
        </span>
        <span className={isComplete ? "text-highlight" : "text-gain"}>
          {progress.toFixed(0)}%
        </span>
      </div>
      {onUpdateProgress && (
        <Button
          size="sm"
          variant="secondary"
          className="mt-3 w-full"
          onClick={() => onUpdateProgress(goal)}
        >
          Update saved amount
        </Button>
      )}
      <p className="mt-2 text-xs text-text-secondary">
        Use Fund goals or update amount manually.
      </p>
    </div>
  );
}
