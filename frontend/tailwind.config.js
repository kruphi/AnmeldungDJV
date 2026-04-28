/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        jagd: {
          50:  '#f0faf5',
          100: '#dcf4e8',
          200: '#b8e8d0',
          500: '#1D9E75',
          600: '#0F6E56',
          700: '#085041',
          800: '#04342C',
        }
      }
    }
  },
  plugins: []
}
