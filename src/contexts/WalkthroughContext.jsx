import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "fintrack_tour_done";

const WalkthroughContext = createContext(null);

export function WalkthroughProvider({ children }) {
  // phases: "idle" | "welcome" | "setup" | "tour" | "done"
  const [phase, setPhase] = useState("idle");
  const [step, setStep] = useState(0);

  // On mount, check if tour has been completed before
  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      const t = setTimeout(() => setPhase("welcome"), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const startSetup = useCallback(() => {
    setPhase("setup");
  }, []);

  const startTour = useCallback(() => {
    setStep(0);
    setPhase("tour");
  }, []);

  const nextStep = useCallback((totalSteps) => {
    setStep((s) => {
      if (s + 1 >= totalSteps) {
        localStorage.setItem(STORAGE_KEY, "1");
        setPhase("done");
        return s;
      }
      return s + 1;
    });
  }, []);

  const prevStep = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const skipAll = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setPhase("idle");
  }, []);

  const restartTour = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setStep(0);
    setPhase("welcome");
  }, []);

  const dismissDone = useCallback(() => {
    setPhase("idle");
  }, []);

  return (
    <WalkthroughContext.Provider
      value={{
        phase,
        step,
        startSetup,
        startTour,
        nextStep,
        prevStep,
        skipAll,
        restartTour,
        dismissDone,
      }}
    >
      {children}
    </WalkthroughContext.Provider>
  );
}

export function useWalkthrough() {
  const ctx = useContext(WalkthroughContext);
  if (!ctx) throw new Error("useWalkthrough must be used inside WalkthroughProvider");
  return ctx;
}
