
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/lib/shopify/types";

interface LatestArticlesProps {
  articles: Article[];
}

export function LatestArticles({ articles }: LatestArticlesProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <Badge variant="outline" className="px-3 py-1 text-sm border-primary/20 text-primary">
            Journal
          </Badge>
          <h2 className="text-3xl font-serif font-bold tracking-tighter sm:text-4xl md:text-5xl">
            L'Atelier Créatif
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Découvrez nos dernières inspirations, conseils et histoires d'artisans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Card key={article.id} className="group overflow-hidden border-none shadow-none bg-transparent hover:shadow-lg transition-all duration-300 rounded-xl">
              <Link href={`/journal/${article.blog.handle}/${article.handle}`} className="block overflow-hidden rounded-t-xl aspect-[4/3] relative">
                {article.image ? (
                  <Image
                    src={article.image.url}
                    alt={article.image.altText || article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                    Pas d'image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <span className="text-white font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    Lire l'article <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
              <CardContent className="p-6 bg-card border border-border/50 rounded-b-xl group-hover:border-transparent transition-colors">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <span className="uppercase tracking-wider text-xs font-semibold text-primary">
                    {article.blog.title}
                  </span>
                  <span>•</span>
                  <time dateTime={article.publishedAt}>
                    {format(new Date(article.publishedAt), "d MMMM yyyy", { locale: fr })}
                  </time>
                </div>
                <h3 className="font-serif text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
                  <Link href={`/journal/${article.blog.handle}/${article.handle}`}>
                    {article.title}
                  </Link>
                </h3>
                <div 
                  className="text-muted-foreground line-clamp-3 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: article.excerptHtml || article.excerpt || "" }}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" asChild className="rounded-full">
            <Link href="/journal">
              Voir tous les articles
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
