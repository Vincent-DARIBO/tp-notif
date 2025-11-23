/**
 * Service Worker pour TP Notifications PWA
 *
 * Responsabilités:
 * 1. Cache des ressources statiques pour le mode offline
 * 2. Réception et affichage des notifications push
 * 3. Gestion du clic sur les notifications
 * 4. Nettoyage des anciens caches lors des mises à jour
 *
 * Lifecycle du Service Worker:
 * install → waiting → activate → fetch/push
 *
 * Documentation:
 * - Service Worker API: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 * - Cache API: https://developer.mozilla.org/en-US/docs/Web/API/Cache
 * - Push API: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
 */

/**
 * Nom du cache pour cette version de l'application
 *
 * Important: Incrémenter la version (v1 → v2) lors de mises à jour
 * pour forcer la mise à jour du cache et supprimer les anciennes versions.
 *
 * Pattern: 'nom-app-v{version}'
 */
const CACHE_NAME = "notification-center-v1";

/**
 * Liste des URLs à mettre en cache lors de l'installation
 *
 * Stratégie: Pre-cache des ressources critiques
 * Ces ressources seront disponibles immédiatement en mode offline.
 *
 * À ajouter selon vos besoins:
 * - Assets statiques: '/assets/logo.png'
 * - Fichiers CSS/JS: '/assets/index.css'
 * - Fonts: '/fonts/roboto.woff2'
 * - Images critiques: '/images/placeholder.png'
 *
 * Note: Ne pas mettre en cache les routes dynamiques ici
 */
const urlsToCache = ["/", "/manifest.json"];

/**
 * Event: install
 * Déclenché lors de l'installation du Service Worker
 *
 * Flow:
 * 1. Ouvre le cache avec CACHE_NAME
 * 2. Ajoute toutes les URLs de urlsToCache au cache
 * 3. Si une URL échoue, toute l'installation échoue (atomique)
 *
 * waitUntil():
 * Indique au navigateur que l'installation n'est pas terminée
 * tant que la promesse n'est pas résolue.
 *
 * Lifecycle:
 * install → waiting (si un ancien SW est actif) → activate
 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );

  // Force le passage immédiat à activate (skipWaiting)
  // Décommenter pour éviter la phase "waiting"
  // self.skipWaiting();
});

/**
 * Event: fetch
 * Intercepte toutes les requêtes réseau de l'application
 *
 * Stratégie actuelle: Cache First (Cache Fallback to Network)
 * 1. Cherche d'abord dans le cache
 * 2. Si trouvé → retourne la version cachée
 * 3. Si non trouvé → fait une requête réseau
 *
 * Avantages:
 * - Performance maximale (pas de latence réseau)
 * - Fonctionne hors ligne
 *
 * Inconvénients:
 * - Peut servir des données obsolètes
 * - Pas adapté pour les données dynamiques
 *
 * Stratégies alternatives:
 *
 * Network First (recommandé pour les données dynamiques):
 * ```js
 * event.respondWith(
 *   fetch(event.request)
 *     .then(response => {
 *       const responseClone = response.clone();
 *       caches.open(CACHE_NAME).then(cache => {
 *         cache.put(event.request, responseClone);
 *       });
 *       return response;
 *     })
 *     .catch(() => caches.match(event.request))
 * );
 * ```
 *
 * Stale While Revalidate (bon compromis):
 * ```js
 * event.respondWith(
 *   caches.match(event.request).then(cached => {
 *     const fetchPromise = fetch(event.request).then(response => {
 *       caches.open(CACHE_NAME).then(cache => {
 *         cache.put(event.request, response.clone());
 *       });
 *       return response;
 *     });
 *     return cached || fetchPromise;
 *   })
 * );
 * ```
 */
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit: retourne la version cachée
      if (response) {
        return response;
      }

      // Cache miss: requête réseau
      return fetch(event.request);
    })
  );
});

/**
 * Event: activate
 * Déclenché quand le Service Worker devient actif
 *
 * Flow:
 * 1. Récupère tous les noms de cache existants
 * 2. Supprime les caches qui ne sont pas dans la whitelist
 * 3. Permet de nettoyer les anciennes versions
 *
 * Cas d'usage:
 * - Mise à jour de l'app (v1 → v2)
 * - Nettoyage après un déploiement
 *
 * waitUntil():
 * Garantit que le nettoyage est terminé avant d'activer le SW
 *
 * clients.claim():
 * Permet au nouveau SW de prendre immédiatement le contrôle
 * de toutes les pages (sans rechargement)
 * Décommenter si besoin: self.clients.claim()
 */
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Si le cache n'est pas dans la whitelist, le supprimer
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Prend immédiatement le contrôle de toutes les pages
  // Décommenter pour activation immédiate
  // return self.clients.claim();
});

