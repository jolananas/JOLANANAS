import { getAllProducts, getCollectionByHandle } from "@/app/src/lib/shopify/index"
import { CollectionPageClient } from "@/app/src/components/pages/CollectionPageClient"

interface CollectionPageProps {
  params: {
    handle: string
  }
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { handle } = await params

  return <CollectionPageClient handle={handle} />
}

// Generate static params for all collections - Utilise les vraies données Shopify
export async function generateStaticParams() {
  try {
    // Récupérer les collections réelles depuis Shopify
    const products = await getAllProducts()
    const collectionsSet = new Set<string>()
    
    products.forEach(product => {
      product.collections.forEach(collection => {
        collectionsSet.add(collection)
      })
    })
    
    return Array.from(collectionsSet).map((handle) => ({
      handle,
    }))
  } catch (error) {
    console.error('❌ Erreur lors de la génération des paramètres statiques:', error)
    // Retourner un tableau vide en cas d'erreur (pas de données mockées)
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CollectionPageProps) {
  const { handle } = await params
  
  // Récupérer les métadonnées réelles depuis Shopify
  const shopifyCollection = await getCollectionByHandle(handle)

  if (!shopifyCollection) {
    return {
      title: 'Collection non trouvée - JOLANANAS',
      description: 'Cette collection n\'existe pas dans notre catalogue.'
    }
  }

  return {
    title: `${shopifyCollection.title} - JOLANANAS`,
    description: shopifyCollection.description || `Découvrez notre collection ${shopifyCollection.title}`,
    openGraph: {
      title: shopifyCollection.title,
      description: shopifyCollection.description || `Découvrez notre collection ${shopifyCollection.title}`,
    },
  }
}

