import { AppError } from './AppError';

/**
 * Custom error class for authentication and authorization errors
 *
 * Extends AppError to provide typed errors with user-friendly messages
 * and technical details for debugging.
 */
export class AuthError extends AppError {
  constructor(message: string, userMessage: string, code?: string, technicalDetails?: unknown) {
    super(message, userMessage, code, technicalDetails);
  }

  static invalidCredentials(): AuthError {
    return new AuthError(
      'invalid_credentials',
      'Email ou mot de passe incorrect',
      'invalid_credentials'
    );
  }

  static unauthorized(): AuthError {
    return new AuthError(
      'unauthorized',
      'Vous n\'êtes pas autorisé à accéder à cette ressource',
      'unauthorized'
    );
  }

  static notAdmin(): AuthError {
    return new AuthError(
      'not_admin',
      'Vous devez être administrateur pour accéder à cette page',
      'not_admin'
    );
  }

  static sessionExpired(): AuthError {
    return new AuthError(
      'session_expired',
      'Votre session a expiré. Veuillez vous reconnecter',
      'session_expired'
    );
  }

  static loginFailed(technicalDetails?: unknown): AuthError {
    return new AuthError(
      'login_failed',
      'Erreur lors de la connexion. Veuillez réessayer',
      'login_failed',
      technicalDetails
    );
  }

  static logoutFailed(technicalDetails?: unknown): AuthError {
    return new AuthError(
      'logout_failed',
      'Erreur lors de la déconnexion',
      'logout_failed',
      technicalDetails
    );
  }

  static signupFailed(technicalDetails?: unknown): AuthError {
    return new AuthError(
      'signup_failed',
      'Erreur lors de la création du compte',
      'signup_failed',
      technicalDetails
    );
  }

  static userNotFound(): AuthError {
    return new AuthError(
      'user_not_found',
      'Utilisateur introuvable',
      'user_not_found'
    );
  }

  static emailAlreadyExists(): AuthError {
    return new AuthError(
      'email_already_exists',
      'Cette adresse email est déjà utilisée',
      'email_already_exists'
    );
  }
}
