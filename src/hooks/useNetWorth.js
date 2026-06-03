import { useMemo } from "react";
import { useFinanceStore } from "../store/useFinanceStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { getPortfolioValueUSD } from "../utils/finance";
import { usdToPhp } from "../utils/currency";

export function useNetWorth() {
  const cashOnHand = useFinanceStore((s) => s.cashOnHand);
  const savingsBalance = useFinanceStore((s) => s.savingsBalance);
  const purchases = useFinanceStore((s) => s.investmentPurchases);
  const etfPrices = useFinanceStore((s) => s.etfPrices);
  const phpUsdRate = useSettingsStore((s) => s.phpUsdRate);
  const monthlyIncome = useSettingsStore((s) => s.monthlyIncome);
  const allocation = useSettingsStore((s) => s.allocation);

  return useMemo(() => {
    const investmentUsd = getPortfolioValueUSD(purchases, etfPrices);
    const investmentPhp = usdToPhp(investmentUsd, phpUsdRate);
    const netWorth = cashOnHand + savingsBalance + investmentPhp;

    const allocAmounts = {
      investments: monthlyIncome * allocation.investments,
      savings: monthlyIncome * allocation.savings,
      spending: monthlyIncome * allocation.spending,
    };

    return {
      netWorth,
      cashOnHand,
      savingsBalance,
      investmentPhp,
      investmentUsd,
      allocAmounts,
      allocation,
    };
  }, [
    cashOnHand,
    savingsBalance,
    purchases,
    etfPrices,
    phpUsdRate,
    monthlyIncome,
    allocation,
  ]);
}
