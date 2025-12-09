/**
 * Custom hook for dashboard button logic
 *
 * Manages dashboard access for admin users.
 *
 * Returns:
 * - isAdmin: Boolean indicating if user is admin
 * - navigateToDashboard: Function to navigate to admin dashboard
 *
 * @example
 * ```tsx
 * const { isAdmin, navigateToDashboard } = useDashboardButton();
 *
 * if (!isAdmin) return null;
 * ```
 */

import { useNavigate } from 'react-router';
import useAuth from '~/hooks/useAuth';

export default function useDashboardButton() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const navigateToDashboard = () => {
    navigate('/admin/dashboard');
  };

  return {
    isAdmin,
    navigateToDashboard,
  };
}
