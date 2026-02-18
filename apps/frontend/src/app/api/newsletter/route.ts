import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialiser Resend avec la clé API
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

const AUDIENCE_ID = process.env.NEWSLETTER_AUDIENCE_ID;
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'noreply@jolananas.com';
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'contact@jolananas.com';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // 1. Validation de l'email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide.' },
        { status: 400 }
      );
    }

    // 2. Tenter d'ajouter à une audience Resend (si ID configuré)
    if (AUDIENCE_ID && process.env.RESEND_API_KEY) {
      try {
        await resend.contacts.create({
          email: email,
          firstName: '',
          lastName: '',
          unsubscribed: false,
          audienceId: AUDIENCE_ID,
        });
      } catch (audienceError) {
        console.warn('Erreur lors de l\'ajout à l\'audience Resend:', audienceError);
        // On continue même si l'ajout à l'audience échoue (peut-être déjà inscrit)
      }
    }

    // 3. Envoyer un email de notification à l'admin (Optionnel mais utile pour le MVP)
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: TO_EMAIL,
          subject: '[JOLANANAS Newsletter] Nouvelle inscription',
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Nouvelle inscription à la newsletter ! 🍍</h2>
              <p>Un nouvel utilisateur souhaite rejoindre le club :</p>
              <p style="font-size: 18px; font-weight: bold; background: #eee; padding: 10px; border-radius: 5px;">
                ${email}
              </p>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                Envoyé depuis le site JOLANANAS.
              </p>
            </div>
          `
        });
      } catch (emailError) {
         console.error('Erreur lors de l\'envoi de la notification:', emailError);
      }
    } else {
        console.log('Simulation inscription newsletter:', email);
    }

    return NextResponse.json(
      { success: true, message: 'Inscription réussie ! Bienvenue dans le club.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur API Newsletter:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'inscription.' },
      { status: 500 }
    );
  }
}
