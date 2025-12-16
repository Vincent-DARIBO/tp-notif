// Supabase Edge Function: send-notification
// Allows admins to send notifications to users with push delivery

import { createClient } from 'jsr:@supabase/supabase-js@2';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendNotificationPayload {
  type: 'SLOT_PROPOSAL' | 'SLOT_AVAILABLE' | 'SLOT_CANCELLED';
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
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role (bypasses RLS for admin operations)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token to verify auth
    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is admin
    const { data: userData, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (roleError || !userData || userData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const payload: SendNotificationPayload = await req.json();

    // Validate payload
    if (!payload.type || !payload.slot) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, slot' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Resolve recipients based on notification type
    let recipientIds: string[] = [];

    switch (payload.type) {
      case 'SLOT_PROPOSAL': {
        // Use provided recipient IDs
        if (!payload.recipientIds || payload.recipientIds.length === 0) {
          return new Response(
            JSON.stringify({ error: 'SLOT_PROPOSAL requires recipientIds' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (payload.recipientIds.length > 10) {
          return new Response(
            JSON.stringify({ error: 'Maximum 10 recipients allowed for SLOT_PROPOSAL' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        recipientIds = payload.recipientIds;
        break;
      }

      case 'SLOT_AVAILABLE': {
        // Get all users with availability_alerts_enabled = true
        const { data: availableUsers, error: availableError } = await supabase
          .from('users')
          .select('id')
          .eq('availability_alerts_enabled', true);

        if (availableError) {
          throw new Error(`Failed to fetch available users: ${availableError.message}`);
        }
        recipientIds = availableUsers?.map((u: { id: string }) => u.id) || [];
        break;
      }

      case 'SLOT_CANCELLED': {
        // Get users who accepted the slot
        if (!payload.slotId) {
          return new Response(
            JSON.stringify({ error: 'SLOT_CANCELLED requires slotId' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: cancelledRecipients, error: cancelledError } = await supabase
          .from('notification_recipients')
          .select('user_id')
          .eq('notification_id', payload.slotId)
          .eq('action', 'ACCEPTED');

        if (cancelledError) {
          throw new Error(`Failed to fetch slot recipients: ${cancelledError.message}`);
        }
        recipientIds = cancelledRecipients?.map((r: { user_id: string }) => r.user_id) || [];
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid notification type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    if (recipientIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No recipients found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notification record
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        type: payload.type,
        status: 'UNREAD',
        slot_date: payload.slot.date,
        slot_time_start: payload.slot.startTime,
        slot_time_end: payload.slot.endTime,
        slot_location: payload.slot.location,
        slot_description: payload.slot.description || null,
        sent_by: user.id,
      })
      .select()
      .single();

    if (notificationError || !notification) {
      throw new Error(`Failed to create notification: ${notificationError?.message}`);
    }

    // Create recipient records
    const recipientRecords = recipientIds.map((recipientId) => ({
      notification_id: notification.id,
      user_id: recipientId,
      received: false,
      clicked: false,
    }));

    const { error: recipientsError } = await supabase
      .from('notification_recipients')
      .insert(recipientRecords);

    if (recipientsError) {
      throw new Error(`Failed to create recipient records: ${recipientsError.message}`);
    }

    // Fetch push subscriptions for recipients
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('push_subscriptions')
      .select('id, user_id, endpoint, p256dh_key, auth_key, users!inner(email)')
      .in('user_id', recipientIds);

    if (subscriptionsError) {
      console.error('Failed to fetch subscriptions:', subscriptionsError);
    }

    // Send push notifications
    let pushNotificationsSent = 0;
    let failedDeliveries = 0;
    const failedReasons: Array<{ userId: string; email: string; reason: string }> = [];

    // Generate notification title and message based on type
    let title = '';
    let message = '';

    switch (payload.type) {
      case 'SLOT_PROPOSAL':
        title = 'Proposition de créneau';
        message = `Un nouveau créneau vous est proposé le ${payload.slot.date}`;
        break;
      case 'SLOT_AVAILABLE':
        title = 'Créneau disponible';
        message = `Un créneau correspondant à vos alertes est disponible le ${payload.slot.date}`;
        break;
      case 'SLOT_CANCELLED':
        title = 'Créneau annulé';
        message = `Votre créneau du ${payload.slot.date} a été annulé`;
        break;
    }

    if (subscriptions && subscriptions.length > 0) {
      const _vapidPublicKey = Deno.env.get('VITE_VAPID_PUBLIC_KEY');
      const _vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

      // Note: For production, use a proper Web Push library or send to a queue
      // This is a simplified version - in production, you'd want to:
      // 1. Use a Web Push library compatible with Deno
      // 2. Implement retry logic
      // 3. Handle subscription expiration
      // 4. Use a background queue for large batches

      for (const subscription of subscriptions) {
        try {
          // This is a placeholder - actual Web Push implementation would go here
          // For now, we'll mark it as attempted and log
          console.log(`Would send push to: ${subscription.endpoint}`);
          console.log(`Title: ${title}, Message: ${message}`);

          // In production, implement actual Web Push sending here
          // using _vapidPublicKey and _vapidPrivateKey

          pushNotificationsSent++;

          // Update recipient record as received
          await supabase
            .from('notification_recipients')
            .update({ received: true })
            .eq('notification_id', notification.id)
            .eq('user_id', subscription.user_id);
        } catch (error) {
          console.error(`Failed to send push to ${subscription.endpoint}:`, error);
          failedDeliveries++;
          const subscriptionWithUser = subscription as { user_id: string; users?: { email: string } };
          failedReasons.push({
            userId: subscriptionWithUser.user_id,
            email: subscriptionWithUser.users?.email || 'Unknown',
            reason: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    // Build delivery report
    const deliveryReport: DeliveryReport = {
      notificationId: notification.id,
      totalRecipients: recipientIds.length,
      pushNotificationsSent,
      failedDeliveries,
      failedReasons: failedReasons.length > 0 ? failedReasons : undefined,
    };

    return new Response(JSON.stringify(deliveryReport), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-notification function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
