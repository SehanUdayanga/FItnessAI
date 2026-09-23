/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // FitTrack Color System from reference fittrack.html
        green: {
          900: '#123D2C',
          700: '#1F6F4F',
          600: '#278B62',
          400: '#4FAE85',
          100: '#EAF4EE',
          '050': '#F4FAF6',
        },
        navy: {
          900: '#0F151C',
          800: '#141B23',
          700: '#1D2733',
        },
        slate: {
          700: '#3A4550',
          500: '#68737E',
          300: '#AAB4BC',
        },
        line: {
          DEFAULT: '#E3E9E4',
          dark: '#28323C',
        },
        amber: '#D98A3D',
        primary: {
          DEFAULT: '#1F6F4F',
          hover: '#278B62',
          light: '#EAF4EE',
          accent: '#4FAE85',
        },
        secondary: {
          DEFAULT: '#0EA5E9',
          hover: '#0284C7',
          light: '#E0F2FE',
        },
        background: '#FAFAF8',
        card: '#FFFFFF',
        textMain: '#0F151C',
        textSecondary: '#68737E'
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(15,21,28,0.04), 0 1px 1px rgba(15,21,28,0.03)',
        'md': '0 8px 24px rgba(15,21,28,0.07), 0 2px 6px rgba(15,21,28,0.05)',
        'lg': '0 24px 64px rgba(15,21,28,0.14), 0 6px 16px rgba(15,21,28,0.06)',
      },
      borderRadius: {
        'lg': '20px',
        'md': '14px',
        'sm': '10px',
      }
    },
  },
  plugins: [],
}

