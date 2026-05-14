/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E31837',
          50: '#FFF0F2',
          100: '#FFD6DC',
          200: '#FFA8B4',
          300: '#FF7A8C',
          400: '#FF4C64',
          500: '#E31837',
          600: '#C0102C',
          700: '#8F0B21',
          800: '#5E0716',
          900: '#2D030B',
        },
        dark: '#1A1A1A',
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        'xs': '475px',
      }
    },
  },
  plugins: [],
}
