/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#7FFF00',
        'background-dark': '#0f1f0b',
      },
    },
  },
  plugins: [],
}
