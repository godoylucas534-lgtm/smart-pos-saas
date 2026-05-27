// apps/frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',   // Indigo 500
        success: '#10b981',   // Emerald 500
        danger: '#ef4444',    // Red 500
        warning: '#f59e0b',   // Amber 500
      },
    },
  },
  plugins: [],
}
