/**
 * Custom hook for polling new notifications
 *
 * Polls for new notifications every 30 seconds when the document is visible.
 * Used for users without push notification subscriptions.
 */

import { useQuery } from '@tanstack/react-query';
import { NotificationService } from '~/services/NotificationService';
import { isServer } from '~/utils/environment';

export default function useNotificationPolling() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', 'polling'],
    queryFn: () => NotificationService.getNotifications(),
    refetchInterval: 30000, // Poll every 30 seconds
    enabled: !isServer() && document.visibilityState === 'visible', // Only poll when visible
    staleTime: 0, // Always consider data stale for fresh polling
  });

  return {
    notifications: data || [],
    isPolling: isLoading,
    pollingError: error,
  };
}
