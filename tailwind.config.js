/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#070B12',
        'bg-surface': '#101722',
        'bg-sidebar': '#0B1018',
        'bg-card': '#101722',
        'border-primary': '#202A39',
        'accent-gold': '#D7AE4A',
        'text-primary': '#F5F6F8',
        'text-secondary': '#8E99AA',
      },
      boxShadow: {
        'sm-elevation': '0 4px 12px rgba(0, 0, 0, 0.3)',
        'md-elevation': '0 8px 24px rgba(0, 0, 0, 0.4)',
        'lg-elevation': '0 12px 32px rgba(0, 0, 0, 0.5)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.15)',
      },
      scale: {
        '102': '1.02',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        'sm': '12px',
        'md': '16px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '28px',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
      },
    },
  },
  plugins: [],
}


