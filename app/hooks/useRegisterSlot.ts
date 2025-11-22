import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '../services/NotificationService';
import type { RegisterSlotDTO } from '../types/notification';

export default function useRegisterSlot({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
} = {}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: RegisterSlotDTO) => NotificationService.registerSlot(payload),
    onError: (error: Error) => {
      console.error('useRegisterSlot: onError', error.message);
      onError?.(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      onSuccess?.();
    },
  });

  return { registerSlot: mutate, isRegisteringSlot: isPending };
}
