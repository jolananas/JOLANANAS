/**
 * 🍍 JOLANANAS - Newsletter API Route
 * ====================================
 * Route API pour gérer les inscriptions à la newsletter
 */

import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.NEWSLETTER_FROM_EMAIL || 'newsletter@jolananas.com';
const TO_EMAIL = process.env.NEWSLETTER_TO_EMAIL || 'contact@jolananas.com';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 });
    }

    if (!RESEND_API_KEY) {
      console.log('📧 Newsletter subscription (Resend not configured):', email);
      return NextResponse.json({ success: true, message: 'Inscription enregistrée (mode développement)' });
    }

    const { Resend } = await import('resend');
    const resend = new Resend(RESEND_API_KEY);

    const confirmationEmail = await resend.emails.send({
      from: `JOLANANAS <${FROM_EMAIL}>`,
      to: email,
      subject: '🍍 Bienvenue dans la famille JOLANANAS !',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #FFE5D4 0%, #FFB3D9 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: #8B4513; margin: 0; font-size: 32px;">🍍 JOLANANAS</h1>
            </div>
            <div style="background: #fff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #8B4513; margin-top: 0;">Merci pour votre inscription !</h2>
              <p>Bonjour,</p>
              <p>Nous sommes ravis de vous compter parmi nos abonnés ! 🎉</p>
              <ul style="color: #666;">
                <li>✨ Nos nouvelles créations artisanales</li>
                <li>🎁 Nos offres spéciales et promotions</li>
                <li>💡 Nos conseils d'entretien</li>
              </ul>
              <div style="margin-top: 40px; text-align: center;">
                <a href="https://jolananas.com" style="display: inline-block; background: #FFD700; color: #8B4513; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Découvrir nos créations
                </a>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    try {
      await resend.emails.send({
        from: `JOLANANAS Newsletter <${FROM_EMAIL}>`,
        to: TO_EMAIL,
        subject: `📧 Nouvelle inscription newsletter: ${email}`,
        html: `<p>Email: ${email}</p>`,
      });
    } catch {
      // Ignorer l'erreur de notification interne
    }

    return NextResponse.json({ success: true, message: 'Inscription réussie !', emailId: confirmationEmail?.id });

  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue.' }, { status: 500 });
  }
}
