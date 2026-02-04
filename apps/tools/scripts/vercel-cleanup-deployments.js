#!/usr/bin/env node

/**
 * Script pour supprimer tous les déploiements Vercel sauf le déploiement actif (current)
 *
 * Usage: node apps/tools/scripts/vercel-cleanup-deployments.js
 */

import { readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PROJECT_ID = "prj_o1NyObC275pgb1YhnKfivNAKjMAz"; // jolananas
const TEAM_ID = "team_icbGr4ECSH4JQdrCGsEwcmFm";

// Lire le token Vercel
function getVercelToken() {
  const authPath = join(
    homedir(),
    "Library/Application Support/com.vercel.cli/auth.json",
  );

  try {
    const auth = JSON.parse(readFileSync(authPath, "utf8"));
    return auth.token;
  } catch (error) {
    console.error("❌ Erreur : Impossible de lire le token Vercel");
    console.error("💡 Assurez-vous d'être connecté avec: vercel login");
    process.exit(1);
  }
}

// Lister tous les déploiements
async function listDeployments(token) {
  const url = `https://api.vercel.com/v6/deployments?projectId=${PROJECT_ID}&teamId=${TEAM_ID}&limit=100`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.deployments || [];
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des déploiements:",
      error.message,
    );
    throw error;
  }
}

// Supprimer un déploiement
async function deleteDeployment(token, deploymentId) {
  const url = `https://api.vercel.com/v13/deployments/${deploymentId}?teamId=${TEAM_ID}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return true;
  } catch (error) {
    console.error(
      `❌ Erreur lors de la suppression du déploiement ${deploymentId}:`,
      error.message,
    );
    return false;
  }
}

// Fonction principale
async function cleanupDeployments() {
  const token = getVercelToken();

  console.log("🔍 Récupération de la liste des déploiements...\n");

  try {
    // Lister tous les déploiements
    const deployments = await listDeployments(token);

    if (deployments.length === 0) {
      console.log("✅ Aucun déploiement trouvé.");
      return;
    }

    console.log(`📊 ${deployments.length} déploiement(s) trouvé(s)\n`);

    // Identifier le déploiement actif (current)
    const currentDeployment = deployments.find(
      (d) => d.state === "READY" && d.target === "production",
    );

    if (!currentDeployment) {
      // Si aucun déploiement "production" n'est trouvé, chercher le plus récent en état READY
      const readyDeployments = deployments.filter((d) => d.state === "READY");
      if (readyDeployments.length > 0) {
        readyDeployments.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        const latest = readyDeployments[0];
        console.log(
          '⚠️  Aucun déploiement "production" trouvé, conservation du plus récent déploiement READY:',
        );
        console.log(`   - ID: ${latest.uid}`);
        console.log(`   - URL: ${latest.url || "N/A"}`);
        console.log(
          `   - Créé le: ${new Date(latest.createdAt).toLocaleString("fr-FR")}\n`,
        );

        // Supprimer tous les autres déploiements
        const toDelete = deployments.filter((d) => d.uid !== latest.uid);
        await deleteDeployments(token, toDelete, latest);
        return;
      } else {
        console.log("⚠️  Aucun déploiement en état READY trouvé.");
        console.log(
          "💡 Voulez-vous vraiment supprimer tous les déploiements ?",
        );
        return;
      }
    }

    console.log("✅ Déploiement actif identifié:");
    console.log(`   - ID: ${currentDeployment.uid}`);
    console.log(`   - URL: ${currentDeployment.url || "N/A"}`);
    console.log(`   - État: ${currentDeployment.state}`);
    console.log(
      `   - Créé le: ${new Date(currentDeployment.createdAt).toLocaleString("fr-FR")}\n`,
    );

    // Filtrer les déploiements à supprimer (tous sauf le current)
    const toDelete = deployments.filter((d) => d.uid !== currentDeployment.uid);

    if (toDelete.length === 0) {
      console.log("✅ Aucun autre déploiement à supprimer.");
      return;
    }

    console.log(`🗑️  ${toDelete.length} déploiement(s) à supprimer:\n`);

    // Afficher la liste des déploiements à supprimer
    toDelete.forEach((deployment, index) => {
      console.log(`   ${index + 1}. ID: ${deployment.uid}`);
      console.log(`      URL: ${deployment.url || "N/A"}`);
      console.log(`      État: ${deployment.state}`);
      console.log(
        `      Créé le: ${new Date(deployment.createdAt).toLocaleString("fr-FR")}\n`,
      );
    });

    // Supprimer les déploiements
    await deleteDeployments(token, toDelete, currentDeployment);
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage:", error.message);
    process.exit(1);
  }
}

// Supprimer plusieurs déploiements
async function deleteDeployments(token, deployments, keepDeployment) {
  let successCount = 0;
  let errorCount = 0;

  console.log("🗑️  Suppression en cours...\n");

  for (const deployment of deployments) {
    const success = await deleteDeployment(token, deployment.uid);
    if (success) {
      successCount++;
      console.log(
        `   ✅ Supprimé: ${deployment.uid} (${deployment.url || "N/A"})`,
      );
    } else {
      errorCount++;
      console.log(`   ❌ Échec: ${deployment.uid}`);
    }

    // Petite pause pour éviter de surcharger l'API
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log("\n📊 Résumé:");
  console.log(`   ✅ ${successCount} déploiement(s) supprimé(s)`);
  if (errorCount > 0) {
    console.log(`   ❌ ${errorCount} déploiement(s) non supprimé(s)`);
  }
  console.log(
    `   🔒 Déploiement conservé: ${keepDeployment.uid} (${keepDeployment.url || "N/A"})`,
  );
  console.log("\n✅ Nettoyage terminé !");
}

// Exécuter
cleanupDeployments().catch(console.error);
