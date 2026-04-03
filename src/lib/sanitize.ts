/**
 * Sanitizes user input by stripping all HTML tags and attributes.
 * Use on all free-text fields before sending to any API.
 */
export function sanitize(input: string): string {
  // Strip HTML tags
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Sanitizes user input for AI prompts, removing prompt injection attempts.
 */
export function sanitizeForAI(input: string): string {
  const injectionPatterns = [
    /ignore\s+(previous|all|above)\s+instructions?/gi,
    /\bsystem\s*:/gi,
    /\bassistant\s*:/gi,
    /\bDAN\b/g,
    /you are now/gi,
    /forget your instructions/gi,
    /new persona/gi,
  ];
  let sanitized = input;
  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, '[REMOVED]');
  }
  return sanitized.slice(0, 5000);
}
