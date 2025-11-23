import { PWAError } from "../errors/PWAError";

const INSTALL_BANNER_DISMISSED_KEY = "pwa_install_banner_dismissed";
const INSTALL_BANNER_DISMISSED_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours

export class PWAService {
  private static beforeInstallPromptEvent: BeforeInstallPromptEvent | null =
    null;

  static setBeforeInstallPromptEvent(event: BeforeInstallPromptEvent): void {
    this.beforeInstallPromptEvent = event;
  }

  static isInstallable(): boolean {
    return this.beforeInstallPromptEvent !== null;
  }

  static async promptInstall(): Promise<boolean> {
    if (!this.beforeInstallPromptEvent) {
      throw PWAError.installNotSupported();
    }

    try {
      this.beforeInstallPromptEvent.prompt();
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

  static isStandalone(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    );
  }

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

  static dismissBanner(): void {
    try {
      localStorage.setItem(
        INSTALL_BANNER_DISMISSED_KEY,
        Date.now().toString()
      );
    } catch (error) {
      throw PWAError.storageFailed(error);
    }
  }

  static shouldShowBanner(): boolean {
    return (
      !this.isStandalone() &&
      this.isInstallable() &&
      !this.isBannerDismissed()
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
