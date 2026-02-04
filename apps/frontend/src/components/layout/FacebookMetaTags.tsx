'use client';

import { useEffect } from 'react';

/**
 * 🍍 FacebookMetaTags - Injection des balises meta Facebook
 * ===========================================================
 * Injecte les balises meta Facebook supplémentaires dans le <head>
 * pour une meilleure intégration avec Facebook et les réseaux sociaux
 */
export function FacebookMetaTags() {
  useEffect(() => {
    // Fonction pour créer ou mettre à jour une balise meta
    const setMetaTag = (property: string, content: string) => {
      // Supprimer l'attribut existant si présent
      const existing = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
      if (existing) {
        existing.remove();
      }

      // Créer la nouvelle balise meta
      const meta = document.createElement('meta');
      if (property.startsWith('og:') || property.startsWith('fb:')) {
        meta.setAttribute('property', property);
      } else {
        meta.setAttribute('name', property);
      }
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    };

    // Balises meta Facebook/Open Graph supplémentaires
    const facebookMetaTags = {
      // Facebook App ID (optionnel - à configurer si nécessaire)
      // Pour obtenir un App ID : https://developers.facebook.com/apps/
      'fb:app_id': '',
      
      // Auteur et éditeur Facebook
      'article:author': 'https://www.facebook.com/jolananas.officiel',
      'article:publisher': 'https://www.facebook.com/jolananas.officiel',
      
      // Image Open Graph sécurisée
      'og:image:secure_url': 'https://jolananas.com/assets/images/preview/Jolananas_preview.png',
      'og:image:type': 'image/png',
      'og:image:width': '1200',
      'og:image:height': '630',
      
      // Locale alternatif
      'og:locale:alternate': 'en_US',
    };

    // Injecter toutes les balises meta
    Object.entries(facebookMetaTags).forEach(([property, content]) => {
      if (content) {
        setMetaTag(property, content);
      }
    });

    // Nettoyage au démontage
    return () => {
      Object.keys(facebookMetaTags).forEach((property) => {
        const meta = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
        if (meta) {
          meta.remove();
        }
      });
    };
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}

