/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#E8EDF4',
          100: '#C5D1E5',
          200: '#9FB3D4',
          300: '#7895C3',
          400: '#5A7DB5',
          500: '#3D65A7',
          600: '#1E3A5F',
          700: '#162C48',
          800: '#0F1E30',
          900: '#071019',
        },
        mint: {
          50: '#E8F8F0',
          100: '#C6EED9',
          200: '#A0E3C0',
          300: '#7AD8A7',
          400: '#5DCF93',
          500: '#2ECC71',
          600: '#27AE60',
          700: '#1E8449',
          800: '#166534',
          900: '#0D3D20',
        },
        coral: {
          500: '#E67E22',
          600: '#D35400',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

