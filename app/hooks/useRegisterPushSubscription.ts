/**
 * Custom hook for registering push notifications
 *
 * Handles user registration for push notifications by requesting permission
 * and subscribing to push notifications via the NotificationService.
 *
 * Returns:
 * - registerPushSubscription: Function to initiate registration
 * - isRegistering: Boolean indicating registration in progress
 *
 * @example
 * ```tsx
 * const { registerPushSubscription, isRegistering } = useRegisterPushSubscription({
 *   onSuccess: () => alert('Notifications activées!'),
 *   onError: (error) => alert(error.message)
 * });
 *
 * <button onClick={() => registerPushSubscription()} disabled={isRegistering}>
 *   Activer les notifications
 * </button>
 * ```
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationService } from "~/services/NotificationService";
import { SupabaseService } from "~/services/SupabaseService";
import { AuthError } from "~/errors/AuthError";

interface UseRegisterPushSubscriptionParams {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function useRegisterPushSubscription({
  onSuccess,
  onError,
}: UseRegisterPushSubscriptionParams = {}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      // Check if user is authenticated
      const user = await SupabaseService.getCurrentUser();
      if (!user) {
        throw AuthError.unauthorized();
      }

      // Request notification permission
      const permission =
        await NotificationService.requestNotificationPermission();
      if (permission !== "granted") {
        throw new Error("Permission de notification refusée");
      }

      // Subscribe to push notifications (includes Supabase registration)
      const subscription = await NotificationService.subscribeToNotifications();
      return subscription;
    },
    onSuccess: () => {
      // Invalidate auth queries to refresh subscription status
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error("Registration error:", error.message);
      onError?.(error);
    },
  });

  return {
    registerPushSubscription: mutate,
    isRegistering: isPending,
  };
}
