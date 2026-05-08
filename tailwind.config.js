/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Tajawal", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#ecfaf7",
          100: "#cff2eb",
          200: "#a3e5d8",
          300: "#6ed1bf",
          400: "#3eb8a3",
          500: "#1e9a8a",
          600: "#177c70",
          700: "#13635a",
          800: "#114e48",
          900: "#0f413c",
        },
        kpi: {
          blue: "#3FA9F5",
          teal: "#1E9A8A",
          green: "#22C55E",
          pink: "#E84A6B",
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
};
