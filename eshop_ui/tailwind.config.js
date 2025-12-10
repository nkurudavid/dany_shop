/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enables dark mode using a CSS class
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        lg: '1120px',
        xl: '1280px',
      },
    },

    extend: {
      colors: {
        primary: {
          DEFAULT: '#0EA5E9',
          light: '#38BDF8',
          dark: '#0284C7',
        },
        secondary: {
          DEFAULT: '#1F2937',
          light: '#374151',
          dark: '#111827',
        },
        accent: '#22C55E', // Optional green theme color
      },

      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Best modern UI font
        heading: ['Poppins', 'sans-serif'],
      },

      boxShadow: {
        soft: '0 4px 10px rgba(0,0,0,0.05)',
      },
    },
  },

  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
  ],
}
