import { NextAuthOptions } from 'next-auth';
import type { User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { ENV } from "@/lib/env";
import { checkRateLimit, resetRateLimit } from './rate-limit';
import { authenticateCustomer } from './shopify/auth';
import { getCustomerFrontend } from './shopify/customer-accounts';

/**
 * Obtient le domaine Customer Account pour les endpoints OAuth
 * 
 * Priorité :
 * 1. Variable d'environnement SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN (si définie)
 * 2. Dérivation depuis DOMAIN_URL (si défini, extrait le domaine principal)
 * 3. Dérivation depuis SHOPIFY_STORE_DOMAIN (extrait le domaine principal)
 * 
 * Le domaine Customer Account est généralement au format: account.{domaine-principal}.com
 */
function getCustomerAccountDomain(): string {
  // 1. Variable d'environnement explicite (priorité la plus haute)
  if (ENV.SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN) {
    return ENV.SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN;
  }

  // 2. Dériver depuis DOMAIN_URL si disponible
  if (ENV.DOMAIN_URL) {
    try {
      const url = new URL(ENV.DOMAIN_URL);
      const hostname = url.hostname;
      // Extraire le domaine principal (ex: jolananas.com depuis https://jolananas.com)
      const domainParts = hostname.split('.');
      if (domainParts.length >= 2) {
        // Prendre les 2 dernières parties (ex: jolananas.com)
        const mainDomain = domainParts.slice(-2).join('.');
        return `account.${mainDomain}`;
      }
    } catch {
      // Ignorer les erreurs de parsing URL
    }
  }

  // 3. Dériver depuis SHOPIFY_STORE_DOMAIN
  const storeDomain = ENV.SHOPIFY_STORE_DOMAIN;
  if (storeDomain && storeDomain.includes('.myshopify.com')) {
    // Extraire le nom de la boutique (ex: u6ydbb-sx depuis u6ydbb-sx.myshopify.com)
    const shopName = storeDomain.replace('.myshopify.com', '');
    
    // Si le domaine principal est connu (jolananas), l'utiliser
    // Sinon, utiliser le format account.{shop-name}.myshopify.com
    // Note: En production, Shopify utilise généralement un domaine personnalisé
    // Pour JOLANANAS, le domaine principal est jolananas.com
    return 'account.jolananas.com';
  }

  // Fallback: Si aucune configuration n'est disponible, lancer une erreur
  // plutôt que d'utiliser une valeur hardcodée
  throw new Error(
    'SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN non configuré. ' +
    'Définissez SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN dans .env.local ou ' +
    'configurez DOMAIN_URL pour dériver automatiquement le domaine Customer Account.'
  );
}

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
    // Provider OAuth pour Shopify Customer Account API (account.jolananas.com)
    // Utilisé si CLIENT_ID et CLIENT_SECRET sont configurés
    ...(ENV.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID && ENV.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET
      ? [
          {
            id: 'shopify',
            name: 'Shopify',
            type: 'oauth' as const,
            clientId: ENV.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID,
            clientSecret: ENV.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET,
            authorization: {
              url: `https://${getCustomerAccountDomain()}/auth/oauth/authorize`,
              params: {
                scope: 'openid email customer-account-api:full',
                response_type: 'code',
              },
            },
            token: {
              url: `https://${getCustomerAccountDomain()}/auth/oauth/token`,
            },
            userinfo: {
              url: `https://${getCustomerAccountDomain()}/api/customer-account/v1/customer`,
              async request(context: any) {
                // Utiliser GraphQL pour récupérer les informations client
                const clientId = ENV.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID!;
                const accessToken = context.tokens.access_token as string;
                
                if (!accessToken) {
                  throw new Error('Access token manquant');
                }

                // Récupérer les informations client via GraphQL
                const customerResult = await getCustomerFrontend(accessToken, clientId);
                
                if (customerResult.errors.length > 0 || !customerResult.customer) {
                  throw new Error(customerResult.errors[0]?.message || 'Erreur récupération client');
                }

                const customer = customerResult.customer;
                return {
                  sub: customer.id,
                  email: customer.email,
                  name: customer.firstName && customer.lastName
                    ? `${customer.firstName} ${customer.lastName}`
                    : customer.firstName || customer.lastName || undefined,
                  picture: undefined,
                };
              },
            },
            profile(profile: any) {
              return {
                id: profile.sub,
                email: profile.email,
                name: profile.name || undefined,
                image: profile.picture || undefined,
                role: 'CUSTOMER' as const,
              };
            },
          },
        ]
      : []),
    // Fallback: CredentialsProvider si OAuth n'est pas configuré
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
            phone: customer.phone || null,
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
      // Gérer le flux OAuth (Shopify Customer Account API)
      if (account?.provider === 'shopify' && account.access_token) {
        token.shopifyAccessToken = account.access_token as string;
        token.shopifyCustomerId = user.id;
        token.role = 'CUSTOMER' as const;
        token.avatar = user.image || null;
        if (user.name) {
          token.name = sanitizeForCookie(user.name);
        }
        if (user.email) {
          token.email = user.email;
        }
        if ((user as any).phone) {
          token.phone = (user as any).phone;
        }
        // emailVerified peut être défini si disponible
        if ((user as any).emailVerified) {
          token.emailVerified = (user as any).emailVerified;
        }
        return token;
      }

      // Gérer le flux Credentials (fallback)
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
        if ((user as any).phone) {
          token.phone = (user as any).phone;
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
        if (token.phone) {
          (session.user as any).phone = token.phone;
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
