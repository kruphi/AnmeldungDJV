/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        jagd: {
          50:  '#F0F7EE',
          100: '#DBEFD7',
          200: '#B5DDB0',
          300: '#7EC276',
          400: '#4EA845',
          500: '#2E8B2E',
          600: '#1F6B20',
          700: '#165018',
          800: '#0F3611',
          900: '#082009',
        },
      },
    },
  },
  plugins: [],
}
