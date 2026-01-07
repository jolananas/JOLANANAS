#!/usr/bin/env node

/**
 * Script pour configurer le projet Vercel via l'API
 * Met à jour Node.js version et Root Directory
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PROJECT_ID = 'prj_o1NyObC275pgb1YhnKfivNAKjMAz'; // jolananas
const TEAM_ID = 'team_icbGr4ECSH4JQdrCGsEwcmFm';
const ROOT_DIRECTORY = 'app/frontend';
const NODE_VERSION = '20.x';

// Lire le token Vercel
function getVercelToken() {
  const authPath = join(
    homedir(),
    'Library/Application Support/com.vercel.cli/auth.json'
  );
  
  try {
    const auth = JSON.parse(readFileSync(authPath, 'utf8'));
    return auth.token;
  } catch (error) {
    console.error('❌ Erreur : Impossible de lire le token Vercel');
    console.error('💡 Assurez-vous d\'être connecté avec: vercel login');
    process.exit(1);
  }
}

// Mettre à jour la configuration du projet
async function updateProjectConfig() {
  const token = getVercelToken();
  
  const url = `https://api.vercel.com/v9/projects/${PROJECT_ID}?teamId=${TEAM_ID}`;
  
  const payload = {
    nodeVersion: NODE_VERSION,
    rootDirectory: ROOT_DIRECTORY,
  };
  
  console.log('🔧 Configuration du projet Vercel...\n');
  console.log(`📁 Root Directory: ${ROOT_DIRECTORY}`);
  console.log(`🟢 Node.js Version: ${NODE_VERSION}\n`);
  
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Configuration mise à jour avec succès !\n');
    console.log('📊 Détails du projet:');
    console.log(`   - Nom: ${data.name}`);
    console.log(`   - Root Directory: ${data.rootDirectory || 'Non configuré'}`);
    console.log(`   - Node.js Version: ${data.nodeVersion || 'Non configuré'}`);
    console.log('\n💡 Redéployez maintenant depuis GitHub pour appliquer les changements.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error.message);
    console.error('\n💡 Alternative: Configurez manuellement dans Vercel Dashboard:');
    console.error('   1. https://vercel.com/dashboard');
    console.error('   2. Projet "jolananas" → Settings → General');
    console.error('   3. Root Directory: app/frontend');
    console.error('   4. Node.js Version: 20.x');
    process.exit(1);
  }
}

// Exécuter
updateProjectConfig().catch(console.error);

