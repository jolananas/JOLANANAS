import aspectRatio from '@tailwindcss/aspect-ratio';
import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Couleurs signature JOLANANAS
      colors: {
        // Couleurs principales
        'jolananas': {
          // Nuances Peach/Pink principales
          'peach-light': '#F4C0AC',
          'pink-medium': '#F38FA3', 
          'pink-deep': '#EC7B9C',
          'peach-pink': '#F4B4AB',
          'peach-bright': '#FCA4A4',
          
          // Nuances intermédiaires
          'peach-cream': '#F8D4C4', // Entre peach-light et peach-pink
          'pink-soft': '#F5A5B8', // Entre pink-medium et pink-deep
          'coral-warm': '#FF9F9F', // Entre peach-bright et pink-medium
          'rose-dust': '#E8A5B5', // Nuance plus douce de pink
          'peach-blush': '#FAD0C4', // Nuance très claire
          
          // Nuances de fond
          'white-soft': '#FEF7F0',
          'gray-warm': '#F3E8FF',
          'cream': '#FFF8F3', // Plus clair que white-soft
          'ivory': '#FFFEF9', // Presque blanc avec teinte chaude
          
          // Nuances sombres
          'black-ink': '#141318',
          'dark': '#1A1625', // Fond sombre avec nuances de rose/pêche foncé
          'dark-deep': '#0F0D14', // Fond très sombre pour footer
          'dark-medium': '#2D1F2E', // Nuance intermédiaire sombre
          'charcoal': '#1E1B24', // Gris anthracite avec teinte chaude
          
          // Couleurs d'accent
          'gold': '#FFD700',
          'gold-light': '#FFE55C', // Or plus clair
          'gold-dark': '#E6C200', // Or plus foncé
          'green': '#228B22',
          'green-light': '#32CD32', // Vert plus vif
          'green-soft': '#90EE90', // Vert doux
          
          // Couleurs pour états UI
          'success': '#22C55E', // Vert moderne pour succès
          'warning': '#F59E0B', // Ambre pour avertissement
          'error': '#EF4444', // Rouge moderne pour erreur
          'info': '#3B82F6', // Bleu pour information
          
          // Variations avec transparence (pour overlays)
          'peach-light-alpha': 'rgba(244, 192, 172, 0.8)',
          'pink-medium-alpha': 'rgba(243, 143, 163, 0.8)',
          'dark-alpha': 'rgba(26, 22, 37, 0.9)',
          'white-overlay': 'rgba(255, 255, 255, 0.95)',
          'black-overlay': 'rgba(20, 19, 24, 0.8)',
          
          // Couleurs pour états interactifs (hover, active, focus)
          'peach-hover': '#F0B89A', // Peach-light plus foncé au hover
          'pink-hover': '#E67A95', // Pink-medium plus foncé au hover
          'pink-active': '#D96A87', // Pink-deep pour état actif
          'coral-hover': '#FF8F8F', // Coral-warm plus foncé
          'gold-hover': '#FFCC00', // Gold plus foncé au hover
          
          // Couleurs pour états désactivés
          'peach-disabled': '#E8D4C8', // Peach-light désaturé
          'pink-disabled': '#E0B8C2', // Pink-medium désaturé
          'gray-disabled': '#D1D5DB', // Gris neutre pour éléments désactivés
          
          // Couleurs pour badges et notifications
          'badge-success': '#10B981', // Vert émeraude pour succès
          'badge-warning': '#F59E0B', // Ambre pour avertissement
          'badge-error': '#EF4444', // Rouge pour erreur
          'badge-info': '#3B82F6', // Bleu pour information
          'badge-new': '#EC7B9C', // Pink-deep pour badge "nouveau"
          'badge-sale': '#FFD700', // Gold pour promotions
          
          // Couleurs pour bordures et séparateurs
          'border-light': '#F3E8FF', // Gray-warm pour bordures légères
          'border-medium': '#E5D4F0', // Gray-warm plus foncé
          'border-dark': '#D1B8E0', // Gray-warm encore plus foncé
          'divider': '#E5E7EB', // Séparateur neutre
          
          // Couleurs pour textes et contrastes
          'text-primary': '#141318', // Black-ink pour texte principal
          'text-secondary': '#6B7280', // Gris pour texte secondaire
          'text-muted': '#9CA3AF', // Gris clair pour texte atténué
          'text-inverse': '#FEF7F0', // White-soft pour texte sur fond sombre
          'text-link': '#F38FA3', // Pink-medium pour liens
          'text-link-hover': '#EC7B9C', // Pink-deep pour liens au hover
          
          // Couleurs pour ombres et effets
          'shadow-peach': 'rgba(244, 192, 172, 0.3)', // Ombre peach
          'shadow-pink': 'rgba(243, 143, 163, 0.3)', // Ombre pink
          'shadow-gold': 'rgba(255, 215, 0, 0.3)', // Ombre gold
          'shadow-dark': 'rgba(20, 19, 24, 0.2)', // Ombre sombre
        },
        
        // Aliases plus courts
        'rose': {
          50: '#FEF7F0',
          100: '#FEF0E1', 
          200: '#FDDCBB',
          300: '#FBC395',
          400: '#F9AA6E',
          500: '#F79147',
          600: '#F38FA3',
          700: '#EC7B9C',
          800: '#E06681',
          900: '#D44F66',
        },
        
        // Couleurs e-commerce modernes - Tons Peach/Pink JOLANANAS
        'commerce': {
          'primary': '#EC7B9C', // pink-deep pour un look moderne et accrocheur
          'white-overlay': 'rgba(254, 247, 240, 0.95)', // white-soft avec transparence
          'white-pure': '#FEF7F0', // white-soft pour fonds cohérents avec la palette
          'gray-light': '#FFF8F3', // cream - nuance peach très claire
          'gray-medium': '#F3E8FF', // gray-warm - nuance peach/pink douce
          'gray-dark': '#E8A5B5', // rose-dust - nuance peach/pink moyenne pour textes secondaires
          'black-text': '#141318', // black-ink - texte principal avec teinte chaude
        },
        
        // Couleurs pour boutons et composants UI
        'button': {
          'primary': '#F38FA3', // Pink-medium pour bouton principal
          'primary-hover': '#EC7B9C', // Pink-deep au hover
          'primary-active': '#E67A95', // Pink encore plus foncé au clic
          'secondary': '#F4C0AC', // Peach-light pour bouton secondaire
          'secondary-hover': '#F0B89A', // Peach-hover
          'outline': 'transparent', // Bouton outline
          'outline-border': '#F38FA3', // Bordure pour outline
          'ghost': 'transparent', // Bouton ghost
          'ghost-hover': '#F3E8FF', // Fond au hover pour ghost
          'disabled': '#E0B8C2', // Pink-disabled
          'disabled-text': '#9CA3AF', // Texte désactivé
        },
        
        // Couleurs pour inputs et formulaires
        'input': {
          'background': '#FEF7F0', // White-soft
          'border': '#F3E8FF', // Gray-warm
          'border-focus': '#F38FA3', // Pink-medium au focus
          'border-error': '#EF4444', // Rouge pour erreur
          'border-success': '#22C55E', // Vert pour succès
          'placeholder': '#9CA3AF', // Texte placeholder
          'text': '#141318', // Black-ink pour texte
        },
        
        // Couleurs pour notifications et alertes
        'alert': {
          'success-bg': '#D1FAE5', // Fond vert clair
          'success-text': '#065F46', // Texte vert foncé
          'success-border': '#10B981', // Bordure verte
          'warning-bg': '#FEF3C7', // Fond ambre clair
          'warning-text': '#92400E', // Texte ambre foncé
          'warning-border': '#F59E0B', // Bordure ambre
          'error-bg': '#FEE2E2', // Fond rouge clair
          'error-text': '#991B1B', // Texte rouge foncé
          'error-border': '#EF4444', // Bordure rouge
          'info-bg': '#DBEAFE', // Fond bleu clair
          'info-text': '#1E40AF', // Texte bleu foncé
          'info-border': '#3B82F6', // Bordure bleue
        },
        
        // Couleurs pour badges et tags
        'badge': {
          'default-bg': '#F3E8FF', // Gray-warm
          'default-text': '#6B7280', // Gris moyen
          'primary-bg': '#F38FA3', // Pink-medium
          'primary-text': '#FFFFFF', // Blanc
          'success-bg': '#10B981', // Vert
          'success-text': '#FFFFFF', // Blanc
          'warning-bg': '#F59E0B', // Ambre
          'warning-text': '#FFFFFF', // Blanc
          'error-bg': '#EF4444', // Rouge
          'error-text': '#FFFFFF', // Blanc
          'new-bg': '#EC7B9C', // Pink-deep pour "nouveau"
          'new-text': '#FFFFFF', // Blanc
          'sale-bg': '#FFD700', // Gold pour promotions
          'sale-text': '#141318', // Black-ink
        },
        
        // Couleurs pour statuts de commande - Palette JOLANANAS
        'order-status': {
          // PENDING - En attente (nuance ambre/peach)
          'pending-bg': '#FEF3C7', // Fond ambre clair (light)
          'pending-bg-dark': '#92400E', // Fond ambre foncé (dark)
          'pending-text': '#92400E', // Texte ambre foncé (light)
          'pending-text-dark': '#FEF3C7', // Texte ambre clair (dark)
          
          // PAID - Payée (nuance bleu/cyan intégrée à la palette)
          'paid-bg': '#DBEAFE', // Fond bleu clair (light)
          'paid-bg-dark': '#1E3A8A', // Fond bleu foncé (dark)
          'paid-text': '#1E40AF', // Texte bleu foncé (light)
          'paid-text-dark': '#DBEAFE', // Texte bleu clair (dark)
          
          // PROCESSING - En traitement (nuance violet/pink de la palette)
          'processing-bg': '#F3E8FF', // Fond violet clair (light) - gray-warm adapté
          'processing-bg-dark': '#6B21A8', // Fond violet foncé (dark)
          'processing-text': '#6B21A8', // Texte violet foncé (light)
          'processing-text-dark': '#F3E8FF', // Texte violet clair (dark)
          
          // SHIPPED - Expédiée (nuance indigo/bleu profond)
          'shipped-bg': '#E0E7FF', // Fond indigo clair (light)
          'shipped-bg-dark': '#3730A3', // Fond indigo foncé (dark)
          'shipped-text': '#3730A3', // Texte indigo foncé (light)
          'shipped-text-dark': '#E0E7FF', // Texte indigo clair (dark)
          
          // DELIVERED - Livrée (nuance verte succès)
          'delivered-bg': '#D1FAE5', // Fond vert clair (light)
          'delivered-bg-dark': '#065F46', // Fond vert foncé (dark)
          'delivered-text': '#065F46', // Texte vert foncé (light)
          'delivered-text-dark': '#D1FAE5', // Texte vert clair (dark)
          
          // CANCELLED - Annulée (nuance rouge erreur)
          'cancelled-bg': '#FEE2E2', // Fond rouge clair (light)
          'cancelled-bg-dark': '#991B1B', // Fond rouge foncé (dark)
          'cancelled-text': '#991B1B', // Texte rouge foncé (light)
          'cancelled-text-dark': '#FEE2E2', // Texte rouge clair (dark)
          
          // REFUNDED - Remboursée (nuance gris neutre)
          'refunded-bg': '#F3F4F6', // Fond gris clair (light)
          'refunded-bg-dark': '#374151', // Fond gris foncé (dark)
          'refunded-text': '#374151', // Texte gris foncé (light)
          'refunded-text-dark': '#F3F4F6', // Texte gris clair (dark)
          
          // Bordures pour variantes outline
          'pending-border': '#F59E0B', // Ambre pour bordure
          'paid-border': '#3B82F6', // Bleu pour bordure
          'processing-border': '#9333EA', // Violet pour bordure
          'shipped-border': '#6366F1', // Indigo pour bordure
          'delivered-border': '#10B981', // Vert pour bordure
          'cancelled-border': '#EF4444', // Rouge pour bordure
          'refunded-border': '#6B7280', // Gris pour bordure
        },
        
        // Couleurs pour InfoBanner - Palette JOLANANAS
        'info-banner': {
          // PROMOTION - Bandeau promotionnel (dégradé peach/pink)
          'promotion-bg-from': '#F38FA3', // Pink-medium pour début du gradient
          'promotion-bg-via': '#F4B4AB', // Peach-pink pour milieu du gradient
          'promotion-bg-to': '#EC7B9C', // Pink-deep pour fin du gradient
          'promotion-bg-from-dark': '#F38FA3', // Pink-medium pour dark mode
          'promotion-bg-via-dark': '#F4B4AB', // Peach-pink pour dark mode
          'promotion-bg-to-dark': '#EC7B9C', // Pink-deep pour dark mode
          'promotion-border': '#F38FA3', // Bordure pink-medium
          'promotion-text': '#141318', // Black-ink pour texte (light)
          'promotion-text-dark': '#FEF7F0', // White-soft pour texte (dark)
          
          // INFO - Bandeau informatif (nuance bleu)
          'info-bg': '#DBEAFE', // Fond bleu clair (light) - équivalent blue-50
          'info-bg-dark': '#1E3A8A', // Fond bleu foncé (dark) - équivalent blue-950
          'info-border': '#93C5FD', // Bordure bleue claire (light) - équivalent blue-200
          'info-border-dark': '#3B82F6', // Bordure bleue foncée (dark) - équivalent blue-800
          'info-text': '#1E40AF', // Texte bleu foncé (light) - équivalent blue-900
          'info-text-dark': '#DBEAFE', // Texte bleu clair (dark) - équivalent blue-100
          
          // WARNING - Bandeau d'avertissement (nuance ambre)
          'warning-bg': '#FEF3C7', // Fond ambre clair (light) - équivalent amber-50
          'warning-bg-dark': '#78350F', // Fond ambre foncé (dark) - équivalent amber-950
          'warning-border': '#FDE68A', // Bordure ambre claire (light) - équivalent amber-200
          'warning-border-dark': '#F59E0B', // Bordure ambre foncée (dark) - équivalent amber-800
          'warning-text': '#92400E', // Texte ambre foncé (light) - équivalent amber-900
          'warning-text-dark': '#FEF3C7', // Texte ambre clair (dark) - équivalent amber-100
          
          // SUCCESS - Bandeau de succès (nuance verte)
          'success-bg': '#D1FAE5', // Fond vert clair (light) - équivalent green-50
          'success-bg-dark': '#064E3B', // Fond vert foncé (dark) - équivalent green-950
          'success-border': '#86EFAC', // Bordure verte claire (light) - équivalent green-200
          'success-border-dark': '#10B981', // Bordure verte foncée (dark) - équivalent green-800
          'success-text': '#065F46', // Texte vert foncé (light) - équivalent green-900
          'success-text-dark': '#D1FAE5', // Texte vert clair (dark) - équivalent green-100
          
          // DEFAULT - Bandeau par défaut
          'default-bg': '#FEF7F0', // White-soft pour fond (light)
          'default-bg-dark': '#1A1625', // Dark pour fond (dark)
          'default-border': '#F3E8FF', // Gray-warm pour bordure
          'default-text': '#141318', // Black-ink pour texte (light)
          'default-text-dark': '#FEF7F0', // White-soft pour texte (dark)
        },
        
        // Couleurs système pour UI - Personnalisées avec palette JOLANANAS
        border: '#F3E8FF', // gray-warm pour bordures douces
        input: '#FEF7F0', // white-soft pour champs de saisie
        ring: '#F38FA3', // pink-medium pour focus ring (accent Jolananas)
        background: '#FEF7F0', // white-soft pour fond principal (thème clair)
        foreground: '#141318', // black-ink pour texte principal
        muted: {
          DEFAULT: '#F3E8FF', // gray-warm pour éléments secondaires
          foreground: '#6B7280', // gris moyen pour texte secondaire
        },
        accent: {
          DEFAULT: '#F38FA3', // pink-medium pour éléments d'accentuation
          foreground: '#FFFFFF', // blanc pour texte sur accent
        },
        popover: {
          DEFAULT: '#FFFFFF', // blanc pur pour popovers
          foreground: '#141318', // black-ink pour texte
        },
        card: {
          DEFAULT: '#FFFFFF', // blanc pur pour cartes
          foreground: '#141318', // black-ink pour texte
        },
        destructive: {
          DEFAULT: 'var(--destructive)', // Utilise la variable CSS oklch définie dans globals.css
          foreground: 'var(--destructive-foreground)', // Utilise la variable CSS oklch définie dans globals.css
        },
      },

      // Typographie personnalisée
      fontFamily: {
        'sans': ['var(--font-inter)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'logo': ['weather sunday - personal use', 'cursive', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'display': ['var(--font-serif)', 'Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'serif': ['var(--font-serif)', 'Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },

      // Tailles de typographie personnalisées
      fontSize: {
        'xs': '0.75rem',      // 12px
        'sm': '0.875rem',     // 14px
        'base': '1rem',       // 16px
        'lg': '1.125rem',     // 18px
        'xl': '1.25rem',      // 20px
        '2xl': '1.5rem',      // 24px
        '3xl': '1.875rem',    // 30px
        '4xl': '2.25rem',     // 36px
        '5xl': '3rem',        // 48px
      },

      // Font weights personnalisés
      fontWeight: {
        'normal': 400,
        'medium': 500,
        'semibold': 600,
        'bold': 700,
      },

      // Gradients personnalisés
      backgroundImage: {
        // Gradients Jolananas principaux
        'gradient-jolananas': 'linear-gradient(135deg, #F4C0AC 0%, #F38FA3 50%, #EC7B9C 100%)',
        'gradient-jolananas-soft': 'linear-gradient(135deg, #FAD0C4 0%, #F5A5B8 50%, #F4B4AB 100%)', // Version plus douce
        'gradient-jolananas-vibrant': 'linear-gradient(135deg, #FCA4A4 0%, #F38FA3 50%, #EC7B9C 100%)', // Version plus vibrante
        'gradient-jolananas-dark': 'linear-gradient(135deg, #1A1625 0%, #2D1F2E 50%, #1A1625 100%)', // Gradient sombre pour footer
        
        // Gradients JOLANANAS personnalisés
        'gradient-primary': 'linear-gradient(135deg, #F4C0AC 0%, #F38FA3 50%, #EC7B9C 100%)',
        'gradient-soft': 'linear-gradient(135deg, #FAD0C4 0%, #F5A5B8 50%, #F4B4AB 100%)',
        'gradient-vibrant': 'linear-gradient(135deg, #FCA4A4 0%, #F38FA3 50%, #EC7B9C 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1A1625 0%, #2D1F2E 50%, #1A1625 100%)',
        'gradient-gold': 'linear-gradient(135deg, #F4C0AC 0%, #FFD700 50%, #F38FA3 100%)',
        'gradient-mesh-jolananas': `
          radial-gradient(circle at 20% 30%, #F4C0AC 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, #F38FA3 0%, transparent 50%),
          radial-gradient(circle at 30% 80%, #EC7B9C 0%, transparent 50%),
          radial-gradient(circle at 70% 70%, #FCA4A4 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, #F4B4AB 0%, transparent 50%)
        `,
        
        // Gradients directionnels
        'gradient-jolananas-horizontal': 'linear-gradient(90deg, #F4C0AC 0%, #F38FA3 50%, #EC7B9C 100%)',
        'gradient-jolananas-vertical': 'linear-gradient(180deg, #F4C0AC 0%, #F38FA3 50%, #EC7B9C 100%)',
        'gradient-jolananas-diagonal': 'linear-gradient(45deg, #F4C0AC 0%, #F38FA3 50%, #EC7B9C 100%)',
        
        // Gradients avec or
        'gradient-jolananas-gold': 'linear-gradient(135deg, #F4C0AC 0%, #FFD700 50%, #F38FA3 100%)',
        'gradient-gold-soft': 'linear-gradient(135deg, #FFE55C 0%, #FFD700 50%, #E6C200 100%)',
        
        // Gradients sombres
        'gradient-dark-elegant': 'linear-gradient(135deg, #1A1625 0%, #2D1F2E 50%, #1E1B24 100%)',
        'gradient-dark-deep': 'linear-gradient(135deg, #0F0D14 0%, #1A1625 50%, #0F0D14 100%)',
        
        // Gradients mesh et effets
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'gradient-radial-jolananas': 'radial-gradient(ellipse at center, #F4C0AC 0%, #F38FA3 50%, #EC7B9C 100%)',
        
        // Gradients pour overlays
        'gradient-overlay-light': 'linear-gradient(to bottom, rgba(254, 247, 240, 0.95) 0%, rgba(254, 247, 240, 0.8) 100%)',
        'gradient-overlay-dark': 'linear-gradient(to bottom, rgba(26, 22, 37, 0.95) 0%, rgba(15, 13, 20, 0.9) 100%)',
        'gradient-overlay-jolananas': 'linear-gradient(to bottom, rgba(244, 192, 172, 0.9) 0%, rgba(243, 143, 163, 0.85) 100%)',
        
        // Gradients coniques (effets circulaires)
        'gradient-conic-jolananas': 'conic-gradient(from 0deg, #F4C0AC 0deg, #F38FA3 120deg, #EC7B9C 240deg, #F4C0AC 360deg)',
        'gradient-conic-gold': 'conic-gradient(from 0deg, #FFE55C 0deg, #FFD700 120deg, #E6C200 240deg, #FFE55C 360deg)',
        'gradient-conic-soft': 'conic-gradient(from 45deg, #FAD0C4 0deg, #F5A5B8 90deg, #F4B4AB 180deg, #FAD0C4 270deg, #FAD0C4 360deg)',
        
        // Gradients radiaux avec variations
        'gradient-radial-peach': 'radial-gradient(circle at center, #F4C0AC 0%, #FEF7F0 70%)',
        'gradient-radial-pink': 'radial-gradient(circle at center, #F38FA3 0%, #FEF7F0 70%)',
        'gradient-radial-gold': 'radial-gradient(circle at center, #FFD700 0%, #FFF8F3 70%)',
        'gradient-radial-dark': 'radial-gradient(circle at center, #1A1625 0%, #0F0D14 100%)',
        'gradient-radial-soft': 'radial-gradient(ellipse at top, #FAD0C4 0%, transparent 50%)',
        
        // Gradients pour boutons et CTA
        'gradient-button-primary': 'linear-gradient(135deg, #F38FA3 0%, #EC7B9C 100%)',
        'gradient-button-secondary': 'linear-gradient(135deg, #F4C0AC 0%, #F4B4AB 100%)',
        'gradient-button-gold': 'linear-gradient(135deg, #FFD700 0%, #E6C200 100%)',
        'gradient-button-hover': 'linear-gradient(135deg, #EC7B9C 0%, #E67A95 100%)',
        
        // Gradients pour cartes et sections
        'gradient-card-light': 'linear-gradient(to bottom right, #FFFFFF 0%, #FEF7F0 100%)',
        'gradient-card-warm': 'linear-gradient(to bottom right, #FFF8F3 0%, #FEF7F0 100%)',
        'gradient-card-peach': 'linear-gradient(135deg, #FEF7F0 0%, #F4C0AC 100%)',
        'gradient-card-pink': 'linear-gradient(135deg, #FEF7F0 0%, #F38FA3 100%)',
        'gradient-card-dark': 'linear-gradient(135deg, #1A1625 0%, #2D1F2E 100%)',
        
        // Gradients pour hero sections
        'gradient-hero-light': 'linear-gradient(to bottom, #FEF7F0 0%, #FAD0C4 50%, #F5A5B8 100%)',
        'gradient-hero-vibrant': 'linear-gradient(to bottom, #FCA4A4 0%, #F38FA3 50%, #EC7B9C 100%)',
        'gradient-hero-dark': 'linear-gradient(to bottom, #1A1625 0%, #2D1F2E 50%, #1E1B24 100%)',
        'gradient-hero-gold': 'linear-gradient(to bottom, #FFE55C 0%, #FFD700 50%, #E6C200 100%)',
        
        // Gradients pour effets de brillance (shimmer)
        'gradient-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
        'gradient-shimmer-pink': 'linear-gradient(90deg, transparent 0%, rgba(243, 143, 163, 0.4) 50%, transparent 100%)',
        'gradient-shimmer-gold': 'linear-gradient(90deg, transparent 0%, rgba(255, 215, 0, 0.4) 50%, transparent 100%)',
        
        // Gradients pour séparateurs et dividers
        'gradient-divider': 'linear-gradient(90deg, transparent 0%, #E5D4F0 50%, transparent 100%)',
        'gradient-divider-pink': 'linear-gradient(90deg, transparent 0%, #F38FA3 50%, transparent 100%)',
        'gradient-divider-vertical': 'linear-gradient(180deg, transparent 0%, #E5D4F0 50%, transparent 100%)',
        
        // Gradients pour effets de bordure
        'gradient-border': 'linear-gradient(135deg, #F4C0AC 0%, #F38FA3 50%, #EC7B9C 100%)',
        'gradient-border-gold': 'linear-gradient(135deg, #FFE55C 0%, #FFD700 50%, #E6C200 100%)',
        'gradient-border-soft': 'linear-gradient(135deg, #FAD0C4 0%, #F5A5B8 50%, #F4B4AB 100%)',
      },

      // Animations et transitions personnalisées
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
        'slower': '500ms',
      },
      transitionTimingFunction: {
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // Animations et transitions
      animation: {
        'wiggle': 'wiggle 1s ease-in-out',
        'shimmer': 'shimmer 1.2s ease-in-out infinite',
        'fadeInUp': 'fadeInUp 0.6s ease-out',
        'slideInLeft': 'slideInLeft 0.6s ease-out',
        'slideInRight': 'slideInRight 0.6s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-grow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'status-pulse': 'statusPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'status-bounce': 'statusBounce 1s ease-in-out',
      },

      keyframes: {
        wiggle: {
          '0%, 7%': { transform: 'rotateZ(0)' },
          '15%': { transform: 'rotateZ(-15deg)' },
          '20%': { transform: 'rotateZ(10deg)' },
          '25%': { transform: 'rotateZ(-10deg)' },
          '30%': { transform: 'rotateZ(6deg)' },
          '35%': { transform: 'rotateZ(-4deg)' },
          '40%, 100%': { transform: 'rotateZ(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-468px 0' },
          '100%': { backgroundPosition: '468px 0' },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        slideInLeft: {
          '0%': { 
            opacity: '0',
            transform: 'translateX(-30px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        slideInRight: {
          '0%': { 
            opacity: '0',
            transform: 'translateX(30px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        statusPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        statusBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },

      // Espacement et taille personnalisés
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        // Espacements personnalisés
        'xs': '0.5rem',   // 8px
        'sm': '0.75rem',  // 12px
        'md': '1rem',     // 16px
        'lg': '1.5rem',   // 24px
        'xl': '2rem',     // 32px
        '2xl': '3rem',    // 48px
        '3xl': '4rem',    // 64px
      },

      // Border radius personnalisés
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        // Border radius personnalisés
        'sm': '0.25rem',   // 4px
        'md': '0.5rem',    // 8px
        'lg': '0.75rem',   // 12px
        'xl': '1rem',     // 16px
        '2xl': '1.5rem',  // 24px
        'full': '9999px',
      },

      // Ombres personnalisées
      boxShadow: {
        'glow': '0 0 20px rgba(255, 215, 0, 0.3)',
        'glow-pink': '0 0 20px rgba(243, 143, 163, 0.3)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(255, 215, 0, 0.2)',
        // Ombres personnalisées
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },

      // Breakpoints personnalisés
      screens: {
        // Breakpoints responsive (liste exhaustive)
        'xxs': '240px',
        'xs': '375px',        // Priorité au breakpoint existant de tailwind.config.js
        'xs-tokens': '280px', // Renommé pour éviter conflit
        's-xs': '320px',
        'sm': '640px',        // Priorité au breakpoint existant de tailwind.config.js
        'sm-tokens': '360px', // Renommé pour éviter conflit
        's-md': '375px',
        'md': '768px',        // Priorité au breakpoint existant de tailwind.config.js
        'md-tokens': '414px', // Renommé pour éviter conflit
        'md-lg': '480px',
        'lg': '1024px',       // Priorité au breakpoint existant de tailwind.config.js
        'lg-tokens': '540px', // Renommé pour éviter conflit
        'xl-mobile': '600px',
        'phablet': '640px',
        'xs-tablet': '720px',
        'sm-tablet': '768px',
        'md-tablet': '834px',
        'lg-tablet': '912px',
        'breakpoint-test': '999px',
        'xl-tablet': '1024px',
        'xl': '1280px',       // Priorité au breakpoint existant de tailwind.config.js
        'xs-laptop': '1136px',
        'sm-laptop': '1200px',
        'md-laptop': '1280px',
        'lg-laptop': '1366px',
        'sm-desktop': '1440px',
        'foldable': '1530px',
        'md-desktop': '1536px',
        '2xl': '1536px',      // Priorité au breakpoint existant de tailwind.config.js
        'lg-desktop': '1600px',
        'xl-desktop': '1680px',
        '2xl-desktop': '1728px',
        '3xl-desktop': '1800px',
        '3xl': '1920px',      // Priorité au breakpoint existant de tailwind.config.js
        'hd': '1920px',
        '2k': '2048px',
        'small-ultrawide': '2304px',
        '2k-ultrawide': '2560px',
        '3k': '2880px',
        '3k-ultrawide': '3440px',
        '4k': '3840px',
        '5k': '5120px',
        '6k': '6016px',
        '8k': '7680px',
        'debug-max': '10000px',
      },

      // Dimensions personnalisées
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        '10xl': '104rem',
      },

      // Hauteurs personnalisées pour sections
      height: {
        'screen-1/2': '50vh',
        'screen-3/4': '75vh',
        'screen-4/5': '80vh',
      },

      // Z-index personnalisé
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
        // Z-index nommés
        'base': 0,
        'dropdown': 1000,
        'sticky': 1020,
        'fixed': 1030,
        'modalBackdrop': 1040,
        'modal': 1050,
        'popover': 1060,
        'tooltip': 1070,
      },

      // Aspect ratios
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        md: '2rem',
        lg: '2rem',
        xl: '2rem',
        '2xl': '2rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px',
      },
    },
  },
  plugins: [
    aspectRatio,
    containerQueries,
    forms,
    typography,
    
    // Plugin personnalisé pour les utilities JOLANANAS
    function({ addUtilities, addComponents, theme }) {
      addUtilities({
        '.glass-card': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.glass'),
        },
        '.text-gradient': {
          background: 'linear-gradient(135deg, #F4C0AC 0%, #F38FA3 50%, #EC7B9C 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        },
        '.btn-jolananas': {
          background: 'linear-gradient(135deg, #F38FA3 0%, #FCA4A4 100%)',
          color: '#fff',
          padding: '0.75rem 1.5rem',
          borderRadius: theme('borderRadius.lg'),
          fontWeight: theme('fontWeight.semibold'),
          boxShadow: theme('boxShadow.glow-pink'),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 25px -5px rgba(243, 143, 163, 0.4)',
          },
        },
        '.card-commerce': {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: theme('borderRadius.xl'),
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          transition: 'all 0.3s ease-out',
        },
        '.btn-commerce': {
          background: '#141318',
          color: '#FFFFFF',
          padding: '0.75rem 1.5rem',
          borderRadius: theme('borderRadius.lg'),
          fontWeight: theme('fontWeight.medium'),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            background: '#2D2D2D',
            transform: 'translateY(-1px)',
          },
        },
        // Classes utilitaires JOLANANAS
        '.glass-card-tokens': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.glass'),
        },
        '.text-gradient-tokens': {
          background: 'linear-gradient(to right, #F4C0AC, #F38FA3, #EC7B9C)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        },
        '.btn-primary-tokens': {
          background: 'linear-gradient(to right, #F38FA3, #EC7B9C)',
          color: '#FFFFFF',
          fontWeight: theme('fontWeight.semibold'),
          padding: '0.75rem 1.5rem',
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.glow-pink'),
          transition: 'all 0.3s ease-out',
          '&:hover': {
            boxShadow: theme('boxShadow.lg'),
          },
        },
        '.card-commerce-tokens': {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(229, 231, 235, 1)',
          borderRadius: theme('borderRadius.xl'),
          boxShadow: theme('boxShadow.md'),
          transition: 'all 0.3s ease-out',
          '&:hover': {
            boxShadow: theme('boxShadow.xl'),
          },
        },
      })

      addComponents({
        '.card-jolananas': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.glass'),
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme('boxShadow.glow'),
          },
          transition: 'all 0.3s ease-out',
        },
      })
    }
  ],
}