import { useMutation } from '@tanstack/react-query';
import AdminService from '~/services/AdminService';

interface TestPushResult {
  success: boolean;
  subscriptionsFound: number;
  pushNotificationsSent: number;
  failedDeliveries: number;
  message?: string;
  details: Array<{
    endpoint: string;
    status: 'success' | 'failed';
    error?: string;
  }>;
}

export default function useTestPushNotification() {
  const { mutate, isPending } = useMutation<TestPushResult, Error>({
    mutationFn: () => AdminService.testPushNotification(),
  });

  return {
    testPushNotification: mutate,
    isTesting: isPending,
  };
}
