
import { notFound } from "next/navigation";
import { getMetaobjectByHandle, Metaobject } from "@/lib/shopify/metaobjects";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/SEO/JsonLd";
import { baseUrl } from "@/app/shared-metadata";



interface MaterialPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export async function generateMetadata({ params }: MaterialPageProps) {
  try {
    const { handle } = await params;
    const metaobject = await getMetaobjectByHandle("material", handle);
    
    if (!metaobject) {
      return {
        title: "Matériau non trouvé",
      };
    }

    const nameField = metaobject.fields.find((f) => f.key === "name" || f.key === "title" || f.key === "label");
    const descriptionField = metaobject.fields.find((f) => f.key === "description" || f.key === "story" || f.key === "content");
    
    return {
      title: `${nameField?.value} - Jolananas`,
      description: descriptionField?.value,
      alternates: {
        canonical: `${baseUrl}/materials/${handle}`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata for material:", error);
    return {
      title: "Erreur - Jolananas",
    };
  }
}

export default async function MaterialPage({ params }: MaterialPageProps) {
  try {
    const { handle } = await params;
    const metaobject = await getMetaobjectByHandle("material", handle);

    if (!metaobject) {
       notFound();
    }

    // Parse fields for easier access
    const nameField = metaobject.fields.find((f) => f.key === "name" || f.key === "title" || f.key === "label");
    const descriptionField = metaobject.fields.find((f) => f.key === "description" || f.key === "story" || f.key === "content");
    const imageField = metaobject.fields.find((f) => f.key === "image" || f.key === "photo" || f.key === "cover");
    const originField = metaobject.fields.find((f) => f.key === "origin" || f.key === "provenance");
    const propertiesField = metaobject.fields.find((f) => f.key === "properties" || f.key === "features");

    // Get image URL from reference
    const imageUrl = imageField?.reference?.image?.url;
    const imageAlt = imageField?.reference?.image?.altText || nameField?.value || "";

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: nameField?.value,
      description: descriptionField?.value,
      image: imageUrl,
      author: {
        "@type": "Organization",
        name: "JOLANANAS",
      },
    };

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Accueil",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Matériaux",
          item: `${baseUrl}/materials`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: nameField?.value,
          item: `${baseUrl}/materials/${handle}`,
        },
      ],
    };

    return (
      <>
        <JsonLd data={jsonLd} id="material-schema" />
        <JsonLd data={breadcrumbJsonLd} id="breadcrumb-schema" />
        <div className="container py-32 md:py-48">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Pas d'image disponible
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-medium mb-4">
                {nameField?.value}
              </h1>
              {originField && (
                <p className="text-muted-foreground text-lg italic">
                  Origine : {originField.value}
                </p>
              )}
            </div>

            <div className="prose prose-lg text-muted-foreground leading-relaxed">
              {descriptionField?.value}
            </div>

              {propertiesField && (
                <div className="bg-primary/5 p-6 rounded-xl space-y-4">
                  <h3 className="font-serif text-xl font-medium">Propriétés</h3>
                  <p className="text-muted-foreground">{propertiesField.value}</p>
                </div>
              )}
              
              <div className="pt-8 border-t">
                <Button variant="outline" asChild>
                  <Link href="/products">Découvrir les produits</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_NOT_FOUND") {
      throw error;
    }
    console.error("Error rendering material page:", error);
    return (
      <div className="container py-32">
        <div className="text-center">
           <h1 className="text-2xl font-bold">Une erreur est survenue</h1>
           <p className="text-muted-foreground">Impossible de charger ce matériau.</p>
        </div>
      </div>
    );
  }
}
