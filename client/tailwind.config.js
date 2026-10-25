/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Strict STORENT Tri-Color Palette: Yellow, Dark Grey, White
        storent: {
          yellow: '#FCC837',
          yellowHover: '#F0BA28',
          yellowDark: '#E6B01B',
          darkGrey: '#34373C',
          charcoal: '#222428',
          deep: '#181A1D',
          white: '#FFFFFF',
        },
        // Re-mapping brand to Storent Yellow so legacy brand classes cleanly inherit Yellow
        brand: {
          50: '#FEF9E7',
          100: '#FDF3CF',
          200: '#FCE79F',
          300: '#FADB6E',
          400: '#F9D145',
          500: '#FCC837', // Official STORENT Yellow
          600: '#F0BA28', // Darker yellow hover
          700: '#E6B01B', // Border yellow
          800: '#34373C', // Dark grey
          900: '#222428', // Charcoal
        },
        slate: {
          850: '#222428',
          900: '#222428',
          950: '#181A1D',
        }
      },
    },
  },
  plugins: [],
}
