export type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

export type NormalizedMoney = {
  amount: number;
  currencyCode: string;
  symbol: string;
  formatted: string;
};

/**
 * Mapping "maison" pour overrides ou devises non bien gérées
 * par Intl.NumberFormat, + conventions type Shopify (CA$, A$, etc.)
 */
const HARDCODED_SYMBOLS: Record<string, string> = {
  // Principales devises
  AUD: 'A$',   // Dollar australien
  CAD: 'CA$',  // Dollar canadien
  CHF: 'CHF',  // Franc suisse
  CNY: '¥',    // Yuan chinois
  EUR: '€',    // Euro
  GBP: '£',    // Livre sterling
  JPY: '¥',    // Yen japonais
  NZD: 'NZ$',  // Dollar néo-zélandais
  SEK: 'kr',   // Couronne suédoise
  NOK: 'kr',   // Couronne norvégienne
  DKK: 'kr',   // Couronne danoise
  USD: '$',    // Dollar US

  // Amériques
  ARS: '$',    // Peso argentin
  BRL: 'R$',   // Réal brésilien
  CLP: '$',    // Peso chilien
  COP: '$',    // Peso colombien
  MXN: '$',    // Peso mexicain
  PEN: 'S/',   // Sol péruvien

  // Europe
  CZK: 'Kč',   // Couronne tchèque
  HUF: 'Ft',   // Forint hongrois
  PLN: 'zł',   // Zloty polonais
  RON: 'lei',  // Leu roumain

  // Asie / Moyen-Orient
  HKD: 'HK$',  // Dollar HK
  IDR: 'Rp',   // Roupie indonésienne
  ILS: '₪',    // Nouveau shekel israélien
  INR: '₹',    // Roupie indienne
  KRW: '₩',    // Won sud-coréen
  MYR: 'RM',   // Ringgit malaisien
  PHP: '₱',    // Peso philippin
  SGD: 'S$',   // Dollar de Singapour
  THB: '฿',    // Baht thaïlandais
  TRY: '₺',    // Livre turque
  AED: 'د.إ',  // Dirham des EAU
  SAR: '﷼',   // Riyal saoudien
  QAR: '﷼',   // Riyal qatarien
  KWD: 'د.ك',  // Dinar koweïtien

  // Afrique
  ZAR: 'R',    // Rand sud-africain
  NGN: '₦',    // Naira nigérian
  EGP: '£',    // Livre égyptienne

  // Autres exemples courants
  RUB: '₽',    // Rouble russe
};

/**
 * Mapping pays -> devise par défaut, utilisé pour choisir la devise
 * "intelligemment" en fonction de l'IP (via countryCode).
 */
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // Europe
  FR: 'EUR',
  DE: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  PT: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  LU: 'EUR',
  IE: 'EUR',
  AT: 'EUR',
  FI: 'EUR',
  GR: 'EUR',

  // Nordics
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',

  // UK
  GB: 'GBP',

  // Amérique du Nord
  US: 'USD',
  CA: 'CAD',

  // Océanie
  AU: 'AUD',
  NZ: 'NZD',

  // Amérique latine
  BR: 'BRL',
  MX: 'MXN',
  AR: 'ARS',
  CL: 'CLP',
  CO: 'COP',
  PE: 'PEN',

  // Moyen-Orient / Afrique / Asie (exemples)
  AE: 'AED',
  SA: 'SAR',
  QA: 'QAR',
  KW: 'KWD',
  ZA: 'ZAR',
  NG: 'NGN',
  IN: 'INR',
  JP: 'JPY',
  CN: 'CNY',
  HK: 'HKD',
  SG: 'SGD',
};

/**
 * Récupère le symbole d'une devise, façon Shopify, mais 100% future-proof :
 * 1. Essaie Intl.NumberFormat pour extraire le symbole de la plateforme
 * 2. Fallback sur un mapping hardcodé "Shopify-like"
 * 3. Fallback ultime : renvoie le code devise
 */
export function getCurrencySymbol(currencyCode: string, locale: string = 'en'): string {
  if (!currencyCode) return '';
  const code = currencyCode.toUpperCase();

  // 1. Mapping maison prioritaire (permet d'imposer CA$, A$, etc.)
  if (HARDCODED_SYMBOLS[code]) {
    return HARDCODED_SYMBOLS[code];
  }

  // 2. Tentative via Intl.NumberFormat pour être “future proof”
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      currencyDisplay: 'symbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    // On formate une valeur fictive pour extraire le symbole
    const parts = formatter.formatToParts(1);
    const symbolPart = parts.find((p) => p.type === 'currency');
    if (symbolPart && symbolPart.value) {
      return symbolPart.value;
    }
  } catch {
    // Si Intl ne connaît pas la devise ou crash, on ignore
  }

  // 3. Fallback final : renvoyer le code lui-même
  return code;
}

/**
 * Normalise un objet monnaie Shopify -> ton format local
 * avec symbole et prix formaté, façon Shopify.
 */
export function mapShopifyCurrencyFromApi(
  money: ShopifyMoney,
  locale: string = 'en'
): NormalizedMoney {
  const code = money.currencyCode.toUpperCase();
  const amount = Number(money.amount);
  const symbol = getCurrencySymbol(code, locale);

  // Formatage façon Shopify (prix avec symbole)
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
  });

  const formatted = formatter.format(amount);

  return {
    amount,
    currencyCode: code,
    symbol,
    formatted,
  };
}

/**
 * Devise "intelligente" en fonction du code pays (souvent issu d'un lookup IP).
 */
export function getCurrencyFromCountry(
  countryCode: string | null | undefined,
  defaultCurrency: string = 'USD'
): string {
  if (!countryCode) return defaultCurrency;
  const code = countryCode.toUpperCase();
  return COUNTRY_TO_CURRENCY[code] ?? defaultCurrency;
}

/**
 * Helper complet : à partir de l’IP (ou du countryCode déjà résolu),
 * renvoie monnaie normalisée + symbole, façon Shopify.
 */
export function getShopifyStyleMoneyForIp(
  amount: number,
  countryCode: string | null | undefined,
  locale: string = 'en',
  fallbackCurrency: string = 'USD'
): NormalizedMoney {
  const currencyCode = getCurrencyFromCountry(countryCode, fallbackCurrency);
  const money: ShopifyMoney = {
    amount: amount.toFixed(2),
    currencyCode,
  };
  return mapShopifyCurrencyFromApi(money, locale);
}
