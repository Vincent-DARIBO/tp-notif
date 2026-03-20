// Supabase Edge Function: test-push-notification
// Allows admins to test push notifications to their own devices

import { createClient } from "jsr:@supabase/supabase-js@2";
import * as webpush from "jsr:@negrel/webpush";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TestResult {
  success: boolean;
  subscriptionsFound: number;
  pushNotificationsSent: number;
  failedDeliveries: number;
  details: Array<{
    endpoint: string;
    status: "success" | "failed";
    error?: string;
  }>;
}

// Database subscription format
interface PushSubscriptionDB {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  status: string;
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

function log(...args: any[]) {
  console.log("[DEBUG]", args)
}
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    log("return cors")
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    log("creating client")



    // Verify user is admin
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("*")
      .eq("role", "admin")
      .single();


    log({userData}, roleError)
    if (roleError || !userData || userData.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch admin's active push subscriptions
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh_key, auth_key, status")
      .eq("user_id", userData.id)
      .eq("status", "active");

    log({ subscriptions, subscriptionsError })

    if (subscriptionsError) {
      throw new Error(
        `Failed to fetch subscriptions: ${subscriptionsError.message}`
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No active push subscriptions found for your account",
          subscriptionsFound: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Web Push
    const vapidKeys = getVapidKeys();
    await webpush.importVapidKeys({
      publicKey: vapidKeys.publicKey,
      privateKey: vapidKeys.privateKey,
      
    });

    log({ vapidKeys })
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "admin@example.com";
    const appServer = await webpush.ApplicationServer.new({
      contactInformation: `mailto:${adminEmail}`,

    });

    // Test push notification payload
    const testPayload = JSON.stringify({
      title: "Test de notification",
      message: "Ceci est une notification de test. Votre configuration fonctionne correctement!",
      notificationId: "test-" + Date.now(),
      type: "TEST",
      timestamp: new Date().toISOString(),
    });

    log({ testPayload })
    // Send test notifications
    let pushNotificationsSent = 0;
    let failedDeliveries = 0;
    const details: Array<{
      endpoint: string;
      status: "success" | "failed";
      error?: string;
    }> = [];

    for (const dbSubscription of subscriptions as PushSubscriptionDB[]) {
      try {
        const pushSubscription = convertToWebPushSubscription(dbSubscription);
        const subscriber = appServer.subscribe(pushSubscription);

        log("test payload", { testPayload })

        await subscriber.pushTextMessage(testPayload, {});

        console.log(`Test push sent to: ${dbSubscription.endpoint.substring(0, 50)}...`);
        pushNotificationsSent++;
        details.push({
          endpoint: dbSubscription.endpoint.substring(0, 50) + "...",
          status: "success",
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Failed to send test push:`, errorMessage);

        failedDeliveries++;
        details.push({
          endpoint: dbSubscription.endpoint.substring(0, 50) + "...",
          status: "failed",
          error: errorMessage,
        });
      }
    }

    const result: TestResult = {
      success: pushNotificationsSent > 0,
      subscriptionsFound: subscriptions.length,
      pushNotificationsSent,
      failedDeliveries,
      details,
    };
    log({ result })
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in test-push-notification function:", error);
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
