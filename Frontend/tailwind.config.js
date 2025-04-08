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
        bapreddark: "#921F26",
        bapredsat: "#D12F39",
        baptan: "#C5C19D",
      },
      fontFamily: {
        arial: ["Georgia","Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
}
