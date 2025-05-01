/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy': {
          800: '#002d52',
          900: '#003764',
        },
        'gray': {
          200: '#E5E5E5',
        },
        'yellow': {
          500: '#FFD700',
          600: '#E6C200',
        },
      }
    },
  },
  plugins: [],
}
