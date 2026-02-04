import tailwindAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "text-foreground": "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#EC7B9C", // Pink Deep
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F4C0AC", // Peach
          foreground: "#141318",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#FEF7F0", // Soft White
          foreground: "#6B7280",
        },
        accent: {
          DEFAULT: "#F38FA3", // Pink Medium
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#141318",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // STYLE SUISSE : Helvetica dominant, mais on garde la douceur
        sans: ["'Helvetica Neue'", "Helvetica", "Arial", "sans-serif"],
        serif: ["'Helvetica Neue'", "Helvetica", "Arial", "sans-serif"], // On uniformise pour le look "Galerie"
      },
      animation: {
        grid: "grid 15s linear infinite", // Animation pour la grille rétro
        morph: "morph 8s ease-in-out infinite", // Animation pour le métal liquide
        shine: "shine 3s linear infinite", // Reflet chrome
      },
      keyframes: {
        grid: {
          "0%": { transform: "translateY(-50%)" },
          "100%": { transform: "translateY(0)" },
        },
        morph: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
        },
        shine: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
      },
      backgroundImage: {
        // LE LIQUID METAL JOLANANAS (Chrome teinté de rose pâle)
        "liquid-metal":
          "linear-gradient(135deg, #e0e0e0 0%, #ffffff 50%, #f4c0ac 100%)",
        "chrome-text":
          "linear-gradient(to right, #666 0%, #fff 50%, #666 100%)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        swiss: "cubic-bezier(0.32, 0.72, 0, 1)",
        curtain: "cubic-bezier(0.87, 0, 0.13, 1)",
      },
    },
  },
  plugins: [tailwindAnimate],
};
