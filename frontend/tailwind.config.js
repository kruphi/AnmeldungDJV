/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        jagd: {
          25:  '#F3F8EC',
          50:  '#E6F2D4',
          100: '#C8E4A3',
          200: '#9FCE68',
          300: '#75B038',
          400: '#548F20',
          500: '#3A7012',
          600: '#2C5609',
          700: '#1C3905',
          800: '#122503',
          900: '#09150A',
        },
        gold: {
          50:  '#FEF9E8',
          100: '#FCF0C3',
          200: '#F8D97A',
          400: '#D4A72C',
          500: '#B88C1A',
          600: '#9A7312',
        },
      },
    },
  },
  plugins: [],
}
