/**
 * Custom hook to fetch notification history with metrics (admin only)
 *
 * Fetches all sent notifications with delivery and engagement metrics.
 */

import { useQuery } from '@tanstack/react-query';
import { AdminService } from '~/services/AdminService';

export default function useNotificationHistory() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notificationHistory'],
    queryFn: () => AdminService.getNotificationHistory(),
  });

  return {
    history: data || [],
    isLoadingHistory: isLoading,
    errorHistory: error,
    refetchHistory: refetch,
  };
}
