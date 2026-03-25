/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#14b8a6", // Tailwind teal-500
        secondary: "#0f766e", // Tailwind teal-700
      }
    },
  },
  plugins: [],
}
