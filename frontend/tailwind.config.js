/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'vault-primary': '#00D9FF',
        'vault-secondary': '#7B2CBF',
        'vault-accent': '#FF006E',
      },
    },
  },
  plugins: [],
};
