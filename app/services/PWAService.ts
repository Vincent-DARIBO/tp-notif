import { PWAError } from "../errors/PWAError";

/**
 * Clé de stockage localStorage pour la bannière d'installation PWA
 * Utilisée pour persister l'information de fermeture de la bannière
 */
const INSTALL_BANNER_DISMISSED_KEY = "pwa_install_banner_dismissed";

/**
 * Durée pendant laquelle la bannière reste cachée après avoir été fermée
 * 7 jours en millisecondes (7 * 24 * 60 * 60 * 1000)
 */
const INSTALL_BANNER_DISMISSED_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours

/**
 * Service de gestion PWA (Progressive Web App)
 *
 * Responsabilités:
 * - Gérer l'événement beforeinstallprompt pour l'installation de la PWA
 * - Vérifier si l'application peut être installée
 * - Déclencher l'invite d'installation
 * - Détecter si l'application est lancée en mode standalone
 * - Gérer l'affichage de la bannière d'installation (avec persistance)
 *
 * Architecture:
 * Ce service utilise un pattern Singleton avec des méthodes statiques
 * pour centraliser la logique PWA de l'application.
 */
export class PWAService {
  /**
   * Stockage de l'événement beforeinstallprompt
   * Cet événement est capturé au chargement de l'application et permet
   * de déclencher l'installation à tout moment
   */
  private static beforeInstallPromptEvent: BeforeInstallPromptEvent | null =
    null;

  /**
   * Enregistre l'événement beforeinstallprompt
   *
   * @param event - L'événement beforeinstallprompt déclenché par le navigateur
   *
   * Usage:
   * Appelé dans le useEffect du hook usePWAInstall lors de la capture
   * de l'événement beforeinstallprompt
   */
  static setBeforeInstallPromptEvent(event: BeforeInstallPromptEvent): void {
    this.beforeInstallPromptEvent = event;
  }

  /**
   * Vérifie si l'application peut être installée
   *
   * @returns true si l'événement beforeinstallprompt a été capturé
   *
   * Note:
   * Cette méthode ne retourne true que si le navigateur supporte l'installation
   * PWA et que l'événement a été déclenché (app non encore installée)
   */
  static isInstallable(): boolean {
    return this.beforeInstallPromptEvent !== null;
  }

  /**
   * Déclenche l'invite d'installation de la PWA
   *
   * @returns Promise<boolean> - true si l'utilisateur a accepté l'installation
   * @throws PWAError.installNotSupported - Si l'installation n'est pas disponible
   * @throws PWAError.installPromptFailed - Si l'invite échoue
   *
   * Flow:
   * 1. Vérifie que l'événement beforeinstallprompt est disponible
   * 2. Déclenche l'invite d'installation via event.prompt()
   * 3. Attend la réponse de l'utilisateur via event.userChoice
   * 4. Nettoie l'événement si accepté (ne peut être utilisé qu'une fois)
   * 5. Retourne le résultat
   */
  static async promptInstall(): Promise<boolean> {
    if (!this.beforeInstallPromptEvent) {
      throw PWAError.installNotSupported();
    }

    try {
      await this.beforeInstallPromptEvent.prompt();
      const choiceResult = await this.beforeInstallPromptEvent.userChoice;

      if (choiceResult.outcome === "accepted") {
        this.beforeInstallPromptEvent = null;
        return true;
      }

      return false;
    } catch (error) {
      throw PWAError.installPromptFailed(error);
    }
  }

  /**
   * Vérifie si l'application est lancée en mode standalone (installée)
   *
   * @returns true si l'application est en mode standalone
   *
   * Détection multi-plateforme:
   * - window.matchMedia('(display-mode: standalone)') - Standard moderne
   * - window.navigator.standalone - Support iOS Safari
   *
   * SSR Safety:
   * Retourne false côté serveur (window undefined)
   */
  static isStandalone(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    );
  }

  /**
   * Vérifie si la bannière d'installation a été fermée récemment
   *
   * @returns true si la bannière a été fermée il y a moins de 7 jours
   *
   * Logique:
   * 1. Récupère le timestamp de fermeture depuis localStorage
   * 2. Compare avec la date actuelle
   * 3. Retourne true si la durée n'a pas expiré (7 jours)
   *
   * SSR Safety:
   * Retourne false côté serveur (window undefined)
   *
   * Error Handling:
   * Retourne false en cas d'erreur (localStorage inaccessible, etc.)
   */
  static isBannerDismissed(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      const dismissedAt = localStorage.getItem(INSTALL_BANNER_DISMISSED_KEY);
      if (!dismissedAt) {
        return false;
      }

      const dismissedTimestamp = parseInt(dismissedAt, 10);
      const now = Date.now();

      return now - dismissedTimestamp < INSTALL_BANNER_DISMISSED_DURATION;
    } catch (error) {
      return false;
    }
  }

  /**
   * Marque la bannière d'installation comme fermée
   *
   * @throws PWAError.storageFailed - Si l'enregistrement échoue
   *
   * Persistance:
   * Enregistre le timestamp actuel dans localStorage pour empêcher
   * l'affichage de la bannière pendant 7 jours
   */
  static dismissBanner(): void {
    try {
      localStorage.setItem(INSTALL_BANNER_DISMISSED_KEY, Date.now().toString());
    } catch (error) {
      throw PWAError.storageFailed(error);
    }
  }

  /**
   * Détermine si la bannière d'installation doit être affichée
   *
   * @returns true si toutes les conditions sont remplies
   *
   * Conditions d'affichage:
   * 1. L'application N'est PAS en mode standalone (non installée)
   * 2. L'installation est disponible (événement capturé)
   * 3. La bannière n'a PAS été fermée récemment (< 7 jours)
   *
   * Usage:
   * Utilisé dans usePWAInstall pour contrôler l'affichage du composant
   * InstallBanner dans l'interface utilisateur
   */
  static shouldShowBanner(): boolean {
    return (
      !this.isStandalone() && this.isInstallable() && !this.isBannerDismissed()
    );
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}
