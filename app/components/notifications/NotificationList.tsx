import useNotifications from "~/hooks/useNotifications";
import useAcceptSlot from "~/hooks/useAcceptSlot";
import useRefuseSlot from "~/hooks/useRefuseSlot";
import useRegisterSlot from "~/hooks/useRegisterSlot";
import useMarkAsRead from "~/hooks/useMarkAsRead";
import useNotificationSimulator from "~/hooks/useNotificationSimulator";
import NotificationCard from "./NotificationCard";
import { useMemo } from "react";

interface NotificationListProps {
  simulatorEnabled?: boolean;
  filterMode?: "all" | "pending";
  onFilterChange?: (mode: "all" | "pending") => void;
}

export default function NotificationList(props: NotificationListProps) {
  const {
    simulatorEnabled = false,
    filterMode = "all",
    onFilterChange,
  } = props;

  const {
    notifications,
    isLoadingNotifications,
    errorNotifications,
    refetchNotifications,
  } = useNotifications();

  const {
    simulatedNotifications,
    generateRandomNotification,
    clearSimulatedNotifications,
  } = useNotificationSimulator();

  const allNotifications = useMemo(() => {
    const baseNotifications = simulatorEnabled
      ? [...simulatedNotifications, ...(notifications || [])]
      : notifications || [];

    // Filtrer par mode
    if (filterMode === "pending") {
      return baseNotifications.filter(
        (n) => n.type === "SLOT_PROPOSAL" && n.status === "UNREAD"
      );
    }

    return baseNotifications;
  }, [simulatorEnabled, simulatedNotifications, notifications, filterMode]);

  const { acceptSlot, isAcceptingSlot } = useAcceptSlot({
    onSuccess: () => {
      refetchNotifications();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const { refuseSlot, isRefusingSlot } = useRefuseSlot({
    onSuccess: () => {
      refetchNotifications();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const { registerSlot, isRegisteringSlot } = useRegisterSlot({
    onSuccess: () => {
      refetchNotifications();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const { markAsRead } = useMarkAsRead({
    onSuccess: () => {
      refetchNotifications();
    },
  });

  const handleAccept = (notificationId: string, slotId: string) => {
    acceptSlot({ notificationId, slotId });
  };

  const handleRefuse = (notificationId: string, slotId: string) => {
    refuseSlot({ notificationId, slotId });
  };

  const handleRegister = (notificationId: string, slotId: string) => {
    registerSlot({ notificationId, slotId });
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };
  const unreadCount = allNotifications.filter(
    (n) => n.status === "UNREAD"
  ).length;

  // Calculer les compteurs pour tous les modes
  const allNotificationsBase = useMemo(() => {
    return simulatorEnabled
      ? [...simulatedNotifications, ...(notifications || [])]
      : notifications || [];
  }, [simulatorEnabled, simulatedNotifications, notifications]);

  const pendingCount = allNotificationsBase.filter(
    (n) => n.type === "SLOT_PROPOSAL" && n.status === "UNREAD"
  ).length;

  const totalCount = allNotificationsBase.length;
  if (isLoadingNotifications) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des notifications...</p>
        </div>
      </div>
    );
  }

  if (errorNotifications) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-semibold mb-2">
          Erreur lors du chargement
        </p>
        <p className="text-red-600 text-sm mb-4">
          {errorNotifications instanceof Error
            ? errorNotifications.message
            : "Une erreur est survenue"}
        </p>
        <button
          onClick={() => refetchNotifications()}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!allNotifications || allNotifications.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 sm:p-12 text-center">
        <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">📭</div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
          Aucune notification
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          {filterMode === "pending"
            ? "Aucune notification en attente"
            : "Vous n'avez pas de notifications pour le moment"}
        </p>
        {simulatorEnabled && (
          <button
            onClick={() => generateRandomNotification()}
            className="mt-7 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm sm:text-base"
          >
            Générer une notification de test
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Section sticky avec filtres, simulateur et compteur */}
      <div className="sticky top-20 bg-gray-50 pb-3 sm:pb-4">
        {/* Barre de filtres */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="font-semibold text-gray-800 text-sm sm:text-base">
              Filtrer
            </h2>
            <div className="grid grid-cols-2 sm:flex gap-2">
              <button
                onClick={() => onFilterChange?.("all")}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors text-xs sm:text-sm ${
                  filterMode === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="hidden sm:inline">Toutes</span>
                <span className="sm:hidden">Tout</span> ({totalCount})
              </button>
              <button
                onClick={() => onFilterChange?.("pending")}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors relative text-xs sm:text-sm ${
                  filterMode === "pending"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                En attente ({pendingCount})
                {pendingCount > 0 && filterMode !== "pending" && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {simulatorEnabled && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex flex-col gap-3">
              <div>
                <h3 className="font-semibold text-purple-900 text-sm sm:text-base mb-1">
                  Mode Simulateur activé
                </h3>
                <p className="text-xs sm:text-sm text-purple-700">
                  Générez des notifications factices
                </p>
              </div>
              <div className="grid grid-cols-2 sm:flex gap-2">
                <button
                  onClick={() => generateRandomNotification()}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">
                    + Nouvelle notification
                  </span>
                  <span className="sm:hidden">+ Nouveau</span>
                </button>
                {simulatedNotifications.length > 0 && (
                  <button
                    onClick={clearSimulatedNotifications}
                    className="bg-purple-200 hover:bg-purple-300 text-purple-900 font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors text-xs sm:text-sm"
                  >
                    Tout effacer
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {unreadCount > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 text-center">
            <p className="text-blue-700 font-semibold text-xs sm:text-sm">
              {unreadCount} notification{unreadCount > 1 ? "s" : ""} non lue
              {unreadCount > 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {allNotifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onAccept={handleAccept}
            onRefuse={handleRefuse}
            onRegister={handleRegister}
            onMarkAsRead={handleMarkAsRead}
            isAccepting={isAcceptingSlot}
            isRefusing={isRefusingSlot}
            isRegistering={isRegisteringSlot}
          />
        ))}
      </div>
    </div>
  );
}
