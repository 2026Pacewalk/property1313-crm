/**
 * WhatsApp deep link utilities
 *
 * Rules:
 * - Normalize numbers to 91XXXXXXXXXX (no +, no spaces, no dashes)
 * - Use wa.me for mobile, web.whatsapp.com for desktop
 * - Fallback to api.whatsapp.com
 * - window.open() must be called from DIRECT click handler (not async)
 */

/** Debug log (only in dev) */
function debug(...args: unknown[]) {
  if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).DEBUG_WHATSAPP) {
    // eslint-disable-next-line no-console
    console.log('[WA]', ...args);
  }
}

/**
 * Normalize any Indian mobile number to 91XXXXXXXXXX format
 * Input: +91 98765 43210 / 91-9876543210 / 9876543210 / 09876543210
 * Output: 919876543210
 */
export function normalizeMobileForWhatsApp(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Phone number is empty');
  }

  // Step 1: Remove ALL non-digit characters except leading +
  let cleaned = phone.trim();
  debug('Original phone:', cleaned);

  // Step 2: Remove spaces, brackets, dashes, dots
  cleaned = cleaned.replace(/[\s\-().]/g, '');
  debug('After removing spaces/dashes/brackets:', cleaned);

  // Step 3: Remove leading + if present
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
    debug('After removing + :', cleaned);
  }

  // Step 4: Handle various formats
  // Case: 919876543210 (12 digits, starts with 91)
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    debug('Format: 91XXXXXXXXXX (valid):', cleaned);
    return cleaned;
  }

  // Case: 9876543210 (10 digits) -> prepend 91
  // Indian mobile numbers start with 6, 7, 8, or 9
  if (cleaned.length === 10 && cleaned[0] >= '6' && cleaned[0] <= '9') {
    const result = '91' + cleaned;
    debug('Format: 10-digit -> ', result);
    return result;
  }

  // Case: 09876543210 (11 digits, starts with 0) -> remove 0, prepend 91
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    const result = '91' + cleaned.slice(1);
    debug('Format: 0XXXXXXXXXX -> ', result);
    return result;
  }

  // Case: already has country code other than 91
  if (cleaned.length >= 11) {
    debug('Format: long number (assuming has CC):', cleaned);
    return cleaned;
  }

  throw new Error(`Invalid phone number: "${phone}" (cleaned: "${cleaned}", length: ${cleaned.length})`);
}

/** Detect if current device is mobile */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(ua);
  debug('UserAgent:', ua.substring(0, 60), '| isMobile:', isMobile);
  return isMobile;
}

/** Detect if iOS */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Detect if Android */
export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

/**
 * Build the WhatsApp URL with proper encoding
 * Returns an object with primary URL and fallback URLs
 */
export function buildWhatsAppUrl(params: { phone: string; message: string }): {
  primary: string;
  fallback: string;
  waMe: string;
} {
  const normalizedPhone = normalizeMobileForWhatsApp(params.phone);
  const encodedMessage = encodeURIComponent(params.message);

  debug('Normalized phone:', normalizedPhone);
  debug('Encoded message length:', encodedMessage.length);

  const waMe = `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
  const api = `https://api.whatsapp.com/send?phone=${normalizedPhone}&text=${encodedMessage}`;

  debug('wa.me URL:', waMe.substring(0, 80) + '...');

  if (isMobileDevice()) {
    return { primary: waMe, fallback: api, waMe };
  }
  // Desktop: web.whatsapp.com often blocks cross-origin, so use api.whatsapp.com as primary
  return { primary: api, fallback: waMe, waMe };
}

/** Build just the wa.me link (universal fallback) */
export function buildWaMeUrl(params: { phone: string; message: string }): string {
  const normalizedPhone = normalizeMobileForWhatsApp(params.phone);
  const encodedMessage = encodeURIComponent(params.message);
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}

/** Build api.whatsapp.com link */
export function buildApiUrl(params: { phone: string; message: string }): string {
  const normalizedPhone = normalizeMobileForWhatsApp(params.phone);
  const encodedMessage = encodeURIComponent(params.message);
  return `https://api.whatsapp.com/send?phone=${normalizedPhone}&text=${encodedMessage}`;
}

/** Validate that a phone number looks usable for WhatsApp */
export function isValidWhatsAppNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  try {
    const normalized = normalizeMobileForWhatsApp(phone);
    return normalized.length >= 11 && /^\d+$/.test(normalized);
  } catch {
    return false;
  }
}

/** Get send method label based on device */
export function getSendMethodLabel(): string {
  if (isAndroid()) return 'WhatsApp (Android)';
  if (isIOS()) return 'WhatsApp (iPhone)';
  if (isMobileDevice()) return 'WhatsApp App';
  return 'WhatsApp Web';
}

/**
 * Open WhatsApp from a direct click handler.
 * MUST be called synchronously from a user click event.
 *
 * Strategy:
 * 1. Try window.open() with primary URL
 * 2. If blocked (null returned), try window.location.href
 * 3. On mobile, use window.location.href as primary (more reliable)
 */
export function openWhatsApp(params: { phone: string; message: string }): {
  opened: boolean;
  url: string;
  method: 'window_open' | 'location_href' | 'failed';
} {
  const { primary, fallback, waMe } = buildWhatsAppUrl({ phone: params.phone, message: params.message });
  const mobile = isMobileDevice();

  debug('Opening WhatsApp...', { mobile, primary: primary.substring(0, 60) });

  // On mobile: use window.location.href (most reliable, no popup blocking)
  if (mobile) {
    try {
      window.location.href = primary;
      debug('Opened via window.location.href (mobile)');
      return { opened: true, url: primary, method: 'location_href' };
    } catch {
      // Fallback to wa.me
      try {
        window.location.href = waMe;
        return { opened: true, url: waMe, method: 'location_href' };
      } catch {
        return { opened: false, url: waMe, method: 'failed' };
      }
    }
  }

  // On desktop: try window.open first
  try {
    const win = window.open(primary, '_blank');
    if (win) {
      debug('Opened via window.open (desktop)');
      return { opened: true, url: primary, method: 'window_open' };
    }
    // Popup blocked - try fallback
    const win2 = window.open(fallback, '_blank');
    if (win2) {
      debug('Opened fallback via window.open');
      return { opened: true, url: fallback, method: 'window_open' };
    }
  } catch {
    // Ignore
  }

  // Last resort: window.location.href
  try {
    window.location.href = waMe;
    return { opened: true, url: waMe, method: 'location_href' };
  } catch {
    return { opened: false, url: waMe, method: 'failed' };
  }
}
