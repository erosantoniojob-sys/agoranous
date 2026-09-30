/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': 'var(--color-bg-base)',
        'bg-surface': 'var(--color-bg-surface)',
        'bg-elevated': 'var(--color-bg-elevated)',
        'bg-main': 'var(--color-bg-main)',
        'bg-card': 'var(--color-bg-card)',
        'accent-gold': 'var(--color-accent-gold)',
        'accent-gold-bright': 'var(--color-accent-gold-bright)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
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
