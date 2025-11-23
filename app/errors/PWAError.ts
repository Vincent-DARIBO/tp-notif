import { AppError } from "./AppError";

export class PWAError extends AppError {
  constructor(
    message: string,
    userMessage: string,
    code?: string,
    technicalDetails?: unknown
  ) {
    super(message, userMessage, code, technicalDetails);
  }

  static installPromptFailed(technicalDetails?: unknown): PWAError {
    return new PWAError(
      "install_prompt_failed",
      "Impossible d'afficher l'invitation à installer l'application",
      "install_prompt_failed",
      technicalDetails
    );
  }

  static installNotSupported(): PWAError {
    return new PWAError(
      "install_not_supported",
      "L'installation de l'application n'est pas supportée par votre navigateur",
      "install_not_supported"
    );
  }

  static storageFailed(technicalDetails?: unknown): PWAError {
    return new PWAError(
      "storage_failed",
      "Impossible de sauvegarder la préférence d'installation",
      "storage_failed",
      technicalDetails
    );
  }
}
