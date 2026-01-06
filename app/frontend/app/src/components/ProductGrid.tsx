import { ProductCard } from "@/app/src/components/product-card"
import type { Product } from "@/app/src/lib/shopify/types"

interface ProductGridProps {
  products: Product[]
  title?: string
  description?: string
}

export function ProductGrid({ products, title, description }: ProductGridProps) {
  return (
    <section className="container py-12 md:py-16 lg:py-20">
      {(title || description) && (
        <div className="mb-8 md:mb-12 text-center space-y-2">
          {title && <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl text-balance">{title}</h2>}
          {description && (
            <p className="text-muted-foreground text-pretty leading-relaxed max-w-2xl mx-auto">{description}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun produit disponible pour le moment.</p>
        </div>
      )}
    </section>
  )
}
