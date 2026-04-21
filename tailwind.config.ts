import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A0A0B",
          900: "#111113",
          800: "#18181B",
          700: "#27272A",
          600: "#3F3F46",
          500: "#52525B",
          400: "#71717A",
          300: "#A1A1AA",
          200: "#D4D4D8",
          100: "#F4F4F5",
        },
        mint: {
          DEFAULT: "#7EF0C1",
          hover: "#6EE0B1",
        },
        amber: {
          leak: "#FFB547",
        },
        rose: {
          warn: "#FF7A7A",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "pulse-slow": "pulse-slow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
