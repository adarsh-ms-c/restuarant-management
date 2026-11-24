import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: "var(--color-charcoal)",
          700: "var(--color-charcoal-700)",
        },
        brick: {
          50: "var(--color-brick-50)",
          100: "var(--color-brick-100)",
          200: "var(--color-brick-200)",
          500: "var(--color-brick-500)",
          600: "var(--color-brick-600)",
          700: "var(--color-brick-700)",
        },
        coffee: {
          DEFAULT: "var(--color-coffee)",
          100: "var(--color-coffee-100)",
        },
        paper: "var(--color-paper)",
        card: "var(--color-card)",
        cream: "var(--color-cream)",
        muted: "var(--color-muted)",
        line: "var(--color-line)",
        overlay: "var(--color-overlay)",
        success: {
          50: "var(--color-success-50)",
          100: "var(--color-success-100)",
          600: "var(--color-success-600)",
          700: "var(--color-success-700)",
        },
        warning: {
          50: "var(--color-warning-50)",
          100: "var(--color-warning-100)",
          600: "var(--color-warning-600)",
          700: "var(--color-warning-700)",
        },
        danger: {
          50: "var(--color-danger-50)",
          100: "var(--color-danger-100)",
          600: "var(--color-danger-600)",
          700: "var(--color-danger-700)",
        },
      },
      borderColor: {
        DEFAULT: "var(--color-line)",
      },
      ringColor: {
        DEFAULT: "var(--color-brick-200)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(41, 41, 41, 0.04), 0 8px 24px rgba(112, 69, 47, 0.05)",
        panel: "0 24px 60px rgba(41, 41, 41, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
