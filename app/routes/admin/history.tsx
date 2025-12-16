/**
 * Admin History Route
 *
 * Displays the notification history with metrics.
 */

import ProtectedRoute from '~/components/ProtectedRoute';
import AdminLayout from '~/components/admin/AdminLayout';
import NotificationHistoryList from '~/components/admin/NotificationHistoryList';

export default function AdminHistory() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <NotificationHistoryList />
      </AdminLayout>
    </ProtectedRoute>
  );
}
