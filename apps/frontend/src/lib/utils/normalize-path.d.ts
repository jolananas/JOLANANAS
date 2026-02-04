/**
 * Déclaration de type pour normalize-path
 * @see https://github.com/jonschlinkert/normalize-path
 */
declare module 'normalize-path' {
  /**
   * Normalise un chemin de fichier pour la compatibilité cross-platform
   * @param path Chemin à normaliser
   * @returns Chemin normalisé
   */
  function normalizePath(path: string): string;
  export default normalizePath;
}

