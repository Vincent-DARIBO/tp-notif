/**
 * Protected Route Component
 *
 * Wraps admin routes to ensure only authenticated admins can access them.
 * Redirects to login page if user is not authenticated or not an admin.
 *
 * @example
 * ```tsx
 * <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
 * ```
 */

import { Navigate } from 'react-router';
import useAuth from '~/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAdmin, isLoadingAuth } = useAuth();

  // Show loading state while checking auth
  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Redirect to notifications if not admin
  if (!isAdmin) {
    return <Navigate to="/notifications" replace />;
  }

  // User is authenticated and admin, render children
  return <>{children}</>;
}
