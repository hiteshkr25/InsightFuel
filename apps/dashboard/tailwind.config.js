/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "white",
        foreground: "#0f172a",
        card: "white",
        "card-foreground": "#0f172a",
        border: "#e2e8f0",
        input: "#e2e8f0",
        primary: "#3b82f6",
        "primary-foreground": "white",
        secondary: "#f1f5f9",
        "secondary-foreground": "#0f172a",
        muted: "#f8fafc",
        "muted-foreground": "#64748b",
        destructive: "#ef4444",
        "destructive-foreground": "white",
        ring: "#3b82f6",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
}
