-- Migration: Add subscription status tracking
-- Adds status and expiration tracking to push_subscriptions table

-- Add status column with CHECK constraint
ALTER TABLE public.push_subscriptions
ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
CHECK (status IN ('active', 'expired', 'invalid'));

-- Add expired_at timestamp column
ALTER TABLE public.push_subscriptions
ADD COLUMN expired_at TIMESTAMPTZ;

-- Create index on status for filtering active subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_status
ON public.push_subscriptions(status);

-- Backfill existing records to 'active' status
UPDATE public.push_subscriptions
SET status = 'active'
WHERE status IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.push_subscriptions.status IS 'Subscription status: active, expired (410 Gone), invalid (404 Not Found)';
COMMENT ON COLUMN public.push_subscriptions.expired_at IS 'Timestamp when subscription was marked as expired or invalid';
