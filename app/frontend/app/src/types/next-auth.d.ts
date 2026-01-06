/**
 * 🍍 JOLANANAS - Types NextAuth étendus
 * ======================================
 * Déclaration des types NextAuth personnalisés
 */

import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      avatar?: string | null;
      role: 'CUSTOMER' | 'ADMIN';
      image?: string | null;
      emailVerified?: Date | null;
      shopifyCustomerId?: string;
      shopifyAccessToken?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    avatar?: string | null;
    role: 'CUSTOMER' | 'ADMIN';
    password?: string | null;
    emailVerified?: Date | null;
    shopifyCustomerId?: string;
    shopifyAccessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'CUSTOMER' | 'ADMIN';
    avatar?: string | null;
    emailVerified?: Date | null;
    shopifyCustomerId?: string;
    shopifyAccessToken?: string;
  }
}
