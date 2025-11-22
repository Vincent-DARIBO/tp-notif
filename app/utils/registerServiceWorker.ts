import { isServer } from './environment';

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (isServer() || typeof navigator === 'undefined') {
    return null;
  }

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker enregistré avec succès:', registration.scope);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('Nouvelle version du Service Worker disponible');
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du Service Worker:", error);
      return null;
    }
  } else {
    console.warn('Les Service Workers ne sont pas supportés par ce navigateur');
    return null;
  }
}
