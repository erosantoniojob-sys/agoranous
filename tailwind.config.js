/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0B1420',
        'bg-surface': '#132231',
        'bg-elevated': '#1D2E3F',
        'bg-main': '#0B1420',
        'bg-card': '#132231',
        'accent-gold': '#D4AF37',
        'accent-gold-bright': '#E5C158',
        'text-primary': '#F2F4F7',
        'text-secondary': '#8A93A3',
        // Dark Academia low-saturation trail icon background variations
        'trilha-blue': '#16283D',
        'trilha-blue-gradient-start': '#1A324B',
        'trilha-blue-gradient-end': '#111F30',
        'trilha-green': '#182E23',
        'trilha-green-gradient-start': '#1E3A2B',
        'trilha-green-gradient-end': '#11221B',
        'trilha-purple': '#261B33',
        'trilha-purple-gradient-start': '#2F2042',
        'trilha-purple-gradient-end': '#1D1428',
        'trilha-orange': '#332018',
        'trilha-orange-gradient-start': '#3F281E',
        'trilha-orange-gradient-end': '#271710',
      },
      boxShadow: {
        '3d-deep': '0 15px 35px -5px rgba(0, 0, 0, 0.7), 0 5px 15px -3px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        '3d-card': '0 10px 30px -5px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
        '3d-gold': '0 12px 28px -4px rgba(0, 0, 0, 0.8), 0 0 15px rgba(212, 175, 55, 0.25), inset 0 1px 1px rgba(255, 240, 180, 0.6)',
        'inner-dark': 'inset 0 2px 8px 0 rgba(0, 0, 0, 0.6)',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
      },
    },
  },
  plugins: [],
}
