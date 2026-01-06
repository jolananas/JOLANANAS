/**
 * 🍍 JOLANANAS - API Upload Avatar Utilisateur
 * ============================================
 * Endpoint pour uploader et gérer l'avatar de l'utilisateur
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/src/lib/auth';
import { db } from '@/app/src/lib/db';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * POST /api/user/avatar
 * Upload un nouvel avatar
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Format de fichier non supporté. Utilisez JPG, PNG ou WebP.' },
        { status: 400 }
      );
    }

    // Vérifier la taille
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Fichier trop volumineux. Taille maximum: 2MB.' },
        { status: 400 }
      );
    }

    // Créer le dossier avatars s'il n'existe pas
    const avatarsDir = join(process.cwd(), 'public', 'avatars');
    if (!existsSync(avatarsDir)) {
      await mkdir(avatarsDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${session.user.shopifyCustomerId}-${Date.now()}.${fileExtension}`;
    const filePath = join(avatarsDir, fileName);

    // Convertir le fichier en buffer et l'écrire
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // URL de l'avatar
    const avatarUrl = `/avatars/${fileName}`;

    // Note: L'avatar est stocké localement mais n'est plus lié à un User dans la DB
    // L'avatar peut être utilisé via l'URL retournée, mais n'est pas synchronisé avec Shopify
    // Pour synchroniser avec Shopify, utiliser Metafields ou Admin API

    return NextResponse.json({
      success: true,
      message: 'Avatar mis à jour avec succès',
      avatar: avatarUrl,
      user: {
        id: session.user.shopifyCustomerId,
        email: session.user.email,
        name: session.user.name,
        avatar: avatarUrl,
        role: session.user.role,
      },
    });

  } catch (error: unknown) {
    console.error('❌ Erreur upload avatar:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Une erreur est survenue lors de l\'upload de l\'avatar',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Une erreur est survenue lors de l\'upload de l\'avatar' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/avatar
 * Supprime l'avatar de l'utilisateur
 */
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true },
    });

    // Supprimer le fichier si il existe
    if (user?.avatar && user.avatar.startsWith('/avatars/')) {
      const filePath = join(process.cwd(), 'public', user.avatar);
      if (existsSync(filePath)) {
        try {
          await unlink(filePath);
        } catch (err) {
          console.warn('⚠️ Impossible de supprimer l\'avatar:', err);
        }
      }
    }

    // Mettre à jour la base de données
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        avatar: null,
        image: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Avatar supprimé avec succès',
      user: updatedUser,
    });

  } catch (error: unknown) {
    console.error('❌ Erreur suppression avatar:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Une erreur est survenue lors de la suppression de l\'avatar',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Une erreur est survenue lors de la suppression de l\'avatar' 
      },
      { status: 500 }
    );
  }
}

