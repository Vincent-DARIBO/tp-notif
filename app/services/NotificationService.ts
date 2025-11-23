import { NotificationError } from '../errors/NotificationError';
import { isServer } from '../utils/environment';
import type {
  Notification,
  AcceptSlotDTO,
  RefuseSlotDTO,
  RegisterSlotDTO,
  NotificationType,
  NotificationStatus
} from '../types/notification';

/**
 * Données mock pour la démonstration
 *
 * TODO: Remplacer par de vrais appels API vers votre backend
 *
 * Structure:
 * - Contient 3 types de notifications: SLOT_AVAILABLE, SLOT_CANCELLED, SLOT_PROPOSAL
 * - Chaque notification inclut des informations de créneau (slot) avec date, heure, lieu
 * - Les timestamps sont générés dynamiquement pour simuler des notifications récentes
 */
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'SLOT_AVAILABLE' as NotificationType,
    status: 'UNREAD' as NotificationStatus,
    title: 'Créneau disponible',
    message: 'Un créneau correspondant à votre alerte est maintenant disponible',
    slot: {
      id: 'slot-1',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '12:00',
      location: 'Paris 15e',
      description: 'Prédication publique - Stand métro Commerce',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'SLOT_CANCELLED' as NotificationType,
    status: 'UNREAD' as NotificationStatus,
    title: 'Créneau annulé',
    message: 'Votre créneau du 23/11/2025 a été annulé',
    slot: {
      id: 'slot-2',
      date: '2025-11-23',
      startTime: '14:00',
      endTime: '16:00',
      location: 'Paris 12e',
      description: 'Prédication de porte-à-porte - Secteur A',
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    type: 'SLOT_PROPOSAL' as NotificationType,
    status: 'UNREAD' as NotificationStatus,
    title: 'Proposition de créneau',
    message: 'Un nouveau créneau vous est proposé suite à votre alerte',
    slot: {
      id: 'slot-3',
      date: '2025-11-26',
      startTime: '09:00',
      endTime: '11:00',
      location: 'Paris 18e',
      description: 'Prédication téléphonique',
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

/**
 * Service de gestion des notifications
 *
 * Responsabilités:
 * - Récupérer la liste des notifications depuis le backend
 * - Marquer les notifications comme lues
 * - Gérer les actions utilisateur sur les créneaux (accepter, refuser, s'inscrire)
 * - Demander la permission pour les notifications navigateur
 * - Gérer l'abonnement aux notifications push
 *
 * Architecture:
 * Ce service utilise un pattern Singleton avec des méthodes statiques.
 * Actuellement en mode MOCK pour la démo - tous les appels API commentés doivent
 * être décommentés et configurés pour la production.
 *
 * Migration vers production:
 * 1. Décommenter les appels fetch()
 * 2. Configurer API_BASE_URL avec l'URL de votre backend
 * 3. Générer une paire de clés VAPID pour les push notifications
 * 4. Remplacer 'YOUR_PUBLIC_VAPID_KEY' par votre clé publique VAPID
 * 5. Supprimer les données MOCK_NOTIFICATIONS
 */
export class NotificationService {
  /**
   * URL de base de l'API backend
   * TODO: Configurer selon votre environnement (dev/staging/prod)
   */
  private static API_BASE_URL = '/api/notifications';

  /**
   * Récupère la liste des notifications de l'utilisateur
   *
   * @returns Promise<Notification[]> - Liste des notifications
   * @throws NotificationError.fetchFailed - En cas d'erreur réseau ou serveur
   *
   * État actuel: Mode MOCK
   * Pour la production: Décommenter les lignes d'appel fetch()
   *
   * @example
   * ```ts
   * try {
   *   const notifications = await NotificationService.getNotifications();
   *   console.log(`${notifications.length} notifications reçues`);
   * } catch (error) {
   *   console.error('Erreur:', error.userMessage);
   * }
   * ```
   */
  static async getNotifications(): Promise<Notification[]> {
    try {
      // TODO: Remplacer par un vrai appel API
      // const response = await fetch(this.API_BASE_URL);
      // if (!response.ok) throw new Error('Failed to fetch notifications');
      // return await response.json();

      // Mock delay pour simuler un appel réseau
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_NOTIFICATIONS;
    } catch (error) {
      throw NotificationError.fetchFailed(error);
    }
  }

  /**
   * Marque une notification comme lue
   *
   * @param _notificationId - ID de la notification à marquer comme lue
   * @returns Promise<void>
   * @throws NotificationError.markAsReadFailed - En cas d'erreur
   *
   * État actuel: Mode MOCK (ne fait rien)
   * Pour la production: Décommenter l'appel API PATCH
   *
   * @example
   * ```ts
   * await NotificationService.markAsRead('notif-123');
   * ```
   */
  static async markAsRead(_notificationId: string): Promise<void> {
    try {
      // TODO: Remplacer par un vrai appel API
      // const response = await fetch(`${this.API_BASE_URL}/${notificationId}/read`, {
      //   method: 'PATCH',
      // });
      // if (!response.ok) throw new Error('Failed to mark notification as read');

      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      throw NotificationError.markAsReadFailed(error);
    }
  }

  /**
   * Accepte un créneau proposé
   *
   * @param _payload - Données de l'acceptation (notificationId, slotId, etc.)
   * @returns Promise<void>
   * @throws NotificationError.acceptSlotFailed - En cas d'erreur
   *
   * État actuel: Mode MOCK (ne fait rien)
   * Pour la production: Décommenter l'appel API POST
   *
   * @example
   * ```ts
   * await NotificationService.acceptSlot({
   *   notificationId: 'notif-123',
   *   slotId: 'slot-456'
   * });
   * ```
   */
  static async acceptSlot(_payload: AcceptSlotDTO): Promise<void> {
    try {
      // TODO: Remplacer par un vrai appel API
      // const response = await fetch(`${this.API_BASE_URL}/${payload.notificationId}/accept`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
      // if (!response.ok) throw new Error('Failed to accept slot');

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      throw NotificationError.acceptSlotFailed(error);
    }
  }

  /**
   * Refuse un créneau proposé
   *
   * @param _payload - Données du refus (notificationId, reason, etc.)
   * @returns Promise<void>
   * @throws NotificationError.refuseSlotFailed - En cas d'erreur
   *
   * État actuel: Mode MOCK (ne fait rien)
   * Pour la production: Décommenter l'appel API POST
   *
   * @example
   * ```ts
   * await NotificationService.refuseSlot({
   *   notificationId: 'notif-123',
   *   reason: 'Non disponible'
   * });
   * ```
   */
  static async refuseSlot(_payload: RefuseSlotDTO): Promise<void> {
    try {
      // TODO: Remplacer par un vrai appel API
      // const response = await fetch(`${this.API_BASE_URL}/${payload.notificationId}/refuse`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
      // if (!response.ok) throw new Error('Failed to refuse slot');

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      throw NotificationError.refuseSlotFailed(error);
    }
  }

  /**
   * Inscription à un créneau disponible
   *
   * @param _payload - Données de l'inscription (notificationId, slotId, etc.)
   * @returns Promise<void>
   * @throws NotificationError.acceptSlotFailed - En cas d'erreur
   *
   * État actuel: Mode MOCK (ne fait rien)
   * Pour la production: Décommenter l'appel API POST
   *
   * Note: Utilise acceptSlotFailed comme erreur (probablement à renommer en registerSlotFailed)
   *
   * @example
   * ```ts
   * await NotificationService.registerSlot({
   *   notificationId: 'notif-123',
   *   slotId: 'slot-456'
   * });
   * ```
   */
  static async registerSlot(_payload: RegisterSlotDTO): Promise<void> {
    try {
      // TODO: Remplacer par un vrai appel API
      // const response = await fetch(`${this.API_BASE_URL}/${payload.notificationId}/register`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
      // if (!response.ok) throw new Error('Failed to register for slot');

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      throw NotificationError.acceptSlotFailed(error);
    }
  }

  /**
   * Demande la permission d'afficher des notifications navigateur
   *
   * @returns Promise<NotificationPermission> - 'granted', 'denied', ou 'default'
   * @throws NotificationError.notificationPermissionDenied - Si refusé ou indisponible
   *
   * SSR Safety: Throw si exécuté côté serveur ou si l'API n'est pas disponible
   *
   * Flow:
   * 1. Vérifie que l'API Notification est disponible
   * 2. Demande la permission via Notification.requestPermission()
   * 3. Throw si l'utilisateur refuse
   * 4. Retourne le statut de permission
   *
   * @example
   * ```ts
   * try {
   *   const permission = await NotificationService.requestNotificationPermission();
   *   if (permission === 'granted') {
   *     console.log('Notifications autorisées !');
   *   }
   * } catch (error) {
   *   console.error('Permission refusée');
   * }
   * ```
   */
  static async requestNotificationPermission(): Promise<NotificationPermission> {
    if (isServer() || !('Notification' in window)) {
      throw NotificationError.notificationPermissionDenied();
    }

    const permission = await Notification.requestPermission();
    if (permission === 'denied') {
      throw NotificationError.notificationPermissionDenied();
    }

    return permission;
  }

  /**
   * Souscrit aux notifications push (Web Push API)
   *
   * @returns Promise<PushSubscription | null> - L'objet subscription ou null si SSR
   * @throws NotificationError.fetchFailed - En cas d'erreur d'abonnement
   *
   * Prérequis:
   * - Service Worker enregistré et actif
   * - Clé publique VAPID configurée
   * - Permission notifications accordée
   *
   * Flow:
   * 1. Attend que le Service Worker soit ready
   * 2. Crée une subscription via pushManager.subscribe()
   * 3. Envoie la subscription au backend (TODO: décommenter)
   * 4. Retourne l'objet subscription
   *
   * VAPID (Voluntary Application Server Identification):
   * Les clés VAPID identifient votre application auprès du service push.
   * Génération: npx web-push generate-vapid-keys
   *
   * SSR Safety: Retourne null côté serveur
   *
   * @example
   * ```ts
   * try {
   *   const subscription = await NotificationService.subscribeToNotifications();
   *   if (subscription) {
   *     console.log('Abonné aux notifications push !');
   *   }
   * } catch (error) {
   *   console.error('Erreur d\'abonnement:', error);
   * }
   * ```
   */
  static async subscribeToNotifications(): Promise<PushSubscription | null> {
    if (isServer() || typeof navigator === 'undefined') {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // TODO: Remplacer par votre clé publique VAPID
          // Générer via: npx web-push generate-vapid-keys
          'YOUR_PUBLIC_VAPID_KEY'
        ),
      });

      // TODO: Envoyer la subscription au backend
      // await fetch(`${this.API_BASE_URL}/subscribe`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(subscription),
      // });

      return subscription;
    } catch (error) {
      throw NotificationError.fetchFailed(error);
    }
  }

  /**
   * Convertit une clé VAPID base64url en Uint8Array
   *
   * Utilitaire privé utilisé pour convertir la clé publique VAPID
   * du format base64url (standard VAPID) en Uint8Array (requis par l'API Push)
   *
   * @param base64String - Clé VAPID au format base64url
   * @returns Uint8Array - Clé convertie
   *
   * SSR Safety: Retourne un tableau vide côté serveur
   *
   * Conversion:
   * 1. Ajoute le padding '=' si nécessaire
   * 2. Remplace les caractères base64url par base64 standard
   * 3. Décode via window.atob()
   * 4. Convertit chaque caractère en byte dans un Uint8Array
   */
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    if (isServer()) {
      return new Uint8Array(0);
    }

    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
