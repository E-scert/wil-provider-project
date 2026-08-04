/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        tut: {
          red: '#A41E34',
          redDark: '#7A1526',
          black: '#0d0d0d',
          ink: '#141414',
          panel: '#1c1c1c',
          line: '#2c2c2c',
          gold: '#FFD700',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        redGlow: '0 0 0 1px rgba(164,30,52,0.45), 0 10px 30px -10px rgba(164,30,52,0.4)',
      },
    },
  },
  plugins: [],
};
