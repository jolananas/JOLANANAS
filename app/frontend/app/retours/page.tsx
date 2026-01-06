import { join } from 'path';
import { Metadata } from 'next';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { readFileWithUnicode } from '@/app/src/lib/utils/formatters.server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/Breadcrumb';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de Retours et Remboursements - JOLANANAS',
  description: 'Politique de retours et remboursements de JOLANANAS. Découvrez comment retourner un produit et obtenir un remboursement.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Politique de Retours et Remboursements - JOLANANAS',
    description: 'Politique de retours et remboursements de JOLANANAS',
    type: 'website',
  },
};

export default async function RetoursPage() {
  // Normaliser le chemin AVANT de l'utiliser pour éviter les erreurs ByteString dans le cache Next.js
  const fileName = 'Retours et Remboursements — JOLANANAS.md';
  // Remplacer le tiret cadratin par un tiret simple pour les opérations de cache Next.js
  const normalizedFileName = fileName.replace(/—/g, '-');
  const filePath = join(process.cwd(), 'public/assets/documents', normalizedFileName);
  
  let fileContent: string;
  try {
    // readFileWithUnicode gère automatiquement la résolution Unicode en interne
    // mais on normalise d'abord le chemin pour éviter les problèmes de cache Next.js
    fileContent = await readFileWithUnicode(filePath);
  } catch (error) {
    // Si le fichier normalisé n'existe pas, essayer avec le nom original
    try {
      const originalPath = join(process.cwd(), 'public/assets/documents', fileName);
      fileContent = await readFileWithUnicode(originalPath);
    } catch (originalError) {
      console.error('❌ Erreur lors de la lecture du fichier Retours:', error);
      throw new Error('Impossible de charger la Politique de Retours et Remboursements. Veuillez réessayer plus tard.');
    }
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
              <BreadcrumbPage>Retours</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="font-serif text-4xl font-bold tracking-tight md:text-5xl text-balance">
                Retours et Remboursements
              </CardTitle>
              <Badge variant="secondary">Document officiel</Badge>
            </div>
            <CardDescription className="text-lg text-pretty leading-relaxed">
              Comment retourner un produit et obtenir un remboursement
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

