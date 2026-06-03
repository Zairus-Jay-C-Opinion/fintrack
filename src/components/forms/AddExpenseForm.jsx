import { useState, useEffect } from "react";
import Input from "../ui/Input";
import FormSelect from "../ui/FormSelect";
import Button from "../ui/Button";
import { format } from "date-fns";
import { EXPENSE_CATEGORIES } from "../../utils/expenses";

export default function AddExpenseForm({
  onSubmit,
  onCancel,
  initialData = null,
  submitLabel = "Add expense",
  formId = "add-expense-form",
  hideActions = false,
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
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
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
      <FormSelect
        label="Category"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      >
        {EXPENSE_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </FormSelect>
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
      {!hideActions && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" className="w-full sm:w-auto">
            {submitLabel}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </form>
  );
}
