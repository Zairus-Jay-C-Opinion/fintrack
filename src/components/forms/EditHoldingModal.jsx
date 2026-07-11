import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { formatUsd } from "../../utils/currency";
import { formatDate } from "../../utils/formatters";

export default function EditHoldingModal({
  open,
  onClose,
  holding,
  purchases,
  etfPrices,
  onUpdatePrice,
  onEditPurchase,
  onDeletePurchase,
}) {
  const [priceInput, setPriceInput] = useState("");

  const currentPrice =
    holding && (etfPrices[holding.ticker] ?? holding.currentPrice);

  useEffect(() => {
    if (holding && open) {
      setPriceInput(String(currentPrice ?? ""));
    }
  }, [holding, open, currentPrice]);

  if (!holding) return null;

  const tickerPurchases = purchases.filter((p) => p.ticker === holding.ticker);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit ${holding.ticker} holding`}
    >
      <div className="space-y-6">
        <p className="text-sm text-text-secondary">
          {holding.assetType} · {holding.shares.toFixed(4)} shares · Avg cost{" "}
          {formatUsd(holding.avgCost)}
        </p>

        <div className="flex gap-2">
          <Input
            label="Current price per share (USD)"
            type="number"
            step="0.01"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            className="flex-1"
          />
          <Button
            className="mt-6"
            size="sm"
            onClick={() => {
              const price = parseFloat(priceInput);
              if (!isNaN(price)) onUpdatePrice(holding.ticker, price);
            }}
          >
            Update price
          </Button>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-white">
            Purchase lots ({tickerPurchases.length})
          </p>
          <p className="mb-2 text-xs text-text-secondary">
            Edit individual buys to change shares and cost basis
          </p>
          {tickerPurchases.length === 0 ? (
            <p className="text-sm text-text-secondary">No lots found</p>
          ) : (
            <ul className="max-h-48 space-y-2 overflow-y-auto">
              {tickerPurchases.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <span className="text-white">{formatDate(p.date)}</span>
                    <span className="ml-2 font-mono text-text-secondary">
                      {p.shares} @ {formatUsd(p.priceUSD)}
                    </span>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onEditPurchase(p)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onDeletePurchase(p.id)}
                    >
                      Del
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
