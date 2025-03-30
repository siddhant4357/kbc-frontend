tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kbc-dark-blue': 'var(--kbc-dark-blue)',
        'kbc-blue': 'var(--kbc-blue)',
        'kbc-light-blue': 'var(--kbc-light-blue)',
        'kbc-gold': 'var(--kbc-gold)',
        'kbc-light': 'var(--kbc-light)',
        'kbc-purple': 'var(--kbc-purple)',
      }
    },
  },
  plugins: [],
}