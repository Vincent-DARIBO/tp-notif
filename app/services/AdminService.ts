/**
 * Admin Service
 *
 * Handles admin-specific operations including sending notifications,
 * fetching users, managing slots, and accessing notification history.
 *
 * Responsibilities:
 * - Send notifications via Supabase Edge Function
 * - Fetch all users for recipient selection
 * - Fetch available slots for cancellation
 * - Fetch slot recipients
 * - Fetch notification history with metrics
 *
 * All methods throw AdminError on failure.
 */

import { supabase } from "~/config/supabase";
import { AdminError } from "~/errors/AdminError";
import type {
  SendNotificationPayload,
  DeliveryReport,
  User,
  SlotOption,
  NotificationHistoryItem,
} from "~/types/admin";
import { SupabaseService } from "./SupabaseService";

export class AdminService {
  /**
   * Send a notification to recipients
   *
   * @param payload - Notification payload with type, slot details, and recipients
   * @returns DeliveryReport with success/failure metrics
   * @throws {AdminError} If sending fails or user not authorized
   *
   * Calls the send-notification Edge Function which:
   * - Verifies admin role
   * - Resolves recipients based on notification type
   * - Creates notification and recipient records
   * - Sends push notifications
   * - Returns delivery report
   */
  static async sendNotification(
    payload: SendNotificationPayload
  ): Promise<DeliveryReport> {
    try {
      // Get auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw AdminError.notAuthorized();
      }

      // Call send-notification Edge Function
      const response = await supabase.functions.invoke("send-notification", {
        body: payload,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error || !response.data) {
        throw AdminError.sendNotificationFailed(
          response.error || "Unknown error"
        );
      }

      return response.data as DeliveryReport;
    } catch (error) {
      console.log(
        "AdminService: sendNotification: error",
        JSON.stringify(error, null, 2)
      );
      if (error instanceof AdminError) {
        throw error;
      }
      // Check for network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw AdminError.sendNotificationFailed("Erreur réseau");
      }
      throw AdminError.sendNotificationFailed(error);
    }
  }

  /**
   * Get all users for recipient selection
   *
   * @returns Array of users with email, role, and alert preferences
   * @throws {AdminError} If query fails
   *
   * Used for SLOT_PROPOSAL recipient selector.
   * Only admins can access this endpoint (enforced by RLS).
   */
  static async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, role, availability_alerts_enabled, created_at")
        .order("email", { ascending: true });

      if (error) {
        throw AdminError.getUsersFailed(error);
      }

      return data || [];
    } catch (error) {
      if (error instanceof AdminError) {
        throw error;
      }
      throw AdminError.getUsersFailed(error);
    }
  }

  /**
   * Get available slots for SLOT_CANCELLED selection
   *
   * @returns Array of slot options with recipient counts
   * @throws {AdminError} If query fails
   *
   * Fetches slots that have accepted recipients (for cancellation).
   * Returns formatted labels for dropdown display.
   */
  static async getAvailableSlots(): Promise<SlotOption[]> {
    try {
      // Query notifications with recipient counts
      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
          id,
          slot_date,
          slot_time_start,
          slot_time_end,
          slot_location,
          notification_recipients!inner(action)
        `
        )
        .in("notification_recipients.action", ["ACCEPTED"])
        .order("slot_date", { ascending: false });

      if (error) {
        throw AdminError.getSlotsFailed(error);
      }

      if (!data) {
        return [];
      }

      // Transform to SlotOption format
      const slotMap = new Map<string, SlotOption>();

      data.forEach((notification: any) => {
        if (!slotMap.has(notification.id)) {
          slotMap.set(notification.id, {
            id: notification.id,
            date: notification.slot_date,
            startTime: notification.slot_time_start,
            endTime: notification.slot_time_end,
            location: notification.slot_location,
            label: `${notification.slot_date} - ${notification.slot_time_start}-${notification.slot_time_end} - ${notification.slot_location}`,
            recipientCount: 0,
          });
        }
        const slot = slotMap.get(notification.id)!;
        slot.recipientCount++;
      });

      return Array.from(slotMap.values());
    } catch (error) {
      if (error instanceof AdminError) {
        throw error;
      }
      throw AdminError.getSlotsFailed(error);
    }
  }

  /**
   * Get recipients for a specific slot (for SLOT_CANCELLED preview)
   *
   * @param slotId - Notification ID representing the slot
   * @returns Array of users who accepted/registered for the slot
   * @throws {AdminError} If query fails
   */
  static async getSlotRecipients(slotId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from("notification_recipients")
        .select(
          `
          user:users(id, email, role, availability_alerts_enabled, created_at)
        `
        )
        .eq("notification_id", slotId)
        .eq("action", "ACCEPTED");

      if (error) {
        throw AdminError.getSlotRecipientsFailed(error);
      }

      if (!data) {
        return [];
      }

      return data.map((item: any) => item.user).filter(Boolean);
    } catch (error) {
      if (error instanceof AdminError) {
        throw error;
      }
      throw AdminError.getSlotRecipientsFailed(error);
    }
  }

  /**
   * Get notification history with metrics
   *
   * @returns Array of sent notifications with delivery metrics
   * @throws {AdminError} If query fails
   *
   * Fetches all notifications sent by the current admin user
   * with aggregated metrics (recipients, received, clicked, accepted, refused).
   */
  static async getNotificationHistory(): Promise<NotificationHistoryItem[]> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw AdminError.notAuthorized();
      }

      // Query notifications with recipient metrics
      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
          id,
          type,
          slot_date,
          slot_time_start,
          slot_time_end,
          slot_location,
          slot_description,
          sent_at,
          sent_by,
          sender:users!sent_by(id, email),
          notification_recipients(received, clicked, action)
        `
        )
        .order("sent_at", { ascending: false });

      if (error) {
        throw AdminError.getNotificationHistoryFailed(error);
      }

      if (!data) {
        return [];
      }

      // Transform to NotificationHistoryItem format
      return data.map((notification: any) => {
        const recipients = notification.notification_recipients || [];

        return {
          id: notification.id,
          type: notification.type,
          slot: {
            id: notification.id,
            date: notification.slot_date,
            startTime: notification.slot_time_start,
            endTime: notification.slot_time_end,
            location: notification.slot_location,
            description: notification.slot_description,
          },
          sentAt: notification.sent_at,
          sentBy: notification.sender || {
            id: notification.sent_by,
            email: "Unknown",
          },
          metrics: {
            totalRecipients: recipients.length,
            received: recipients.filter((r: any) => r.received).length,
            clicked: recipients.filter((r: any) => r.clicked).length,
            accepted: recipients.filter((r: any) => r.action === "ACCEPTED")
              .length,
            refused: recipients.filter((r: any) => r.action === "REFUSED")
              .length,
          },
        };
      });
    } catch (error) {
      if (error instanceof AdminError) {
        throw error;
      }
      throw AdminError.getNotificationHistoryFailed(error);
    }
  }
}
