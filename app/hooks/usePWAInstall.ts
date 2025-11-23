import { useState, useEffect } from "react";
import { PWAService } from "../services/PWAService";

/**
 * Hook personnalisé pour gérer l'installation PWA
 *
 * Responsabilités:
 * - Gérer les états liés à l'installation PWA (installable, installing, standalone)
 * - Écouter les événements beforeinstallprompt et appinstalled
 * - Contrôler l'affichage de la bannière d'installation
 * - Exposer des fonctions pour déclencher l'installation ou fermer la bannière
 *
 * Architecture:
 * Ce hook fait le pont entre le PWAService (logique métier) et les composants React (UI).
 * Il gère l'état local et délègue la logique métier au service.
 *
 * @returns {Object} État et fonctions pour gérer l'installation PWA
 * @returns {boolean} isInstallable - L'app peut-elle être installée ?
 * @returns {boolean} showBanner - La bannière doit-elle être affichée ?
 * @returns {boolean} isInstalling - Installation en cours ?
 * @returns {boolean} isStandalone - L'app est-elle en mode standalone ?
 * @returns {Function} promptInstall - Déclenche l'invite d'installation
 * @returns {Function} dismissBanner - Ferme la bannière pour 7 jours
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isInstallable, showBanner, promptInstall, dismissBanner } = usePWAInstall();
 *
 *   if (!showBanner) return null;
 *
 *   return (
 *     <div>
 *       <button onClick={promptInstall}>Installer l'app</button>
 *       <button onClick={dismissBanner}>Fermer</button>
 *     </div>
 *   );
 * }
 * ```
 */
export default function usePWAInstall() {
  /**
   * État: L'application peut-elle être installée ?
   * true si l'événement beforeinstallprompt a été capturé
   */
  const [isInstallable, setIsInstallable] = useState(false);

  /**
   * État: La bannière d'installation doit-elle être affichée ?
   * Contrôlé par les conditions: non standalone, installable, non fermée récemment
   */
  const [showBanner, setShowBanner] = useState(false);

  /**
   * État: Installation en cours ?
   * true pendant l'attente de la réponse utilisateur à l'invite d'installation
   */
  const [isInstalling, setIsInstalling] = useState(false);

  /**
   * État: L'application est-elle en mode standalone (installée) ?
   * true si l'app a été installée et lancée depuis l'écran d'accueil
   */
  const [isStandalone, setIsStandalone] = useState(false);

  /**
   * Effect: Configuration des événements PWA au montage du composant
   *
   * Flow:
   * 1. Vérifie que nous sommes côté client (typeof window !== "undefined")
   * 2. Définit les gestionnaires d'événements beforeinstallprompt et appinstalled
   * 3. Enregistre les listeners
   * 4. Initialise les états showBanner et isStandalone
   * 5. Nettoie les listeners au démontage
   *
   * SSR Safety:
   * Return early si window est undefined (rendering côté serveur)
   */
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    /**
     * Gestionnaire de l'événement beforeinstallprompt
     *
     * Déclenché par le navigateur quand l'app est éligible à l'installation.
     * Cet événement est capturé et stocké dans le service pour être utilisé
     * plus tard quand l'utilisateur clique sur "Installer".
     *
     * @param e - L'événement beforeinstallprompt natif du navigateur
     */
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Empêche l'affichage automatique de l'invite du navigateur
      PWAService.setBeforeInstallPromptEvent(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      setShowBanner(PWAService.shouldShowBanner());
    };

    /**
     * Gestionnaire de l'événement appinstalled
     *
     * Déclenché quand l'utilisateur a installé l'application avec succès.
     * Met à jour les états pour refléter que l'installation est terminée.
     */
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setShowBanner(false);
    };

    // Enregistrement des event listeners
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Initialisation des états au montage
    setShowBanner(PWAService.shouldShowBanner());
    setIsStandalone(PWAService.isStandalone());

    // Cleanup: suppression des event listeners au démontage
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  /**
   * Déclenche l'invite d'installation de la PWA
   *
   * Flow:
   * 1. Vérifie que l'installation est possible
   * 2. Active l'état isInstalling (pour afficher un loader)
   * 3. Délègue au PWAService.promptInstall()
   * 4. Si accepté, cache la bannière et met à jour l'état
   * 5. Gère les erreurs en les loggant
   * 6. Désactive l'état isInstalling dans le finally
   *
   * @returns Promise<boolean> - true si l'utilisateur a accepté l'installation
   *
   * @example
   * ```tsx
   * <button onClick={async () => {
   *   const installed = await promptInstall();
   *   if (installed) {
   *     console.log('App installée !');
   *   }
   * }}>
   *   Installer
   * </button>
   * ```
   */
  const promptInstall = async (): Promise<boolean> => {
    if (!isInstallable) {
      return false;
    }

    try {
      setIsInstalling(true);
      const accepted = await PWAService.promptInstall();

      if (accepted) {
        setShowBanner(false);
        setIsInstallable(false);
      }

      return accepted;
    } catch (error) {
      console.error("Erreur lors de l'installation:", error);
      return false;
    } finally {
      setIsInstalling(false);
    }
  };

  /**
   * Ferme la bannière d'installation pour 7 jours
   *
   * Enregistre un timestamp dans localStorage via PWAService.dismissBanner()
   * pour empêcher l'affichage de la bannière pendant 7 jours.
   *
   * Error Handling:
   * Les erreurs sont loggées mais n'empêchent pas la fermeture de la bannière
   * dans l'interface (l'état local est mis à jour quoi qu'il arrive).
   *
   * @example
   * ```tsx
   * <button onClick={dismissBanner}>Plus tard</button>
   * ```
   */
  const dismissBanner = (): void => {
    try {
      PWAService.dismissBanner();
      setShowBanner(false);
    } catch (error) {
      console.error("Erreur lors de la fermeture de la bannière:", error);
    }
  };

  return {
    isInstallable,
    showBanner,
    isInstalling,
    isStandalone,
    promptInstall,
    dismissBanner,
  };
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}
