import { useState, useEffect } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { format } from "date-fns";
import { EXPENSE_CATEGORIES } from "../../utils/expenses";

export default function AddExpenseForm({
  onSubmit,
  onCancel,
  initialData = null,
  submitLabel = "Add expense",
}) {
  const [form, setForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    item: "",
    category: EXPENSE_CATEGORIES[0],
    amount: "",
    note: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        date: initialData.date,
        item: initialData.item || "",
        category: initialData.category || EXPENSE_CATEGORIES[0],
        amount: String(initialData.amount),
        note: initialData.note || "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: initialData?.id ?? crypto.randomUUID(),
      date: form.date,
      type: "expense",
      item: form.item.trim(),
      category: form.category,
      amount: parseFloat(form.amount),
      note: form.note,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Date"
        type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        required
      />
      <Input
        label="What did you buy?"
        placeholder="e.g. Coffee, textbooks, load"
        value={form.item}
        onChange={(e) => setForm({ ...form, item: e.target.value })}
        required
      />
      <label className="block text-sm text-text-secondary">
        Category
        <select
          className="mt-1.5 w-full rounded-[var(--radius-sm)] border border-accent bg-bg-deepest px-3 py-2 text-text-primary"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <Input
        label="Amount (PHP)"
        type="number"
        min="0"
        step="0.01"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
        required
      />
      <Input
        label="Note (optional)"
        value={form.note}
        onChange={(e) => setForm({ ...form, note: e.target.value })}
      />
      <div className="flex gap-2">
        <Button type="submit">{submitLabel}</Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
