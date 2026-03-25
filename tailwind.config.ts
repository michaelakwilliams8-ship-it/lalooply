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
        brand: {
          blue: '#0057FF',
          bg: '#F6F4EF',
          surface: '#FFFFFF',
          textPrimary: '#1A1A1A',
          textSecondary: '#666666',
          gold: '#C98A00',
          success: '#00913C',
          error: '#D42B2B',
        },
      },
      fontFamily: {
        fredoka: ['Fredoka', 'sans-serif'],
        dmsans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
