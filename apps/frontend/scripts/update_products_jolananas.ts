import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Simulation de __dirname pour ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement manuellement depuis la racine du projet
const envPath = path.resolve(__dirname, "../.env.local");
console.log(`🔍 Tentative de lecture de .env.local à: ${envPath}`);
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value && !process.env[key.trim()]) {
      process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, "");
    }
  });
}

const DRY_RUN = process.argv.includes("--dry-run");
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.SHOPIFY_ACCESS_TOKEN || process.env.SHOPIFY_STOREFRONT_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION;

if (!TOKEN) {
  console.error("❌ ERREUR: SHOPIFY_STOREFRONT_ACCESS_TOKEN manquant dans .env.local");
  process.exit(1);
}

// --- UTILS ---

// Simplified sanitize function to avoid importing dependencies
function sanitizeStringForByteString(str: string): string {
  if (!str) return "";
  let res = "";
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code > 255) {
      if (code === 8211 || code === 8212) res += "-";
      else if (code === 8230) res += "...";
      else if (code === 8216 || code === 8217) res += "'";
      else if (code === 8220 || code === 8221) res += '"';
      else res += " ";
    } else {
      res += str[i];
    }
  }
  return res;
}

// --- SHOPIFY CLIENT (STANDALONE) ---

class ShopifyScriptClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `https://${DOMAIN}/admin/api/${API_VERSION}`;
    console.log(`✅ Client Shopify initialisé pour ${DOMAIN}`);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data?: T; errors?: any }> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = TOKEN!; // Guaranteed by check above

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": token,
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Erreur API (${response.status}): ${errorText}`);
            return { errors: errorText };
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        console.error("❌ Exception Fetch:", error);
        return { errors: error };
    }
  }

  async findProductByHandle(handle: string): Promise<any | null> {
    const response = await this.request<{ products: any[] }>(`/products.json?handle=${handle}`);
    if (response.data?.products && response.data.products.length > 0) {
      return response.data.products[0];
    }
    return null;
  }

  async updateProduct(productId: number | string, data: any) {
    return this.request(`/products/${productId}.json`, {
        method: "PUT",
        body: JSON.stringify({ product: data })
    });
  }
}

// --- CSV PARSER ---
function parseCSV(filePath: string): any[] {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const rows: any[] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;

  for (let i = 0; i < fileContent.length; i++) {
    const char = fileContent[i];
    const nextChar = fileContent[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"'; 
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentField);
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      currentRow.push(currentField);
      if (currentRow.length > 0 && (currentRow.length > 1 || currentRow[0])) {
          rows.push(currentRow);
      }
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  if (rows.length === 0) return [];
  
  const headers = rows[0];
  const data = rows.slice(1).map((row) => {
    const obj: any = {};
    headers.forEach((header: string, index: number) => {
      obj[header] = row[index];
    });
    return obj;
  });

  return data;
}

// --- TRANSFORMATIONS ---

function cleanTitle(title: string): string {
  if (!title) return "";
  let newTitle = title;
  
  newTitle = newTitle.replace(/\s*x\d+\s*/gi, " ");
  newTitle = newTitle.replace(/\s+-\s+/g, " — ");
  
  return sanitizeStringForByteString(newTitle.trim());
}

function generateDescription(product: any, handle: string): string {
  const type = product["Type"] || "";
  const existingBody = product["Body (HTML)"] || "";
  
  let intro = "";
  
  if (type.toLowerCase().includes("bijoux") || type.toLowerCase().includes("jewelry")) {
    intro = "<p>Façonné pour apporter une touche de lumière.</p>";
  } else if (type.toLowerCase().includes("accessoire")) {
    intro = "<p>Le petit détail qui change tout.</p>";
  } else {
    intro = "<p>Une création originale pour votre collection.</p>";
  }
  
  const atelierSign = "<p><strong>Préparé avec soin à l'atelier.</strong></p>";
  
  let newBody = existingBody;
  if (!newBody.includes("Façonné pour") && !newBody.includes("Le petit détail")) {
      newBody = `${intro}\n${newBody}`;
  }
  if (!newBody.includes("Préparé avec soin à l'atelier")) {
      newBody = `${newBody}\n${atelierSign}`;
  }
  
  return sanitizeStringForByteString(newBody);
}

// --- MAIN ---

async function main() {
  console.log(`🚀 Démarrage du script de mise à jour ${DRY_RUN ? '(DRY RUN)' : ''}...`);
  
  const csvPath = path.resolve(__dirname, "../../../products/products_export_1.csv");
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Fichier CSV non trouvé: ${csvPath}`);
    return;
  }
  
  console.log(`📂 Lecture du CSV: ${csvPath}`);
  const products = parseCSV(csvPath);
  console.log(`📊 ${products.length} lignes trouvées.`);

  const processedHandles = new Set();
  const uniqueProducts = products.filter(p => {
    if (!p.Handle || processedHandles.has(p.Handle)) return false;
    processedHandles.add(p.Handle);
    return true;
  });
  
  console.log(`✨ ${uniqueProducts.length} produits uniques à traiter.`);
  
  const client = new ShopifyScriptClient();
  
  for (const p of uniqueProducts) {
    const handle = p.Handle;
    const currentTitle = p.Title;
    
    // FETCH (respect rate limits)
    await new Promise(r => setTimeout(r, 600)); 
    const product = await client.findProductByHandle(handle);
    
    if (!product) {
      console.warn(`⚠️ Produit non trouvé sur Shopify: ${handle}`);
      continue;
    }
    
    const newTitle = cleanTitle(currentTitle);
    const newDescription = generateDescription(p, handle);
    
    const titleChanged = product.title !== newTitle;
    
    if (titleChanged) {
        console.log(`📝 [${handle}] Titre à mettre à jour: "${product.title}" -> "${newTitle}"`);
    }

    if (!DRY_RUN) {
      console.log(`🔄 Mise à jour de ${handle}...`);
      await client.updateProduct(product.id, {
        title: newTitle,
        body_html: newDescription
      });
      console.log(`✅ ${handle} mis à jour.`);
      // Update delay
      await new Promise(r => setTimeout(r, 600));
    }
  }
  
  console.log(`\n🎉 Terminé !`);
}

main().catch(console.error);
