/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          deepest: "#050F0D",
          dark: "#0F1917",
          mid: "#1C2E29",
        },
        accent: "#213631",
        text: {
          secondary: "#8FA69C",
          primary: "#E8F5EE",
        },
        gain: "#84CC16",
        loss: "#F87171",
        highlight: "#10B981",
        warning: "#FBBF24",
        violet: "#A78BFA",
        teal: "#22D3D3",
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        body: ["Outfit", "sans-serif"],
        mono: ["Outfit", "sans-serif"],
      },
      borderRadius: {
        xl: "20px",
        "2xl": "28px",
        "3xl": "2rem",
      },
    },
  },
  plugins: [],
};
