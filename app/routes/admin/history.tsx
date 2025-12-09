/**
 * Admin History Route
 *
 * Displays the notification history with metrics.
 */

import ProtectedRoute from '~/components/ProtectedRoute';
import AdminLayout from '~/components/admin/AdminLayout';

export default function AdminHistory() {
  return (
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  );
}

export function HistoryContent() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Historique des notifications
      </h2>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">
          Fonctionnalité en cours de développement...
        </p>
        <p className="text-sm text-gray-500">
          Cette page affichera l'historique complet des notifications envoyées avec les métriques associées.
        </p>
      </div>
    </div>
  );
}
