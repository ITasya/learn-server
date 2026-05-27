/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        learnhub: {
          "primary":          "#7c3aed",
          "primary-content":  "#ffffff",
          "secondary":        "#1a1a2e",
          "secondary-content":"#ffffff",
          "accent":           "#7c3aed",
          "neutral":          "#1a1a2e",
          "base-100":         "#ffffff",
          "base-200":         "#f5f3ff",
          "base-300":         "#ede9fe",
          "base-content":     "#1a1a2e",
          "info":             "#8b5cf6",
          "success":          "#16a34a",
          "warning":          "#d97706",
          "error":            "#dc2626",
        },
      },
    ],
  },
} 