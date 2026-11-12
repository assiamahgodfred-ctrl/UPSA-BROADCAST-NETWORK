/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Urgency tier tokens
        emergency: '#DC2626',
        academic:  '#D97706',
        general:   '#2563EB',
        events:    '#059669',

        // Surface tokens (light/dark via CSS vars for easier extension)
        surface: {
          DEFAULT: '#ffffff',
          muted:   '#f1f5f9',
          hover:   '#e2e8f0',
        },
        secondary: '#64748b',
      },
      borderColor: {
        'l-emergency': '#DC2626',
        'l-academic':  '#D97706',
        'l-general':   '#2563EB',
        'l-events':    '#059669',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'fade-in':        'fadeIn 0.15s ease-out',
      },
      keyframes: {
        slideInRight: {
          from: { transform: 'translateX(100%)', opacity: 0 },
          to:   { transform: 'translateX(0)',    opacity: 1 },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
