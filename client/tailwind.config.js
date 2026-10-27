/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        heading: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
      },
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
        // Enforce Yellow on any amber or orange references across the entire application
        amber: {
          50: '#FEF9E7',
          100: '#FDF3CF',
          200: '#FCE79F',
          300: '#FADB6E',
          400: '#FCC837',
          500: '#FCC837',
          600: '#F0BA28',
          700: '#E6B01B',
          800: '#34373C',
          900: '#222428',
        },
        orange: {
          50: '#FEF9E7',
          100: '#FDF3CF',
          200: '#FCE79F',
          300: '#FADB6E',
          400: '#FCC837',
          500: '#FCC837',
          600: '#F0BA28',
          700: '#E6B01B',
          800: '#34373C',
          900: '#222428',
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

