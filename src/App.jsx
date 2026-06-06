import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import MobileNav from "./components/layout/MobileNav";
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
  const [sidebarCollapsed] = useState(false);

  return (
    <MarketChartProvider>
      <div className="flex h-[100dvh] max-h-[100dvh] w-full max-w-full overflow-hidden bg-bg-deepest pt-[env(safe-area-inset-top)] pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:h-full md:max-h-none md:pb-0 md:pt-0">
        <Sidebar collapsed={sidebarCollapsed} />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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
        <MobileNav />
      </div>
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
