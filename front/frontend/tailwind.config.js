/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7d5c48',
        'primary-dark': '#4a3728',
        'primary-light': '#9c7a62',
        cream: '#f5f0e8',
        'cream-dark': '#ede8df',
        brand: {
          brown: '#7d5c48',
          'brown-dark': '#4a3728',
          'brown-light': '#9c7a62',
          cream: '#f5f0e8',
          'cream-dark': '#ede8df',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
