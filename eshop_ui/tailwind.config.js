/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0EA5E9', // Sky blue
        secondary: '#1F2937', // Dark gray
      },
    },
  },
  plugins: [],
}