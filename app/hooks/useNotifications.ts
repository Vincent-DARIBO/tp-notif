import { useQuery } from "@tanstack/react-query";
import { NotificationService } from "../services/NotificationService";

export default function useNotifications() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => NotificationService.getNotifications(),
  });

  return {
    notifications: data,
    isLoadingNotifications: isLoading,
    errorNotifications: error,
    refetchNotifications: refetch,
  };
}
