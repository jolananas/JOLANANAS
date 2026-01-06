/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Couleurs JOLANANAS
      colors: {
        'jolananas-peach-light': '#F4C0AC',
        'jolananas-pink-medium': '#F38FA3',
        'jolananas-pink-deep': '#EC7B9C',
        'jolananas-peach-pink': '#F4B4AB',
        'jolananas-peach-bright': '#FCA4A4',
        'jolananas-white-soft': '#FEF7F0',
        'jolananas-gray-warm': '#F3E8FF',
        'jolananas-black-ink': '#141318',
        'jolananas-gold': '#FFD700',
        'jolananas-green': '#228B22',
      },
      
      // Backgrounds personnalisés
      backgroundImage: {
        'jolananas-gradient': 'linear-gradient(135deg, #F4C0AC 0%, #F38FA3 50%, #EC7B9C 100%)',
        'jolananas-radial': 'radial-gradient(ellipse at center, #F4C0AC 0%, #F38FA3 50%, #EC7B9C 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },

      // Animations personnalisées
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%': { boxShadow: '0 0 5px rgba(244, 192, 172, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(244, 192, 172, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },

      // Typography
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'serif': ['Playfair Display', 'Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'mono': ['JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', 'monospace'],
      },

      // Shadows personnalisés
      boxShadow: {
        'jolananas': '0 10px 40px rgba(244, 192, 172, 0.3)',
        'jolananas-lg': '0 20px 60px rgba(244, 192, 172, 0.4)',
        'glass': '0 8px 32px rgba(255, 255, 255, 0.1)',
        'glass-lg': '0 16px 64px rgba(255, 255, 255, 0.15)',
      },

      // Responsive breakpoints étendus
      screens: {
        'xs': '450px',
        '4xl': '1920px',
      },

      // Aspects ratios personnalisés
      aspectRatio: {
        'golden': '1.618',
        'photo': '4/3',
        'video': '16/9',
      },
    },
  },
  
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    
    // Plugin personnalisé pour les utilitaires JOLANANAS
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-strong': {
          'background': 'rgba(255, 255, 255, 0.15)',
          'backdrop-filter': 'blur(15px)',
          'border': '1px solid rgba(255, 255, 255, 0.3)',
        },
        '.text-gradient': {
          'background': 'linear-gradient(135deg, #F4C0AC, #F38FA3, #EC7B9C)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.line-clamp-2': {
          'overflow': 'hidden',
          'display': '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        },
        '.line-clamp-3': {
          'overflow': 'hidden',
          'display': '-webkit-box',
          '-webkit-box-orient': 'vertical',
          'webkit-line-clamp': '3',
        },
      };
      
      addUtilities(newUtilities);
    },
  ],
};
