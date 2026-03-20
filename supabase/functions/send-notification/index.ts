// Supabase Edge Function: send-notification
// Allows admins to send notifications to users with push delivery

import { createClient } from "jsr:@supabase/supabase-js@2";
import * as webpush from "jsr:@negrel/webpush";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendNotificationPayload {
  type: "SLOT_PROPOSAL" | "SLOT_AVAILABLE" | "SLOT_CANCELLED";
  slot: {
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    description?: string;
  };
  recipientIds?: string[]; // For SLOT_PROPOSAL
  slotId?: string; // For SLOT_CANCELLED
}

interface DeliveryReport {
  notificationId: string;
  totalRecipients: number;
  pushNotificationsSent: number;
  failedDeliveries: number;
  failedReasons?: Array<{
    userId: string;
    email: string;
    reason: string;
    errorCode?: string;
  }>;
  subscriptionStatusUpdates?: {
    expired: number;
    invalid: number;
  };
}

// Database subscription format (from Supabase query with join)
interface PushSubscriptionDB {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  status: string;
  users?: { email: string } | { email: string }[];
}

// Helper to get email from subscription
function getSubscriptionEmail(sub: PushSubscriptionDB): string {
  if (!sub.users) return "Unknown";
  if (Array.isArray(sub.users)) {
    return sub.users[0]?.email || "Unknown";
  }
  return sub.users.email || "Unknown";
}

// Web Push subscription format
interface WebPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Convert database subscription to Web Push format
function convertToWebPushSubscription(
  dbSub: PushSubscriptionDB
): WebPushSubscription {
  return {
    endpoint: dbSub.endpoint,
    keys: {
      p256dh: dbSub.p256dh_key,
      auth: dbSub.auth_key,
    },
  };
}

// VAPID keys configuration
interface VapidKeys {
  publicKey: string;
  privateKey: string;
}

