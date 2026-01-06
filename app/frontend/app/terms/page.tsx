import { join } from 'path';
import { Metadata } from 'next';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { readFileWithUnicode } from '@/app/src/lib/utils/formatters.server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/Breadcrumb';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation (CGU) - JOLANANAS',
  description: 'Conditions générales d\'utilisation du site JOLANANAS. Règles et conditions d\'accès et d\'utilisation de notre plateforme e-commerce.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Conditions Générales d\'Utilisation (CGU) - JOLANANAS',
    description: 'Conditions générales d\'utilisation du site JOLANANAS',
    type: 'website',
  },
};

export default async function TermsPage() {
  // Lire le fichier Markdown depuis public/assets/documents/
  // process.cwd() pointe vers app/frontend/, donc on utilise le chemin relatif depuis public/
  // readFileWithUnicode utilise automatiquement resolveUnicodePath() en interne pour gérer les caractères Unicode
  const filePath = join(process.cwd(), 'public/assets/documents/CGU — JOLANANAS.md');
  
  let fileContent: string;
  try {
    fileContent = await readFileWithUnicode(filePath);
  } catch (error) {
    console.error('❌ Erreur lors de la lecture du fichier CGU:', error);
    throw new Error('Impossible de charger les Conditions Générales d\'Utilisation. Veuillez réessayer plus tard.');
  }

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
              <BreadcrumbPage>CGU</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="font-serif text-4xl font-bold tracking-tight md:text-5xl text-balance">
                Conditions Générales d'Utilisation
              </CardTitle>
              <Badge variant="secondary">Document officiel</Badge>
            </div>
            <CardDescription className="text-lg text-pretty leading-relaxed">
              Règles et conditions d'utilisation du site JOLANANAS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Card className="p-6 md:p-8">
              <MarkdownContent content={fileContent} />
            </Card>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

