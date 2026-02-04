import { getCollectionByHandle } from "@/lib/shopify";
import { CollectionPageClient } from "@/components/pages/CollectionPageClient";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  let collection = await getCollectionByHandle(handle);

  if (!collection) {
    const { getProgrammaticCollection } = await import(
      "@/lib/programmatic-seo"
    );
    collection = await getProgrammaticCollection(handle);
  }

  if (!collection) return { title: "Collection introuvable" };

  return {
    title: `${collection.title} | JOLANANAS`,
    description: collection.description,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  let collection = await getCollectionByHandle(handle);

  // Fallback: Programmatic SEO
  if (!collection) {
    const { getProgrammaticCollection } = await import(
      "@/lib/programmatic-seo"
    );
    collection = await getProgrammaticCollection(handle);
  }

  if (!collection) {
    return notFound();
  }

  return <CollectionPageClient collection={collection} />;
}