function getVapidKeys(): VapidKeys {
  const publicKey = Deno.env.get("VITE_VAPID_PUBLIC_KEY");
  const privateKey = Deno.env.get("VAPID_PRIVATE_KEY");

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys not configured in environment variables");
  }

  return { publicKey, privateKey };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role (bypasses RLS for admin operations)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create client with user's token to verify auth
    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user is admin
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError || !userData || userData.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const payload: SendNotificationPayload = await req.json();
    console.log({ payload });

    // Validate payload
    if (!payload.type || !payload.slot) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: type, slot" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Resolve recipients based on notification type
    let recipientIds: string[] = [];
    console.log({ recipientIds });

    switch (payload.type) {
      case "SLOT_PROPOSAL": {
        // Use provided recipient IDs
        if (!payload.recipientIds || payload.recipientIds.length === 0) {
          return new Response(
            JSON.stringify({ error: "SLOT_PROPOSAL requires recipientIds" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        if (payload.recipientIds.length > 10) {
          return new Response(
            JSON.stringify({
              error: "Maximum 10 recipients allowed for SLOT_PROPOSAL",
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        recipientIds = payload.recipientIds;
        break;
      }

      case "SLOT_AVAILABLE": {
        // Get all users with availability_alerts_enabled = true
        const { data: availableUsers, error: availableError } = await supabase
          .from("users")
          .select("id")
          .eq("availability_alerts_enabled", true);

        if (availableError) {
          throw new Error(
            `Failed to fetch available users: ${availableError.message}`
          );
        }
        recipientIds = availableUsers?.map((u: { id: string }) => u.id) || [];
        break;
      }

      case "SLOT_CANCELLED": {
        // Get users who accepted the slot
        if (!payload.slotId) {
          return new Response(
            JSON.stringify({ error: "SLOT_CANCELLED requires slotId" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { data: cancelledRecipients, error: cancelledError } =
          await supabase
            .from("notification_recipients")
            .select("user_id")
            .eq("notification_id", payload.slotId)
            .eq("action", "ACCEPTED");

        if (cancelledError) {
          throw new Error(
            `Failed to fetch slot recipients: ${cancelledError.message}`
          );
        }
        recipientIds =
          cancelledRecipients?.map((r: { user_id: string }) => r.user_id) || [];
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid notification type" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    if (recipientIds.length === 0) {
      return new Response(JSON.stringify({ error: "No recipients found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create notification record
    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .insert({
        type: payload.type,
        status: "UNREAD",
        slot_date: payload.slot.date,
        slot_time_start: payload.slot.startTime,
        slot_time_end: payload.slot.endTime,
        slot_location: payload.slot.location,
        slot_description: payload.slot.description || null,
        sent_by: user.id,
      })
      .select()
      .single();
    console.log({ notification, notificationError });

    if (notificationError || !notification) {
      throw new Error(
        `Failed to create notification: ${notificationError?.message}`
      );
    }

    // Create recipient records
    const recipientRecords = recipientIds.map((recipientId) => ({
      notification_id: notification.id,
      user_id: recipientId,
      received: false,
      clicked: false,
    }));

    const { error: recipientsError } = await supabase
      .from("notification_recipients")
      .insert(recipientRecords);
    console.log({ recipientsError });

    if (recipientsError) {
      throw new Error(
        `Failed to create recipient records: ${recipientsError.message}`
      );
    }

    // Fetch active push subscriptions for recipients
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh_key, auth_key, status, users!inner(email)")
      .in("user_id", recipientIds)
      .eq("status", "active");

    if (subscriptionsError) {
      console.error("Failed to fetch subscriptions:", subscriptionsError);
    }

    // Send push notifications
    let pushNotificationsSent = 0;
    let failedDeliveries = 0;
    let expiredCount = 0;
    let invalidCount = 0;
    const failedReasons: Array<{
      userId: string;
      email: string;
      reason: string;
      errorCode?: string;
    }> = [];

    // Generate notification title and message based on type
    let title = "";
    let message = "";

    switch (payload.type) {
      case "SLOT_PROPOSAL":
        title = "Proposition de créneau";
        message = `Un nouveau créneau vous est proposé le ${payload.slot.date}`;
        break;
      case "SLOT_AVAILABLE":
        title = "Créneau disponible";
        message = `Un créneau correspondant à vos alertes est disponible le ${payload.slot.date}`;
        break;
      case "SLOT_CANCELLED":
        title = "Créneau annulé";
        message = `Votre créneau du ${payload.slot.date} a été annulé`;
        break;
    }

    if (subscriptions && subscriptions.length > 0) {
      try {
        // Initialize VAPID keys
        const vapidKeys = getVapidKeys();
        await webpush.importVapidKeys({
          publicKey: vapidKeys.publicKey,
          privateKey: vapidKeys.privateKey,
        });

        // Create application server
        const adminEmail = Deno.env.get("ADMIN_EMAIL") || "admin@example.com";
        const appServer = await webpush.ApplicationServer.new({
          contactInformation: `mailto:${adminEmail}`,
        });

        // Send to each subscription
        for (const dbSubscription of subscriptions as PushSubscriptionDB[]) {
          const sendPush = async (retryAttempt = 0): Promise<void> => {
            try {
              // Convert database subscription to Web Push format
              const pushSubscription = convertToWebPushSubscription(dbSubscription);

              // Create subscriber
              const subscriber = appServer.subscribe(pushSubscription);

              // Send push notification with payload
              const pushPayload = JSON.stringify({
                title,
                message,
                notificationId: notification.id,
                type: payload.type,
                slot: payload.slot,
              });

              await subscriber.pushTextMessage(pushPayload, {});

              console.log(`Push sent to: ${dbSubscription.endpoint.substring(0, 50)}...`);
              pushNotificationsSent++;

              // Update recipient record as received
              await supabase
                .from("notification_recipients")
                .update({ received: true })
                .eq("notification_id", notification.id)
                .eq("user_id", dbSubscription.user_id);

            } catch (error) {
              // Handle different error types
              const errorMessage = error instanceof Error ? error.message : String(error);
              const errorResponse = error as { status?: number; statusText?: string };

              console.error(
                `Failed to send push (attempt ${retryAttempt + 1}):`,
                {
                  endpoint: dbSubscription.endpoint.substring(0, 50),
                  error: errorMessage,
                  status: errorResponse.status,
                }
              );

              // Check for specific error codes
              if (errorResponse.status === 410) {
                // 410 Gone - subscription expired
                console.log(`Subscription expired: ${dbSubscription.id}`);
                await supabase
                  .from("push_subscriptions")
                  .update({ status: "expired", expired_at: new Date().toISOString() })
                  .eq("id", dbSubscription.id);

                expiredCount++;
                failedDeliveries++;
                failedReasons.push({
                  userId: dbSubscription.user_id,
                  email: getSubscriptionEmail(dbSubscription),
                  reason: "Subscription expired (410 Gone)",
                  errorCode: "410",
                });
              } else if (errorResponse.status === 404) {
                // 404 Not Found - subscription invalid
                console.log(`Subscription invalid: ${dbSubscription.id}`);
                await supabase
                  .from("push_subscriptions")
                  .update({ status: "invalid", expired_at: new Date().toISOString() })
                  .eq("id", dbSubscription.id);

                invalidCount++;
                failedDeliveries++;
                failedReasons.push({
                  userId: dbSubscription.user_id,
                  email: getSubscriptionEmail(dbSubscription),
                  reason: "Subscription not found (404)",
                  errorCode: "404",
                });
              } else if (retryAttempt === 0) {
                // Retry once for network errors
                console.log(`Retrying push notification...`);
                await sendPush(1);
              } else {
                // Final failure after retry
                failedDeliveries++;
                failedReasons.push({
                  userId: dbSubscription.user_id,
                  email: getSubscriptionEmail(dbSubscription),
                  reason: errorMessage,
                  errorCode: errorResponse.status?.toString(),
                });
              }
            }
          };

          await sendPush(0);
        }
      } catch (error) {
        console.error("Web Push initialization error:", error);
        throw new Error(
          `Failed to initialize Web Push: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Build delivery report
    const deliveryReport: DeliveryReport = {
      notificationId: notification.id,
      totalRecipients: recipientIds.length,
      pushNotificationsSent,
      failedDeliveries,
      failedReasons: failedReasons.length > 0 ? failedReasons : undefined,
      subscriptionStatusUpdates: (expiredCount > 0 || invalidCount > 0)
        ? { expired: expiredCount, invalid: invalidCount }
        : undefined,
    };

    return new Response(JSON.stringify(deliveryReport), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
