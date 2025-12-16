/**
 * Admin Send Notification Route
 *
 * Allows admins to create and send notifications.
 */

import ProtectedRoute from '~/components/ProtectedRoute';
import AdminLayout from '~/components/admin/AdminLayout';
import SendNotificationForm from '~/components/admin/SendNotificationForm';

export default function AdminSend() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <SendNotificationForm />
      </AdminLayout>
    </ProtectedRoute>
  );
}
