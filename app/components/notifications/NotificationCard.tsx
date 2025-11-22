import type { Notification } from '~/types/notification';

interface NotificationCardProps {
  notification: Notification;
  onAccept: (notificationId: string, slotId: string) => void;
  onRefuse: (notificationId: string, slotId: string) => void;
  onRegister: (notificationId: string, slotId: string) => void;
  onMarkAsRead: (notificationId: string) => void;
  isAccepting: boolean;
  isRefusing: boolean;
  isRegistering: boolean;
}

export default function NotificationCard(props: NotificationCardProps) {
  const { notification, onAccept, onRefuse, onRegister, onMarkAsRead, isAccepting, isRefusing, isRegistering } = props;

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'SLOT_AVAILABLE':
        return '🔔';
      case 'SLOT_CANCELLED':
        return '❌';
      case 'SLOT_PROPOSAL':
        return '📩';
      default:
        return '📬';
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'SLOT_AVAILABLE':
        return 'bg-green-50 border-green-200';
      case 'SLOT_CANCELLED':
        return 'bg-red-50 border-red-200';
      case 'SLOT_PROPOSAL':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const handleAccept = () => {
    onAccept(notification.id, notification.slot.id);
  };

  const handleRefuse = () => {
    onRefuse(notification.id, notification.slot.id);
  };

  const handleRegister = () => {
    onRegister(notification.id, notification.slot.id);
  };

  const handleMarkAsRead = () => {
    if (notification.status === 'UNREAD') {
      onMarkAsRead(notification.id);
    }
  };

  const showProposalActions = notification.type === 'SLOT_PROPOSAL' && notification.status === 'UNREAD';
  const showAvailableActions = notification.type === 'SLOT_AVAILABLE' && notification.status === 'UNREAD';
  const isRead = notification.status === 'READ';

  return (
    <div
      className={`border-2 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 transition-all active:shadow-lg sm:hover:shadow-md ${
        isRead ? 'opacity-50 bg-gray-100 border-gray-300' : getNotificationColor()
      } ${
        notification.status === 'UNREAD' ? 'border-l-4' : ''
      }`}
      onClick={handleMarkAsRead}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="text-2xl sm:text-3xl shrink-0">{getNotificationIcon()}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-base sm:text-lg flex-1">{notification.title}</h3>
            {notification.status === 'UNREAD' && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 sm:py-1 rounded-full shrink-0">
                Nouvelle
              </span>
            )}
          </div>

          <p className="text-sm sm:text-base text-gray-700 mb-3">{notification.message}</p>

          <div className="bg-white rounded-md p-2 sm:p-3 border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
              <div>
                <span className="font-semibold block">Date</span>
                <p className="text-gray-700">{formatDate(notification.slot.date)}</p>
              </div>
              <div>
                <span className="font-semibold block">Horaire</span>
                <p className="text-gray-700">
                  {formatTime(notification.slot.startTime)} - {formatTime(notification.slot.endTime)}
                </p>
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold block">Lieu</span>
                <p className="text-gray-700">{notification.slot.location}</p>
              </div>
              {notification.slot.description && (
                <div className="sm:col-span-2">
                  <span className="font-semibold block">Description</span>
                  <p className="text-gray-600">{notification.slot.description}</p>
                </div>
              )}
            </div>
          </div>

          {showProposalActions && (
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 mt-3 sm:mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAccept();
                }}
                disabled={isAccepting || isRefusing}
                className="bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
              >
                <span className="hidden sm:inline">{isAccepting ? 'Acceptation...' : 'Accepter'}</span>
                <span className="sm:hidden">{isAccepting ? '...' : 'Accepter'}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRefuse();
                }}
                disabled={isAccepting || isRefusing}
                className="bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
              >
                <span className="hidden sm:inline">{isRefusing ? 'Refus...' : 'Refuser'}</span>
                <span className="sm:hidden">{isRefusing ? '...' : 'Refuser'}</span>
              </button>
            </div>
          )}

          {showAvailableActions && (
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 mt-3 sm:mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRegister();
                }}
                disabled={isRegistering}
                className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base col-span-2 sm:col-span-1"
              >
                <span className="hidden sm:inline">{isRegistering ? 'Inscription...' : "S'inscrire"}</span>
                <span className="sm:hidden">{isRegistering ? '...' : "S'inscrire"}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAsRead();
                }}
                disabled={isRegistering}
                className="bg-gray-500 hover:bg-gray-600 active:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base col-span-2 sm:col-span-1"
              >
                Marquer comme lu
              </button>
            </div>
          )}

          {isRead && notification.type === 'SLOT_AVAILABLE' && (
            <div className="mt-3 sm:mt-4 text-center">
              <span className="inline-block bg-gray-400 text-white text-xs sm:text-sm px-3 py-1 rounded-full">
                Marqué comme lu
              </span>
            </div>
          )}

          <div className="mt-2 text-xs text-gray-500">
            Reçu le {new Date(notification.createdAt).toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
