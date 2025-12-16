/**
 * Custom hook to fetch recipients for a specific slot (admin only)
 *
 * Used to preview recipients before sending SLOT_CANCELLED notification.
 */

import { useQuery } from '@tanstack/react-query';
import { AdminService } from '~/services/AdminService';

export default function useSlotRecipients(slotId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['slotRecipients', slotId],
    queryFn: () => AdminService.getSlotRecipients(slotId),
    enabled: !!slotId, // Only fetch when slotId is provided
  });

  return {
    recipients: data || [],
    isLoadingRecipients: isLoading,
    errorRecipients: error,
  };
}
