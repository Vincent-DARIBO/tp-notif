# TP Notifications - PWA Notification Center

Centre de notifications pour la gestion des créneaux de prédication. Application PWA (Progressive Web App) moderne construite avec React Router, TypeScript et TailwindCSS.

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Architecture du projet](#-architecture-du-projet)
- [Quick Start](#-quick-start)
- [Concepts clés](#-concepts-clés)
- [Structure des fichiers](#-structure-des-fichiers)
- [Configuration PWA](#-configuration-pwa)
- [Workflow de développement](#-workflow-de-développement)
- [Migration vers la production](#-migration-vers-la-production)
- [Technologies](#-technologies)
- [Documentation détaillée](#-documentation-détaillée)

---

## 🎯 Vue d'ensemble

### Fonctionnalités principales

- ✅ **Notifications en temps réel** - Gestion des créneaux (disponibles, annulés, propositions)
- ✅ **Installation PWA** - Bannière d'installation personnalisée avec persistance
- ✅ **Mode offline** - Support hors ligne via Service Worker
- ✅ **Notifications push** - API Web Push intégrée (prête pour VAPID)
- ✅ **Simulateur** - Générateur de notifications pour tests et démos
- ✅ **Responsive** - Interface adaptative mobile/desktop

### État du projet

🚧 **Mode démo** - L'application utilise actuellement des données mock pour la démonstration.
Consultez la section [Migration vers la production](#-migration-vers-la-production) pour connecter un backend réel.

---

## 🏗 Architecture du projet

Le projet suit une architecture en couches avec séparation des responsabilités:

```
┌─────────────────────────────────────────┐
│         Components (UI Layer)           │  ← Composants React pure UI
├─────────────────────────────────────────┤
│      Custom Hooks (Logic Layer)         │  ← Gestion d'état et logique métier
├─────────────────────────────────────────┤
│       Services (Data Layer)             │  ← Interaction avec APIs et données
├─────────────────────────────────────────┤
│      Errors (Error Handling)            │  ← Gestion centralisée des erreurs
└─────────────────────────────────────────┘
```

### Principes architecturaux

1. **Separation of Concerns (SOC)** - Chaque fichier a une responsabilité unique
2. **SOLID** - Respect des principes SOLID pour la maintenabilité
3. **DRY** - Pas de duplication de code, abstraction via hooks et services
4. **Single Source of Truth** - React Query pour le cache et l'état serveur

---

## 🚀 Quick Start

### Prérequis

- **Node.js** 18+
- **npm** ou **pnpm** ou **bun**

### Installation

```bash
# Cloner le repository
git clone <votre-repo>
cd tp-notif

# Installer les dépendances
npm install
```

### Lancement en développement

```bash
npm run dev
```

L'application sera accessible sur **http://localhost:5173**

### Build de production

```bash
npm run build
```

Les fichiers de build seront dans le dossier `build/`:
- `build/client/` - Assets statiques
- `build/server/` - Code server-side

---

## 💡 Concepts clés

### 1. Architecture en couches

#### Services (`app/services/`)

Les services encapsulent toute la logique d'accès aux données:

```typescript
// app/services/NotificationService.ts
export class NotificationService {
  static async getNotifications(): Promise<Notification[]> {
    // Logique d'appel API
  }
}
```

**Responsabilités:**
- Appels API/fetch
- Transformation des données
- Gestion des erreurs métier

#### Hooks personnalisés (`app/hooks/`)

Les hooks font le pont entre services et composants:

```typescript
// app/hooks/useNotifications.ts
export default function useNotifications() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => NotificationService.getNotifications(),
  });

  return {
    notifications: data,
    isLoadingNotifications: isLoading,
    // ...
  };
}
```

**Responsabilités:**
- Gestion de l'état local (useState, useReducer)
- Orchestration de la logique métier
- Exposition d'une API simple pour les composants

#### Composants (`app/components/`)

Les composants sont des fonctions pures qui consomment les hooks:

```typescript
export default function NotificationsList() {
  const { notifications, isLoadingNotifications } = useNotifications();

  if (isLoadingNotifications) return <Spinner />;

  return (
    <div>
      {notifications?.map(notif => <NotificationCard key={notif.id} {...notif} />)}
    </div>
  );
}
```

**Responsabilités:**
- Affichage de l'UI
- Gestion des événements utilisateur
- AUCUNE logique métier

### 2. Gestion d'état avec React Query

L'application utilise **React Query** pour:
- ✅ Cache automatique des données
- ✅ Synchronisation entre composants
- ✅ Invalidation et refetching intelligent
- ✅ Gestion du loading et des erreurs

```typescript
// Configuration par défaut dans root.tsx
<QueryClientProvider client={queryClient}>
  <Outlet />
</QueryClientProvider>
```

### 3. Gestion des erreurs

Pattern centralisé avec des classes d'erreurs typées:

```typescript
// app/errors/NotificationError.ts
export class NotificationError extends AppError {
  static fetchFailed(details?: unknown): NotificationError {
    return new NotificationError(
      'fetch_failed',
      'Impossible de récupérer les notifications',
      'fetch_failed',
      details
    );
  }
}
```

**Avantages:**
- Messages utilisateur cohérents
- Codes d'erreur standardisés
- Détails techniques pour le debug

### 4. PWA (Progressive Web App)

#### Installation

Le système d'installation PWA est géré par:

1. **PWAService** - Logique métier (capture de l'événement, stockage)
2. **usePWAInstall** - Hook React pour les composants
3. **InstallBanner** - Composant UI de la bannière

```typescript
const { showBanner, promptInstall, dismissBanner } = usePWAInstall();

if (showBanner) {
  return <InstallBanner onInstall={promptInstall} onDismiss={dismissBanner} />;
}
```

#### Manifest PWA

Fichier de configuration: [`public/manifest.json`](public/manifest.json)

Voir la [documentation complète du manifest](public/MANIFEST_README.md).

---

## 📁 Structure des fichiers

```
tp-notif/
├── app/
│   ├── components/          # Composants React réutilisables
│   ├── errors/              # Classes d'erreurs personnalisées
│   │   ├── AppError.ts      # Classe de base pour toutes les erreurs
│   │   ├── NotificationError.ts
│   │   └── PWAError.ts
│   ├── hooks/               # Custom React Hooks
│   │   ├── useNotifications.ts          # Hook React Query pour les notifications
│   │   ├── useNotificationSimulator.ts  # Générateur de notifications de test
│   │   └── usePWAInstall.ts             # Gestion de l'installation PWA
│   ├── services/            # Services d'accès aux données
│   │   ├── NotificationService.ts       # API notifications
│   │   └── PWAService.ts                # Logique PWA (installation, standalone)
│   ├── types/               # Définitions TypeScript
│   │   └── notification.ts  # Types pour les notifications
│   ├── utils/               # Utilitaires
│   │   └── environment.ts   # Helpers SSR (isClient, isServer)
│   └── routes/              # Routes React Router
│       └── home.tsx         # Page d'accueil
├── public/
│   ├── icons/               # Icônes PWA (192x192, 512x512)
│   ├── manifest.json        # Configuration PWA
│   └── MANIFEST_README.md   # Documentation du manifest
└── README.md                # Ce fichier
```

### Fichiers clés à documenter

| Fichier | Description | Documentation |
|---------|-------------|---------------|
| [`app/services/PWAService.ts`](app/services/PWAService.ts) | Gestion PWA (installation, détection standalone) | Commentée ✅ |
| [`app/services/NotificationService.ts`](app/services/NotificationService.ts) | API notifications + push subscriptions | Commentée ✅ |
| [`app/hooks/usePWAInstall.ts`](app/hooks/usePWAInstall.ts) | Hook pour l'installation PWA | Commentée ✅ |
| [`app/hooks/useNotifications.ts`](app/hooks/useNotifications.ts) | Hook React Query pour notifications | Commentée ✅ |
| [`app/hooks/useNotificationSimulator.ts`](app/hooks/useNotificationSimulator.ts) | Simulateur de notifications | Commentée ✅ |
| [`public/manifest.json`](public/manifest.json) | Configuration PWA | [Doc détaillée](public/MANIFEST_README.md) |

---

## ⚙️ Configuration PWA

### 1. Manifest

Configuré dans [`public/manifest.json`](public/manifest.json):

```json
{
  "name": "TP Notifications",
  "short_name": "TP Notif",
  "display": "standalone",
  "icons": [ /* icônes 192x192 et 512x512 */ ]
}
```

Voir la [documentation complète du manifest](public/MANIFEST_README.md).

### 2. Service Worker

**TODO**: Configurer le service worker pour:
- Cache des assets statiques
- Stratégie de cache (Network First, Cache First, etc.)
- Réception des notifications push

### 3. Notifications Push

Pour activer les notifications push:

1. **Générer les clés VAPID**:
   ```bash
   npx web-push generate-vapid-keys
   ```

2. **Configurer la clé publique**:
   ```typescript
   // app/services/NotificationService.ts
   applicationServerKey: this.urlBase64ToUint8Array(
     'VOTRE_CLE_PUBLIQUE_VAPID'  // Remplacer ici
   )
   ```

3. **Implémenter le backend**:
   - Endpoint pour enregistrer les subscriptions
   - Service pour envoyer les push avec la clé privée VAPID

---

## 🔄 Workflow de développement

### Pattern de développement standard

Pour ajouter une nouvelle fonctionnalité:

#### 1. Créer le service

```typescript
// app/services/MonService.ts
export class MonService {
  static async getData(): Promise<Data[]> {
    const response = await fetch('/api/data');
    if (!response.ok) throw MonError.fetchFailed();
    return await response.json();
  }
}
```

#### 2. Créer les erreurs

```typescript
// app/errors/MonError.ts
export class MonError extends AppError {
  static fetchFailed(details?: unknown): MonError {
    return new MonError(
      'fetch_failed',
      'Impossible de récupérer les données',
      'fetch_failed',
      details
    );
  }
}
```

#### 3. Créer le hook

```typescript
// app/hooks/useMonHook.ts
export default function useMonHook() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['monHook'],
    queryFn: () => MonService.getData(),
  });

  return {
    data,
    isLoadingData: isLoading,
    errorData: error,
  };
}
```

#### 4. Créer le composant

```typescript
// app/components/MonComposant.tsx
export default function MonComposant() {
  const { data, isLoadingData, errorData } = useMonHook();

  if (isLoadingData) return <Spinner />;
  if (errorData) return <Error message={errorData.message} />;

  return <div>{/* UI */}</div>;
}
```

### Conventions de nommage

#### Hooks React Query

```typescript
// ❌ Mauvais
const { data, isLoading, error } = useNotifications();

// ✅ Bon
const {
  notifications,              // Nom explicite
  isLoadingNotifications,     // Préfixé
  errorNotifications,         // Préfixé
  refetchNotifications        // Préfixé
} = useNotifications();
```

#### Hooks de mutation

```typescript
export default function useAcceptSlot({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}) {
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: AcceptSlotDTO) =>
      NotificationService.acceptSlot(payload),
    onSuccess: (data) => {
      // Toast de succès
      onSuccess?.(data);
    },
    onError: (error) => {
      // Toast d'erreur
      onError?.(error);
    },
  });

  return {
    acceptSlot: mutate,        // Nom explicite
    isAcceptingSlot: isPending // État préfixé
  };
}
```

---

## 🚀 Migration vers la production

L'application est actuellement en **mode démo** avec des données mock. Voici les étapes pour passer en production:

### 1. Backend API

#### a. Configurer l'URL de l'API

```typescript
// app/services/NotificationService.ts
private static API_BASE_URL = process.env.VITE_API_URL || '/api/notifications';
```

Ajouter dans `.env`:
```bash
VITE_API_URL=https://votre-backend.com/api/notifications
```

#### b. Décommenter les appels API

Dans [`app/services/NotificationService.ts`](app/services/NotificationService.ts):

```typescript
// Remplacer les mocks par:
static async getNotifications(): Promise<Notification[]> {
  const response = await fetch(this.API_BASE_URL);
  if (!response.ok) throw new Error('Failed to fetch notifications');
  return await response.json();
}
```

Faire de même pour:
- `markAsRead()`
- `acceptSlot()`
- `refuseSlot()`
- `registerSlot()`

### 2. Notifications Push

#### a. Générer les clés VAPID

```bash
npx web-push generate-vapid-keys
```

Résultat:
```
Public Key: BEl62iU...
Private Key: 5JUv...
```

#### b. Configurer le frontend

```typescript
// app/services/NotificationService.ts
applicationServerKey: this.urlBase64ToUint8Array(
  'VOTRE_CLE_PUBLIQUE_VAPID'  // Remplacer ici
)
```

#### c. Configurer le backend

Endpoint pour enregistrer les subscriptions:
```typescript
POST /api/notifications/subscribe
Body: PushSubscription
```

Service pour envoyer les push:
```typescript
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:contact@example.com',
  'VOTRE_CLE_PUBLIQUE_VAPID',
  'VOTRE_CLE_PRIVEE_VAPID'
);

await webpush.sendNotification(subscription, payload);
```

### 3. Service Worker

Créer `public/sw.js`:

```javascript
// Cache strategy
self.addEventListener('fetch', (event) => {
  // Implémenter Network First ou Cache First
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/icon-192x192.png',
  });
});
```

Enregistrer le Service Worker:
```typescript
// app/root.tsx ou entry.client.tsx
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### 4. Supprimer le simulateur

Retirer `useNotificationSimulator` des composants de production.
Le garder uniquement pour les pages de démo/test.

---

## 🛠 Technologies

### Stack principal

| Technologie | Version | Usage |
|-------------|---------|-------|
| **React** | 18+ | UI Library |
| **React Router** | 7+ | Routing + SSR |
| **TypeScript** | 5+ | Type Safety |
| **TailwindCSS** | 3+ | Styling |
| **React Query** | 5+ | State Management |

### APIs Web

- **Service Worker API** - Cache et offline
- **Notification API** - Notifications navigateur
- **Push API** - Notifications push
- **beforeinstallprompt** - Installation PWA personnalisée

### Outils de développement

```bash
npm run dev         # Serveur de développement
npm run build       # Build de production
npm run preview     # Prévisualiser le build
npm run typecheck   # Vérification TypeScript
```

---

## 📚 Documentation détaillée

### Fichiers de documentation

- [**Manifest PWA**](public/MANIFEST_README.md) - Configuration complète du manifest.json
- **Ce README** - Vue d'ensemble et onboarding

### Code documenté

Tous les fichiers clés contiennent des commentaires JSDoc détaillés:

- **Services**: Explications des méthodes, paramètres, erreurs
- **Hooks**: Flows complets, exemples d'usage
- **Types**: Descriptions des propriétés

Exemple:

```typescript
/**
 * Hook personnalisé pour gérer l'installation PWA
 *
 * Responsabilités:
 * - Gérer les états liés à l'installation PWA
 * - Écouter les événements beforeinstallprompt
 * - Contrôler l'affichage de la bannière
 *
 * @returns État et fonctions pour gérer l'installation PWA
 *
 * @example
 * ```tsx
 * const { showBanner, promptInstall } = usePWAInstall();
 * ```
 */
export default function usePWAInstall() {
  // ...
}
```

### Ressources externes

- [React Router Docs](https://reactrouter.com/)
- [React Query Docs](https://tanstack.com/query)
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)

---

## 🤝 Contribution

Pour contribuer au projet:

1. Suivre l'architecture en couches (Service → Hook → Component)
2. Respecter les principes SOC, SOLID, DRY
3. Documenter le code avec JSDoc
4. Tester les fonctionnalités PWA sur mobile

---

## 📝 Checklist de migration

Avant de passer en production:

- [ ] Configurer l'URL du backend (`VITE_API_URL`)
- [ ] Décommenter les appels API dans NotificationService
- [ ] Générer les clés VAPID
- [ ] Configurer le Service Worker
- [ ] Implémenter l'endpoint `/subscribe` côté backend
- [ ] Tester les notifications push
- [ ] Personnaliser le manifest.json (nom, icônes, couleurs)
- [ ] Générer toutes les tailles d'icônes PWA
- [ ] Tester l'installation PWA sur Android/iOS
- [ ] Supprimer le simulateur des routes de production
- [ ] Configurer les variables d'environnement
- [ ] Tester le mode offline

---

**Built with ❤️ for modern PWA experiences**
