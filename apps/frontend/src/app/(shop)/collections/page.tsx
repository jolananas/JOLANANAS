import { getAllCollections } from "@/lib/shopify";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { Footer } from "@/components/layout/Footer";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Nos Collections | JOLANANAS",
  description: "Explorez nos univers de créations artisanales.",
};

export default async function CollectionsIndexPage() {
  const collections = await getAllCollections();

  // On filtre pour ne pas afficher les collections techniques (ex: frontpage) si besoin
  // const filteredCollections = collections.filter(c => c.handle !== 'frontpage')

  return (
    <div className="pt-64 py-32">
      <PageContainer className="bg-[#FEF7F0] min-h-screen rounded-xl md:rounded-2xl lg:rounded-3xl pt-12 pb-24">
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-24">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#4A3C31] mb-6">
            Nos <span className="italic">Collections</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
            Explorez notre univers. Chaque collection raconte une histoire unique, pensée et créée avec passion pour vous offrir des pièces d'exception.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection: any) => (
            <Link
              href={`/collections/${collection.handle}`}
              key={collection.id}
              className="group relative h-[400px] w-full overflow-hidden rounded-xl bg-gray-100 block"
            >
              {/* Image de collection ou Placeholder */}
              {collection.image ? (
                <Image
                  src={collection.image.url}
                  alt={collection.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-secondary/30 flex items-center justify-center text-muted-foreground">
                  Pas d'image
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />

              {/* Titre Centré */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-md transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {collection.title}
                </h2>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 delay-75">
                  <Button className="bg-primary" size="sm">
                    Explorer
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center border-t border-[#4A3C31]/10 pt-12">
          <p className="text-sm md:text-base text-muted-foreground italic font-serif max-w-xl mx-auto">
            "Chaque perle, chaque fil, chaque détail est choisi avec soin pour sublimer votre quotidien."
          </p>
        </div>
      </PageContainer>
    </div>
  );
}
