import { getProductByHandle, getAllProducts } from "@/app/src/lib/shopify/index"
import { ProductPageClient } from "@/app/src/components/pages/ProductPageClient"

interface ProductPageProps {
  params: {
    handle: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params

  return <ProductPageClient handle={handle} />
}

// Generate static params for all products
export async function generateStaticParams() {
  const products = await getAllProducts()
  return products.map((product) => ({
    handle: product.handle,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps) {
  const { handle } = await params
  const product = await getProductByHandle(handle)

  if (!product) {
    return {
      title: 'Produit non trouvé',
      description: 'Ce produit n\'existe pas dans notre catalogue.'
    }
  }

  return {
    title: `${product.title} - JOLANANAS`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.images,
    },
  }
}

