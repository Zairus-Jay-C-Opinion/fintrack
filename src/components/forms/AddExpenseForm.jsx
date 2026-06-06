import { useState, useEffect, useRef } from "react";
import Input from "../ui/Input";
import FormSelect from "../ui/FormSelect";
import Button from "../ui/Button";
import { format } from "date-fns";
import { EXPENSE_CATEGORIES } from "../../utils/expenses";
import { analyzeReceipt } from "../../utils/geminiVision";
import { Camera, Loader2 } from "lucide-react";

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

  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const fileInputRef = useRef(null);

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

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input so same file can be selected again if needed
    e.target.value = "";
    setScanError("");
    setIsScanning(true);

    try {
      // Convert file to Base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(",")[1]); // strip data:image/... prefix
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Image = await base64Promise;

      // Send to Gemini
      const result = await analyzeReceipt(base64Image, file.type);
      
      // Update form
      setForm((prev) => ({
        ...prev,
        item: result.item || prev.item,
        amount: result.amount > 0 ? String(result.amount) : prev.amount,
        category: result.category || prev.category,
        date: result.date || prev.date,
      }));
    } catch (err) {
      setScanError(err.message || "Failed to scan receipt");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      {/* Receipt Scanner Section */}
      {!initialData && (
        <div className="mb-4 rounded-[var(--radius-sm)] border border-accent/60 bg-bg-mid/30 p-4 text-center">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="mb-3 text-sm text-text-secondary">
            Save time typing — let AI extract the details from a receipt or screenshot.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
          >
            {isScanning ? (
              <><Loader2 className="animate-spin" size={16} /> Scanning...</>
            ) : (
              <><Camera size={16} /> Scan receipt</>
            )}
          </Button>
          {scanError && <p className="mt-2 text-xs text-loss">{scanError}</p>}
        </div>
      )}

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
