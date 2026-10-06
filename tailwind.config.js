/** HIQ 2.0 design tokens (Section 3 of the brief) */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hiq: {
          blue: "#0E71B8",
          navy: "#0B2A4A",
          sky: "#EAF5FC",
          water: "#CFE8F7",
          accent: "#C2410C",
          "accent-dark": "#9A3412",
          "blue-dark": "#0A5A93",
        },
        success: "#15803D",
        warning: "#B45309",
        error: "#B91C1C",
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "12px" },
      boxShadow: {
        soft: "0 1px 2px rgba(11,42,74,.06), 0 4px 16px rgba(11,42,74,.06)",
        lift: "0 8px 30px rgba(11,42,74,.12)",
      },
      maxWidth: { page: "1200px" },
    },
  },
  plugins: [],
};
