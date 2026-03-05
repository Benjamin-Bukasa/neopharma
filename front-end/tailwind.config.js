/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"]
      },
      colors: {
        "primary": "#002E31",
        "secondary": "#1D473F",
        "accent": "#D8F274",
        "background": "#F3F4F6",
        "text-primary": "#111827",
        "text-secondary": "#6B7280",
        "header":"#A9BDB6",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
    },
    screens: {
    xs: "480px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },
  },
  plugins: [],
}