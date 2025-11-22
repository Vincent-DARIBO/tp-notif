import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '../services/NotificationService';

export default function useMarkAsRead({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
} = {}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (notificationId: string) => NotificationService.markAsRead(notificationId),
    onError: (error: Error) => {
      console.error('useMarkAsRead: onError', error.message);
      onError?.(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      onSuccess?.();
    },
  });

  return { markAsRead: mutate, isMarkingAsRead: isPending };
}
