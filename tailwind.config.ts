import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'ui-monospace', 'monospace'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-display)', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#0A0F1C',
          surface: '#111827',
          elevated: '#1F2937',
        },
        surface: '#111827',
        elevated: '#1F2937',
        border: '#1E293B',
        accent: {
          cyan: '#22D3EE',
          'cyan-dim': '#0E7490',
        },
        status: {
          proposed: '#8B5CF6',
          announced: '#F59E0B',
          permitting: '#3B82F6',
          approved: '#60A5FA',
          construction: '#EF4444',
          under_construction: '#EF4444',
          operational: '#10B981',
          paused: '#6B7280',
          cancelled: '#374151',
        },
        node: {
          tech: '#3B82F6',
          cloud: '#6366F1',
          investor: '#F59E0B',
          pe: '#F97316',
          construction: '#EF4444',
          engineering: '#FB923C',
          energy: '#10B981',
          lobbying: '#EC4899',
          consortium: '#A855F7',
          datacenter: '#22D3EE',
          official: '#94A3B8',
        },
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-up': 'slideInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fadeIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.65', transform: 'scale(1.06)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
