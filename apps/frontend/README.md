# JOLANANAS E-Commerce Storefront

A beautiful, modern e-commerce storefront for JOLANANAS - French artisanal brand selling girly accessories. Built with Next.js 14+, TypeScript, Tailwind CSS v4, and integrated with Shopify Storefront API.

## Features

### 🎨 Design System

- **Brand Colors**: Peach (#F4C0AC), Pink (#F38FA3), Rose (#EC7B9C), Coral (#FCA4A4)
- **Typography**: Poppins for headings, Inter for body text
- **Glassmorphism Effects**: Modern glass-style UI elements
- **Fully Responsive**: Mobile-first design with smooth animations

### 🛍️ E-Commerce Features

- **Product Catalog**: Browse all products with beautiful grid layout
- **Product Detail Pages**: Image galleries, pricing, descriptions, and related products
- **Shopping Cart**: Persistent cart with localStorage, quantity controls, and real-time totals
- **Collections**: Filter and sort products by collections and tags
- **Checkout Flow**: Complete checkout page ready for integration

### 🔍 Search Features

- **Smart Search**: Enhanced product search with instant filtering
- **Product Recommendations**: Intelligent product suggestions

### 🔌 Shopify Integration

- **Storefront API**: Full integration with Shopify Storefront GraphQL API
- **Real-time Data**: Fetch products, collections, and manage cart operations
- **Production-Ready**: Uses only real Shopify data - no mock data

## Project Structure

\`\`\`
├── apps/
│ ├── page.tsx # Homepage with hero and product grid
│ ├── products/[handle]/ # Dynamic product detail pages
│ ├── collections/[handle]/ # Collection pages with filtering
│ ├── checkout/ # Checkout page
│ ├── about/ # About page
│ └── api/
│ └── products/ # Products API endpoint
├── components/
│ ├── header.tsx # Navigation header
│ ├── footer.tsx # Site footer
│ ├── hero-section.tsx # Homepage hero
│ ├── product-card.tsx # Product card component
│ ├── product-grid.tsx # Product grid layout
│ ├── product-image-gallery.tsx # Image gallery for product pages
│ ├── product-info.tsx # Product information display
│ ├── add-to-cart-button.tsx # Add to cart functionality
│ ├── cart-sheet.tsx # Sliding cart panel
│ ├── search-dialog.tsx # Search modal
│ ├── product-filters.tsx # Filtering UI
│ └── ui/ # shadcn/ui components
├── lib/
│ ├── shopify/
│ │ ├── index.ts # Main Shopify API functions
│ │ ├── client.ts # GraphQL client
│ │ ├── queries.ts # GraphQL queries
│ │ └── types.ts # TypeScript types
│ ├── cart-context.tsx # Cart state management
│ └── utils.ts # Utility functions
└── public/ # Static assets and product images
\`\`\`

## Getting Started

### Prerequisites

- Node.js 18+
- A Shopify store with Storefront API access

### Environment Variables

To connect to your Shopify store, add these environment variables:

\`\`\`env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=your_storefront_access_token
SHOPIFY_API_VERSION=2026-01
\`\`\`

**Note**: These environment variables are required for the application to function. The app uses only real Shopify data - no mock or fake data is used.

### Installation

The project uses the shadcn CLI for easy setup:

\`\`\`bash

# Install and setup the project

npx shadcn@latest init

# Or download the ZIP and extract

\`\`\`

### Development

\`\`\`bash
npm run dev

# or

yarn dev

# or

pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the storefront.

## Key Technologies

- **Next.js 14+**: App Router, Server Components, Server Actions
- **TypeScript**: Strict mode for type safety
- **Tailwind CSS v4**: Modern utility-first CSS
- **shadcn/ui**: High-quality React components
- **Framer Motion**: Smooth animations
- **Vercel AI SDK**: AI-powered search (optional)
- **Shopify Storefront API**: E-commerce backend

## Pages

### Homepage (`/`)

- Hero section with brand messaging
- Featured products grid

### Product Detail (`/products/[handle]`)

- Image gallery with zoom
- Product information and pricing
- Add to cart functionality
- Related products section

### Collections (`/collections/[handle]`)

- Filtered product views
- Sort by price, name, newest
- Tag-based filtering

### Checkout (`/checkout`)

- Order summary
- Customer information form
- Payment integration ready

### About (`/about`)

- Brand story
- Mission and values
- Contact information

## Cart Management

The cart uses React Context for state management and persists to localStorage:

- Add/remove items
- Update quantities
- Real-time total calculations
- Free shipping threshold (€50)
- Persistent across sessions

## Search Features

### Search

- Instant product filtering
- Smart suggestions
- Search by name, description, or tags

## Customization

### Colors

Edit `apps/globals.css` to customize the brand colors:

\`\`\`css
:root {
--primary: oklch(0.72 0.15 10); /_JOLANANAS Pink _/
--secondary: oklch(0.85 0.08 40); /_ JOLANANAS Peach _/
--accent: oklch(0.68 0.18 15); /_ JOLANANAS Rose_/
}
\`\`\`

### Fonts

Fonts are configured in `apps/layout.tsx`:

- Poppins for headings
- Inter for body text

### Products

All products are fetched directly from your Shopify store via the Storefront API. Ensure your environment variables are properly configured to connect to your store.

## Deployment

### Deploy to Vercel

1. Click the "Publish" button in the v0 interface
2. Connect your GitHub repository
3. Add environment variables in Vercel dashboard
4. Deploy!

The app is optimized for Vercel's Edge Network with:

- Automatic image optimization
- Edge caching
- Analytics integration

## Support

For issues or questions:

- Check the [Next.js documentation](https://nextjs.org/docs)
- Review [Shopify Storefront API docs](https://shopify.dev/docs/api/storefront)
- Visit [shadcn/ui documentation](https://ui.shadcn.com)

## License

This project was created with v0 by Vercel.
