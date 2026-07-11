import { useState, useMemo } from "react";
import { Pencil, Trash2, DollarSign, TrendingUp, Wallet, Calendar } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import PageHelp from "../components/ui/PageHelp";
import Tabs from "../components/ui/Tabs";
import StockPriceChart from "../components/charts/StockPriceChart";
import HoldingsAllocationChart from "../components/charts/HoldingsAllocationChart";
import StatCard from "../components/cards/StatCard";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import AddInvestmentForm from "../components/forms/AddInvestmentForm";
import EditHoldingModal from "../components/forms/EditHoldingModal";
import { useFinanceStore } from "../store/useFinanceStore";
import { useSettingsStore } from "../store/useSettingsStore";
import {
  getHoldingsSummary,
  getTotalInvestedUSD,
  getPortfolioValueUSD,
  getNextPayday,
  daysUntil,
} from "../utils/finance";
import { formatPhp, formatUsd, usdToPhp } from "../utils/currency";
import { formatDate } from "../utils/formatters";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { useMarketChart } from "../contexts/MarketChartContext";
import { resolveChartTicker } from "../utils/marketChart";
import { userProfile } from "../constants/userProfile";

export default function Investments() {
  const purchases = useFinanceStore((s) => s.investmentPurchases);
  const etfPrices = useFinanceStore((s) => s.etfPrices);
  const addInvestmentPurchase = useFinanceStore((s) => s.addInvestmentPurchase);
  const updateInvestmentPurchase = useFinanceStore(
    (s) => s.updateInvestmentPurchase
  );
  const removeInvestmentPurchase = useFinanceStore(
    (s) => s.removeInvestmentPurchase
  );
  const updateEtfPrice = useFinanceStore((s) => s.updateEtfPrice);
  const phpUsdRate = useSettingsStore((s) => s.phpUsdRate);
  const monthlyIncome = useSettingsStore((s) => s.monthlyIncome);
  const allocation = useSettingsStore((s) => s.allocation);
  const paydays = useSettingsStore((s) => s.paydays);
  const { fetchLiveRate, loading: fxLoading } = useExchangeRate();
  const {
    refreshPrices,
    loading: pricesLoading,
    lastRefresh,
    quoteErrors,
    chartErrors,
    priceFallbacks,
    priceHistory,
    chartTicker,
    setChartTicker,
  } = useMarketChart();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [editingHolding, setEditingHolding] = useState(null);
  const [priceEdits, setPriceEdits] = useState({});

  const holdings = getHoldingsSummary(purchases, etfPrices);
  const tickers = useMemo(
    () => [...new Set(purchases.map((p) => p.ticker))],
    [purchases]
  );
  const activeChartTicker = resolveChartTicker(
    tickers,
    chartTicker,
    priceHistory
  );
  const activeChartData = priceHistory?.[activeChartTicker];
  const hasChartData =
    activeChartData?.length > 0 ||
    Object.values(priceHistory ?? {}).some((pts) => pts?.length > 0);
  const totalInvested = getTotalInvestedUSD(purchases);
  const currentValue = getPortfolioValueUSD(purchases, etfPrices);
  const gain = currentValue - totalInvested;
  const gainPct = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;
  const dcaAmount = monthlyIncome * allocation.investments;
  const nextPayday = getNextPayday(paydays);

  const openAdd = () => {
    setEditingPurchase(null);
    setModalOpen(true);
  };

  const openEdit = (purchase) => {
    setEditingPurchase(purchase);
    setModalOpen(true);
  };

  const handleSubmit = (purchase) => {
    if (editingPurchase) {
      updateInvestmentPurchase(editingPurchase.id, purchase);
    } else {
      addInvestmentPurchase(purchase);
    }
    setModalOpen(false);
    setEditingPurchase(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this purchase record?")) {
      removeInvestmentPurchase(id);
    }
  };

  return (
    <div className="page-shell">
      <TopBar
        title="Investments"
        subtitle={`${userProfile.broker} portfolio`}
      />

      <PageHelp title="Understanding Investments">
        <ul className="list-inside list-disc space-y-2">
          <li>
            <strong className="text-text-primary">Unrealized P/L</strong> (profit/loss)
            — paper gain or loss if you sold today. Current value minus what you
            paid. Not taxed or realized until you sell.
          </li>
          <li>
            <strong className="text-text-primary">Monthly DCA</strong> — Dollar-Cost
            Averaging: the amount from your allocation (
            {(allocation.investments * 100).toFixed(0)}% = {formatPhp(dcaAmount)})
            you plan to invest each payday.
          </li>
          <li>
            <strong className="text-text-primary">Live prices & charts</strong> — click{" "}
            <em>Refresh live</em> pulls the latest quote and ~90-day price chart for
            each symbol.
          </li>
        </ul>
      </PageHelp>

      {lastRefresh && (
        <p className="mb-4 text-xs text-text-secondary">
          Market data last updated {lastRefresh.toLocaleString()}
        </p>
      )}

      <div className="mb-4 grid grid-cols-2 gap-2 min-w-0 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Total Invested" value={formatUsd(totalInvested)} sub="What you paid" />
        <StatCard
          icon={Wallet}
          label="Current Value"
          value={formatUsd(currentValue)}
          sub={formatPhp(usdToPhp(currentValue, phpUsdRate))}
        />
        <StatCard
          icon={TrendingUp}
          label="Unrealized P/L"
          value={formatUsd(gain)}
          trend={gainPct}
          sub="Paper gain/loss if sold today"
        />
        <StatCard
          icon={Calendar}
          label="Monthly DCA"
          value={formatPhp(dcaAmount)}
          sub="Planned investment per month"
        />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <div className="card min-w-0 lg:col-span-2">
          <h3 className="font-display text-lg font-semibold text-white">
            Holdings
          </h3>
          {holdings.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] py-10 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-text-secondary/60">
                <TrendingUp className="h-7 w-7" />
              </div>
              <h4 className="mb-1 font-medium text-white">No investments yet</h4>
              <p className="text-sm text-text-secondary">Log a stock or ETF purchase to see it here.</p>
            </div>
          ) : (
          <div className="mt-4 max-w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-white/10">
            <table className="w-full min-w-[520px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-text-secondary">
                  <th className="px-2 py-3">Symbol</th>
                  <th className="hidden px-2 py-3 sm:table-cell">Type</th>
                  <th className="px-2 py-3">Shares</th>
                  <th className="px-2 py-3">Avg</th>
                  <th className="px-2 py-3">Price</th>
                  <th className="px-2 py-3">Value</th>
                  <th className="px-2 py-3">Gain</th>
                  <th className="w-10 px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => (
                    <tr key={h.ticker} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                      <td className="py-3 pr-3 pl-2 font-medium text-white">
                        {h.ticker}
                      </td>
                      <td className="hidden py-3 pr-2 text-text-secondary sm:table-cell">
                        {h.assetType}
                      </td>
                      <td className="py-3 pr-2 font-mono">
                        {h.shares.toFixed(2)}
                      </td>
                      <td className="py-3 pr-2 font-mono">
                        {formatUsd(h.avgCost)}
                      </td>
                      <td className="py-3 pr-2 font-mono">
                        {h.currentPrice > 0 ? formatUsd(h.currentPrice) : "—"}
                      </td>
                      <td className="py-3 pr-2 font-mono text-white">
                        {formatUsd(h.currentValue)}
                        <span className="block text-xs text-text-secondary">
                          {formatPhp(usdToPhp(h.currentValue, phpUsdRate))}
                        </span>
                      </td>
                      <td
                        className={`py-3 pr-3 font-mono ${h.gain >= 0 ? "text-gain" : "text-loss"}`}
                      >
                        {formatUsd(h.gain)} ({h.gainPct.toFixed(1)}%)
                      </td>
                      <td className="py-3 pr-2">
                        <button
                          type="button"
                          onClick={() => setEditingHolding(h)}
                          className="rounded-full p-1.5 text-text-secondary hover:bg-white/5 hover:text-white"
                          title="Edit holding"
                        >
                          <Pencil size={16} />
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
          <div className="mt-4 flex justify-start">
            <Button size="sm" onClick={openAdd}>
              Add purchase
            </Button>
          </div>
        </div>

        <div className="space-y-4 min-w-0">

          <div className="card border-highlight/20 bg-gradient-to-br from-highlight/10 to-transparent">
            <h3 className="font-display font-semibold text-white">DCA Tracker</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Next contribution in {daysUntil(nextPayday) ?? "—"} days
            </p>
            <p className="mt-2 font-mono text-lg text-highlight">
              {formatPhp(dcaAmount)} recommended
            </p>
          </div>
          <div className="card">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display font-semibold text-white">
                Current prices (USD)
              </h3>
              <Button
                size="sm"
                variant="secondary"
                onClick={refreshPrices}
                disabled={pricesLoading || tickers.length === 0}
              >
                {pricesLoading ? "Updating…" : "Refresh live"}
              </Button>
            </div>
            {lastRefresh && (
              <p className="mb-2 text-xs text-text-secondary">
                Last updated {lastRefresh.toLocaleTimeString()}
              </p>
            )}
            {Object.keys(priceFallbacks).length > 0 && (
              <div className="mb-2 rounded-[var(--radius-sm)] border border-highlight/30 bg-highlight/10 p-2 text-xs text-text-primary">
                <p className="font-medium text-highlight">Price from chart (estimate)</p>
                <ul className="mt-1 list-inside list-disc text-text-secondary">
                  {Object.entries(priceFallbacks).map(([symbol, msg]) => (
                    <li key={symbol}>
                      <span className="font-mono text-white">{symbol}</span>: {msg}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Object.keys(quoteErrors).filter((k) => k !== "_").length > 0 && (
              <div className="mb-2 rounded-[var(--radius-sm)] border border-warning/40 bg-warning/10 p-2 text-xs text-warning">
                <p className="font-medium">Live price could not load:</p>
                <ul className="mt-1 list-inside list-disc">
                  {Object.entries(quoteErrors)
                    .filter(([k]) => k !== "_")
                    .map(([symbol, msg]) => (
                      <li key={symbol}>
                        <span className="font-mono text-white">{symbol}</span>:{" "}
                        {msg}
                      </li>
                    ))}
                </ul>
                <p className="mt-2 text-text-secondary">
                  If this says <span className="font-mono">Invalid API key</span>, open
                  Vercel → Settings → Environment Variables → fix{" "}
                  <span className="font-mono">FINNHUB_API_KEY</span> (no spaces, then
                  Redeploy). You can still set prices manually below.
                </p>
              </div>
            )}
            {quoteErrors._ && (
              <p className="mb-2 text-xs text-loss">{quoteErrors._}</p>
            )}
            {tickers.length === 0 ? (
              <p className="text-sm text-text-secondary">
                Add a purchase to set prices
              </p>
            ) : (
              tickers.map((ticker) => (
                <div key={ticker} className="mb-2 flex gap-2">
                  <Input
                    label={ticker}
                    type="number"
                    value={priceEdits[ticker] ?? etfPrices[ticker] ?? ""}
                    onChange={(e) =>
                      setPriceEdits({ ...priceEdits, [ticker]: e.target.value })
                    }
                  />
                  <Button
                    size="sm"
                    className="mt-6"
                    onClick={() =>
                      updateEtfPrice(
                        ticker,
                        parseFloat(priceEdits[ticker]) || etfPrices[ticker]
                      )
                    }
                  >
                    Set
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {tickers.length > 0 && (
        <div className="mb-4 grid min-w-0 gap-4 lg:grid-cols-2" key="charts-section">
          <div className="card min-w-0 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-lg font-semibold text-white">
                Price history
              </h3>
              <Button
                size="sm"
                variant="secondary"
                onClick={refreshPrices}
                disabled={pricesLoading}
              >
                {pricesLoading ? "Loading…" : "Refresh live"}
              </Button>
            </div>
            {tickers.length > 1 && (
              <div className="mt-4 max-w-full overflow-x-auto">
                <Tabs
                  tabs={tickers.map((t) => ({ id: t, label: t }))}
                  active={activeChartTicker}
                  onChange={setChartTicker}
                />
              </div>
            )}
            <div className="mt-4 min-w-0 w-full">
              <StockPriceChart
                key={`${activeChartTicker}-${activeChartData?.length ?? 0}`}
                ticker={activeChartTicker}
                data={activeChartData}
              />
            </div>
            {Object.keys(chartErrors).length > 0 && (
              <p className="mt-2 text-xs text-warning">
                Chart unavailable for:{" "}
                {Object.entries(chartErrors)
                  .map(([s, m]) => `${s} (${m})`)
                  .join("; ")}
              </p>
            )}
            <p className="mt-2 text-xs text-text-secondary">
              {hasChartData
                ? "Daily closing prices, last ~90 days"
                : "Tap Refresh live to load chart data"}
            </p>
          </div>
          <div className="card min-w-0 overflow-hidden">
            <h3 className="font-display text-lg font-semibold text-white">
              Portfolio mix (USD)
            </h3>
            <div className="mt-4 min-w-0">
              <HoldingsAllocationChart holdings={holdings} />
            </div>
          </div>
        </div>
      )}

      <div className="card min-w-0">
        <h3 className="font-display text-lg font-semibold text-white">
          Purchase history
        </h3>
        {purchases.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] py-10 text-center">
            <p className="text-sm text-text-secondary">No purchases yet</p>
          </div>
        ) : (
        <div className="mt-4 max-w-full overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-text-secondary">
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Symbol</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Shares</th>
                <th className="px-3 py-3">Total USD</th>
                <th className="px-3 py-3">Note</th>
                <th className="w-20 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                    <td className="whitespace-nowrap px-3 py-3 text-text-secondary">{formatDate(p.date)}</td>
                    <td className="px-3 py-3 font-medium text-white">
                      {p.ticker}
                    </td>
                    <td className="px-3 py-3 text-text-secondary">
                      {p.assetType || "—"}
                    </td>
                    <td className="px-3 py-3 font-mono">{p.shares}</td>
                    <td className="px-3 py-3 font-mono">
                      {formatUsd(p.totalUSD)}
                    </td>
                    <td className="px-3 py-3 text-text-secondary">{p.note}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="rounded-full p-1.5 text-text-secondary hover:bg-white/5 hover:text-white"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="rounded-full p-1.5 text-text-secondary hover:bg-loss/10 hover:text-loss"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPurchase(null);
        }}
        title={editingPurchase ? "Edit purchase" : "Add purchase"}
      >
        <AddInvestmentForm
          key={editingPurchase?.id ?? "new"}
          formId="add-investment-form"
          initialData={editingPurchase}
          submitLabel={editingPurchase ? "Save changes" : "Record purchase"}
          onSubmit={handleSubmit}
        />
      </Modal>

      <EditHoldingModal
        open={!!editingHolding}
        onClose={() => setEditingHolding(null)}
        holding={editingHolding}
        purchases={purchases}
        etfPrices={etfPrices}
        onUpdatePrice={(ticker, price) => {
          updateEtfPrice(ticker, price);
        }}
        onEditPurchase={(p) => {
          setEditingHolding(null);
          openEdit(p);
        }}
        onDeletePurchase={(id) => {
          if (window.confirm("Delete this purchase lot?")) {
            removeInvestmentPurchase(id);
          }
        }}
      />
    </div>
  );
}
