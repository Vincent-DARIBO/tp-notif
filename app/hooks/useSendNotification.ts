/**
 * Custom hook for sending notifications (admin only)
 *
 * Uses React Query mutation to send notifications via AdminService.
 * Invalidates notification history on success.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '~/services/AdminService';
import type { SendNotificationPayload, DeliveryReport } from '~/types/admin';

interface UseSendNotificationOptions {
  onSuccess?: (data: DeliveryReport) => void;
  onError?: (error: Error) => void;
}

export default function useSendNotification({
  onSuccess,
  onError,
}: UseSendNotificationOptions = {}) {
  const queryClient = useQueryClient();

  const { mutate, isPending, data, error } = useMutation({
    mutationFn: (payload: SendNotificationPayload) =>
      AdminService.sendNotification(payload),
    onSuccess: (deliveryReport) => {
      // Invalidate notification history to refresh the list
      queryClient.invalidateQueries({ queryKey: ['notificationHistory'] });
      onSuccess?.(deliveryReport);
    },
    onError: (err: Error) => {
      console.log('useSendNotification: onError', JSON.stringify(err, null, 2));
      onError?.(err);
    },
  });

  return {
    sendNotification: mutate,
    isSending: isPending,
    deliveryReport: data,
    sendError: error,
  };
}
