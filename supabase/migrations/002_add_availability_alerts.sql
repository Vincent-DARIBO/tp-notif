-- Migration: Add availability alerts tracking
-- This migration adds a column to track which users want to receive SLOT_AVAILABLE notifications

-- Add availability_alerts_enabled column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS availability_alerts_enabled BOOLEAN NOT NULL DEFAULT true;

-- Add index for faster queries when filtering users by availability alerts
CREATE INDEX IF NOT EXISTS idx_users_availability_alerts
ON public.users(availability_alerts_enabled)
WHERE availability_alerts_enabled = true;

-- Add comment
COMMENT ON COLUMN public.users.availability_alerts_enabled IS 'True if user wants to receive SLOT_AVAILABLE notifications';
