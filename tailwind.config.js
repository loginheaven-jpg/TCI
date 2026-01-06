/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        temperament: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
          dark: '#1E40AF'
        },
        character: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#065F46'
        }
      }
    },
  },
  plugins: [],
}
