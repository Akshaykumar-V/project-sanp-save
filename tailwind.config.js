/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066FF',
        'primary-dark': '#003D99',
        'primary-light': '#E6F0FF',
        success: '#00C48C',
        warning: '#FFAA33',
        error: '#FF3B3B',
        neutral: '#6B7280',
        background: '#F9FAFB',
        category: {
          food: '#FF6B6B',
          transport: '#4ECDC4',
          shopping: '#FFE66D',
          entertainment: '#A8E6CF',
          health: '#FF8B94',
          bills: '#6C5CE7',
          transfers: '#74B9FF',
          other: '#B2BEC3',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        hero: ['40px', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['32px', { lineHeight: '1.3', fontWeight: '700' }],
        h3: ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        h4: ['18px', { lineHeight: '1.5', fontWeight: '600' }],
        body: ['16px', { lineHeight: '1.6' }],
        small: ['14px', { lineHeight: '1.5' }],
        caption: ['12px', { lineHeight: '1.4' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
        md: '0 4px 16px rgba(0, 0, 0, 0.12)',
        lg: '0 8px 24px rgba(0, 0, 0, 0.15)',
        'btn-hover': '0 4px 12px rgba(0, 102, 255, 0.3)',
      },
    },
  },
  plugins: [],
}
