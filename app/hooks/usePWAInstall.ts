import { useState, useEffect } from "react";
import { PWAService } from "../services/PWAService";
import { json } from "stream/consumers";

export default function usePWAInstall() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      PWAService.setBeforeInstallPromptEvent(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      setShowBanner(PWAService.shouldShowBanner());
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setShowBanner(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    setShowBanner(PWAService.shouldShowBanner());
    setIsStandalone(PWAService.isStandalone());

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

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
