import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand core (from brandbook). Never invent new hues.
        baltic: {
          DEFAULT: "#2C689A", // Primary — buttons, logo, key accents
          hover: "#255A86",
          press: "#1F4D72",
          soft: "rgba(44, 104, 154, 0.10)",
        },
        icy: {
          DEFAULT: "#B0DBF8", // Secondary — backgrounds, cards, fills
          soft: "#D9EDFB",
          softer: "#ECF5FD",
        },
        ink: {
          DEFAULT: "#102231", // Dominant text, dark mode surfaces, hi-impact type
          80: "rgba(16, 34, 49, 0.80)",
          60: "rgba(16, 34, 49, 0.60)",
          40: "rgba(16, 34, 49, 0.40)",
          20: "rgba(16, 34, 49, 0.20)",
          10: "rgba(16, 34, 49, 0.10)",
          5: "rgba(16, 34, 49, 0.05)",
        },
        // Supporting neutrals (allowed)
        paper: "#F5F6F8", // Warm gray for light-mode surfaces
        // On-dark text helper (icy on dark surfaces)
        snow: {
          DEFAULT: "#ECF5FD",
          60: "rgba(236, 245, 253, 0.60)",
          80: "rgba(236, 245, 253, 0.80)",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-jakarta)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "var(--font-jakarta)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        // Brandbook scale. iOS-friendly.
        display: ["34px", { lineHeight: "40px", fontWeight: "800", letterSpacing: "-0.02em" }],
        title1: ["28px", { lineHeight: "34px", fontWeight: "700", letterSpacing: "-0.015em" }],
        title2: ["22px", { lineHeight: "28px", fontWeight: "700", letterSpacing: "-0.01em" }],
        headline: ["17px", { lineHeight: "22px", fontWeight: "600" }],
        body: ["16px", { lineHeight: "24px", fontWeight: "500" }],
        callout: ["15px", { lineHeight: "20px", fontWeight: "500" }],
        caption: ["13px", { lineHeight: "18px", fontWeight: "500" }],
        micro: ["11px", { lineHeight: "14px", fontWeight: "600", letterSpacing: "0.18em" }],
      },
      borderRadius: {
        xl2: "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16, 34, 49, 0.04), 0 4px 12px rgba(16, 34, 49, 0.04)",
        card: "0 2px 6px rgba(16, 34, 49, 0.06), 0 12px 30px rgba(16, 34, 49, 0.06)",
        lift: "0 1px 2px rgba(16, 34, 49, 0.06), 0 18px 40px rgba(16, 34, 49, 0.12)",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "pulse-slow": "pulse-slow 2.4s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
