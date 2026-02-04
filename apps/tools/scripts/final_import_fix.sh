#!/bin/bash

echo "Correction finale des imports..."

# Corriger tous les imports restants
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/lib/shopify-storefront-client|@/lib/ShopifyStorefrontClient|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/lib/shopify-admin-client|@/lib/ShopifyAdminClient|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/components/ui/label|@/components/ui/Label|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/components/ui/card|@/components/ui/Card|g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/app/src/components/ui/separator|@/components/ui/Separator|g' {} +

echo "Correction finale terminée!"
