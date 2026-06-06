import { useState, useEffect } from "react";
import Input from "../ui/Input";
import FormSelect from "../ui/FormSelect";
import Button from "../ui/Button";
import { format } from "date-fns";
import { EXPENSE_CATEGORIES } from "../../utils/expenses";

export default function AddExpenseForm({
  onSubmit,
  initialData = null,
  formId = "add-expense-form",
  submitLabel = "Log purchase",
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
        amount: initialData.amount ? String(initialData.amount) : "",
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
      <Button type="submit" className="mt-2 w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
