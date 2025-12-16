import type { NotificationType, Slot } from './notification';

/**
 * Payload for sending a notification from admin
 */
export interface SendNotificationPayload {
  type: NotificationType;
  slot: Omit<Slot, 'id'>;
  recipientIds?: string[]; // For SLOT_PROPOSAL (max 10 users)
  slotId?: string; // For SLOT_CANCELLED (to find registered users)
}

/**
 * Preview of notification before sending
 */
export interface NotificationPreview {
  type: NotificationType;
  title: string;
  message: string;
  slot: Omit<Slot, 'id'>;
  recipientCount: number;
  recipientEmails: string[];
}

/**
 * Delivery report after sending notification
 */
export interface DeliveryReport {
  notificationId: string;
  totalRecipients: number;
  pushNotificationsSent: number;
  failedDeliveries: number;
  failedReasons?: Array<{
    userId: string;
    email: string;
    reason: string;
  }>;
}

/**
 * User information for recipient selection
 */
export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  availability_alerts_enabled: boolean;
  created_at: string;
}

/**
 * Slot option for SLOT_CANCELLED selector
 */
export interface SlotOption {
  id: string;
  label: string; // Formatted as "Date - Time - Location"
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  recipientCount: number; // Number of users who registered/accepted
}

/**
 * Notification history item with metrics
 */
export interface NotificationHistoryItem {
  id: string;
  type: NotificationType;
  slot: Slot;
  sentAt: string;
  sentBy: {
    id: string;
    email: string;
  };
  metrics: {
    totalRecipients: number;
    received: number;
    clicked: number;
    accepted: number;
    refused: number;
  };
}

/**
 * Form state for send notification
 */
export interface SendNotificationFormState {
  type: NotificationType | '';
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  recipientIds: string[]; // For SLOT_PROPOSAL
  slotId: string; // For SLOT_CANCELLED
}

/**
 * Form validation errors
 */
export interface SendNotificationFormErrors {
  type?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  recipientIds?: string;
  slotId?: string;
}
