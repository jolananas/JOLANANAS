#!/bin/bash

# Script pour mettre à jour tous les imports après renommage en PascalCase

echo "Mise à jour des imports..."

# Composants racine
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/add-to-cart-button|@/components/AddToCartButton|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ai-chatbot-wrapper|@/components/AiChatbotWrapper|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ai-chatbot|@/components/AiChatbot|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/cart-sheet|@/components/CartSheet|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/hero-section|@/components/HeroSection|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/product-card|@/components/ProductCard|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/product-filters|@/components/ProductFilters|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/product-grid|@/components/ProductGrid|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/product-image-gallery|@/components/ProductImageGallery|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/product-info|@/components/ProductInfo|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/search-dialog|@/components/SearchDialog|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/theme-provider|@/components/ThemeProvider|g' {} +

# Composants UI
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/accordion|@/components/ui/Accordion|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/alert-dialog|@/components/ui/AlertDialog|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/alert|@/components/ui/Alert|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/aspect-ratio|@/components/ui/AspectRatio|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/avatar|@/components/ui/Avatar|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/badge|@/components/ui/Badge|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/breadcrumb|@/components/ui/Breadcrumb|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/button-group|@/components/ui/ButtonGroup|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/calendar|@/components/ui/Calendar|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/card|@/components/ui/Card|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/carousel|@/components/ui/Carousel|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/chart|@/components/ui/Chart|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/checkbox|@/components/ui/Checkbox|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/collapsible|@/components/ui/Collapsible|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/command|@/components/ui/Command|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/context-menu|@/components/ui/ContextMenu|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/dialog|@/components/ui/Dialog|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/drawer|@/components/ui/Drawer|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/dropdown-menu|@/components/ui/DropdownMenu|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/empty|@/components/ui/Empty|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/field|@/components/ui/Field|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/form|@/components/ui/Form|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/hover-card|@/components/ui/HoverCard|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/input-group|@/components/ui/InputGroup|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/input-otp|@/components/ui/InputOtp|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/input|@/components/ui/Input|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/item|@/components/ui/Item|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/kbd|@/components/ui/Kbd|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/label|@/components/ui/Label|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/menubar|@/components/ui/Menubar|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/navigation-menu|@/components/ui/NavigationMenu|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/pagination|@/components/ui/Pagination|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/popover|@/components/ui/Popover|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/progress|@/components/ui/Progress|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/radio-group|@/components/ui/RadioGroup|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/resizable|@/components/ui/Resizable|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/scroll-area|@/components/ui/ScrollArea|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/select|@/components/ui/Select|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/separator|@/components/ui/Separator|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/sheet|@/components/ui/Sheet|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/sidebar|@/components/ui/Sidebar|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/skeleton|@/components/ui/Skeleton|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/slider|@/components/ui/Slider|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/sonner|@/components/ui/Sonner|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/spinner|@/components/ui/Spinner|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/switch|@/components/ui/Switch|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/table|@/components/ui/Table|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/tabs|@/components/ui/Tabs|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/textarea|@/components/ui/Textarea|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/toast|@/components/ui/Toast|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/toaster|@/components/ui/Toaster|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/toggle-group|@/components/ui/ToggleGroup|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/toggle|@/components/ui/Toggle|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/tooltip|@/components/ui/Tooltip|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/use-mobile|@/components/ui/UseMobile|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/ui/use-toast|@/components/ui/UseToast|g' {} +

# Hooks
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/hooks/use-mobile|@/hooks/UseMobile|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/hooks/use-toast|@/hooks/UseToast|g' {} +

# Lib
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/lib/cart-context|@/lib/CartContext|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/lib/shopify-admin-client|@/lib/ShopifyAdminClient|g' {} +
find app/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/lib/shopify-storefront-client|@/lib/ShopifyStorefrontClient|g' {} +

echo "Mise à jour des imports terminée!"
