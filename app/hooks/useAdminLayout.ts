/**
 * Custom hook for admin layout logic
 *
 * Manages admin layout state and navigation logic.
 *
 * Responsibilities:
 * - Get current user info
 * - Handle logout action
 * - Determine active navigation item
 * - Provide navigation items configuration
 *
 * Returns:
 * - user: Current user profile
 * - handleLogout: Function to logout and redirect
 * - navItems: Array of navigation items
 * - isActive: Function to check if path is active
 *
 * @example
 * ```tsx
 * const { user, handleLogout, navItems, isActive } = useAdminLayout();
 * ```
 */

import { useLocation } from 'react-router';
import useAuth from '~/hooks/useAuth';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

export default function useAdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems: NavItem[] = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/send', label: 'Envoyer notification', icon: '📤' },
    { path: '/admin/history', label: 'Historique', icon: '📜' },
  ];

  const handleLogout = () => {
    logout(
      () => {
        window.location.href = '/admin/login';
      },
      (error) => {
        console.error('Logout error:', error);
      }
    );
  };

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  return {
    user,
    handleLogout,
    navItems,
    isActive,
  };
}
