import { create } from "zustand";
import { persist } from "zustand/middleware";
import { recalculateSavingsEntries } from "../utils/savings";

const defaultEtfPrices = { VOO: 520, VTI: 240 };

export const useFinanceStore = create(
  persist(
    (set, get) => ({
      savingsEntries: [],
      savingsBalance: 0,
      savingsGoals: [],
      savingsInterestRate: 2.5,
      emergencyFund: 0,
      cashOnHand: 0,

      investmentPurchases: [],
      etfPrices: { ...defaultEtfPrices },

      transactions: [],

      addSavingsEntry: (entry) =>
        set((state) => {
          const savingsEntries = [entry, ...state.savingsEntries];
          const recalculated = recalculateSavingsEntries(savingsEntries);
          return {
            savingsEntries: recalculated,
            savingsBalance: recalculated[0]?.balance ?? entry.balance,
          };
        }),

      updateSavingsEntry: (id, updates) =>
        set((state) => {
          const savingsEntries = recalculateSavingsEntries(
            state.savingsEntries.map((e) =>
              e.id === id ? { ...e, ...updates } : e
            )
          );
          return {
            savingsEntries,
            savingsBalance: savingsEntries[0]?.balance ?? state.savingsBalance,
          };
        }),

      removeSavingsEntry: (id) =>
        set((state) => {
          const savingsEntries = recalculateSavingsEntries(
            state.savingsEntries.filter((e) => e.id !== id)
          );
          return {
            savingsEntries,
            savingsBalance: savingsEntries[0]?.balance ?? 0,
          };
        }),

      setSavingsBalance: (balance) => set({ savingsBalance: balance }),

      addSavingsGoal: (goal) =>
        set((state) => ({
          savingsGoals: [...state.savingsGoals, goal],
        })),

      updateSavingsGoal: (id, updates) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),

      removeSavingsGoal: (id) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((g) => g.id !== id),
        })),

      setSavingsInterestRate: (rate) => set({ savingsInterestRate: rate }),
      setEmergencyFund: (amount) => set({ emergencyFund: amount }),
      setCashOnHand: (amount) => set({ cashOnHand: amount }),

      addInvestmentPurchase: (purchase) =>
        set((state) => ({
          investmentPurchases: [purchase, ...state.investmentPurchases],
          etfPrices: {
            ...state.etfPrices,
            [purchase.ticker]: purchase.priceUSD,
          },
        })),

      updateInvestmentPurchase: (id, updates) =>
        set((state) => {
          const investmentPurchases = state.investmentPurchases.map((p) => {
            if (p.id !== id) return p;
            const merged = { ...p, ...updates };
            const shares = merged.shares ?? p.shares;
            const priceUSD = merged.priceUSD ?? p.priceUSD;
            const rate = merged.phpUsdRate ?? p.phpUsdRate;
            const totalUSD = shares * priceUSD;
            return {
              ...merged,
              totalUSD,
              totalPHP: totalUSD * rate,
            };
          });
          const updated = investmentPurchases.find((p) => p.id === id);
          const etfPrices = updated
            ? { ...state.etfPrices, [updated.ticker]: updated.priceUSD }
            : state.etfPrices;
          return { investmentPurchases, etfPrices };
        }),

      removeInvestmentPurchase: (id) =>
        set((state) => ({
          investmentPurchases: state.investmentPurchases.filter(
            (p) => p.id !== id
          ),
        })),

      updateEtfPrice: (ticker, price) =>
        set((state) => ({
          etfPrices: { ...state.etfPrices, [ticker]: price },
        })),

      addTransaction: (tx) =>
        set((state) => ({
          transactions: [tx, ...state.transactions],
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      removeTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      resetFinanceData: () =>
        set({
          savingsEntries: [],
          savingsBalance: 0,
          savingsGoals: [],
          savingsInterestRate: 2.5,
          emergencyFund: 0,
          cashOnHand: 0,
          investmentPurchases: [],
          etfPrices: { ...defaultEtfPrices },
          transactions: [],
        }),

      exportData: () => {
        const state = get();
        return JSON.stringify(
          {
            savingsEntries: state.savingsEntries,
            savingsBalance: state.savingsBalance,
            savingsGoals: state.savingsGoals,
            savingsInterestRate: state.savingsInterestRate,
            emergencyFund: state.emergencyFund,
            cashOnHand: state.cashOnHand,
            investmentPurchases: state.investmentPurchases,
            etfPrices: state.etfPrices,
            transactions: state.transactions,
          },
          null,
          2
        );
      },

      importData: (json) => {
        const data = JSON.parse(json);
        set({
          savingsEntries: data.savingsEntries ?? [],
          savingsBalance: data.savingsBalance ?? 0,
          savingsGoals: data.savingsGoals ?? [],
          savingsInterestRate: data.savingsInterestRate ?? 2.5,
          emergencyFund: data.emergencyFund ?? 0,
          cashOnHand: data.cashOnHand ?? 0,
          investmentPurchases: data.investmentPurchases ?? [],
          etfPrices: data.etfPrices ?? { ...defaultEtfPrices },
          transactions: data.transactions ?? [],
        });
      },
    }),
    { name: "fintrack-data" }
  )
);
