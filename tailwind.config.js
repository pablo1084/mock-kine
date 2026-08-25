/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        graphite: '#2f3438',
        graphiteDark: '#15181b',
        graphiteSoft: '#3a4045',
        ink: '#1f2427',
        line: '#e2e0da',
        pulse: '#f05a28',
        amber: '#c7963a',
      },
      fontFamily: {
        sans: ['MuseoModerno', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 50px rgba(17, 17, 17, 0.10)',
      },
    },
  },
  plugins: [],
};
