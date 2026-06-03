import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { useFinanceStore } from "./store/useFinanceStore";

function renderApp() {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

const persist = useFinanceStore.persist;

if (persist.hasHydrated()) {
  renderApp();
} else {
  persist.onFinishHydration(renderApp);
}
