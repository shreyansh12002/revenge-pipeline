import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      bg: "#0a0f14",
      surface: "#111a24",
      "surface-elevated": "#1a2636",
      border: "#1a2a3a",
      accent: "#4a9eff",
      "accent-secondary": "#2dd4bf",
      danger: "#f43f5e",
      warning: "#f59e0b",
      "text-primary": "#e2e8f0",
      "text-secondary": "#94a3b8",
      "text-muted": "#475569",
    },
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "monospace"],
    },
  },
  plugins: [],
};

export default config;