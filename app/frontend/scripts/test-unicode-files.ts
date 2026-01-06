/**
 * Script de test pour valider la lecture des fichiers Markdown avec caractères Unicode
 */

import { readFileWithUnicode } from '../app/src/lib/utils/formatters.server';
import { join } from 'path';
import { existsSync } from 'fs';

const markdownFiles = [
  'CGU — JOLANANAS.md',
  'CGV — JOLANANAS.md',
  'Confidentialité — JOLANANAS.md',
  'Cookies — JOLANANAS.md',
  'Livraison — JOLANANAS.md',
  'Mentions Légales — JOLANANAS.md',
  'Retours et Remboursements — JOLANANAS.md',
];

async function testAllMarkdownFiles() {
  console.log('🧪 Test de lecture des fichiers Markdown avec caractères Unicode\n');
  
  const results: Array<{ file: string; success: boolean; error?: string; size?: number }> = [];
  
  for (const fileName of markdownFiles) {
    const filePath = join(process.cwd(), 'public/assets/documents', fileName);
    
    if (!existsSync(filePath)) {
      console.log(`⚠️  ${fileName} - Fichier non trouvé`);
      results.push({ file: fileName, success: false, error: 'Fichier non trouvé' });
      continue;
    }
    
    try {
      const content = await readFileWithUnicode(filePath);
      const size = content.length;
      console.log(`✅ ${fileName} - ${size} caractères lus avec succès`);
      results.push({ file: fileName, success: true, size });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error(`❌ ${fileName} - ${errorMessage}`);
      results.push({ file: fileName, success: false, error: errorMessage });
    }
  }
  
  console.log('\n📊 Résumé des tests:');
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`✅ Succès: ${successCount}/${results.length}`);
  console.log(`❌ Échecs: ${failCount}/${results.length}`);
  
  if (failCount > 0) {
    console.log('\n❌ Fichiers en échec:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.file}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 Tous les fichiers ont été lus avec succès!');
    process.exit(0);
  }
}

testAllMarkdownFiles().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

