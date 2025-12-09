/**
 * Supabase Service
 *
 * Handles interactions with Supabase Edge Functions and database.
 *
 * Responsibilities:
 * - Push subscription registration
 * - Push subscription removal
 * - Direct database queries
 *
 * All methods throw SupabaseError on failure.
 */

import { supabase } from "~/config/supabase";
import { SupabaseError } from "~/errors/SupabaseError";

export class SupabaseService {
  /**
   * Get current authenticated user
   *
   * @returns User object or null if not authenticated
   */
  static async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw SupabaseError.queryFailed(error);
      }

      return user;
    } catch (error) {
      if (error instanceof SupabaseError) {
        throw error;
      }
      throw SupabaseError.queryFailed(error);
    }
  }

  /**
   * Register a push subscription for the current user
   *
   * @param subscription - PushSubscription object from browser
   * @throws {SupabaseError} If registration fails
   */
  static async registerPushSubscription(
    subscription: PushSubscription
  ): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      // Check if already registered (re-registration check)
      const { data: existingSubscription } = await supabase
        .from("push_subscriptions")
        .select("id")
        .eq("endpoint", subscription.endpoint)
        .eq("user_id", user.id)
        .single();

      if (existingSubscription) {
        console.log(
          "Subscription already registered, updating last_used_at",
          JSON.stringify(existingSubscription, null, 2)
        );
        // Already registered, just update last_used_at
        await supabase
          .from("push_subscriptions")
          .update({ last_used_at: new Date().toISOString() })
          .eq("id", existingSubscription.id);
        return;
      }

      console.log("SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL);
      console.log("vapidPublicKey", import.meta.env.VITE_VAPID_PUBLIC_KEY);

      // Call subscribe Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: {
              p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh")),
              auth: this.arrayBufferToBase64(subscription.getKey("auth")),
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw SupabaseError.subscriptionFailed(error);
      }
    } catch (error) {
      if (error instanceof SupabaseError) {
        throw error;
      }
      // Check for network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw SupabaseError.networkOffline();
      }
      throw SupabaseError.subscriptionFailed(error);
    }
  }

  /**
   * Unregister a push subscription
   *
   * @param endpoint - Push subscription endpoint URL
   * @throws {SupabaseError} If removal fails
   */
  static async unregisterPushSubscription(endpoint: string): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      // Call unsubscribe Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/unsubscribe`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ endpoint }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw SupabaseError.unsubscribeFailed(error);
      }
    } catch (error) {
      if (error instanceof SupabaseError) {
        throw error;
      }
      // Check for network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw SupabaseError.networkOffline();
      }
      throw SupabaseError.unsubscribeFailed(error);
    }
  }

  /**
   * Convert ArrayBuffer to Base64 string
   *
   * @param buffer - ArrayBuffer to convert
   * @returns Base64 encoded string
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return "";
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Get all notifications for the current user
   *
   * @returns Array of notifications with recipient data
   */
  static async getUserNotifications() {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from("notification_recipients")
        .select(
          `
          *,
          notification:notifications(*)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw SupabaseError.queryFailed(error);
      }

      return data || [];
    } catch (error) {
      if (error instanceof SupabaseError) {
        throw error;
      }
      throw SupabaseError.queryFailed(error);
    }
  }

  /**
   * Update notification recipient record (for tracking)
   *
   * @param notificationId - Notification ID
   * @param updates - Fields to update
   */
  static async updateNotificationRecipient(
    notificationId: string,
    updates: {
      received?: boolean;
      clicked?: boolean;
      clicked_at?: string;
      action?: "ACCEPTED" | "REFUSED";
      action_at?: string;
    }
  ) {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("notification_recipients")
        .update(updates)
        .eq("notification_id", notificationId)
        .eq("user_id", user.id);

      if (error) {
        throw SupabaseError.updateFailed(error);
      }
    } catch (error) {
      if (error instanceof SupabaseError) {
        throw error;
      }
      throw SupabaseError.updateFailed(error);
    }
  }
}
