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
        "off-white": "#fdfbf7",
        charcoal: "#2d2d2d",
        orange: {
          500: "#e67e22",
          600: "#e67e22",
          700: "#cf711f",
        },
      },
    },
  },
  plugins: [],
};
