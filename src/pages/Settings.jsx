import { useRef, useState, useEffect } from "react";
import TopBar from "../components/layout/TopBar";
import PageHelp from "../components/ui/PageHelp";
import AllocationEditor from "../components/forms/AllocationEditor";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useSettingsStore } from "../store/useSettingsStore";
import { useFinanceStore } from "../store/useFinanceStore";
import { requestNotificationPermission, maskApiKey } from "../utils/notifications";
import { useWalkthrough } from "../contexts/WalkthroughContext";
import { HelpCircle } from "lucide-react";


function clampPayday(day) {
  if (day == null || isNaN(day)) return null;
  return Math.min(31, Math.max(1, Math.round(day)));
}

export default function Settings() {
  const { restartTour } = useWalkthrough();
  const allocation = useSettingsStore((s) => s.allocation);
  const updateAllocation = useSettingsStore((s) => s.updateAllocation);
  const monthlyIncome = useSettingsStore((s) => s.monthlyIncome);
  const setMonthlyIncome = useSettingsStore((s) => s.setMonthlyIncome);
  const paydays = useSettingsStore((s) => s.paydays);
  const setPaydays = useSettingsStore((s) => s.setPaydays);
  const phpUsdRate = useSettingsStore((s) => s.phpUsdRate);
  const updatePhpUsdRate = useSettingsStore((s) => s.updatePhpUsdRate);
  const showUsd = useSettingsStore((s) => s.showUsd);
  const showPhp = useSettingsStore((s) => s.showPhp);
  const setShowUsd = useSettingsStore((s) => s.setShowUsd);
  const setShowPhp = useSettingsStore((s) => s.setShowPhp);
  const resetSettings = useSettingsStore((s) => s.resetSettings);
  const exportData = useFinanceStore((s) => s.exportData);
  const importData = useFinanceStore((s) => s.importData);
  const resetFinanceData = useFinanceStore((s) => s.resetFinanceData);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const notifyMarketOpen = useSettingsStore((s) => s.notifyMarketOpen);
  const setNotifyMarketOpen = useSettingsStore((s) => s.setNotifyMarketOpen);
  const notifyPayday = useSettingsStore((s) => s.notifyPayday);
  const setNotifyPayday = useSettingsStore((s) => s.setNotifyPayday);
  const autoRefreshStockPrices = useSettingsStore((s) => s.autoRefreshStockPrices);
  const setAutoRefreshStockPrices = useSettingsStore((s) => s.setAutoRefreshStockPrices);
  const stockRefreshMinutes = useSettingsStore((s) => s.stockRefreshMinutes);
  const setStockRefreshMinutes = useSettingsStore((s) => s.setStockRefreshMinutes);
  const marketNotifyHour = useSettingsStore((s) => s.marketNotifyHour);
  const marketNotifyMinute = useSettingsStore((s) => s.marketNotifyMinute);
  const setMarketNotifyHour = useSettingsStore((s) => s.setMarketNotifyHour);
  const setMarketNotifyMinute = useSettingsStore((s) => s.setMarketNotifyMinute);
  const paydayNotifyHourStart = useSettingsStore((s) => s.paydayNotifyHourStart);
  const paydayNotifyHourEnd = useSettingsStore((s) => s.paydayNotifyHourEnd);
  const setPaydayNotifyHourStart = useSettingsStore((s) => s.setPaydayNotifyHourStart);
  const setPaydayNotifyHourEnd = useSettingsStore((s) => s.setPaydayNotifyHourEnd);
  const fileRef = useRef(null);

  const enableNotifications = async () => {
    const perm = await requestNotificationPermission();
    if (perm === "granted") {
      setNotificationsEnabled(true);
    } else if (perm === "denied") {
      alert("Notifications blocked. Enable them in your browser site settings.");
    } else {
      alert("Notifications are not supported in this browser.");
    }
  };

  const [payday1, setPayday1] = useState(String(paydays[0] ?? ""));
  const [payday2, setPayday2] = useState(String(paydays[1] ?? ""));
  const [showSecondPayday, setShowSecondPayday] = useState(paydays.length > 1);

  useEffect(() => {
    setPayday1(String(paydays[0] ?? ""));
    setPayday2(String(paydays[1] ?? ""));
    setShowSecondPayday(paydays.length > 1);
  }, [paydays]);

  const savePaydays = () => {
    const first = clampPayday(parseInt(payday1, 10));
    if (!first) return;
    const list = [first];
    if (showSecondPayday) {
      const second = clampPayday(parseInt(payday2, 10));
      if (second && second !== first) list.push(second);
    }
    setPaydays(list);
  };

  const handleExport = () => {
    const settings = useSettingsStore.getState();
    const blob = new Blob(
      [
        JSON.stringify(
          {
            finance: JSON.parse(exportData()),
            settings: {
              allocation: settings.allocation,
              monthlyIncome: settings.monthlyIncome,
              paydays: settings.paydays,
              phpUsdRate: settings.phpUsdRate,
              savingsBank: settings.savingsBank,
              savingsBankCustom: settings.savingsBankCustom,
            },
          },
          null,
          2
        ),
      ],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fintrack-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.finance) importData(JSON.stringify(data.finance));
        else importData(reader.result);
        if (data.settings) {
          const s = data.settings;
          if (s.allocation) updateAllocation(s.allocation);
          if (s.monthlyIncome) setMonthlyIncome(s.monthlyIncome);
          if (s.paydays) setPaydays(s.paydays);
          if (s.phpUsdRate) updatePhpUsdRate(s.phpUsdRate);
          if (s.savingsBank) useSettingsStore.getState().setSavingsBank(s.savingsBank);
          if (s.savingsBankCustom != null)
            useSettingsStore.getState().setSavingsBankCustom(s.savingsBankCustom);
          if (s.finnhubApiKey) {
            /* legacy import — key now lives in app config */
          }
        }
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleReset = () => {
    if (window.confirm("Reset all FinTrack data? This cannot be undone.")) {
      resetFinanceData();
      resetSettings();
    }
  };

  const paydaySummary =
    paydays.length === 1
      ? `Day ${paydays[0]} of each month`
      : `Days ${paydays.join(" & ")} of each month`;

  return (
    <>
      <TopBar title="Settings" subtitle="Configure income, allocation, and data" />

      <PageHelp title="How Settings works">
        <p>
          Set monthly income, paydays, and allocation here. Notifications and
          Finnhub apply app-wide. Export JSON to back up; import restores data
          on this device.
        </p>
      </PageHelp>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="font-display text-lg font-semibold text-white">
            Allocation
          </h3>
          <div className="mt-4">
            <AllocationEditor allocation={allocation} onSave={updateAllocation} />
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="font-display text-lg font-semibold text-white">
            Income & paydays
          </h3>
          <Input
            label="Monthly income (PHP)"
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
          />

          <div className="relative rounded-[var(--radius-md)] border border-accent bg-bg-deepest p-4 pb-14">
            <p className="text-sm font-medium text-white">Pay schedule</p>
            <p className="mt-1 text-xs text-text-secondary">
              Enter one payday per month, or add a second if you&apos;re paid twice.
            </p>
            <div className="mt-4 space-y-3">
              <Input
                label="Payday (day of month, 1–31)"
                type="number"
                min="1"
                max="31"
                value={payday1}
                onChange={(e) => setPayday1(e.target.value)}
              />
              {!showSecondPayday ? (
                <button
                  type="button"
                  className="text-sm text-highlight hover:underline"
                  onClick={() => setShowSecondPayday(true)}
                >
                  + Add second payday (optional)
                </button>
              ) : (
                <>
                  <Input
                    label="Second payday (optional)"
                    type="number"
                    min="1"
                    max="31"
                    value={payday2}
                    onChange={(e) => setPayday2(e.target.value)}
                  />
                  <button
                    type="button"
                    className="text-xs text-text-secondary hover:text-loss"
                    onClick={() => {
                      setShowSecondPayday(false);
                      setPayday2("");
                    }}
                  >
                    Remove second payday
                  </button>
                </>
              )}
              <p className="text-xs text-text-secondary">Active: {paydaySummary}</p>
            </div>
            <div className="absolute bottom-4 right-4">
              <Button size="sm" onClick={savePaydays}>
                Save paydays
              </Button>
            </div>
          </div>

          <Input
            label="PHP / USD rate"
            type="number"
            step="0.01"
            value={phpUsdRate}
            onChange={(e) => updatePhpUsdRate(parseFloat(e.target.value) || 0)}
          />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showPhp}
                onChange={(e) => setShowPhp(e.target.checked)}
              />
              Show PHP
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showUsd}
                onChange={(e) => setShowUsd(e.target.checked)}
              />
              Show USD
            </label>
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="font-display text-lg font-semibold text-white">
            Notifications
          </h3>
          <p className="text-sm text-text-secondary">
            Browser alerts while FinTrack is open (keep a tab open for reminders).
          </p>
          {!notificationsEnabled ? (
            <Button size="sm" onClick={enableNotifications}>
              Enable notifications
            </Button>
          ) : (
            <p className="text-xs text-gain">Notifications enabled</p>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={notifyMarketOpen}
              disabled={!notificationsEnabled}
              onChange={(e) => setNotifyMarketOpen(e.target.checked)}
            />
            US market open reminder
          </label>
          {notifyMarketOpen && notificationsEnabled && (
            <div className="grid grid-cols-2 gap-2 pl-6">
              <Input
                label="Hour (0–23, Manila time)"
                type="number"
                min="0"
                max="23"
                value={marketNotifyHour}
                onChange={(e) =>
                  setMarketNotifyHour(parseInt(e.target.value, 10) || 0)
                }
              />
              <Input
                label="Minute"
                type="number"
                min="0"
                max="59"
                value={marketNotifyMinute}
                onChange={(e) =>
                  setMarketNotifyMinute(parseInt(e.target.value, 10) || 0)
                }
              />
            </div>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={notifyPayday}
              disabled={!notificationsEnabled}
              onChange={(e) => setNotifyPayday(e.target.checked)}
            />
            Payday reminder
          </label>
          {notifyPayday && notificationsEnabled && (
            <div className="grid grid-cols-2 gap-2 pl-6">
              <Input
                label="From hour (payday dates)"
                type="number"
                min="0"
                max="23"
                value={paydayNotifyHourStart}
                onChange={(e) =>
                  setPaydayNotifyHourStart(parseInt(e.target.value, 10) || 0)
                }
              />
              <Input
                label="Until hour"
                type="number"
                min="0"
                max="23"
                value={paydayNotifyHourEnd}
                onChange={(e) =>
                  setPaydayNotifyHourEnd(parseInt(e.target.value, 10) || 0)
                }
              />
            </div>
          )}
        </div>

        <div className="card space-y-4">
          <h3 className="font-display text-lg font-semibold text-white">
            Live stock prices
          </h3>
          <p className="text-sm text-text-secondary">
            Market data loads automatically on the Investments page (charts and
            holdings). No setup needed in this screen.
          </p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefreshStockPrices}
              onChange={(e) => setAutoRefreshStockPrices(e.target.checked)}
            />
            Auto-refresh while on Investments page
          </label>
          <Input
            label="Refresh every (minutes)"
            type="number"
            min="5"
            max="60"
            value={stockRefreshMinutes}
            onChange={(e) =>
              setStockRefreshMinutes(parseInt(e.target.value, 10) || 15)
            }
          />
        </div>

        <div className="card">
          <div className="flex items-center gap-2">
            <HelpCircle size={18} className="text-highlight" />
            <h3 className="font-display text-lg font-semibold text-white">
              Help &amp; Onboarding
            </h3>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            New to FinTrack? Replay the guided tour to learn about every section of the app.
          </p>
          <div className="mt-4">
            <Button onClick={restartTour} variant="secondary">
              <HelpCircle size={15} />
              Restart Tour
            </Button>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="font-display text-lg font-semibold text-white">
            Data management
          </h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={handleExport}>Export JSON</Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              Import JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
            <Button variant="danger" onClick={handleReset}>
              Reset all data
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
