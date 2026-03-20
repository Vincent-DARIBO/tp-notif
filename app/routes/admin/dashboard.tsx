/**
 * Admin Dashboard Route
 *
 * Displays the admin dashboard with statistics and quick actions.
 */

import { useState } from 'react';
import ProtectedRoute from '~/components/ProtectedRoute';
import AdminLayout from '~/components/admin/AdminLayout';
import useTestPushNotification from '~/hooks/useTestPushNotification';

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <DashboardContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { testPushNotification, isTesting } = useTestPushNotification();
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestPush = async () => {
    setTestResult(null);
    testPushNotification(undefined, {
      onSuccess: (data) => {
        if (data.success) {
          setTestResult(
            `✅ Test réussi ! ${data.pushNotificationsSent}/${data.subscriptionsFound} notifications envoyées.`
          );
        } else {
          setTestResult(`⚠️ ${data.message || 'Aucune subscription trouvée'}`);
        }
      },
      onError: (error) => {
        setTestResult(`❌ Erreur: ${error.message}`);
      },
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Stat Card: Total Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="rounded-md bg-blue-500 p-3">
                <span className="text-2xl">📧</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Notifications envoyées
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">-</dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Stat Card: Active Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="rounded-md bg-green-500 p-3">
                <span className="text-2xl">👥</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Utilisateurs actifs
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">-</dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Stat Card: Click Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="rounded-md bg-purple-500 p-3">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Taux de clic
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">-%</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Actions rapides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/send"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <span className="text-3xl mr-4">📤</span>
            <div>
              <h4 className="font-medium text-gray-900">
                Envoyer une notification
              </h4>
              <p className="text-sm text-gray-600">
                Créer et envoyer une nouvelle notification
              </p>
            </div>
          </a>

          <a
            href="/admin/history"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <span className="text-3xl mr-4">📜</span>
            <div>
              <h4 className="font-medium text-gray-900">
                Consulter l'historique
              </h4>
              <p className="text-sm text-gray-600">
                Voir les notifications envoyées et leurs métriques
              </p>
            </div>
          </a>

          <button
            onClick={handleTestPush}
            disabled={isTesting}
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-3xl mr-4">🧪</span>
            <div className="text-left">
              <h4 className="font-medium text-gray-900">
                {isTesting ? 'Test en cours...' : 'Tester les notifications'}
              </h4>
              <p className="text-sm text-gray-600">
                Envoyer une notification de test à vos appareils
              </p>
            </div>
          </button>
        </div>

        {/* Test Result Display */}
        {testResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">{testResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}
