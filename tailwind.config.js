/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: "#00f5ff",
          green: "#39ff14",
          pink: "#ff2d78",
        },
        dark: {
          900: "#070b12",
          800: "#0d1117",
          700: "#111827",
          600: "#1a2332",
          500: "#243044",
        },
      },
      boxShadow: {
        neon: "0 0 20px rgba(0,245,255,0.4)",
        "neon-green": "0 0 20px rgba(57,255,20,0.4)",
        "neon-pink": "0 0 20px rgba(255,45,120,0.4)",
      },
    },
  },
  plugins: [],
};
