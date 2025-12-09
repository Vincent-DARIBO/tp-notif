-- TP Notifications - Initial Database Schema
-- This migration creates all necessary tables for the notification system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: users
-- ============================================================================
-- Extends Supabase Auth with additional user information
-- Links to auth.users via foreign key
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================================================
-- TABLE: push_subscriptions
-- ============================================================================
-- Stores Web Push API subscriptions for each user
-- One user can have multiple subscriptions (multiple devices)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_endpoint ON public.push_subscriptions(endpoint);

-- ============================================================================
-- TABLE: notifications
-- ============================================================================
-- Stores all notifications sent by admins
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('SLOT_PROPOSAL', 'SLOT_AVAILABLE', 'SLOT_CANCELLED')),
  status TEXT NOT NULL DEFAULT 'UNREAD' CHECK (status IN ('UNREAD', 'READ', 'ACCEPTED', 'REFUSED')),
  slot_date DATE NOT NULL,
  slot_time_start TIME NOT NULL,
  slot_time_end TIME NOT NULL,
  slot_location TEXT NOT NULL,
  slot_description TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  sent_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster filtering and sorting
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON public.notifications(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_by ON public.notifications(sent_by);
CREATE INDEX IF NOT EXISTS idx_notifications_slot_date ON public.notifications(slot_date);

-- ============================================================================
-- TABLE: notification_recipients
-- ============================================================================
-- Junction table linking notifications to recipients with tracking metrics
CREATE TABLE IF NOT EXISTS public.notification_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  received BOOLEAN DEFAULT FALSE,
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMPTZ,
  action TEXT CHECK (action IN ('ACCEPTED', 'REFUSED') OR action IS NULL),
  action_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(notification_id, user_id)
);

-- Indexes for metrics queries
CREATE INDEX IF NOT EXISTS idx_recipients_notification_id ON public.notification_recipients(notification_id);
CREATE INDEX IF NOT EXISTS idx_recipients_user_id ON public.notification_recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_recipients_received ON public.notification_recipients(received);
CREATE INDEX IF NOT EXISTS idx_recipients_clicked ON public.notification_recipients(clicked);
CREATE INDEX IF NOT EXISTS idx_recipients_action ON public.notification_recipients(action);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_recipients ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES: users
-- ============================================================================

-- Users can read their own record
CREATE POLICY "Users can read own record"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can be created via signup (handled by trigger)
CREATE POLICY "Users can be inserted"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- POLICIES: push_subscriptions
-- ============================================================================

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscriptions
CREATE POLICY "Users can insert own subscriptions"
  ON public.push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own subscriptions
CREATE POLICY "Users can delete own subscriptions"
  ON public.push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- POLICIES: notifications
-- ============================================================================

-- Users can read notifications they are recipients of
CREATE POLICY "Users can read their notifications"
  ON public.notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.notification_recipients
      WHERE notification_id = id AND user_id = auth.uid()
    )
  );

-- Admins can read all notifications
CREATE POLICY "Admins can read all notifications"
  ON public.notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can create notifications
CREATE POLICY "Admins can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- POLICIES: notification_recipients
-- ============================================================================

-- Users can view their own recipient records
CREATE POLICY "Users can view own recipient records"
  ON public.notification_recipients
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own recipient records (for tracking)
CREATE POLICY "Users can update own recipient records"
  ON public.notification_recipients
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all recipient records
CREATE POLICY "Admins can view all recipient records"
  ON public.notification_recipients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert recipient records when sending notifications
CREATE POLICY "Admins can insert recipient records"
  ON public.notification_recipients
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to assign admin role to a user by email
-- Usage: SELECT assign_admin_role('admin@example.com');
CREATE OR REPLACE FUNCTION assign_admin_role(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET role = 'admin'
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically create user record on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.users IS 'Extended user information linked to Supabase Auth';
COMMENT ON TABLE public.push_subscriptions IS 'Web Push API subscriptions for notification delivery';
COMMENT ON TABLE public.notifications IS 'Notifications sent by admins about slot opportunities';
COMMENT ON TABLE public.notification_recipients IS 'Junction table with recipient tracking metrics';

COMMENT ON COLUMN public.users.role IS 'User role: user or admin';
COMMENT ON COLUMN public.push_subscriptions.endpoint IS 'Push service endpoint URL (unique per device)';
COMMENT ON COLUMN public.push_subscriptions.p256dh_key IS 'Public key for encryption';
COMMENT ON COLUMN public.push_subscriptions.auth_key IS 'Authentication secret';
COMMENT ON COLUMN public.notification_recipients.received IS 'True when push notification delivered';
COMMENT ON COLUMN public.notification_recipients.clicked IS 'True when user clicked notification';
COMMENT ON COLUMN public.notification_recipients.action IS 'User action: ACCEPTED or REFUSED (for SLOT_PROPOSAL)';
