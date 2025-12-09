# Supabase Setup Guide

This guide explains how to set up Supabase for the TP Notifications application.

## Prerequisites

- Supabase account and project created
- Supabase CLI installed: `npm install -g supabase`
- VAPID keys generated for Web Push

## Step 1: Database Setup

### Run the migration

```bash
# Link to your Supabase project
npx supabase link --project-ref your-project-ref

# Run the migration
npx supabase db push
```

Alternatively, copy the content of `supabase/migrations/001_initial_schema.sql` and execute it in the Supabase SQL Editor.

### Create your first admin user

1. Sign up a user via Supabase Auth (or use the dashboard)
2. In the SQL Editor, run:

```sql
SELECT assign_admin_role('your-admin-email@example.com');
```

## Step 2: Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

Save the output:
- **Public Key**: Will be used in the frontend
- **Private Key**: Will be stored in Supabase Edge Function secrets

## Step 3: Configure Edge Function Secrets

```bash
# Set VAPID private key
npx supabase secrets set VAPID_PUBLIC_KEY="your-public-key"
npx supabase secrets set VAPID_PRIVATE_KEY="your-private-key"
npx supabase secrets set VAPID_SUBJECT="mailto:your-email@example.com"
```

## Step 4: Deploy Edge Functions

The following Edge Functions need to be deployed:

```bash
# Deploy all functions
npx supabase functions deploy subscribe
npx supabase functions deploy unsubscribe
npx supabase functions deploy send-notification
npx supabase functions deploy get-notifications
npx supabase functions deploy track-click
npx supabase functions deploy track-read
```

## Step 5: Enable Supabase Auth

1. Go to Authentication > Providers in your Supabase dashboard
2. Enable **Email** provider
3. Disable email confirmation (for development) or configure SMTP

## Step 6: Test the Setup

### Test database connection

```sql
SELECT * FROM users LIMIT 1;
```

### Test Edge Function

```bash
curl -i --location --request POST 'https://your-project-ref.supabase.co/functions/v1/subscribe' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"endpoint":"test","keys":{"p256dh":"test","auth":"test"}}'
```

## Environment Variables

Update your `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
```

## Edge Functions Overview

| Function | Method | Purpose |
|----------|--------|---------|
| `subscribe` | POST | Register push subscription |
| `unsubscribe` | DELETE | Remove push subscription |
| `send-notification` | POST | Send notification to users (admin only) |
| `get-notifications` | GET | Fetch notification history (admin only) |
| `track-click` | POST | Track notification click |
| `track-read` | POST | Track notification read |

## Troubleshooting

### Migration fails

- Check that the `uuid-ossp` extension is enabled
- Verify you have the correct permissions

### Edge Functions return 401

- Verify the `Authorization` header is sent with `Bearer <token>`
- Check that the user exists in the `users` table

### Push notifications not received

- Verify VAPID keys are correctly configured
- Check browser console for service worker errors
- Ensure notification permission is granted

## Next Steps

After completing this setup:

1. Create an admin user using `assign_admin_role()`
2. Test login at `/admin/login`
3. Send a test notification
4. Verify the notification is received on a test device
