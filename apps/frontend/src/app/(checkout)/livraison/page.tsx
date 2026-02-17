import { join } from "path";
import { Metadata } from "next";
import { MarkdownContent } from "@/components/ui/markdowncontent";
import { readFileWithUnicode } from "@/lib/utils/formatters.server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

export const metadata: Metadata = {
  title: "Politique de Livraison - JOLANANAS",
  description:
    "Politique de livraison de JOLANANAS. Découvrez nos modes de livraison, délais et frais.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Politique de Livraison - JOLANANAS",
    description: "Politique de livraison de JOLANANAS",
    type: "website",
  },
};

export default async function LivraisonPage() {
  const filePath = join(
    process.cwd(),
    "public/assets/documents/Livraison — JOLANANAS.md",
  );

  let fileContent: string;
  try {
    fileContent = await readFileWithUnicode(filePath);
  } catch (error) {
    console.error("❌ Erreur lors de la lecture du fichier Livraison:", error);
    throw new Error(
      "Impossible de charger la Politique de Livraison. Veuillez réessayer plus tard.",
    );
  }

  return (
    <PageContainer className="container py-32 md:py-48">
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
              <BreadcrumbPage>Livraison</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="font-serif text-4xl font-bold tracking-tight md:text-5xl text-balance">
                Politique de Livraison
              </CardTitle>
              <Badge variant="secondary">Document officiel</Badge>
            </div>
            <CardDescription className="text-lg text-pretty leading-relaxed">
              Modes de livraison, délais et frais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Card className="p-6 md:p-8">
              <MarkdownContent content={fileContent} />
            </Card>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
