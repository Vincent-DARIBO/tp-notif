import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '../services/NotificationService';
import type { AcceptSlotDTO } from '../types/notification';

export default function useAcceptSlot({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
} = {}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: AcceptSlotDTO) => NotificationService.acceptSlot(payload),
    onError: (error: Error) => {
      console.error('useAcceptSlot: onError', error.message);
      onError?.(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      onSuccess?.();
    },
  });

  return { acceptSlot: mutate, isAcceptingSlot: isPending };
}
