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
  title: "Politique de Retours et Remboursements - JOLANANAS",
  description:
    "Politique de retours et remboursements de JOLANANAS. Découvrez comment retourner un produit et obtenir un remboursement.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Politique de Retours et Remboursements - JOLANANAS",
    description: "Politique de retours et remboursements de JOLANANAS",
    type: "website",
  },
};

export default async function RetoursPage() {
  const fileName = "Retours et Remboursements — JOLANANAS.md";
  const normalizedFileName = fileName.replace(/—/g, "-");
  const filePath = join(
    process.cwd(),
    "public/assets/documents",
    normalizedFileName,
  );

  let fileContent: string;
  try {
    fileContent = await readFileWithUnicode(filePath);
  } catch (error) {
    try {
      const originalPath = join(
        process.cwd(),
        "public/assets/documents",
        fileName,
      );
      fileContent = await readFileWithUnicode(originalPath);
    } catch (originalError) {
      console.error("❌ Erreur lors de la lecture du fichier Retours:", error);
      throw new Error(
        "Impossible de charger la Politique de Retours et Remboursements. Veuillez réessayer plus tard.",
      );
    }
  }

  return (
    <div className="mx-auto py-32">
      <PageContainer>
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
      </PageContainer>
    </div>
  );
}
