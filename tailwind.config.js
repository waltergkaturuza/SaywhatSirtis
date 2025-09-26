/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'saywhat': {
          'orange': '#ff6b35',
          'red': '#dc2626', 
          'green': '#10b981',
          'black': '#000000',
          'grey': '#6b7280',
          'white': '#ffffff',
          'dark': '#1f2937',
          'light-grey': '#f3f4f6',
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Arial', 'Helvetica', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'tilt': 'tilt 10s infinite linear',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        tilt: {
          '0%, 50%, 100%': {
            transform: 'rotate(0deg)',
          },
          '25%': {
            transform: 'rotate(0.5deg)',
          },
          '75%': {
            transform: 'rotate(-0.5deg)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        glow: {
          '0%': {
            boxShadow: '0 0 5px rgb(59 130 246 / 0.5)',
          },
          '100%': {
            boxShadow: '0 0 20px rgb(59 130 246 / 0.8), 0 0 30px rgb(59 130 246 / 0.4)',
          },
        },
      },
    },
  },
  plugins: [],
}
