/**
 * 🍍 JOLANANAS - API Route Contact
 * =================================
 * Route API pour traiter les formulaires de contact
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || process.env.NEWSLETTER_TO_EMAIL || 'contact@jolananas.com';
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'noreply@jolananas.com';

export async function POST(request: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY || 're_fake_key');
    const body: ContactFormData = await request.json();

    // Validation des champs requis
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Les champs nom, email et message sont obligatoires.' },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide.' },
        { status: 400 }
      );
    }

    // Préparer le contenu de l'email
    const emailSubject = body.subject 
      ? `[JOLANANAS Contact] ${body.subject}`
      : '[JOLANANAS Contact] Nouveau message';

    const emailContent = `
Nouveau message de contact depuis le site JOLANANAS

Nom: ${body.name}
Email: ${body.email}
${body.subject ? `Sujet: ${body.subject}` : ''}

Message:
${body.message}

---
Ce message a été envoyé depuis le formulaire de contact du site JOLANANAS.
    `.trim();

    // Envoyer l'email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: TO_EMAIL,
          replyTo: body.email,
          subject: emailSubject,
          text: emailContent,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; border-bottom: 2px solid #e91e63; padding-bottom: 10px;">
                Nouveau message de contact
              </h2>
              <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Nom:</strong> ${body.name}</p>
                <p><strong>Email:</strong> <a href="mailto:${body.email}">${body.email}</a></p>
                ${body.subject ? `<p><strong>Sujet:</strong> ${body.subject}</p>` : ''}
              </div>
              <div style="background: #fff; padding: 20px; border-left: 4px solid #e91e63; margin: 20px 0;">
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${body.message}</p>
              </div>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #999; font-size: 12px;">
                Ce message a été envoyé depuis le formulaire de contact du site JOLANANAS.
              </p>
            </div>
          `,
        });
      } catch (emailError: any) {
        console.error('Erreur lors de l\'envoi de l\'email:', emailError);
        // Ne pas faire échouer la requête si l'email échoue
        // On peut logger l'erreur pour debugging
      }
    } else {
      console.warn('RESEND_API_KEY non configuré. Email non envoyé.');
      console.log('Données du formulaire de contact:', body);
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.' 
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Erreur lors du traitement du formulaire de contact:', error);
    
    return NextResponse.json(
      { 
        error: 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer plus tard.' 
      },
      { status: 500 }
    );
  }
}

