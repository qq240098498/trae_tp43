/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '3rem',
        xl: '4rem',
      },
    },
    extend: {
      colors: {
        brand: {
          50: '#f0f5fa',
          100: '#dce7f2',
          200: '#b8cde4',
          300: '#8aa9cf',
          400: '#5b81b6',
          500: '#3c629a',
          600: '#1e3a5f',
          700: '#183050',
          800: '#13263f',
          900: '#0e1c30',
        },
        accent: {
          50: '#eef7f1',
          100: '#d6ecd8',
          200: '#afd8b5',
          300: '#7dbe86',
          400: '#4da05a',
          500: '#2d8243',
          600: '#2d6a4f',
          700: '#25553f',
          800: '#1f4433',
          900: '#19382a',
        },
        warn: {
          50: '#fdf4ec',
          100: '#fae4cc',
          200: '#f4c590',
          300: '#ed9f54',
          400: '#e88030',
          500: '#e07b39',
          600: '#cb652e',
          700: '#a54f29',
          800: '#833f28',
          900: '#6b3524',
        },
        danger: {
          50: '#fbeaea',
          100: '#f6cfcf',
          200: '#ec9e9e',
          300: '#e06d6d',
          400: '#d54343',
          500: '#c92a2a',
          600: '#ad1f1f',
          700: '#8e1b1b',
          800: '#721a1a',
          900: '#5d1717',
        },
        neutral: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#868e96',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#0f1115',
        },
      },
      fontFamily: {
        display: ['"Lora"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(30, 58, 95, 0.06), 0 1px 2px -1px rgba(30, 58, 95, 0.06)',
        'card-hover':
          '0 10px 15px -3px rgba(30, 58, 95, 0.08), 0 4px 6px -4px rgba(30, 58, 95, 0.06)',
        soft: '0 8px 24px -8px rgba(30, 58, 95, 0.15)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(32px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 450ms ease-out both',
        'pulse-soft': 'pulse-soft 1.8s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 200ms ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
      backgroundImage: {
        'brand-gradient':
          'linear-gradient(135deg, #1e3a5f 0%, #2d6a4f 100%)',
        'subtle-grid':
          'linear-gradient(rgba(30,58,95,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,95,0.04) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
