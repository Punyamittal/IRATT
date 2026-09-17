import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        clay: {
          bg: "#e7d7c3",
          panel: "#f3e9dc",
          ink: "#3d3228",
          sage: "#4f8a63",
          terracotta: "#c56a3a",
        },
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "ui-rounded", "Trebuchet MS", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        terminal: ["var(--font-nunito)", "ui-rounded", "sans-serif"],
      },
      boxShadow: {
        clay: "10px 14px 28px rgba(138, 108, 74, 0.32), -8px -8px 18px rgba(255, 252, 247, 0.92)",
        "clay-in": "inset 5px 6px 12px rgba(138, 108, 74, 0.22), inset -4px -5px 10px rgba(255, 250, 243, 0.7)",
      },
      borderRadius: {
        clay: "28px",
      },
    },
  },
  plugins: [],
};

export default config;
