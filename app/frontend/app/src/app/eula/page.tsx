import { join } from 'path';
import { Metadata } from 'next';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { readFileWithUnicode } from '@/app/src/lib/utils/formatters.server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/Breadcrumb';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contrat de Licence Utilisateur Final (CLUF/EULA) - JOLANANAS',
  description: 'Contrat de Licence Utilisateur Final (CLUF) pour l\'application web, la PWA et les APIs JOLANANAS. Conditions d\'utilisation du logiciel et restrictions de licence.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Contrat de Licence Utilisateur Final (CLUF/EULA) - JOLANANAS',
    description: 'Conditions de licence pour l\'utilisation du logiciel JOLANANAS',
    type: 'website',
  },
};

export default async function EULAPage() {
  // Lire le fichier Markdown depuis public/assets/documents/
  // process.cwd() pointe vers app/frontend/, donc on utilise le chemin relatif depuis public/
  // readFileWithUnicode utilise automatiquement resolveUnicodePath() en interne pour gérer les caractères Unicode
  const filePath = join(process.cwd(), 'public/assets/documents/CLUF — JOLANANAS.md');
  
  let fileContent: string;
  try {
    fileContent = await readFileWithUnicode(filePath);
  } catch (error) {
    console.error('❌ Erreur lors de la lecture du fichier CLUF:', error);
    throw new Error('Impossible de charger le Contrat de Licence Utilisateur Final. Veuillez réessayer plus tard.');
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
              <BreadcrumbPage>CLUF/EULA</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="font-serif text-4xl font-bold tracking-tight md:text-5xl text-balance">
                Contrat de Licence Utilisateur Final
              </CardTitle>
              <Badge variant="secondary">Document officiel</Badge>
            </div>
            <CardDescription className="text-lg text-pretty leading-relaxed">
              Conditions de licence pour l'application web, la PWA et les APIs JOLANANAS
            </CardDescription>
            <div className="text-sm text-muted-foreground">
              <p>CLUF (Contrat de Licence Utilisateur Final) / EULA (End-User License Agreement)</p>
            </div>
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


