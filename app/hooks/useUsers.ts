/**
 * Custom hook to fetch all users (admin only)
 *
 * Used for recipient selection in SLOT_PROPOSAL notifications.
 */

import { useQuery } from '@tanstack/react-query';
import { AdminService } from '~/services/AdminService';

export default function useUsers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => AdminService.getUsers(),
  });

  return {
    users: data || [],
    isLoadingUsers: isLoading,
    errorUsers: error,
  };
}
