import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "bg-primary": "rgb(var(--bg-primary) / <alpha-value>)",
        "bg-card": "rgb(var(--bg-card) / <alpha-value>)",
        "bg-card-hover": "rgb(var(--bg-card-hover) / <alpha-value>)",
        "text-primary": "rgb(var(--text-primary) / <alpha-value>)",
        "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
        "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
        "accent-blue": "rgb(var(--accent-blue) / <alpha-value>)",
        "accent-orange": "rgb(var(--accent-orange) / <alpha-value>)",
        "accent-red": "rgb(var(--accent-red) / <alpha-value>)",
        "precip-blue": "rgb(var(--precip-blue) / <alpha-value>)",
        "wind-gray": "rgb(var(--wind-gray) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
export default config;