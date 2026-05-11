/**
 * Centralized Indian Mobile Number Validation & Normalization
 * 
 * Rules:
 * - Must be exactly 10 digits after cleanup
 * - Auto-clean: remove spaces, hyphens, brackets, +91, 91 prefix
 * - Store: 10 digits only (9876543210)
 * - WhatsApp: convert to 91XXXXXXXXXX
 * - Login: normalize before matching
 * - Error only on blur/submit, not while typing
 */

/** Remove all non-digit characters */
function cleanToDigits(input: string): string {
  return input.replace(/\D/g, '');
}

/**
 * Normalize any Indian mobile input to 10 digits
 * Input: +91 98765 43210 / 91-9876543210 / 9876543210 / 09876543210
 * Output: 9876543210
 */
export function normalizeMobile(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  let digits = cleanToDigits(input.trim());
  
  // Remove leading 91 if present (91 + 10 digits = 12 digits total)
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }
  
  // Remove leading 0 if present (old landline style)
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  
  return digits;
}

/**
 * Convert 10-digit number to WhatsApp format
 * Input: 9876543210
 * Output: 919876543210
 */
export function toWhatsAppFormat(phone10: string): string {
  const normalized = normalizeMobile(phone10);
  if (normalized.length !== 10) return '';
  return '91' + normalized;
}

/**
 * Format for display with spaces
 * Input: 9876543210
 * Output: 98765 43210
 */
export function formatMobileDisplay(input: string): string {
  const digits = normalizeMobile(input);
  if (digits.length !== 10) return input;
  return digits.slice(0, 5) + ' ' + digits.slice(5);
}

/**
 * Validate Indian mobile number
 * Returns: { valid: boolean; error?: string; normalized: string }
 */
export function validateMobile(input: string): { valid: boolean; error?: string; normalized: string } {
  const normalized = normalizeMobile(input);
  
  if (!normalized) {
    return { valid: false, error: 'Mobile number is required', normalized: '' };
  }
  
  if (normalized.length < 10) {
    return { valid: false, error: 'Mobile number must be 10 digits', normalized };
  }
  
  if (normalized.length > 10) {
    return { valid: false, error: 'Mobile number must be 10 digits (remove country code)', normalized };
  }
  
  // Check for repeated digits (dummy numbers)
  if (/^(\d)\1{9}$/.test(normalized)) {
    return { valid: false, error: 'Please enter a valid mobile number', normalized };
  }
  
  // Must start with 6, 7, 8, or 9 (Indian mobile prefix)
  if (!/^[6-9]/.test(normalized)) {
    return { valid: false, error: 'Mobile number must start with 6, 7, 8, or 9', normalized };
  }
  
  return { valid: true, normalized };
}

/**
 * Check if mobile is valid (boolean only)
 */
export function isValidMobile(input: string): boolean {
  return validateMobile(input).valid;
}

/**
 * Handle input change - allow only digits, max 10 after cleaning
 * Use this in onChange handlers
 */
export function handleMobileInputChange(
  value: string, 
  setter: (val: string) => void
): void {
  // Remove all non-digits immediately
  const digits = cleanToDigits(value);
  // Limit to 12 digits (to allow for 91 prefix during typing)
  const limited = digits.slice(0, 12);
  setter(limited);
}

/**
 * Handle input blur - normalize to 10 digits
 * Use this in onBlur handlers
 */
export function handleMobileInputBlur(
  value: string, 
  setter: (val: string) => void
): string {
  const normalized = normalizeMobile(value);
  setter(normalized);
  return normalized;
}

/**
 * Validate and return error message for form submission
 */
export function getMobileValidationError(input: string): string | null {
  const result = validateMobile(input);
  return result.valid ? null : (result.error || 'Please enter a valid 10-digit mobile number');
}

// ============================================================
// INPUT COMPONENT PROPS
// ============================================================

/** Standard mobile input attributes for consistent behavior */
export const mobileInputProps = {
  type: 'tel' as const,
  inputMode: 'numeric' as const,
  pattern: '[0-9]*',
  maxLength: 12, // Allow 91 + 10 digits during typing
  placeholder: '9876543210',
  autoComplete: 'tel' as const,
};

/** Mobile input CSS classes */
export const mobileInputClasses = 'font-mono tracking-wide';
