/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7A1B2E', // Thapar Maroon
          light: '#9B2D44',
          lighter: '#F3E8EB',
          dark: '#5C1422',
        },
        pokemon: {
          DEFAULT: '#E3350D',
          light: '#FF5A35',
          dark: '#B32506',
        },
        hollow: {
          DEFAULT: '#A3A3A3',
          bg: '#0E1015',
          card: '#181B22',
        }
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
