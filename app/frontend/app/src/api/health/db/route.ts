/**
 * 🍍 JOLANANAS - Endpoint de Santé Base de Données
 * ==============================================
 * Vérifie la connexion à la base de données Prisma
 */

import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test simple de connexion à la base de données
    // On fait une requête légère pour vérifier que la connexion fonctionne
    await db.$queryRaw`SELECT 1`
    
    return NextResponse.json(
      { 
        status: 'ok', 
        message: 'Base de données connectée',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error)
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Base de données non disponible',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}

