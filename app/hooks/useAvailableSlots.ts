/**
 * Custom hook to fetch available slots for cancellation (admin only)
 *
 * Fetches slots that have accepted recipients, used for SLOT_CANCELLED selector.
 */

import { useQuery } from '@tanstack/react-query';
import { AdminService } from '~/services/AdminService';

export default function useAvailableSlots() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['availableSlots'],
    queryFn: () => AdminService.getAvailableSlots(),
  });

  return {
    slots: data || [],
    isLoadingSlots: isLoading,
    errorSlots: error,
  };
}
