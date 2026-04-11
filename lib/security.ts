/**
 * Security utilities for input validation and logging
 */

/**
 * Validate phone number format (9-15 digits)
 */
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 9 && cleaned.length <= 15;
}

/**
 * Validate name (2-100 chars, no special chars)
 */
export function validateName(name: string): boolean {
  return (
    name.trim().length >= 2 &&
    name.length <= 100 &&
    !/[<>"'`]/.test(name)
  );
}

/**
 * Validate text input with length constraints
 */
export function validateText(
  text: string,
  minLength: number = 10,
  maxLength: number = 2000
): boolean {
  const trimmed = text.trim();
  return (
    trimmed.length >= minLength &&
    trimmed.length <= maxLength &&
    !/[<>"'`]/.test(trimmed)
  );
}

/**
 * Validate LinkedIn URL
 */
export function validateLinkedInUrl(url: string): boolean {
  return url.includes("linkedin.com") && url.startsWith("https://");
}

/**
 * Sanitize user input by removing HTML tags and dangerous characters
 */
export function sanitizeInput(input: string, maxLength: number = 500): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'`]/g, "")
    .substring(0, maxLength)
    .trim();
}

/**
 * Log security events with timestamps
 */
export function logSecurityEvent(
  event: string,
  context?: Record<string, string | number | boolean>
): void {
  const timestamp = new Date().toISOString();
  const message = `[SECURITY] ${timestamp} - ${event}`;
  
  if (context) {
    console.error(message, context);
  } else {
    console.error(message);
  }
  
  // In production, send to security monitoring service
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    // TODO: Send to security logging endpoint
    // fetch("/api/security-log", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ event, context, timestamp }),
    // }).catch(() => {});
  }
}

/**
 * Validate API response before processing
 */
export function validateApiResponse(
  response: unknown
): response is Record<string, unknown> {
  return (
    typeof response === "object" &&
    response !== null &&
    !Array.isArray(response)
  );
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(
  json: string,
  fallback: T
): T {
  try {
    return JSON.parse(json) as T;
  } catch (err) {
    logSecurityEvent("UNSAFE_JSON_PARSE", { error: String(err).substring(0, 100) });
    return fallback;
  }
}
