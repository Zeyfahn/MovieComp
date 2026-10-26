/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#090B10',
        surface: '#11141E',
        'surface-elevated': '#181C2A',
        'surface-hover': '#21273B',
        border: 'rgba(255, 255, 255, 0.08)',
        'border-focus': 'rgba(244, 63, 94, 0.4)',
        primary: {
          DEFAULT: '#F43F5E', // Rose/Cinema Red
          hover: '#E11D48',
          glow: 'rgba(244, 63, 94, 0.35)',
        },
        accent: {
          DEFAULT: '#6366F1', // Indigo / Cyber Neon
          hover: '#4F46E5',
          glow: 'rgba(99, 102, 241, 0.35)',
        },
        gold: '#F59E0B',
        emerald: '#10B981',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Cabinet Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(244, 63, 94, 0.4)',
        'glow-accent': '0 0 25px -5px rgba(99, 102, 241, 0.4)',
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
