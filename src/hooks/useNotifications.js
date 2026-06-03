import { useEffect } from "react";
import { useSettingsStore } from "../store/useSettingsStore";
import {
  sendBrowserNotification,
  shouldNotifyMarketOpen,
  shouldNotifyPayday,
} from "../utils/notifications";

export function useNotifications() {
  const enabled = useSettingsStore((s) => s.notificationsEnabled);
  const notifyMarketOpen = useSettingsStore((s) => s.notifyMarketOpen);
  const notifyPayday = useSettingsStore((s) => s.notifyPayday);
  const paydays = useSettingsStore((s) => s.paydays);
  const lastMarketNotify = useSettingsStore((s) => s.lastMarketNotifyDate);
  const lastPaydayNotify = useSettingsStore((s) => s.lastPaydayNotifyDate);
  const setLastMarketNotify = useSettingsStore((s) => s.setLastMarketNotifyDate);
  const setLastPaydayNotify = useSettingsStore((s) => s.setLastPaydayNotifyDate);
  const marketNotifyHour = useSettingsStore((s) => s.marketNotifyHour);
  const marketNotifyMinute = useSettingsStore((s) => s.marketNotifyMinute);
  const paydayNotifyHourStart = useSettingsStore((s) => s.paydayNotifyHourStart);
  const paydayNotifyHourEnd = useSettingsStore((s) => s.paydayNotifyHourEnd);

  useEffect(() => {
    if (!enabled || Notification.permission !== "granted") return;

    const check = () => {
      const today = new Date().toDateString();

      if (
        notifyMarketOpen &&
        shouldNotifyMarketOpen(
          lastMarketNotify,
          marketNotifyHour,
          marketNotifyMinute
        ) &&
        lastMarketNotify !== today
      ) {
        const sent = sendBrowserNotification(
          "US market is open",
          "NYSE/NASDAQ regular session — review your portfolio and DCA plan."
        );
        if (sent) setLastMarketNotify(today);
      }

      if (
        notifyPayday &&
        shouldNotifyPayday(
          paydays,
          lastPaydayNotify,
          paydayNotifyHourStart,
          paydayNotifyHourEnd
        ) &&
        lastPaydayNotify !== today
      ) {
        const sent = sendBrowserNotification(
          "Payday reminder",
          "Today is one of your paydays. Allocate income to investments, savings, and spending."
        );
        if (sent) setLastPaydayNotify(today);
      }
    };

    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [
    enabled,
    notifyMarketOpen,
    notifyPayday,
    paydays,
    lastMarketNotify,
    lastPaydayNotify,
    setLastMarketNotify,
    setLastPaydayNotify,
    marketNotifyHour,
    marketNotifyMinute,
    paydayNotifyHourStart,
    paydayNotifyHourEnd,
  ]);
}
