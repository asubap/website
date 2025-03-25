/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bapgray: "#818181",
        bapred: "#AF272F",
        baptan: "#C5C19D",
      },
      fontFamily: {
        arial: ["Arial", "sans-serif"],
        "pt-serif": ["PT Serif", "serif"],
      },
    },
  },
  plugins: [],
}
