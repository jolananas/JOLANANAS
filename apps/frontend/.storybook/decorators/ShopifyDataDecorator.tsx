export const MOCK_PRODUCT = {
  id: 'gid://shopify/Product/1234567890',
  handle: 'mock-product-handle',
  title: 'JOLANANAS Mock Product',
  description: 'This is a mock product description for Storybook testing. It mimics the structure of real Shopify data.',
  availableForSale: true,
  price: 29.99,
  compareAtPrice: 39.99,
  currency: 'EUR',
  images: {
    edges: [
      {
        node: {
          url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
          altText: 'Mock Product Image'
        }
      }
    ]
  },
  featuredImage: {
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    altText: 'Mock Product Image'
  },
  priceRange: {
    minVariantPrice: {
      amount: '29.99',
      currencyCode: 'EUR'
    }
  },
  variants: {
    edges: [
      {
        node: {
          id: 'gid://shopify/ProductVariant/1234567890',
          title: 'Default Title',
          availableForSale: true,
          price: {
            amount: '29.99',
            currencyCode: 'EUR'
          },
          compareAtPrice: {
            amount: '39.99',
            currencyCode: 'EUR'
          },
          selectedOptions: [{ name: 'Title', value: 'Default Title' }]
        }
      }
    ]
  },
  addedAt: new Date().toISOString(),
  collections: ['gid://shopify/Collection/1234567890'],
  tags: ['mock', 'storybook']
};

export const withShopifyData = (Story: any) => {
  return (
    <div data-testid="shopify-data-decorator-mock">
      <Story />
    </div>
  );
};

export const useShopifyContext = () => {
  return {
    products: [MOCK_PRODUCT],
    realShopifyData: {
      hasProducts: true,
      productsCount: 1,
      lastUpdated: 'Mock Data'
    }
  };
};

export default withShopifyData;