/**
 * Event: push
 * Déclenché quand une notification push est reçue du serveur
 *
 * Flow:
 * 1. Vérifie que l'événement contient des données
 * 2. Parse les données JSON du payload
 * 3. Extrait title, message, icon, etc.
 * 4. Affiche la notification via showNotification()
 *
 * Format attendu du payload (envoyé depuis le backend):
 * ```json
 * {
 *   "title": "Créneau disponible",
 *   "message": "Un créneau est maintenant disponible",
 *   "url": "/notifications/123",
 *   "tag": "slot-available-123"
 * }
 * ```
 *
 * Options de notification:
 * - body: Texte principal de la notification
 * - icon: Icône affichée (grande)
 * - badge: Petite icône pour la barre de notifications (Android)
 * - data: Données arbitraires (utilisées dans notificationclick)
 * - tag: Identifiant unique (remplace les notifs avec même tag)
 * - requireInteraction: La notification reste affichée jusqu'au clic
 *
 * Autres options disponibles:
 * - actions: Boutons d'action dans la notification
 * - image: Image large affichée dans la notification
 * - vibrate: Pattern de vibration (Android)
 * - silent: Notification silencieuse
 * - timestamp: Horodatage personnalisé
 *
 * Documentation:
 * https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
 */
self.addEventListener("push", (event) => {
  // Vérification de la présence de données
  if (!event.data) {
    return;
  }

  // Parse du payload JSON
  const data = event.data.json();

  // Extraction des données avec valeurs par défaut
  const title = data.title || "Nouvelle notification";
  const options = {
    body: data.message || "Vous avez une nouvelle notification",
    icon: "/icon-192x192.png", // Icône principale (visible dans la notification)
    badge: "/icon-192x192.png", // Badge pour la barre de notifications (Android)
    data: {
      url: data.url || "/", // URL de destination au clic
    },
    tag: data.tag || "notification", // Tag pour grouper/remplacer les notifications
    requireInteraction: true, // Notification persistante jusqu'au clic
  };

  // Affichage de la notification
  // waitUntil garantit que la notification est affichée même si le SW se termine
  event.waitUntil(self.registration.showNotification(title, options));
});

/**
 * Event: notificationclick
 * Déclenché quand l'utilisateur clique sur une notification
 *
 * Flow:
 * 1. Ferme la notification
 * 2. Cherche une fenêtre ouverte avec l'URL cible
 * 3. Si trouvée → focus sur cette fenêtre
 * 4. Si non trouvée → ouvre une nouvelle fenêtre
 *
 * Comportement:
 * - Évite d'ouvrir plusieurs onglets pour la même URL
 * - Améliore l'UX en réutilisant les fenêtres existantes
 * - Fonctionne même si l'app n'est pas ouverte
 *
 * event.notification.data:
 * Contient les données passées dans options.data lors du showNotification()
 *
 * clients.matchAll():
 * Récupère toutes les fenêtres/onglets contrôlés par ce Service Worker
 *
 * Options:
 * - type: 'window' → uniquement les fenêtres/onglets
 * - includeUncontrolled: true → inclut les fenêtres non contrôlées
 *
 * Gestion des actions:
 * Si vous avez défini des boutons d'action (options.actions),
 * vous pouvez les gérer avec event.action:
 *
 * ```js
 * if (event.action === 'accept') {
 *   // Action "Accepter"
 * } else if (event.action === 'refuse') {
 *   // Action "Refuser"
 * } else {
 *   // Clic principal sur la notification
 * }
 * ```
 */
self.addEventListener("notificationclick", (event) => {
  // Ferme la notification
  event.notification.close();

  // Récupère l'URL de destination depuis les données de la notification
  const url = event.notification.data.url || "/";

  event.waitUntil(
    // Cherche toutes les fenêtres/onglets ouverts
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Cherche une fenêtre déjà ouverte avec cette URL
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }

        // Aucune fenêtre trouvée → ouvre une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
