/**
 * Custom hook for unregistering push notifications
 *
 * Handles unregistration of push notifications by removing the subscription
 * from Supabase and unsubscribing from the browser push service.
 *
 * Returns:
 * - unregisterPushSubscription: Function to initiate unregistration
 * - isUnregistering: Boolean indicating unregistration in progress
 *
 * @example
 * ```tsx
 * const { unregisterPushSubscription, isUnregistering } = useUnregisterPushSubscription({
 *   onSuccess: () => alert('Notifications désactivées'),
 *   onError: (error) => alert(error.message)
 * });
 *
 * <button onClick={() => unregisterPushSubscription()} disabled={isUnregistering}>
 *   Désactiver les notifications
 * </button>
 * ```
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '~/services/NotificationService';
import { SupabaseService } from '~/services/SupabaseService';
import { AuthError } from '~/errors/AuthError';

interface UseUnregisterPushSubscriptionParams {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function useUnregisterPushSubscription({
  onSuccess,
  onError,
}: UseUnregisterPushSubscriptionParams = {}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      // Check if user is authenticated
      const user = await SupabaseService.getCurrentUser();
      if (!user) {
        throw AuthError.unauthorized();
      }

      // Get current subscription
      const subscription = await NotificationService.getCurrentSubscription();
      if (!subscription) {
        throw new Error('Aucune souscription active trouvée');
      }

      // Unregister from Supabase
      await SupabaseService.unregisterPushSubscription(subscription.endpoint);

      // Unsubscribe from browser push service
      await subscription.unsubscribe();
    },
    onSuccess: () => {
      // Invalidate auth queries to refresh subscription status
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error('Unregistration error:', error);
      onError?.(error);
    },
  });

  return {
    unregisterPushSubscription: mutate,
    isUnregistering: isPending,
  };
}
