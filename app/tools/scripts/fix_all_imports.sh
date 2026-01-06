#!/bin/bash

echo "Correction complète des imports..."

# Corriger tous les imports dans tous les fichiers
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/components/ui/button|@/components/ui/Button|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/components/ui/sheet|@/components/ui/Sheet|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/components/ui/textarea|@/components/ui/Textarea|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/components/ui/skeleton|@/components/ui/Skeleton|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/components/ui/tooltip|@/components/ui/Tooltip|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/components/ui/toggle|@/components/ui/Toggle|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/components/ui/toast|@/components/ui/Toast|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/components/ui/scroll-area|@/components/ui/ScrollArea|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/components/header|@/components/Header|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/components/footer|@/components/Footer|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/components/search-dialog|@/components/SearchDialog|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/components/cart-sheet|@/components/CartSheet|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/components/ai-chatbot|@/components/AiChatbot|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/components/product-image-gallery|@/components/ProductImageGallery|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/components/product-info|@/components/ProductInfo|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/components/product-grid|@/components/ProductGrid|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/lib/cart-context|@/lib/CartContext|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/hooks/use-mobile|@/hooks/UseMobile|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/hooks/use-toast|@/hooks/UseToast|g' {} +

echo "Correction des imports terminée!"
