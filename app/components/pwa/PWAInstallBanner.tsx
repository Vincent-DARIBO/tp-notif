import usePWAInstall from "~/hooks/usePWAInstall";

export default function PWAInstallBanner() {
  const { showBanner, isInstalling, promptInstall, dismissBanner } =
    usePWAInstall();

  if (!showBanner) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 border border-blue-300 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-3xl sm:text-4xl">📱</div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm sm:text-base mb-1">
              Installer l'application
            </h3>
            <p className="text-xs sm:text-sm text-blue-50">
              Accédez rapidement à vos notifications depuis votre écran
              d'accueil
            </p>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={dismissBanner}
            disabled={isInstalling}
            className="flex-1 sm:flex-none bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Plus tard
          </button>
          <button
            onClick={promptInstall}
            disabled={isInstalling}
            className="flex-1 sm:flex-none bg-white hover:bg-gray-100 text-blue-600 font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isInstalling ? "Installation..." : "Installer"}
          </button>
        </div>
      </div>
    </div>
  );
}
