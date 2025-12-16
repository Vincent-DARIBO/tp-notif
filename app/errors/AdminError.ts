import { AppError } from './AppError';

/**
 * Admin-specific error class
 *
 * Extends AppError to provide domain-specific errors for admin operations
 * like sending notifications, fetching users, and managing notification history.
 */
export class AdminError extends AppError {
  constructor(message: string, userMessage: string, code?: string, technicalDetails?: unknown) {
    super(message, userMessage, code, technicalDetails);
  }

  static sendNotificationFailed(technicalDetails?: unknown): AdminError {
    return new AdminError(
      'send_notification_failed',
      "Impossible d'envoyer la notification",
      'send_notification_failed',
      technicalDetails
    );
  }

  static getUsersFailed(technicalDetails?: unknown): AdminError {
    return new AdminError(
      'get_users_failed',
      'Impossible de récupérer la liste des utilisateurs',
      'get_users_failed',
      technicalDetails
    );
  }

  static getSlotsFailed(technicalDetails?: unknown): AdminError {
    return new AdminError(
      'get_slots_failed',
      'Impossible de récupérer la liste des créneaux',
      'get_slots_failed',
      technicalDetails
    );
  }

  static getSlotRecipientsFailed(technicalDetails?: unknown): AdminError {
    return new AdminError(
      'get_slot_recipients_failed',
      'Impossible de récupérer les destinataires du créneau',
      'get_slot_recipients_failed',
      technicalDetails
    );
  }

  static getNotificationHistoryFailed(technicalDetails?: unknown): AdminError {
    return new AdminError(
      'get_notification_history_failed',
      "Impossible de récupérer l'historique des notifications",
      'get_notification_history_failed',
      technicalDetails
    );
  }

  static invalidRecipients(message: string = 'Destinataires invalides'): AdminError {
    return new AdminError(
      'invalid_recipients',
      message,
      'invalid_recipients'
    );
  }

  static notAuthorized(): AdminError {
    return new AdminError(
      'not_authorized',
      "Vous n'êtes pas autorisé à effectuer cette action. Droits administrateur requis.",
      'not_authorized'
    );
  }

  static validationFailed(message: string): AdminError {
    return new AdminError(
      'validation_failed',
      message,
      'validation_failed'
    );
  }
}
