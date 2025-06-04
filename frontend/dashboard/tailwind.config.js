
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
    
  animation: {
    'fade-in': 'fadeIn 1s ease-out forwards',
  },
  keyframes: {
    fadeIn: {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 },
    },
  },
    animation: {
        'slide-in-left': 'slideInLeft 0.6s ease-out forwards',
      },
      keyframes: {
        slideInLeft: {
          '0%': { opacity: 0, transform: 'translateX(-20px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      },
    animation: {
      'slide-in': 'slideIn 0.7s ease-out forwards',
    },
    keyframes: {
      slideIn: {
        '0%': { transform: 'translateX(-100%)', opacity: 0 },
        '100%': { transform: 'translateX(0)', opacity: 1 },
      },
    },

      animation: {
    'slide-in-left': 'slideInLeft 1s ease-out',
  },
  keyframes: {
    slideInLeft: {
      '0%': { opacity: 0, transform: 'translateX(-50%)' },
      '100%': { opacity: 1, transform: 'translateX(0)' },
    },
  },
      animation: {
        'slide-in-left': 'slideInLeft 1s ease-out',
        'fade-in-up': 'fadeInUp 1s ease-out',
      },
      keyframes: {
        slideInLeft: {
          '0%': { opacity: 0, transform: 'translateX(-50%)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

