/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bn-green': '#2EBD85',
        'bn-red': '#F6465D',
      }
    },
  },
  plugins: [],
}
