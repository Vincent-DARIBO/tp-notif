/**
 * Edge Function: track-click
 *
 * Records when a user clicks on a notification.
 * Updates notification_recipients table with clicked=true and timestamp.
 *
 * Request:
 * - Method: POST
 * - Headers: Authorization (Supabase JWT) - optional for anonymous users
 * - Body: { notification_id: string, user_id: string }
 *
 * Response:
 * - 200: Click tracked successfully
 * - 400: Invalid request body
 * - 500: Server error
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrackClickPayload {
  notification_id: string;
  user_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Parse request body
    const { notification_id, user_id }: TrackClickPayload = await req.json();

    if (!notification_id || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing notification_id or user_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update notification_recipients record
    const { error } = await supabase
      .from("notification_recipients")
      .update({
        clicked: true,
        clicked_at: new Date().toISOString(),
      })
      .eq("notification_id", notification_id)
      .eq("user_id", user_id);

    if (error) {
      console.error("Error tracking click:", error);
      return new Response(
        JSON.stringify({ error: "Failed to track click" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Click tracked" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
