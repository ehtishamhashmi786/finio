/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        display: ['"Syne"', 'sans-serif'],
      },
      colors: {
        bg: {
          primary:   '#080b12',
          secondary: '#0d1120',
          tertiary:  '#121828',
          card:      '#161e30',
        },
        accent: {
          DEFAULT: '#6c63ff',
          light:   '#8b85ff',
          glow:    'rgba(108,99,255,0.35)',
        },
        brand: {
          green:  '#00d68f',
          red:    '#ff5c7a',
          amber:  '#ffb84d',
          blue:   '#38b6ff',
          teal:   '#00c9b1',
          pink:   '#ff6ec7',
        },
      },
      borderRadius: {
        card: '20px',
        modal: '28px',
      },
      animation: {
        'fade-up':   'fadeUp 0.4s ease both',
        'slide-in':  'slideIn 0.35s ease both',
        'auth-in':   'authIn 0.5s cubic-bezier(.34,1.2,.64,1) both',
        'modal-in':  'modalIn 0.3s cubic-bezier(.34,1.56,.64,1) both',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'shimmer':   'shimmer 1.2s infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn:  { from: { opacity: '0', transform: 'translateX(-10px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        authIn:   { from: { opacity: '0', transform: 'translateY(32px) scale(0.96)' }, to: { opacity: '1', transform: 'translateY(0) scale(1)' } },
        modalIn:  { from: { opacity: '0', transform: 'translateY(24px) scale(0.95)' }, to: { opacity: '1', transform: 'translateY(0) scale(1)' } },
        pulseDot: { '0%,100%': { transform: 'scale(1)', opacity: '0.3' }, '50%': { transform: 'scale(1.5)', opacity: '0' } },
        shimmer:  { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
      },
      boxShadow: {
        glow:    '0 4px 20px rgba(108,99,255,0.35)',
        'glow-lg':'0 8px 28px rgba(108,99,255,0.45)',
      },
    },
  },
  plugins: [],
}
