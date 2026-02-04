import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dictionnaire de la Joaillerie | JOLANANAS",
  description:
    "Tout savoir sur les métaux précieux, les pierres et l'entretien de vos bijoux.",
};

const TERMS = [
  {
    slug: "quest-ce-que-le-vermeil",
    title: "Qu'est-ce que le Vermeil ?",
    description:
      "Comprendre la différence entre plaqué or et vermeil véritable.",
    category: "Matières",
  },
  {
    slug: "nettoyer-bijoux-argent",
    title: "Comment nettoyer ses bijoux en argent ?",
    description: "Les astuces de grand-mère pour redonner de l'éclat.",
    category: "Entretien",
  },
  {
    slug: "tendance-stacking",
    title: "La tendance Stacking expliquée",
    description: "L'art d'accumuler les bagues et colliers sans faute de goût.",
    category: "Style",
  },
];

export default function DictionaryPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-4xl">
      <header className="mb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
          LE DICTIONNAIRE.
        </h1>
        <p className="text-xl text-muted-foreground font-serif italic">
          L'encyclopédie du style et de la matière selon JOLANANAS.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {TERMS.map((term) => (
          <Link
            key={term.slug}
            href={`/editorials/dictionnaire/${term.slug}`}
            className="group block p-8 border border-black/5 rounded-2xl bg-white/50 hover:bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              {term.category}
            </div>
            <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
              {term.title}
            </h2>
            <p className="text-muted-foreground">{term.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
