const fs = require("fs");
const path = require("path");
const https = require("https");

// 1. Read .env.local manually
const envPath = path.join(__dirname, ".env.local");
console.log(`Lecture du fichier .env.local : ${envPath}`);

let envContent = "";
try {
  envContent = fs.readFileSync(envPath, "utf8");
} catch (e) {
  console.error("❌ Impossible de lire le fichier .env.local.");
  process.exit(1);
}

// Simple parser
const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[match[1].trim()] = value;
  }
});

const domain = env.SHOPIFY_STORE_DOMAIN || env.SHOPIFY_STORE_DOMAIN;
const token =
  env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

console.log("\n--- CONFIGURATION DÉTECTÉE ---");
console.log(`Domaine : ${domain}`);
console.log(
  `Token   : ${token ? token.substring(0, 8) + "...[MASQUÉ]" : "MANQUANT"}`,
);
console.log("------------------------------\n");

if (!domain || !token) {
  console.error("❌ Variables d'environnement manquantes.");
  if (!domain) console.error("   - SHOPIFY_STORE_DOMAIN est manquant.");
  if (!token)
    console.error("   - SHOPIFY_STOREFRONT_ACCESS_TOKEN est manquant.");
  process.exit(1);
}

// 2. Test Connection
const query = `
{
  shop {
    name
    primaryDomain {
      url
    }
  }
}
`;

const data = JSON.stringify({ query });

const options = {
  hostname: domain,
  path: "/api/2024-01/graphql.json",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": token,
    "Content-Length": data.length,
  },
};

console.log(
  `Test de connexion vers https://${domain}/api/2024-01/graphql.json...`,
);

const req = https.request(options, (res) => {
  console.log(`Code HTTP : ${res.statusCode}`);

  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => {
    try {
      const json = JSON.parse(body);
      if (res.statusCode === 200 && !json.errors) {
        console.log("\n✅ SUCCÈS ! Connexion établie.");
        console.log(`Boutique : ${json.data.shop.name}`);
        console.log(`URL      : ${json.data.shop.primaryDomain.url}`);
      } else {
        console.error("\n❌ ÉCHEC. L'API a rejeté la requête.");
        if (
          res.statusCode === 401 ||
          (json.errors && JSON.stringify(json.errors).includes("UNAUTHORIZED"))
        ) {
          console.error("\n⛔️ RAISON : NON AUTORISÉ (401).");
          console.error(
            "Votre Token Storefront est probablement invalide, expiré ou révoqué.",
          );
          console.error(
            "Veuillez générer un nouveau 'Storefront Access Token' dans Shopify.",
          );
        } else {
          console.error(
            "Raison :",
            JSON.stringify(json.errors || body, null, 2),
          );
        }
      }
    } catch (e) {
      console.error("❌ Impossible de lire la réponse :", body);
    }
  });
});

req.on("error", (e) => {
  console.error("❌ Erreur Réseau :", e.message);
});

req.write(data);
req.end();
