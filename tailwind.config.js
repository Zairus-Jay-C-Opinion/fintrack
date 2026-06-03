/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          deepest: "#06141B",
          dark: "#11212D",
          mid: "#253745",
        },
        accent: "#4A5C6A",
        text: {
          secondary: "#9BA8AB",
          primary: "#CCD0CF",
        },
        gain: "#4CAF7D",
        loss: "#E05C5C",
        highlight: "#5B8FA8",
        warning: "#D4A843",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xl: "20px",
        "2xl": "28px",
      },
    },
  },
  plugins: [],
};
