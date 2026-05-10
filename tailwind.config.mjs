/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211d",
        moss: "#5aa982",
        leaf: "#237a52",
        mint: "#e8f6ee",
        cloud: "#f7fbf8",
        ember: "#f0a64a"
      },
      boxShadow: {
        soft: "0 18px 48px rgba(29, 69, 49, 0.12)"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};
