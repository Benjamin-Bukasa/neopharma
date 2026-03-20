import { create } from "zustand";

const STORAGE_KEY = "theme";

const getPreferredTheme = () => {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")
    ?.matches;
  return prefersDark ? "dark" : "light";
};

let transitionTimeout;

const applyTheme = (theme) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.add("theme-transition");
  root.classList.toggle("dark", theme === "dark");
  if (transitionTimeout) clearTimeout(transitionTimeout);
  transitionTimeout = setTimeout(() => {
    root.classList.remove("theme-transition");
  }, 350);
};

const persistTheme = (theme) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, theme);
};

const useThemeStore = create((set, get) => ({
  theme: "light",
  initTheme: () => {
    const theme = getPreferredTheme();
    applyTheme(theme);
    persistTheme(theme);
    set({ theme });
  },
  setTheme: (theme) => {
    const nextTheme = theme === "dark" ? "dark" : "light";
    applyTheme(nextTheme);
    persistTheme(nextTheme);
    set({ theme: nextTheme });
  },
  toggleTheme: () => {
    const current = get().theme;
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    persistTheme(next);
    set({ theme: next });
  },
}));

export default useThemeStore;
