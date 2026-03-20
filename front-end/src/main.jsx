import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import routes from "./routes/router";
import useThemeStore from "./stores/themeStore";
import useAuthStore from "./stores/authStore";
import ToastContainer from "./components/ui/toast";
import { initRealtimeListeners } from "./services/realtimeListeners";

useThemeStore.getState().initTheme();
useAuthStore.getState().init();
initRealtimeListeners();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={routes} />
    <ToastContainer />
  </StrictMode>,
)
