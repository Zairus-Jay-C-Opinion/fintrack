import { BrowserRouter, Routes, Route } from "react-router-dom";
import FloatingNav from "./components/layout/FloatingNav";
import PageWrapper from "./components/layout/PageWrapper";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Savings from "./pages/Savings";
import Goals from "./pages/Goals";
import Investments from "./pages/Investments";
import Forecasting from "./pages/Forecasting";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import More from "./pages/More";
import { useNotifications } from "./hooks/useNotifications";
import { useMarketDataSync } from "./hooks/useMarketDataSync";
import { MarketChartProvider } from "./contexts/MarketChartContext";
import { WalkthroughProvider } from "./contexts/WalkthroughContext";
import WelcomeModal from "./components/ui/WelcomeModal";
import SetupModal from "./components/ui/SetupModal";
import WalkthroughOverlay from "./components/ui/WalkthroughOverlay";

function AppRoutes() {
  useNotifications();
  useMarketDataSync();

  return (
    <MarketChartProvider>
      <div
        className="fixed inset-0 z-0 overflow-hidden bg-bg-deepest"
        aria-hidden="true"
      >
        <div className="ambient-orb-1" />
        <div className="ambient-orb-2" />
        <div className="ambient-noise" />
      </div>
      <div className="relative z-10 flex h-[100dvh] max-h-[100dvh] w-full max-w-full flex-col overflow-hidden pt-[env(safe-area-inset-top)]">
        <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-hidden">
          <PageWrapper>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/savings" element={<Savings />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/investments" element={<Investments />} />
              <Route path="/forecasting" element={<Forecasting />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/more" element={<More />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </PageWrapper>
        </main>
      </div>
      <FloatingNav />
      {/* Walkthrough system — renders via portals above everything */}
      <WelcomeModal />
      <SetupModal />
      <WalkthroughOverlay />
    </MarketChartProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <WalkthroughProvider>
        <AppRoutes />
      </WalkthroughProvider>
    </BrowserRouter>
  );
}
