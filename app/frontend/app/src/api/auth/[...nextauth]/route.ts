/**
 * 🍍 JOLANANAS - API NextAuth.js
 * ===============================
 * Route handler pour l'authentification NextAuth
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/app/src/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
