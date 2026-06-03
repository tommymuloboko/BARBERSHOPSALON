/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        qb: {
          green: '#569DE6',
          'green-hover': '#248F14',
          'green-dark': '#1F7A12',
          sidebar: '#393A3D',
          'sidebar-hover': '#4A4B4E',
          'sidebar-active': '#569DE6',
          bg: '#F4F5F8',
          border: '#E5E7EB',
          text: '#393A3D',
          muted: '#6B6C72',
          header: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'qb-card': '0 1px 2px 0 rgba(0,0,0,0.04), 0 1px 3px 0 rgba(0,0,0,0.06)',
      }
    }
  },
  plugins: []
};
