/**
 * Notification History List (Admin)
 *
 * Displays the complete notification history with delivery metrics.
 */

import useNotificationHistory from '~/hooks/useNotificationHistory';
import type { NotificationHistoryItem } from '~/types/admin';

function NotificationHistoryCard({ notification }: { notification: NotificationHistoryItem }) {
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'SLOT_PROPOSAL':
        return 'bg-blue-100 text-blue-800';
      case 'SLOT_AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'SLOT_CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'SLOT_PROPOSAL':
        return 'Proposition';
      case 'SLOT_AVAILABLE':
        return 'Disponible';
      case 'SLOT_CANCELLED':
        return 'Annulé';
      default:
        return type;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span
            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getTypeBadgeColor(notification.type)}`}
          >
            {getTypeLabel(notification.type)}
          </span>
          <p className="mt-2 text-sm text-gray-600">
            Envoyé le{' '}
            {new Date(notification.sentAt).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="text-xs text-gray-500">Par: {notification.sentBy.email}</p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Détails du créneau</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <strong>Date:</strong> {notification.slot.date}
          </p>
          <p>
            <strong>Horaire:</strong> {notification.slot.startTime} - {notification.slot.endTime}
          </p>
          <p>
            <strong>Lieu:</strong> {notification.slot.location}
          </p>
          {notification.slot.description && (
            <p>
              <strong>Description:</strong> {notification.slot.description}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Métriques</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-gray-500">Destinataires</p>
            <p className="text-lg font-semibold text-gray-900">
              {notification.metrics.totalRecipients}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Reçus</p>
            <p className="text-lg font-semibold text-green-600">{notification.metrics.received}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Cliqués</p>
            <p className="text-lg font-semibold text-blue-600">{notification.metrics.clicked}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Acceptés</p>
            <p className="text-lg font-semibold text-green-600">{notification.metrics.accepted}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Refusés</p>
            <p className="text-lg font-semibold text-red-600">{notification.metrics.refused}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationHistoryList() {
  const { history, isLoadingHistory, errorHistory, refetchHistory } = useNotificationHistory();

  if (isLoadingHistory) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Chargement de l'historique...</p>
      </div>
    );
  }

  if (errorHistory) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-red-600">
          Erreur lors du chargement de l'historique:{' '}
          {errorHistory instanceof Error ? errorHistory.message : 'Erreur inconnue'}
        </p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Aucune notification envoyée pour le moment.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Historique des notifications</h2>
        <button
          onClick={() => refetchHistory()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Actualiser
        </button>
      </div>

      <div className="space-y-4">
        {history.map((notification) => (
          <NotificationHistoryCard key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
}
