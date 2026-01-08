/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preflight: true,
  },
  theme: {
    extend: {},
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000000',
      white: '#ffffff',
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },
      indigo: {
        500: '#6366f1',
        600: '#4f46e5',
      },
      blue: { 500: '#3b82f6' },
      green: { 500: '#10b981' },
      amber: { 500: '#f59e0b' },
      red: { 500: '#ef4444' },
    },
  },
  plugins: [],
}
