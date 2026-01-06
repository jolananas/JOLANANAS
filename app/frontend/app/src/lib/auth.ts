/**
 * 🍍 JOLANANAS - Configuration NextAuth.js avec Shopify Customer Accounts
 * =======================================================================
 * Configuration de l'authentification utilisant Shopify Customer Account API
 * Remplace la gestion locale des comptes clients
 */

import { NextAuthOptions } from 'next-auth';
import type { User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { ENV } from './env';
import { checkRateLimit, resetRateLimit } from './rate-limit';
import { authenticateCustomer } from './shopify/auth';

/**
 * Nettoie une chaîne pour l'utiliser dans les cookies HTTP
 * Remplace les caractères Unicode problématiques par des équivalents ASCII
 */
function sanitizeForCookie(value: string | null | undefined): string {
  if (!value) return '';
  
  // Remplacer les caractères Unicode problématiques par des équivalents ASCII
  return value
    .replace(/—/g, '-')  // Em dash (8211) → tiret
    .replace(/–/g, '-')  // En dash (8212) → tiret
    .replace(/"/g, "'")  // Guillemets courbes → apostrophe
    .replace(/"/g, "'")  // Guillemets courbes → apostrophe
    .replace(/''/g, "'") // Guillemets simples courbes → apostrophe
    .replace(/''/g, "'") // Guillemets simples courbes → apostrophe
    .replace(/…/g, '...') // Points de suspension → trois points
    .replace(/[^\x00-\x7F]/g, ''); // Supprimer tous les autres caractères non-ASCII
}

export const authOptions: NextAuthOptions = {
  // Plus d'adapter Prisma - on utilise uniquement JWT strategy avec Shopify Customer Accounts
  // adapter: PrismaAdapter(db), // SUPPRIMÉ - migration vers Shopify Customer Accounts
  
  // Configuration de l'URL de l'API route
  pages: {
    signIn: '/account',
    error: '/account',
  },
  
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase();
        
        // Vérifier le rate limiting (max 5 tentatives par email toutes les 15 minutes)
        const rateLimit = await checkRateLimit(`login:${email}`, 5, 15 * 60 * 1000);
        
        if (!rateLimit.allowed) {
          const resetMinutes = Math.ceil((rateLimit.resetAt - Date.now()) / (60 * 1000));
          console.warn(`⚠️ Rate limit dépassé pour ${email}. Réessayez dans ${resetMinutes} minutes.`);
          throw new Error(`Trop de tentatives de connexion. Réessayez dans ${resetMinutes} minutes.`);
        }

        try {
          // Authentifier via Shopify Customer Account API
          const authResult = await authenticateCustomer(email, credentials.password);

          if (!authResult.success || !authResult.customer || !authResult.accessToken) {
            // Mot de passe incorrect ou erreur d'authentification
            return null;
          }

          // Connexion réussie : réinitialiser le rate limit
          await resetRateLimit(`login:${email}`);

          // Retourner les informations utilisateur depuis Shopify
          const customer = authResult.customer;
          return {
            id: customer.id, // ID Shopify
            email: customer.email,
            name: sanitizeForCookie(
              customer.firstName && customer.lastName
                ? `${customer.firstName} ${customer.lastName}`
                : customer.firstName || customer.lastName || null
            ),
            avatar: null, // Pas d'avatar dans Customer Account API par défaut
            role: 'CUSTOMER' as const,
            emailVerified: customer.createdAt ? new Date(customer.createdAt) : null,
            // Stocker le token d'accès Shopify dans le token JWT
            shopifyAccessToken: authResult.accessToken.accessToken,
            shopifyCustomerId: customer.id,
          };
        } catch (error) {
          console.error('❌ Erreur authentification:', error);
          
          // Si c'est une erreur de rate limit, la propager
          if (error instanceof Error && error.message.includes('Trop de tentatives')) {
            throw error;
          }
          
          return null;
        }
      }
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  jwt: {
    secret: ENV.NEXTAUTH_SECRET,
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.role = user.role;
        token.avatar = user.avatar;
        // Nettoyer le nom pour éviter les erreurs ByteString dans les cookies
        if (user.name) {
          token.name = sanitizeForCookie(user.name);
        }
        // Stocker les informations Shopify
        if ((user as any).shopifyAccessToken) {
          token.shopifyAccessToken = (user as any).shopifyAccessToken;
        }
        if ((user as any).shopifyCustomerId) {
          token.shopifyCustomerId = (user as any).shopifyCustomerId;
        }
        // emailVerified depuis Shopify
        if (user.emailVerified) {
          token.emailVerified = user.emailVerified;
        }
      }
      
      // Rafraîchir les données client depuis Shopify si nécessaire
      // (optionnel, pour s'assurer que les données sont à jour)
      
      return token;
    },

    async session({ session, token }) {
      if (token) {
        // Utiliser shopifyCustomerId comme ID principal
        session.user.id = (token.shopifyCustomerId as string) || token.sub!;
        session.user.role = token.role as 'CUSTOMER' | 'ADMIN';
        session.user.avatar = token.avatar as string;
        // S'assurer que le nom est nettoyé
        if (token.name) {
          session.user.name = sanitizeForCookie(token.name as string);
        }
        // emailVerified depuis le token
        if (token.emailVerified) {
          session.user.emailVerified = token.emailVerified as Date | null;
        }
        // Ajouter shopifyCustomerId à la session pour utilisation dans les routes API
        (session.user as any).shopifyCustomerId = token.shopifyCustomerId;
        (session.user as any).shopifyAccessToken = token.shopifyAccessToken;
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      // Permettre la connexion pour tous les utilisateurs
      return true;
    },
  },

  secret: ENV.NEXTAUTH_SECRET,
  debug: ENV.NODE_ENV === 'development',
};
