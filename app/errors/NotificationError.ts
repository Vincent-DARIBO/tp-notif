import { AppError } from './AppError';

export class NotificationError extends AppError {
  constructor(message: string, userMessage: string, code?: string, technicalDetails?: unknown) {
    super(message, userMessage, code, technicalDetails);
  }

  static fetchFailed(technicalDetails?: unknown): NotificationError {
    return new NotificationError(
      'fetch_notifications_failed',
      'Impossible de récupérer les notifications',
      'fetch_notifications_failed',
      technicalDetails
    );
  }

  static markAsReadFailed(technicalDetails?: unknown): NotificationError {
    return new NotificationError(
      'mark_as_read_failed',
      'Impossible de marquer la notification comme lue',
      'mark_as_read_failed',
      technicalDetails
    );
  }

  static acceptSlotFailed(technicalDetails?: unknown): NotificationError {
    return new NotificationError(
      'accept_slot_failed',
      "Impossible d'accepter le créneau",
      'accept_slot_failed',
      technicalDetails
    );
  }

  static refuseSlotFailed(technicalDetails?: unknown): NotificationError {
    return new NotificationError(
      'refuse_slot_failed',
      'Impossible de refuser le créneau',
      'refuse_slot_failed',
      technicalDetails
    );
  }

  static notificationPermissionDenied(): NotificationError {
    return new NotificationError(
      'notification_permission_denied',
      "Les notifications sont désactivées. Veuillez les activer dans les paramètres de votre navigateur.",
      'notification_permission_denied'
    );
  }
}
