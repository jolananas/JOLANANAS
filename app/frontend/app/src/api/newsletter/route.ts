/**
 * 🍍 JOLANANAS - Newsletter API Route
 * ====================================
 * Route API pour gérer les inscriptions à la newsletter
 * Utilise Resend (gratuit jusqu'à 3000 emails/mois)
 */

import { NextRequest, NextResponse } from 'next/server';

// Configuration Resend
// Pour utiliser cette API, vous devez :
// 1. Installer: npm install resend
// 2. Créer un compte sur https://resend.com (gratuit)
// 3. Obtenir votre API key
// 4. Ajouter RESEND_API_KEY dans vos variables d'environnement (.env.local)

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.NEWSLETTER_FROM_EMAIL || 'newsletter@jolananas.com';
const TO_EMAIL = process.env.NEWSLETTER_TO_EMAIL || 'contact@jolananas.com';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validation de l'email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      );
    }

    // Si Resend n'est pas configuré, on peut juste logger l'inscription
    if (!RESEND_API_KEY) {
      console.log('📧 Newsletter subscription (Resend not configured):', email);
      
      // En production, vous devriez avoir Resend configuré
      // Pour le développement, on simule le succès
      return NextResponse.json(
        { 
          success: true, 
          message: 'Inscription enregistrée (mode développement)',
          note: 'Configurez RESEND_API_KEY pour activer l\'envoi d\'emails'
        },
        { status: 200 }
      );
    }

    // Import dynamique de Resend (pour éviter les erreurs si non installé)
    const { Resend } = await import('resend');
    const resend = new Resend(RESEND_API_KEY);

    // Email de confirmation personnalisé pour l'utilisateur
    const confirmationEmail = await resend.emails.send({
      from: `JOLANANAS <${FROM_EMAIL}>`,
      to: email,
      subject: '🍍 Bienvenue dans la famille JOLANANAS !',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bienvenue chez JOLANANAS</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #FFE5D4 0%, #FFB3D9 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: #8B4513; margin: 0; font-size: 32px;">🍍 JOLANANAS</h1>
            </div>
            
            <div style="background: #fff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #8B4513; margin-top: 0;">Merci pour votre inscription !</h2>
              
              <p>Bonjour,</p>
              
              <p>Nous sommes ravis de vous compter parmi nos abonnés ! 🎉</p>
              
              <p>Vous recevrez désormais en exclusivité :</p>
              <ul style="color: #666;">
                <li>✨ Nos nouvelles créations artisanales</li>
                <li>🎁 Nos offres spéciales et promotions</li>
                <li>💡 Nos conseils d'entretien pour préserver vos bijoux</li>
                <li>📰 L'actualité de notre atelier français</li>
              </ul>
              
              <p style="margin-top: 30px;">
                <strong>À très bientôt !</strong><br>
                L'équipe JOLANANAS
              </p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                <a href="https://jolananas.com" style="display: inline-block; background: #FFD700; color: #8B4513; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Découvrir nos créations
                </a>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>Vous recevez cet email car vous vous êtes inscrit à notre newsletter.</p>
              <p><a href="https://jolananas.com/unsubscribe?email=${encodeURIComponent(email)}" style="color: #999;">Se désinscrire</a></p>
            </div>
          </body>
        </html>
      `,
      text: `
        Merci pour votre inscription à la newsletter JOLANANAS !
        
        Vous recevrez désormais en exclusivité :
        - Nos nouvelles créations artisanales
        - Nos offres spéciales et promotions
        - Nos conseils d'entretien
        - L'actualité de notre atelier français
        
        À très bientôt !
        L'équipe JOLANANAS
        
        Découvrir nos créations : https://jolananas.com
      `,
    });

    // Notification interne (optionnel)
    try {
      await resend.emails.send({
        from: `JOLANANAS Newsletter <${FROM_EMAIL}>`,
        to: TO_EMAIL,
        subject: `📧 Nouvelle inscription newsletter: ${email}`,
        html: `
          <p>Nouvelle inscription à la newsletter :</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
        `,
      });
    } catch (notificationError) {
      // On continue même si la notification interne échoue
      console.error('Failed to send internal notification:', notificationError);
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Inscription réussie ! Vérifiez votre boîte mail.',
        emailId: confirmationEmail.id
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    
    // Gestion des erreurs Resend
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Configuration email manquante. Veuillez contacter le support.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer plus tard.' },
      { status: 500 }
    );
  }
}

