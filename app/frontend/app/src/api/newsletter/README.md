# 📧 Configuration Newsletter avec Resend

## Installation

```bash
npm install resend
```

## Configuration

### 1. Créer un compte Resend (gratuit)

1. Allez sur [https://resend.com](https://resend.com)
2. Créez un compte gratuit (3000 emails/mois)
3. Vérifiez votre domaine ou utilisez le domaine de test fourni

### 2. Obtenir votre API Key

1. Dans le dashboard Resend, allez dans **API Keys**
2. Créez une nouvelle clé API
3. Copiez la clé (elle ne sera affichée qu'une seule fois)

### 3. Configurer les variables d'environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```env
# Resend API Key (obligatoire pour l'envoi d'emails)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email expéditeur (optionnel, par défaut: newsletter@jolananas.com)
NEWSLETTER_FROM_EMAIL=newsletter@jolananas.com

# Email de notification interne (optionnel, par défaut: contact@jolananas.com)
NEWSLETTER_TO_EMAIL=contact@jolananas.com
```

### 4. Vérifier votre domaine (production)

Pour envoyer depuis votre propre domaine en production :

1. Dans Resend, allez dans **Domains**
2. Ajoutez votre domaine (ex: `jolananas.com`)
3. Ajoutez les enregistrements DNS fournis
4. Attendez la vérification (quelques minutes)

## Fonctionnalités

✅ **Email de confirmation personnalisé** : Chaque nouvel abonné reçoit un email de bienvenue avec le design JOLANANAS

✅ **Notification interne** : Vous recevez une notification à chaque nouvelle inscription

✅ **Gestion d'erreurs** : Messages d'erreur clairs pour l'utilisateur

✅ **Mode développement** : Fonctionne sans configuration pour les tests (log dans la console)

## Test

1. Sans configuration : L'API fonctionne en mode développement (log dans la console)
2. Avec Resend : Les emails sont envoyés automatiquement

## Coûts

- **Gratuit** : 3000 emails/mois
- **Payant** : À partir de $20/mois pour plus d'emails

## Alternative gratuite : Nodemailer + Gmail

Si vous préférez utiliser Gmail (gratuit, 500 emails/jour) :

1. Installez `nodemailer` : `npm install nodemailer`
2. Créez un mot de passe d'application Gmail
3. Modifiez la route API pour utiliser Nodemailer au lieu de Resend

---

**Note** : Resend est recommandé pour sa simplicité et sa fiabilité. C'est une solution moderne et open source friendly.

