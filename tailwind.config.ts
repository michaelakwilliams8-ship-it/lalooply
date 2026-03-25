/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          light: '#e0d3e8',
          DEFAULT: '#800080',
          dark: '#5c0041',
        },
        pink: {
          light: '#f2b2d0',
          DEFAULT: '#ff69b4',
          dark: '#c71585',
        },
      },
    },
  },
  plugins: [],
};