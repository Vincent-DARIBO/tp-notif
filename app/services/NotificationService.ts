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

// Mock data pour la démo - à remplacer par de vrais appels API
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

export class NotificationService {
  private static API_BASE_URL = '/api/notifications'; // À configurer selon votre backend

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

  static async markAsRead(notificationId: string): Promise<void> {
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

  static async acceptSlot(payload: AcceptSlotDTO): Promise<void> {
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

  static async refuseSlot(payload: RefuseSlotDTO): Promise<void> {
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

  static async registerSlot(payload: RegisterSlotDTO): Promise<void> {
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
