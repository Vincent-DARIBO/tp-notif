/**
 * Admin Send Notification Route
 *
 * Allows admins to create and send notifications.
 */

import ProtectedRoute from '~/components/ProtectedRoute';
import AdminLayout from '~/components/admin/AdminLayout';

export default function AdminSend() {
  return (
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  );
}

export function SendContent() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Envoyer une notification
      </h2>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">
          Fonctionnalité en cours de développement...
        </p>
        <p className="text-sm text-gray-500">
          Cette page permettra de créer et envoyer des notifications aux utilisateurs.
        </p>
      </div>
    </div>
  );
}
