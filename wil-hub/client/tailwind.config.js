/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        hub: {
          bg: '#0b0f1a',
          panel: '#121826',
          panel2: '#161f31',
          line: '#232d42',
          ink: '#e8ecf4',
          muted: '#8b95ac',
          indigo: '#5b6bf6',
          indigoDim: '#3a44a8',
          emerald: '#2ee6a6',
          amber: '#f5b642',
          rose: '#f5647a',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(91,107,246,0.35), 0 10px 30px -10px rgba(91,107,246,0.35)',
        glowGreen: '0 0 0 1px rgba(46,230,166,0.35), 0 10px 30px -10px rgba(46,230,166,0.35)',
      },
    },
  },
  plugins: [],
};
