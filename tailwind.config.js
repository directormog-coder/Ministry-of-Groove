/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mog: {
          gold: '#D4AF37',
          goldLight: '#F3E5AB',
          cyan: '#00F0FF',
          dark: '#07080A',
          card: '#0D0F13',
          border: '#1F242C',
        }
      },
      boxShadow: {
        gold: '0 0 25px rgba(212, 175, 55, 0.25)',
        cyan: '0 0 25px rgba(0, 240, 255, 0.25)',
      }
    },
  },
  plugins: [],
}
