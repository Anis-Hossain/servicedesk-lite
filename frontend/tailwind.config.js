/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F6F5F1",
        surface: "#FFFFFF",
        ink: "#1C1F26",
        muted: "#6B6F76",
        border: "#E1DFD8",
        primary: {
          DEFAULT: "#2B4C7E",
          dark: "#1D3A63",
          light: "#EDF1F7",
        },
        accent: {
          DEFAULT: "#C4622D",
          light: "#FBEEE6",
        },
        success: {
          DEFAULT: "#2F6F4F",
          light: "#E8F2EC",
        },
        warn: {
          DEFAULT: "#9C6B12",
          light: "#FBF2DF",
        },
      },
      fontFamily: {
        sans: ["var(--font-plex)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
      },
    },
  },
  plugins: [],
};
