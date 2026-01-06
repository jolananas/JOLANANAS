/**
 * 🍍 JOLANANAS - Page Contact
 * ============================
 * Page de contact avec formulaire
 */

import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/Breadcrumb';
import Link from 'next/link';
import { ContactForm } from '@/components/contact/ContactForm';
import { Mail, Phone, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact - JOLANANAS',
  description: 'Contactez JOLANANAS pour toute question concernant nos créations artisanales, commandes ou services.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Contact - JOLANANAS',
    description: 'Contactez JOLANANAS pour toute question',
    type: 'website',
  },
};

export default async function ContactPage() {
  return (
    <main className="container py-12 md:py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Accueil</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Contact</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="font-serif text-4xl font-bold tracking-tight md:text-5xl text-balance">
              Contactez-nous
            </CardTitle>
            <CardDescription className="text-lg text-pretty leading-relaxed">
              Une question ? Une demande particulière ? Nous sommes là pour vous aider.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Informations de contact */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Nos coordonnées</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-jolananas-pink-medium mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">Email</p>
                        <a 
                          href="mailto:contact@jolananas.com" 
                          className="text-jolananas-pink-medium hover:underline"
                        >
                          contact@jolananas.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-jolananas-pink-medium mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">Téléphone</p>
                        <a 
                          href="tel:+33673087437" 
                          className="text-jolananas-pink-medium hover:underline"
                        >
                          +33 6 73 08 74 37
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-jolananas-pink-medium mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">Adresse</p>
                        <p className="text-muted-foreground">
                          France
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulaire de contact */}
              <div>
                <ContactForm />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

