import { useState, useEffect } from "react";
import Input from "../ui/Input";
import FormSelect from "../ui/FormSelect";
import Button from "../ui/Button";
import { format } from "date-fns";
import { useSettingsStore } from "../../store/useSettingsStore";

const ASSET_TYPES = ["Stock", "ETF", "Mutual fund", "REIT", "Other"];

export default function AddInvestmentForm({
  onSubmit,
  initialData = null,
  formId = "add-investment-form",
  submitLabel = "Record purchase",
}) {
  const phpUsdRate = useSettingsStore((s) => s.phpUsdRate);
  const [form, setForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    assetType: "ETF",
    ticker: "",
    shares: "",
    priceUSD: "",
    fee: "0",
    note: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        date: initialData.date,
        assetType: initialData.assetType || "ETF",
        ticker: initialData.ticker,
        shares: String(initialData.shares),
        priceUSD: String(initialData.priceUSD),
        fee: String(initialData.fee ?? 0),
        note: initialData.note || "",
      });
    }
  }, [initialData]);

  const shares = parseFloat(form.shares) || 0;
  const priceUSD = parseFloat(form.priceUSD) || 0;
  const totalUSD = shares * priceUSD;
  const totalPHP = totalUSD * phpUsdRate;
  const ticker = form.ticker.trim().toUpperCase();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ticker) return;
    onSubmit({
      id: initialData?.id ?? crypto.randomUUID(),
      date: form.date,
      assetType: form.assetType,
      ticker,
      shares,
      priceUSD,
      totalUSD,
      phpUsdRate,
      totalPHP,
      fee: parseFloat(form.fee) || 0,
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
      <FormSelect
        label="Asset type"
        value={form.assetType}
        onChange={(e) => setForm({ ...form, assetType: e.target.value })}
      >
        {ASSET_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </FormSelect>
      <Input
        label="Ticker / symbol"
        placeholder="e.g. VOO, AAPL, TSLA"
        value={form.ticker}
        onChange={(e) =>
          setForm({ ...form, ticker: e.target.value.toUpperCase() })
        }
        required
      />
      <Input
        label="Shares"
        type="number"
        min="0"
        step="0.0001"
        value={form.shares}
        onChange={(e) => setForm({ ...form, shares: e.target.value })}
        required
      />
      <Input
        label="Price per share (USD)"
        type="number"
        min="0"
        step="0.01"
        value={form.priceUSD}
        onChange={(e) => setForm({ ...form, priceUSD: e.target.value })}
        required
      />
      <p className="break-words font-mono text-sm text-text-secondary">
        Total: ${totalUSD.toFixed(2)} ≈ ₱{totalPHP.toLocaleString("en-PH")}
      </p>
      <Input
        label="Fee (USD)"
        type="number"
        min="0"
        step="0.01"
        value={form.fee}
        onChange={(e) => setForm({ ...form, fee: e.target.value })}
      />
      <p className="text-xs text-text-secondary">
        One-time broker or platform fee in US dollars (e.g. 0.50 or 5.00). Use 0
        if none.
      </p>
      <Input
        label="Note"
        value={form.note}
        onChange={(e) => setForm({ ...form, note: e.target.value })}
      />
      <Button
        type="submit"
        className="mt-2 w-full"
        disabled={!ticker}
      >
        {submitLabel}
      </Button>
    </form>
  );
}
