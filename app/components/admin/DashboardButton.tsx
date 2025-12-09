/**
 * Dashboard Button Component
 *
 * Displays dashboard access button for admin users.
 * Returns null if user is not admin.
 * Pure UI component - all logic is handled by useDashboardButton hook.
 */

import useDashboardButton from '~/hooks/useDashboardButton';

export default function DashboardButton() {
  const { isAdmin, navigateToDashboard } = useDashboardButton();

  if (!isAdmin) {
    return null;
  }

  return (
    <button
      onClick={navigateToDashboard}
      className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-semibold transition-colors whitespace-nowrap bg-blue-500 hover:bg-blue-600 text-white"
    >
      <span className="hidden sm:inline">📊 Dashboard</span>
      <span className="sm:hidden">📊</span>
    </button>
  );
}
