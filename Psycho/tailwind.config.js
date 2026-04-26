/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F8F5EE',
        surface: '#FFFDF7',
        border: '#E5DDCC',
        text: '#1F2933',
        muted: '#667085',
        primary: {
          DEFAULT: '#6B8E23',
          foreground: '#F8F5EE',
        },
        secondary: {
          DEFAULT: '#F5F5DC',
          foreground: '#3F4A3C',
        },
        accent: {
          DEFAULT: '#B98D5D',
          foreground: '#FFFFFF',
        },
      },
      boxShadow: {
        soft: '0 12px 40px rgba(63, 74, 60, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
