/**
 * Auth Buttons Component
 *
 * Displays login/register buttons when not logged in,
 * or user info and logout button when logged in.
 * Pure UI component - all logic is handled by useAuthButtons hook.
 */

import useAuthButtons from '~/hooks/useAuthButtons';

export default function AuthButtons() {
  const { isLoggedIn, user, handleLogout } = useAuthButtons();

  if (isLoggedIn && user) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs text-gray-600">Connecté</span>
          <span className="text-sm font-medium text-gray-800 truncate max-w-[150px]">
            {user.email}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
        >
          <span className="hidden sm:inline">Déconnexion</span>
          <span className="sm:hidden">Sortir</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href="/login"
        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
      >
        Connexion
      </a>
      <a
        href="/register"
        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
      >
        <span className="hidden sm:inline">S'inscrire</span>
        <span className="sm:hidden">Inscription</span>
      </a>
    </div>
  );
}
