/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          electric: '#6FCF64',
          primary: '#16A34A',
          light: '#DCFCE7',
          glow: 'rgba(111, 207, 100, 0.35)'
        },
        surface: {
          canvas: '#F8FAFC',
          card: '#FFFFFF',
          hover: '#F1F5F9',
          header: '#0B0F19',
          terminal: '#0B0F17'
        },
        content: {
          primary: '#0F172A',
          secondary: '#334155',
          muted: '#64748B',
          code: '#E2E8F0',
          inverse: '#FFFFFF'
        },
        borderline: {
          subtle: '#E2E8F0',
          medium: '#CBD5E1',
          strong: '#94A3B8',
          header: 'rgba(255, 255, 255, 0.08)'
        },
        severity: {
          danger: '#DC2626',
          dangerLight: '#FEE2E2',
          warning: '#D97706',
          warningLight: '#FEF3C7',
          info: '#2563EB',
          infoLight: '#DBEAFE',
          ai: '#7C3AED',
          aiLight: '#EDE9FE'
        }
      },
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'neon-glow': '0 0 15px rgba(111, 207, 100, 0.35)',
        'neon-sm': '0 0 8px rgba(111, 207, 100, 0.25)',
        'card-subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)'
      }
    },
  },
  plugins: [],
}
