/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: { card: '0 1px 2px rgba(20,20,20,.04), 0 8px 30px rgba(20,20,20,.035)' },
      colors: {
        ink: '#161715',
        acid: '#c8f169',
        cobalt: '#4f6ef7',
      },
    },
  },
  plugins: [],
}
