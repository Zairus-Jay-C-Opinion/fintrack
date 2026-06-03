import { useEffect, useState } from "react";
import { useSettingsStore } from "../store/useSettingsStore";

export function useExchangeRate() {
  const phpUsdRate = useSettingsStore((s) => s.phpUsdRate);
  const updatePhpUsdRate = useSettingsStore((s) => s.updatePhpUsdRate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLiveRate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      const data = await res.json();
      const php = data.rates?.PHP;
      if (php) updatePhpUsdRate(php);
      else setError("Could not parse rate");
    } catch {
      setError("Failed to fetch live rate");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Optional: auto-fetch on mount — commented to respect manual default
  }, []);

  return { rate: phpUsdRate, loading, error, fetchLiveRate, setRate: updatePhpUsdRate };
}
