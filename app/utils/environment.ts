/**
 * Vérifie si le code s'exécute côté client (navigateur)
 * Utile pour éviter les erreurs SSR lors de l'accès à window, document, etc.
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Vérifie si le code s'exécute côté serveur
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}
