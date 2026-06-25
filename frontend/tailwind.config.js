/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables dark mode based on the 'dark' class
  theme: {
    extend: {
      colors: {
        darkBg: '#090514', // Sleek deep purple-black base
        glassBg: 'rgba(25, 18, 44, 0.45)', // Glass card base
        glassBorder: 'rgba(139, 92, 246, 0.15)', // Subtle neon border
        neonPurple: '#8b5cf6',
        neonIndigo: '#6366f1',
        neonPink: '#ec4899',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'neon': '0 0 15px rgba(139, 92, 246, 0.4)',
      }
    },
  },
  plugins: [],
}
