/**
 * Custom hook for authentication
 *
 * Manages user authentication state and provides login/logout functions.
 *
 * Returns:
 * - user: Current user profile or null
 * - isAdmin: Boolean indicating if user is admin
 * - login: Function to authenticate user
 * - logout: Function to sign out user
 * - isLoggingIn: Boolean indicating login in progress
 * - isLoggingOut: Boolean indicating logout in progress
 * - errorAuth: Authentication error if any
 * - isLoadingAuth: Boolean indicating initial auth check
 *
 * @example
 * ```tsx
 * const { user, isAdmin, login, logout } = useAuth();
 *
 * if (isAdmin) {
 *   return <AdminDashboard />;
 * }
 * ```
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService, type UserProfile } from '~/services/AuthService';
import { AuthError } from '~/errors/AuthError';

export default function useAuth() {
  const queryClient = useQueryClient();

  // Query for current session
  const {
    data: user,
    isLoading: isLoadingAuth,
    error: errorAuth,
  } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: () => AuthService.getCurrentSession(),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Login mutation
  const {
    mutate: loginMutate,
    isPending: isLoggingIn,
  } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      AuthService.login(email, password),
    onSuccess: (data: UserProfile) => {
      queryClient.setQueryData(['auth', 'session'], data);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error: Error) => {
      console.error('Login error:', error);
    },
  });

  // Logout mutation
  const {
    mutate: logoutMutate,
    isPending: isLoggingOut,
  } = useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'session'], null);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.clear(); // Clear all cached data on logout
    },
    onError: (error: Error) => {
      console.error('Logout error:', error);
    },
  });

  // Wrapper functions with callbacks
  const login = (
    email: string,
    password: string,
    onSuccess?: (user: UserProfile) => void,
    onError?: (error: Error) => void
  ) => {
    loginMutate(
      { email, password },
      {
        onSuccess,
        onError,
      }
    );
  };

  const logout = (onSuccess?: () => void, onError?: (error: Error) => void) => {
    logoutMutate(undefined, {
      onSuccess,
      onError,
    });
  };

  return {
    user: user ?? null,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    isLoggingIn,
    isLoggingOut,
    errorAuth: errorAuth as AuthError | null,
    isLoadingAuth,
  };
}
