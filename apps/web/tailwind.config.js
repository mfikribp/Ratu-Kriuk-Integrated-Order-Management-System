/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "off-white": "#f6f4f1",
        charcoal: "#2b2b2b",
        muted: "#8a8a8a",
        hairline: "#eceae6",
        orange: {
          50: "#fdf0e9",
          100: "#fbe3d6",
          200: "#f6c6ad",
          400: "#e86a2b",
          500: "#d24e13",
          600: "#c2410c",
          700: "#9a3412",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.03)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
