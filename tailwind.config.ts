import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Flappy Bird 자연 테마 컬러
        sky: {
          light: "#87CEEB",
          DEFAULT: "#4A90D9",
          dark: "#2E5A8B",
        },
        grass: {
          light: "#98FB98",
          DEFAULT: "#4CAF50",
          dark: "#2E7D32",
        },
        pipe: {
          light: "#66BB6A",
          DEFAULT: "#43A047",
          dark: "#2E7D32",
        },
      },
    },
  },
  plugins: [],
};

export default config;
