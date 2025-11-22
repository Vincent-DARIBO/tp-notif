import { useState, useCallback } from 'react';
import type { Notification, NotificationType, NotificationStatus } from '~/types/notification';
import { isClient } from '~/utils/environment';

const SAMPLE_NOTIFICATIONS: Omit<Notification, 'id' | 'createdAt'>[] = [
  {
    type: 'SLOT_AVAILABLE' as NotificationType,
    status: 'UNREAD' as NotificationStatus,
    title: 'Créneau disponible',
    message: 'Un créneau correspondant à votre alerte est maintenant disponible',
    slot: {
      id: 'slot-sample-1',
      date: '2025-11-28',
      startTime: '14:00',
      endTime: '16:00',
      location: 'Paris 11e - République',
      description: 'Prédication publique - Stand Place de la République',
    },
  },
  {
    type: 'SLOT_CANCELLED' as NotificationType,
    status: 'UNREAD' as NotificationStatus,
    title: 'Créneau annulé',
    message: 'Votre créneau du 27/11/2025 a été annulé en raison de conditions météorologiques',
    slot: {
      id: 'slot-sample-2',
      date: '2025-11-27',
      startTime: '10:00',
      endTime: '12:00',
      location: 'Paris 13e - Bibliothèque François Mitterrand',
      description: 'Prédication publique - Parvis de la bibliothèque',
    },
  },
  {
    type: 'SLOT_PROPOSAL' as NotificationType,
    status: 'UNREAD' as NotificationStatus,
    title: 'Nouvelle proposition de créneau',
    message: 'Un créneau vous est proposé suite à votre alerte du dimanche matin',
    slot: {
      id: 'slot-sample-3',
      date: '2025-12-01',
      startTime: '09:30',
      endTime: '11:30',
      location: 'Paris 19e - Buttes-Chaumont',
      description: 'Prédication de porte-à-porte - Secteur Nord',
    },
  },
  {
    type: 'SLOT_AVAILABLE' as NotificationType,
    status: 'UNREAD' as NotificationStatus,
    title: 'Créneau libéré',
    message: 'Un proclamateur a libéré son créneau, vous pouvez le récupérer',
    slot: {
      id: 'slot-sample-4',
      date: '2025-11-26',
      startTime: '16:00',
      endTime: '18:00',
      location: 'Paris 5e - Quartier Latin',
      description: 'Prédication publique - Boulevard Saint-Michel',
    },
  },
  {
    type: 'SLOT_PROPOSAL' as NotificationType,
    status: 'UNREAD' as NotificationStatus,
    title: 'Proposition urgente',
    message: 'Créneau disponible dans moins de 24h, réponse rapide souhaitée',
    slot: {
      id: 'slot-sample-5',
      date: '2025-11-23',
      startTime: '13:00',
      endTime: '15:00',
      location: 'Paris 8e - Champs-Élysées',
      description: 'Prédication téléphonique - Depuis la salle du royaume',
    },
  },
  {
    type: 'SLOT_CANCELLED' as NotificationType,
    status: 'UNREAD' as NotificationStatus,
    title: 'Annulation de dernière minute',
    message: 'Le coordinateur a dû annuler ce créneau pour raisons personnelles',
    slot: {
      id: 'slot-sample-6',
      date: '2025-11-25',
      startTime: '11:00',
      endTime: '13:00',
      location: 'Paris 17e - Batignolles',
      description: 'Prédication de porte-à-porte - Secteur Martin Luther King',
    },
  },
];

export default function useNotificationSimulator() {
  const [simulatedNotifications, setSimulatedNotifications] = useState<Notification[]>([]);

  const generateRandomNotification = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_NOTIFICATIONS.length);
    const template = SAMPLE_NOTIFICATIONS[randomIndex];

    const newNotification: Notification = {
      ...template,
      id: `simulated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    setSimulatedNotifications(prev => [newNotification, ...prev]);

    // Notification navigateur si les permissions sont accordées (uniquement côté client)
    if (isClient() && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: newNotification.id,
      });
    }

    return newNotification;
  }, []);

  const clearSimulatedNotifications = useCallback(() => {
    setSimulatedNotifications([]);
  }, []);

  const removeSimulatedNotification = useCallback((id: string) => {
    setSimulatedNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    simulatedNotifications,
    generateRandomNotification,
    clearSimulatedNotifications,
    removeSimulatedNotification,
  };
}
