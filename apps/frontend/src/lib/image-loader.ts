// Redimensionne les images sans passer par l'optimiseur de Vercel (quota payant).
// Images Shopify : le CDN Shopify redimensionne et convertit gratuitement (paramètre width).
// Images locales : servies telles quelles, le paramètre w ne sert qu'à distinguer les tailles.
export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (src.startsWith("https://cdn.shopify.com/")) {
    // « photo.jpg.webp » (transformation Storefront) ignore width : on revient au fichier d'origine.
    const url = new URL(src.replace(/\.(jpe?g|png|heic|heif)\.webp(?=\?|$)/i, ".$1"));
    url.searchParams.set("width", String(width));
    return url.toString();
  }
  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}w=${width}`;
}
