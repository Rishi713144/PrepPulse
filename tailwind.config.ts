import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f7ff",
          100: "#e4edff",
          200: "#c5d9ff",
          300: "#9abaff",
          400: "#6f99ff",
          500: "#4c7cff",
          600: "#355fed",
          700: "#2d4ecc",
          800: "#2641a3",
          900: "#1f347d",
          950: "#111b4f",
        },
        accent: {
          100: "#fff4e6",
          200: "#ffe0b8",
          300: "#ffc680",
          400: "#ffac47",
          500: "#ff9416",
          600: "#ed7b09",
        },
        success: "#31c48d",
        warning: "#f6c344",
        danger: "#f87171",
        "surface-50": "#f8fafc",
        "surface-100": "#eef2f9",
        "surface-200": "#dbe4f1",
        "surface-300": "#c0cfe3",
        "surface-400": "#93a6c2",
        "surface-500": "#607193",
        "surface-600": "#475878",
        "surface-700": "#33415d",
        "surface-800": "#222c43",
        "surface-900": "#151c2c",
        "surface-950": "#0a101d",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        dashboard: "0 20px 40px -24px rgba(14, 23, 42, 0.45)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(135deg, rgba(76, 124, 255, 0.08) 0%, rgba(10, 16, 29, 0.95) 60%), radial-gradient(circle at 20% 20%, rgba(76, 124, 255, 0.18), transparent 45%), radial-gradient(circle at 80% 0%, rgba(255, 148, 22, 0.18), transparent 42%)",
      },
      borderRadius: {
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
}
export default config
