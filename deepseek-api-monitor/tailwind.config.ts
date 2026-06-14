import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        ds: {
          bg: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
          primary: '#2dd4bf',
          accent: '#0ea5e9',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"SF Mono"', '"Fira Code"', 'monospace'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        input: '8px',
        btn: '8px',
      },
    },
  },
  plugins: [],
} satisfies Config
