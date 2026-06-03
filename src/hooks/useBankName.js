import { useSettingsStore } from "../store/useSettingsStore";

export function useBankName() {
  const savingsBank = useSettingsStore((s) => s.savingsBank);
  const savingsBankCustom = useSettingsStore((s) => s.savingsBankCustom);
  return savingsBank === "Other" && savingsBankCustom.trim()
    ? savingsBankCustom.trim()
    : savingsBank;
}
