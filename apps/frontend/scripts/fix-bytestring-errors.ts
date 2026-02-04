#!/usr/bin/env tsx
/**
 * 🍍 JOLANANAS - Script de Correction des Erreurs ByteString
 * ===========================================================
 * Scanne et nettoie automatiquement les chaînes contenant des En dashes (8211)
 * et autres caractères Unicode problématiques avant qu'elles ne soient passées à .digest()
 *
 * Usage: pnpm tsx scripts/fix-bytestring-errors.ts [--dry-run] [--path <chemin>]
 *
 * Options:
 *   --dry-run : Affiche ce qui sera corrigé sans effectuer les modifications
 *   --path    : Chemin spécifique à scanner (par défaut: apps/frontend/app/src)
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

/**
 * Caractères Unicode problématiques à remplacer
 */
const PROBLEMATIC_CHARS = {
  8211: "-", // En dash (–)
  8212: "-", // Em dash (—)
  8230: "...", // Points de suspension (…)
  8216: "'", // Guillemet simple gauche (')
  8217: "'", // Guillemet simple droit (')
  8220: '"', // Guillemet double gauche (")
  8221: '"', // Guillemet double droit (")
};

/**
 * Extensions de fichiers à scanner
 */
const SCANNABLE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".json"];

/**
 * Dossiers à ignorer
 */
const IGNORED_DIRS = [
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  "_backup",
  ".turbo",
];

/**
 * Nettoie une chaîne en remplaçant les caractères Unicode problématiques
 */
function cleanString(str: string): string {
  let cleaned = str;

  // Remplacer tous les caractères problématiques
  for (const [code, replacement] of Object.entries(PROBLEMATIC_CHARS)) {
    const char = String.fromCharCode(parseInt(code, 10));
    cleaned = cleaned.replace(new RegExp(char, "g"), replacement);
  }

  // Vérification finale : scanner pour tout caractère > 255
  let result = "";
  for (let i = 0; i < cleaned.length; i++) {
    const code = cleaned.charCodeAt(i);
    if (code > 255) {
      // Remplacer par un espace ou un tiret selon le contexte
      result += code === 8211 || code === 8212 ? "-" : " ";
    } else {
      result += cleaned[i];
    }
  }

  return result;
}

/**
 * Scanne un fichier pour trouver les caractères problématiques
 */
function scanFile(
  filePath: string,
): Array<{ line: number; char: string; code: number; context: string }> {
  const issues: Array<{
    line: number;
    char: string;
    code: number;
    context: string;
  }> = [];

  try {
    const content = readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, lineIndex) => {
      for (let i = 0; i < line.length; i++) {
        const code = line.charCodeAt(i);
        if (code > 255) {
          const context = line.substring(
            Math.max(0, i - 20),
            Math.min(line.length, i + 20),
          );
          issues.push({
            line: lineIndex + 1,
            char: line[i],
            code,
            context,
          });
        }
      }
    });
  } catch (error) {
    console.error(`❌ Erreur lors de la lecture de ${filePath}:`, error);
  }

  return issues;
}

/**
 * Nettoie un fichier en remplaçant les caractères problématiques
 */
function cleanFile(filePath: string, dryRun: boolean = false): boolean {
  try {
    const content = readFileSync(filePath, "utf-8");
    const cleaned = cleanString(content);

    if (content !== cleaned) {
      if (!dryRun) {
        writeFileSync(filePath, cleaned, "utf-8");
        console.log(`✅ Fichier nettoyé: ${filePath}`);
      } else {
        console.log(`🔍 Fichier à nettoyer: ${filePath}`);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Erreur lors du nettoyage de ${filePath}:`, error);
    return false;
  }
}

/**
 * Scanne récursivement un dossier
 */
function scanDirectory(
  dirPath: string,
  dryRun: boolean = false,
): {
  filesScanned: number;
  filesCleaned: number;
  issuesFound: number;
} {
  let filesScanned = 0;
  let filesCleaned = 0;
  let issuesFound = 0;

  try {
    const entries = readdirSync(dirPath);

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);

      // Ignorer les dossiers spécifiés
      if (IGNORED_DIRS.includes(entry)) {
        continue;
      }

      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Récursion
        const result = scanDirectory(fullPath, dryRun);
        filesScanned += result.filesScanned;
        filesCleaned += result.filesCleaned;
        issuesFound += result.issuesFound;
      } else if (stat.isFile()) {
        const ext = extname(entry);
        if (SCANNABLE_EXTENSIONS.includes(ext)) {
          filesScanned++;

          // Scanner pour les problèmes
          const issues = scanFile(fullPath);
          if (issues.length > 0) {
            issuesFound += issues.length;
            console.log(`\n📋 Problèmes trouvés dans ${fullPath}:`);
            issues.slice(0, 5).forEach((issue) => {
              console.log(
                `   Ligne ${issue.line}: "${issue.char}" (code: ${issue.code})`,
              );
              console.log(`   Contexte: "${issue.context}"`);
            });
            if (issues.length > 5) {
              console.log(`   ... et ${issues.length - 5} autres problèmes`);
            }

            // Nettoyer le fichier
            if (cleanFile(fullPath, dryRun)) {
              filesCleaned++;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ Erreur lors du scan de ${dirPath}:`, error);
  }

  return { filesScanned, filesCleaned, issuesFound };
}

/**
 * Fonction principale
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const pathIndex = args.indexOf("--path");
  const targetPath =
    pathIndex !== -1 && args[pathIndex + 1]
      ? args[pathIndex + 1]
      : join(process.cwd(), "apps/frontend/app/src");

  console.log(
    "🔍 Scan des fichiers pour les caractères Unicode problématiques...\n",
  );
  console.log(`📁 Chemin: ${targetPath}`);
  console.log(
    `🔧 Mode: ${dryRun ? "DRY RUN (aucune modification)" : "Nettoyage actif"}\n`,
  );

  const result = scanDirectory(targetPath, dryRun);

  console.log("\n" + "=".repeat(60));
  console.log("📊 Résumé:");
  console.log(`   Fichiers scannés: ${result.filesScanned}`);
  console.log(`   Problèmes trouvés: ${result.issuesFound}`);
  console.log(`   Fichiers nettoyés: ${result.filesCleaned}`);
  console.log("=".repeat(60));

  if (dryRun && result.issuesFound > 0) {
    console.log("\n💡 Pour appliquer les corrections, exécutez sans --dry-run");
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}
