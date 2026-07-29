/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        graphite: '#111111',
        ink: '#1f2427',
        line: '#e7e7e4',
        pulse: '#f05a28',
        amber: '#c7963a',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 50px rgba(17, 17, 17, 0.10)',
      },
    },
  },
  plugins: [],
};
