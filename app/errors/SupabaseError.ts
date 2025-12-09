import { AppError } from './AppError';

/**
 * Custom error class for Supabase-related errors
 *
 * Extends AppError to provide typed errors with user-friendly messages
 * and technical details for debugging.
 */
export class SupabaseError extends AppError {
  constructor(message: string, userMessage: string, code?: string, technicalDetails?: unknown) {
    super(message, userMessage, code, technicalDetails);
  }

  static connectionFailed(technicalDetails?: unknown): SupabaseError {
    return new SupabaseError(
      'connection_failed',
      'Impossible de se connecter à la base de données',
      'connection_failed',
      technicalDetails
    );
  }

  static queryFailed(technicalDetails?: unknown): SupabaseError {
    return new SupabaseError(
      'query_failed',
      'Erreur lors de la récupération des données',
      'query_failed',
      technicalDetails
    );
  }

  static insertFailed(technicalDetails?: unknown): SupabaseError {
    return new SupabaseError(
      'insert_failed',
      'Erreur lors de l\'ajout des données',
      'insert_failed',
      technicalDetails
    );
  }

  static updateFailed(technicalDetails?: unknown): SupabaseError {
    return new SupabaseError(
      'update_failed',
      'Erreur lors de la mise à jour des données',
      'update_failed',
      technicalDetails
    );
  }

  static deleteFailed(technicalDetails?: unknown): SupabaseError {
    return new SupabaseError(
      'delete_failed',
      'Erreur lors de la suppression des données',
      'delete_failed',
      technicalDetails
    );
  }

  static subscriptionFailed(technicalDetails?: unknown): SupabaseError {
    return new SupabaseError(
      'subscription_failed',
      'Erreur lors de l\'enregistrement de la notification push',
      'subscription_failed',
      technicalDetails
    );
  }

  static unsubscribeFailed(technicalDetails?: unknown): SupabaseError {
    return new SupabaseError(
      'unsubscribe_failed',
      'Erreur lors de la désactivation des notifications push',
      'unsubscribe_failed',
      technicalDetails
    );
  }

  static networkOffline(): SupabaseError {
    return new SupabaseError(
      'network_offline',
      'Impossible de se connecter au serveur. Vérifiez votre connexion internet',
      'network_offline'
    );
  }
}
