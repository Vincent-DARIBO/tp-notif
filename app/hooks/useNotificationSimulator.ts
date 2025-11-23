import { useState, useCallback } from 'react';
import type { Notification, NotificationType, NotificationStatus } from '~/types/notification';
import { isClient } from '~/utils/environment';

/**
 * Templates de notifications pour la simulation
 *
 * But: Générer des notifications réalistes pour tester l'interface sans backend
 *
 * Structure:
 * - Exclut 'id' et 'createdAt' qui sont générés dynamiquement
 * - Couvre les 3 types de notifications: SLOT_AVAILABLE, SLOT_CANCELLED, SLOT_PROPOSAL
 * - Contient des données de créneaux variées (dates, lieux, horaires)
 *
 * Usage:
 * Ces templates sont utilisés par generateRandomNotification() pour créer
 * des notifications de test avec des timestamps dynamiques.
 */
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

/**
 * Hook personnalisé pour simuler des notifications en temps réel
 *
 * Responsabilités:
 * - Générer des notifications aléatoires pour tester l'interface
 * - Déclencher des notifications navigateur (si permissions accordées)
 * - Gérer l'état local des notifications simulées
 * - Fournir des fonctions de gestion (générer, supprimer, nettoyer)
 *
 * Architecture:
 * Ce hook est utilisé UNIQUEMENT pour les démos et les tests.
 * Il ne doit PAS être utilisé en production.
 *
 * Cas d'usage:
 * - Page de démo pour montrer le système de notifications
 * - Tests d'interface utilisateur
 * - Développement sans backend disponible
 *
 * @returns Objet contenant les notifications simulées et les fonctions de gestion
 *
 * @example
 * ```tsx
 * function DemoPage() {
 *   const {
 *     simulatedNotifications,
 *     generateRandomNotification,
 *     clearSimulatedNotifications
 *   } = useNotificationSimulator();
 *
 *   return (
 *     <div>
 *       <button onClick={generateRandomNotification}>
 *         Simuler une notification
 *       </button>
 *       <button onClick={clearSimulatedNotifications}>
 *         Tout effacer
 *       </button>
 *       <NotificationsList notifications={simulatedNotifications} />
 *     </div>
 *   );
 * }
 * ```
 */
export default function useNotificationSimulator() {
  /**
   * État local: Liste des notifications générées par la simulation
   *
   * Structure:
   * - Tableau de Notification avec id et createdAt générés dynamiquement
   * - Ordre: Nouvelles notifications en premier (prepend)
   */
  const [simulatedNotifications, setSimulatedNotifications] = useState<Notification[]>([]);

  /**
   * Génère une notification aléatoire
   *
   * Flow:
   * 1. Sélectionne un template aléatoire parmi SAMPLE_NOTIFICATIONS
   * 2. Génère un ID unique (timestamp + random string)
   * 3. Ajoute un timestamp de création (ISO format)
   * 4. Ajoute la notification au début de la liste (état local)
   * 5. Si permissions accordées, déclenche une notification navigateur
   *
   * Notification navigateur:
   * - Affichée uniquement côté client (SSR safety)
   * - Nécessite permission 'granted'
   * - Utilise l'API Notification native du navigateur
   * - Affiche title, body, icon, et badge
   *
   * @returns La notification générée
   *
   * @example
   * ```tsx
   * <button onClick={() => {
   *   const notif = generateRandomNotification();
   *   console.log('Notification créée:', notif.id);
   * }}>
   *   Générer
   * </button>
   * ```
   */
  const generateRandomNotification = useCallback(() => {
    // Sélection aléatoire d'un template
    const randomIndex = Math.floor(Math.random() * SAMPLE_NOTIFICATIONS.length);
    const template = SAMPLE_NOTIFICATIONS[randomIndex];

    // Création de la notification avec ID et timestamp uniques
    const newNotification: Notification = {
      ...template,
      id: `simulated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    // Ajout au début de la liste (nouvelles notifications en premier)
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

  /**
   * Supprime toutes les notifications simulées
   *
   * Usage:
   * - Bouton "Tout effacer" dans l'interface de démo
   * - Reset de l'état pour recommencer une démonstration
   *
   * @example
   * ```tsx
   * <button onClick={clearSimulatedNotifications}>
   *   Effacer toutes les notifications
   * </button>
   * ```
   */
  const clearSimulatedNotifications = useCallback(() => {
    setSimulatedNotifications([]);
  }, []);

  /**
   * Supprime une notification spécifique par son ID
   *
   * @param id - ID de la notification à supprimer
   *
   * Usage:
   * - Bouton de fermeture sur une notification individuelle
   * - Action "Supprimer" dans le menu d'une notification
   *
   * @example
   * ```tsx
   * <button onClick={() => removeSimulatedNotification(notif.id)}>
   *   ✕
   * </button>
   * ```
   */
  const removeSimulatedNotification = useCallback((id: string) => {
    setSimulatedNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  /**
   * Retour avec fonctions et état
   *
   * Nomenclature:
   * - simulatedNotifications: Liste des notifications générées
   * - generateRandomNotification: Fonction pour créer une notification
   * - clearSimulatedNotifications: Fonction pour tout effacer
   * - removeSimulatedNotification: Fonction pour supprimer une notification
   */
  return {
    simulatedNotifications,
    generateRandomNotification,
    clearSimulatedNotifications,
    removeSimulatedNotification,
  };
}
