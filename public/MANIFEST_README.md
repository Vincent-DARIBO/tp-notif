# Web App Manifest Documentation

## Fichier: `manifest.json`

Le fichier `manifest.json` est le **fichier de configuration PWA** (Progressive Web App) qui définit comment l'application doit se comporter une fois installée sur l'appareil de l'utilisateur.

---

## 📋 Structure et Propriétés

### `name` (string)
```json
"name": "TP Notifications"
```
- **Rôle**: Nom complet de l'application
- **Utilisation**: Affiché lors de l'installation et dans les paramètres de l'appareil
- **Limite**: 45 caractères recommandés

### `short_name` (string)
```json
"short_name": "TP Notif"
```
- **Rôle**: Nom court de l'application
- **Utilisation**: Affiché sous l'icône sur l'écran d'accueil
- **Limite**: 12 caractères maximum pour un affichage optimal

### `description` (string)
```json
"description": "Centre de notifications pour la gestion des créneaux de prédication"
```
- **Rôle**: Description de l'application
- **Utilisation**: Affichée dans les stores et lors de l'installation
- **Recommandation**: 1-2 phrases claires et concises

### `start_url` (string)
```json
"start_url": "/"
```
- **Rôle**: URL de démarrage de l'application
- **Utilisation**: Page chargée quand l'utilisateur lance l'app depuis l'écran d'accueil
- **Note**: Doit être relative au domaine de l'app

### `display` (string)
```json
"display": "standalone"
```
- **Rôle**: Mode d'affichage de l'application
- **Valeurs possibles**:
  - `standalone`: App native sans barre d'adresse (recommandé pour PWA)
  - `fullscreen`: Plein écran total
  - `minimal-ui`: Barre minimale avec contrôles basiques
  - `browser`: Mode navigateur classique
- **Impact**: Détermine l'expérience utilisateur (standalone = comme une app native)

### `background_color` (string - hex color)
```json
"background_color": "#ffffff"
```
- **Rôle**: Couleur de fond du splash screen
- **Utilisation**: Affichée pendant le chargement de l'app au démarrage
- **Format**: Code hexadécimal (#ffffff = blanc)
- **Conseil**: Utiliser la même couleur que le fond de votre app pour une transition fluide

### `theme_color` (string - hex color)
```json
"theme_color": "#3b82f6"
```
- **Rôle**: Couleur du thème de l'application
- **Utilisation**: Colore la barre d'état système et la barre d'outils du navigateur
- **Format**: Code hexadécimal (#3b82f6 = bleu)
- **Impact**: Donne une identité visuelle cohérente à l'app

### `orientation` (string)
```json
"orientation": "portrait"
```
- **Rôle**: Orientation préférée de l'écran
- **Valeurs possibles**:
  - `portrait`: Vertical (recommandé pour apps mobiles)
  - `landscape`: Horizontal
  - `any`: Toutes orientations
- **Note**: L'utilisateur peut toujours faire pivoter son appareil

### `icons` (array)
```json
"icons": [
  {
    "src": "/icons/icon-192x192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "/icons/icon-512x512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any maskable"
  }
]
```

#### Propriétés d'une icône:

- **`src`**: Chemin vers le fichier icône
  - Doit être accessible publiquement
  - Relatif au domaine racine

- **`sizes`**: Dimensions de l'icône (largeur x hauteur en pixels)
  - `192x192`: Taille minimale recommandée pour Android
  - `512x512`: Taille recommandée pour splash screens et qualité optimale

- **`type`**: Type MIME du fichier
  - `image/png`: Format PNG (recommandé pour la transparence)
  - Alternatives: `image/jpeg`, `image/svg+xml`

- **`purpose`**: Contextes d'utilisation de l'icône
  - `any`: Icône standard pour tous usages
  - `maskable`: Icône adaptative (peut être masquée/rognée selon les OS)
  - `any maskable`: Utilisable dans tous les contextes (recommandé)

---

## 🎯 Tailles d'icônes recommandées

Pour une PWA complète, il est recommandé de fournir plusieurs tailles:

| Taille | Usage principal |
|--------|-----------------|
| 192x192 | Icône écran d'accueil Android |
| 512x512 | Splash screen et haute résolution |
| 144x144 | Windows tiles |
| 96x96 | Icône petite taille |
| 48x48 | Favicons |

---

## 🔧 Configuration pour la production

### Étapes de personnalisation:

1. **Changer les noms**:
   ```json
   "name": "Votre App",
   "short_name": "App"
   ```

2. **Mettre à jour la description**:
   ```json
   "description": "Description de votre application"
   ```

3. **Adapter les couleurs** (utiliser les couleurs de votre design system):
   ```json
   "background_color": "#votre_couleur",
   "theme_color": "#votre_couleur_theme"
   ```

4. **Générer les icônes**:
   - Créer une icône carrée haute résolution (1024x1024)
   - Utiliser un outil comme [PWA Asset Generator](https://www.pwabuilder.com/)
   - Générer toutes les tailles nécessaires
   - Placer les icônes dans `/public/icons/`

5. **Tester**:
   - Chrome DevTools > Application > Manifest
   - Lighthouse audit pour vérifier la conformité PWA

---

## 📱 Support multi-plateforme

Ce manifest fonctionne sur:
- ✅ Android (Chrome, Edge, Samsung Internet)
- ✅ iOS/iPadOS (Safari 16.4+)
- ✅ Desktop (Chrome, Edge)
- ✅ Windows (PWA via Microsoft Store)

---

## 🔗 Intégration dans l'application

Le manifest est automatiquement lié dans le HTML via:
```html
<link rel="manifest" href="/manifest.json">
```

Cette ligne est généralement ajoutée dans le `<head>` de votre `index.html` ou dans votre composant racine.

---

## 📚 Ressources

- [MDN: Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [PWA Builder](https://www.pwabuilder.com/)
- [Manifest Validator](https://manifest-validator.appspot.com/)
