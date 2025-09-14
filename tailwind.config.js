/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          dark: '#3b82f6',
          'dark-hover': '#2563eb',
        },
        secondary: '#64748b',
        border: '#e5e7eb',
        'border-dark': '#374151',
        background: '#ffffff',
        'background-dark': '#121212',
        foreground: '#111827',
        'foreground-dark': '#E0E0E0',
        'card-dark': '#1e1e1e',
        'card-border-dark': '#2d2d2d',
      },
      spacing: {
        'section': '2rem',
        'container': '0.5rem',
      },
      borderRadius: {
        'container': '0.5rem',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            lineHeight: '1.7',
          },
        },
      },
    },
  },
  plugins: [],
}
