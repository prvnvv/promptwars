/**
 * Security utilities for input sanitization and validation
 */

// XSS prevention - sanitize user input
export function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Validate email format
export function validateEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  // Only allow @thapar.edu emails
  const emailRegex = /^[a-z0-9._%+-]+@thapar\.edu$/;
  return emailRegex.test(trimmed) && trimmed.length <= 254;
}

// Generate secure random IDs (not predictable timestamps)
export function generateSecureId(prefix = 'id') {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  const randomStr = Array.from(arr)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}-${randomStr}`;
}

// Validate review text (prevent injection attacks)
export function validateReviewText(text, maxLength = 1000) {
  if (typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) return null;
  return sanitizeInput(trimmed);
}

// Validate rating scores (1-5)
export function validateRating(value) {
  const num = Number(value);
  return Number.isInteger(num) && num >= 1 && num <= 5 ? num : null;
}

// Validate name
export function validateName(name) {
  if (typeof name !== 'string') return null;
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > 100) return null;
  return sanitizeInput(trimmed);
}
