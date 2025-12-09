/**
 * Custom hook for auth buttons logic
 *
 * Manages authentication button display and actions.
 *
 * Responsibilities:
 * - Determine if user is logged in
 * - Get user info for display
 * - Handle logout action
 *
 * Returns:
 * - isLoggedIn: Boolean indicating if user is authenticated
 * - user: Current user profile or null
 * - handleLogout: Function to logout user
 *
 * @example
 * ```tsx
 * const { isLoggedIn, user, handleLogout } = useAuthButtons();
 * ```
 */

import useAuth from '~/hooks/useAuth';

export default function useAuthButtons() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout(
      () => {
        window.location.href = '/';
      },
      (error) => {
        console.error('Logout error:', error);
      }
    );
  };

  return {
    isLoggedIn: !!user,
    user,
    handleLogout,
  };
}
