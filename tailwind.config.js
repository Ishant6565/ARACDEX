/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        surface: "#0a0a0a",
        card: "#0d0d0d",
        cardHover: "#141414",
        borderSubtle: "rgba(255, 255, 255, 0.08)",
        borderHover: "rgba(255, 255, 255, 0.22)",
        muted: "rgba(255, 255, 255, 0.45)",
        dimmed: "rgba(255, 255, 255, 0.25)",
        brand: "#FFFFFF",
        accentAmber: "#f59e0b",
        accentBlue: "#3b82f6",
      },
      fontFamily: {
        display: ['"Clash Display"', '"Syne"', 'sans-serif'],
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        tighterExtra: '-0.06em',
        widestEditorial: '0.25em',
      },
      animation: {
        'pulse-subtle': 'pulseSlow 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        pulseSlow: {
          '0%, 100%': { opacity: '0.08' },
          '50%': { opacity: '0.14' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
};
