# 📄 DOC-DESIGN : Le Système de Design Atomique "Jolananas"

**Objectif :** Nettoyer le "frontend horrible" et rationaliser l'UI.
**Approche :** Less is More.

---

## 1. Palette de Couleurs Rationalisée

Nous remplaçons les 50+ nuances par **5 Tokens Sémantiques**.
Ces couleurs sont définies pour garantir la cohérence de la marque sans complexité.

| Token          | Rôle                                     | Valeur Hex | Référence Tailwind (Legacy) |
| :------------- | :--------------------------------------- | :--------- | :-------------------------- |
| **Primary**    | Action principale, Liens, Marque         | `#F38FA3`  | `pink-medium`               |
| **Secondary**  | Fonds alternatifs, Boutons secondaires   | `#F4C0AC`  | `peach-light`               |
| **Accent**     | Éléments de mise en valeur (Promo/Badge) | `#FFD700`  | `gold`                      |
| **Background** | Fond de page principal                   | `#FEF7F0`  | `white-soft`                |
| **Text**       | Texte principal, Titres                  | `#141318`  | `black-ink`                 |

_Note: Toutes les autres couleurs (gradients complexes, alphas spécifiques) sont supprimées pour le MVP._

---

## 2. Typographie Simplifiée

Trois tailles uniques pour structurer tout le contenu.
Font Family: `Inter` (Sans Serif) + `Serif` (Titres élégants - optionnel si chargement lent).

| Token      | Usage                       | Taille (Desktop)    | Taille (Mobile) |
| :--------- | :-------------------------- | :------------------ | :-------------- |
| **Text-S** | Détails, Mentions légales   | `14px` (`0.875rem`) | `12px`          |
| **Text-M** | Corps de texte, Paragraphes | `16px` (`1rem`)     | `14px`          |
| **Text-L** | Titres, Prix, Boutons       | `24px` (`1.5rem`)   | `20px`          |

---

## 3. Composants UI "Prêts à l'Emploi"

Nous ne codons plus de composants complexes. Nous utilisons des bloc simples et réutilisables.

### A. Bouton (Button)

- **Style Primary** : Fond `Primary`, Texte Blanc, Rounded-Medium.
- **Style Secondary** : Bordure `Secondary`, Texte `Text`, Fond Transparent.
- **Interaction** : Opacité 90% au survol (pas d'animations complexes).

### B. Carte Produit (Product Card)

- **Structure** : Image carrée + Titre (Text-M) + Prix (Text-M Bold).
- **Fond** : Blanc (`#FFFFFF`) ou Transparent.
- **Shadow** : Légère (`shadow-sm`) uniquement.

### C. Input (Form) (Si nécessaire)

- **Style** : Bordure `Secondary`, Fond Blanc, Texte `Text`.

---

## 4. Règles CSS / Tailwind

Pour le nettoyage du `tailwind.config.js` :

1.  **Supprimer** la section `extend.colors` géante.
2.  **Définir** uniquement les 5 couleurs ci-dessus dans `theme.colors`.
3.  **Supprimer** les plugins d'animation custom (`wiggle`, `shimmer` complexe).
4.  **Supprimer** les breakpoints exotiques (`foldable`, `3k`, `debug-max`).

**Résultat attendu :** Un fichier de configuration de < 50 lignes.
