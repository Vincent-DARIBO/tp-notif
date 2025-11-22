import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '../services/NotificationService';
import type { RefuseSlotDTO } from '../types/notification';

export default function useRefuseSlot({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
} = {}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: RefuseSlotDTO) => NotificationService.refuseSlot(payload),
    onError: (error: Error) => {
      console.error('useRefuseSlot: onError', error.message);
      onError?.(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      onSuccess?.();
    },
  });

  return { refuseSlot: mutate, isRefusingSlot: isPending };
}
