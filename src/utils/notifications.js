import { getNextPayday, daysUntil } from "./finance";

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  return result;
}

export function sendBrowserNotification(title, body) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return false;
  }
  try {
    new Notification(title, {
      body,
      icon: "/icon.png",
    });
    return true;
  } catch {
    return false;
  }
}

export function shouldNotifyMarketOpen(lastNotifiedDate, hour, minute) {
  const now = new Date();
  const today = now.toDateString();
  if (lastNotifiedDate === today) return false;
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const targetMins = hour * 60 + minute;
  return currentMins >= targetMins && currentMins < targetMins + 5;
}

export function shouldNotifyPayday(
  paydays,
  lastNotifiedDate,
  hourStart,
  hourEnd
) {
  const today = new Date();
  const todayStr = today.toDateString();
  if (lastNotifiedDate === todayStr) return false;
  const day = today.getDate();
  if (!paydays.includes(day)) return false;
  const hour = today.getHours();
  return hour >= hourStart && hour < hourEnd;
}

export function getPaydayNotificationBody(paydays) {
  const next = getNextPayday(paydays);
  const days = daysUntil(next);
  if (days === 0) {
    return "Today is payday — review your allocation on the Dashboard.";
  }
  return `Payday in ${days} day(s) — plan your investments and savings.`;
}

export function maskApiKey(key) {
  if (!key || key.length < 4) return "";
  return `••••${key.slice(-4)}`;
}
