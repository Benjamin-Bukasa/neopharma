import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import useThemeStore from "./stores/themeStore";
import useAuthStore from "./stores/authStore";

useThemeStore.getState().initTheme();
useAuthStore.getState().init();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
