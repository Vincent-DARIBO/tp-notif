export enum NotificationType {
  SLOT_AVAILABLE = 'SLOT_AVAILABLE',
  SLOT_CANCELLED = 'SLOT_CANCELLED',
  SLOT_PROPOSAL = 'SLOT_PROPOSAL',
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ACCEPTED = 'ACCEPTED',
  REFUSED = 'REFUSED',
}

export interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  message: string;
  slot: Slot;
  createdAt: string;
  readAt?: string;
}

export interface AcceptSlotDTO {
  notificationId: string;
  slotId: string;
}

export interface RefuseSlotDTO {
  notificationId: string;
  slotId: string;
  reason?: string;
}

export interface RegisterSlotDTO {
  notificationId: string;
  slotId: string;
}
