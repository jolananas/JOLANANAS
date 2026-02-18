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

        // Système JOLANANAS (Importé de apps/config)
        "jolananas-peach-light": "#F4C0AC",
        "jolananas-pink-medium": "#F38FA3",
        "jolananas-pink-deep": "#EC7B9C", // Primary
        "jolananas-peach-pink": "#F4B4AB",
        "jolananas-peach-bright": "#FCA4A4",
        "jolananas-white-soft": "#FEF7F0", // Muted
        "jolananas-gray-warm": "#F3E8FF",
        "jolananas-black-ink": "#141318",
        "jolananas-gold": "#FFD700",
        "jolananas-green": "#228B22",

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
        // Fallbacks système (Importé de apps/config)
        mono: ["JetBrains Mono", "SF Mono", "Monaco", "Consolas", "monospace"],
        brand: ["'weather sunday'", "sans-serif"],
      },
      animation: {
        // Animations Frontend existantes
        grid: "grid 15s linear infinite",
        morph: "morph 8s ease-in-out infinite",
        shine: "shine 3s linear infinite",
        // Animations JOLANANAS (Importé de apps/config)
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "bounce-slow": "bounce 2s infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite alternate",
        float: "float 6s ease-in-out infinite",
        glitch: "glitch 0.3s cubic-bezier(.25,.46,.45,.94) infinite",
        "laser-flicker": "laser-flicker 2s ease-in-out infinite",
        "laser-sweep": "laser-sweep 8s ease-in-out infinite",
        "banner-scroll": "banner-scroll 5s linear infinite",
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
        // Keyframes JOLANANAS (Importé de apps/config)
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseGlow: {
          "0%": { boxShadow: "0 0 5px rgba(244, 192, 172, 0.5)" },
          "100%": { boxShadow: "0 0 20px rgba(244, 192, 172, 0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glitch: {
          "0%, 100%": { transform: "translate(0)", clipPath: "inset(0 0 0 0)" },
          "10%": { transform: "translate(-2px, -1px)", clipPath: "inset(20% 0 10% 0)" },
          "30%": { transform: "translate(2px, 1px)", clipPath: "inset(40% 0 50% 0)" },
          "50%": { transform: "translate(-1px, 2px)", clipPath: "inset(60% 0 10% 0)" },
          "70%": { transform: "translate(1px, -2px)", clipPath: "inset(80% 0 30% 0)" },
          "90%": { transform: "translate(-2px, 1px)", clipPath: "inset(10% 0 70% 0)" },
        },
        "banner-scroll": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(110vh)" },
        },
        "laser-flicker": {
          "0%, 100%": { opacity: "0.8", filter: "drop-shadow(0 0 5px #ff0000)" },
          "50%": { opacity: "0.4", filter: "drop-shadow(0 0 2px #ff0000)" },
          "25%, 75%": { opacity: "0.9", filter: "drop-shadow(0 0 8px #ff0000)" },
        },
        "laser-sweep": {
          "0%, 100%": { transform: "translateX(-10%) rotate(var(--rotation))" },
          "50%": { transform: "translateX(10%) rotate(var(--rotation))" },
        },
      },
      backgroundImage: {
        // LE LIQUID METAL JOLANANAS (Chrome teinté de rose pâle)
        "liquid-metal":
          "linear-gradient(135deg, #e0e0e0 0%, #ffffff 50%, #f4c0ac 100%)",
        "chrome-text":
          "linear-gradient(to right, #666 0%, #fff 50%, #666 100%)",
        // Backgrounds JOLANANAS (Importé de apps/config)
        "jolananas-gradient":
          "linear-gradient(135deg, #F4C0AC 0%, #F38FA3 50%, #EC7B9C 100%)",
        "jolananas-radial":
          "radial-gradient(ellipse at center, #F4C0AC 0%, #F38FA3 50%, #EC7B9C 100%)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
      },
      boxShadow: {
        // Shadows JOLANANAS (Importé de apps/config)
        jolananas: "0 10px 40px rgba(244, 192, 172, 0.3)",
        "jolananas-lg": "0 20px 60px rgba(244, 192, 172, 0.4)",
        glass: "0 8px 32px rgba(255, 255, 255, 0.1)",
        "glass-lg": "0 16px 64px rgba(255, 255, 255, 0.15)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        swiss: "cubic-bezier(0.32, 0.72, 0, 1)",
        curtain: "cubic-bezier(0.87, 0, 0.13, 1)",
        full: "cubic-bezier(0.32,0.72,0,1)", // Transition fluide
      },
      screens: {
        // Screens JOLANANAS (Importé de apps/config) - Extensions
        xs: "450px",
        "4xl": "1920px",
      },
      aspectRatio: {
        // Aspect Ratios JOLANANAS (Importé de apps/config)
        golden: "1.618",
        photo: "4/3",
        video: "16/9",
      },
    },
  },
  plugins: [
    tailwindAnimate,
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/container-queries"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    // Plugin utilitaire JOLANANAS (Adapté de apps/config)
    function ({ addUtilities }) {
      addUtilities({
        ".glass": {
          background: "rgba(255, 255, 255, 0.1)",
          "backdrop-filter": "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
        ".glass-strong": {
          background: "rgba(255, 255, 255, 0.15)",
          "backdrop-filter": "blur(15px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        },
        ".text-gradient": {
          background: "linear-gradient(135deg, #F4C0AC, #F38FA3, #EC7B9C)",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
        },
      });
    },
  ],
};
