import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { format } from "date-fns";

export default function AddTransactionForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    amount: "",
    type: "expense",
    note: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: crypto.randomUUID(),
      date: form.date,
      amount: parseFloat(form.amount),
      type: form.type,
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
        label="Amount (PHP)"
        type="number"
        min="0"
        step="0.01"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
        required
      />
      <label className="block text-sm text-text-secondary">
        Type
        <select
          className="mt-1.5 w-full rounded-[var(--radius-sm)] border border-accent bg-bg-deepest px-3 py-2 text-text-primary"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </label>
      <Input
        label="Note"
        value={form.note}
        onChange={(e) => setForm({ ...form, note: e.target.value })}
      />
      <div className="flex gap-2">
        <Button type="submit">Add</Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
