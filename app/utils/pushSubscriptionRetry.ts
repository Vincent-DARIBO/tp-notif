/**
 * Utility for managing failed push subscription registrations with retry mechanism
 *
 * Stores failed registration attempts in localStorage for later retry.
 * Automatically removes stale data older than 7 days.
 */

const STORAGE_KEY = 'tp_notif_pending_registration';
const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface PendingRegistration {
  endpoint: string;
  p256dh: string;
  auth: string;
  timestamp: number;
}

/**
 * Save a failed push subscription registration for later retry
 *
 * @param subscription - PushSubscription object from browser
 */
export function savePendingRegistration(subscription: PushSubscription): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  const p256dhKey = subscription.getKey('p256dh');
  const authKey = subscription.getKey('auth');

  if (!p256dhKey || !authKey) {
    console.error('Push subscription missing required keys');
    return;
  }

  const pending: PendingRegistration = {
    endpoint: subscription.endpoint,
    p256dh: arrayBufferToBase64(p256dhKey),
    auth: arrayBufferToBase64(authKey),
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  } catch (error) {
    console.error('Failed to save pending registration:', error);
  }
}

/**
 * Retrieve pending registration if exists and not stale
 *
 * @returns PendingRegistration object or null
 */
export function getPendingRegistration(): PendingRegistration | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const pending: PendingRegistration = JSON.parse(stored);

    // Check if stale (older than 7 days)
    if (Date.now() - pending.timestamp > STALE_THRESHOLD_MS) {
      clearPendingRegistration();
      return null;
    }

    return pending;
  } catch (error) {
    console.error('Failed to retrieve pending registration:', error);
    return null;
  }
}

/**
 * Clear pending registration from localStorage
 */
export function clearPendingRegistration(): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear pending registration:', error);
  }
}

/**
 * Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
