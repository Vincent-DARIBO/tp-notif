import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import type { Route } from "./+types/notifications";
import NotificationList from "~/components/notifications/NotificationList";
import { registerServiceWorker } from "~/utils/registerServiceWorker";
import { NotificationService } from "~/services/NotificationService";
import { isClient } from "~/utils/environment";
import { queryClient } from "~/utils/queryClient";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TP Notifications" },
    { name: "description", content: "Gérez vos notifications de créneaux" },
  ];
}

export default function NotificationsPage() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [simulatorMode, setSimulatorMode] = useState(true); // Mode simulateur activé par défaut pour les tests
  const [filterMode, setFilterMode] = useState<"all" | "pending">("all");
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);

  useEffect(() => {
    registerServiceWorker();

    if (isClient() && "Notification" in window) {
      if (Notification.permission === "granted") {
        setPermissionGranted(true);
      } else if (Notification.permission !== "denied") {
        setShowNotificationBanner(true);
      }
    }
  }, []);

  const handleRequestPermission = async () => {
    try {
      const permission =
        await NotificationService.requestNotificationPermission();
      if (permission === "granted") {
        setPermissionGranted(true);
        setShowNotificationBanner(false);
        await NotificationService.subscribeToNotifications();
      }
    } catch (error) {
      console.error("Erreur lors de la demande de permission:", error);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
                  Centre de Notifications
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                  Gérez vos créneaux
                </p>
              </div>
              <button
                onClick={() => setSimulatorMode(!simulatorMode)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  simulatorMode
                    ? "bg-purple-500 hover:bg-purple-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                <span className="hidden sm:inline">
                  {simulatorMode ? "🧪 Simulateur ON" : "🧪 Simulateur OFF"}
                </span>
                <span className="sm:hidden">
                  {simulatorMode ? "🧪 ON" : "🧪 OFF"}
                </span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-3 py-4 sm:px-4 sm:py-6">
          {/* <PWAInstallBanner /> */}

          {showNotificationBanner && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 text-sm sm:text-base mb-1">
                    Activer les notifications push
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-700">
                    Recevez des notifications en temps réel
                  </p>
                </div>
                <button
                  onClick={handleRequestPermission}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base w-full sm:w-auto"
                >
                  Activer
                </button>
              </div>
            </div>
          )}

          <NotificationList
            simulatorEnabled={simulatorMode}
            filterMode={filterMode}
            onFilterChange={setFilterMode}
          />
        </main>
      </div>
    </QueryClientProvider>
  );
}
