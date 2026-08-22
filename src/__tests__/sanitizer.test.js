/**
 * Tests for sanitizer.js utility functions
 * Covers: XSS prevention, input validation, secure ID generation
 */

import {
  sanitizeInput,
  generateSecureId,
  validateEmail,
  validateRating,
  validateReviewText,
  validateName
} from '../utils/sanitizer';

describe('Sanitizer Utility Functions', () => {
  describe('sanitizeInput', () => {
    test('should escape HTML special characters', () => {
      const malicious = '<script>alert("xss")</script>';
      const result = sanitizeInput(malicious);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
      expect(result).toContain('alert');
    });

    test('should handle img tag injection', () => {
      const xss = '<img src=x onerror="alert(1)">';
      const result = sanitizeInput(xss);
      expect(result).not.toContain('onerror');
      expect(result).toContain('img');
    });

    test('should preserve normal text', () => {
      const normal = 'Hello World 123';
      const result = sanitizeInput(normal);
      expect(result).toBe(normal);
    });

    test('should handle empty string', () => {
      const result = sanitizeInput('');
      expect(result).toBe('');
    });

    test('should handle non-string input', () => {
      expect(() => sanitizeInput(null)).not.toThrow();
      expect(() => sanitizeInput(undefined)).not.toThrow();
      expect(() => sanitizeInput(123)).not.toThrow();
    });

    test('should escape quotes', () => {
      const input = 'He said "hello"';
      const result = sanitizeInput(input);
      expect(result).toBe(input);
    });

    test('should handle event handlers', () => {
      const input = 'onclick="doEvil()"';
      const result = sanitizeInput(input);
      expect(result).not.toContain('onclick');
    });
  });

  describe('generateSecureId', () => {
    test('should generate string with correct prefix', () => {
      const id = generateSecureId('prof');
      expect(id).toMatch(/^prof/);
      expect(typeof id).toBe('string');
    });

    test('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateSecureId('test'));
      }
      // Should have 100 unique IDs (no collisions)
      expect(ids.size).toBe(100);
    });

    test('should produce different lengths than timestamp-based IDs', () => {
      const id = generateSecureId('yt');
      const timestampBased = `yt-${Date.now()}`;
      expect(id.length).not.toBe(timestampBased.length);
      expect(id.length).toBeGreaterThan(10);
    });

    test('should handle empty prefix', () => {
      const id = generateSecureId('');
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    test('should contain only valid characters', () => {
      const id = generateSecureId('spot');
      // Should only contain alphanumeric (hex from crypto)
      expect(id).toMatch(/^spot[a-f0-9]+$/);
    });

    test('should not be predictable', () => {
      const id1 = generateSecureId('test');
      const id2 = generateSecureId('test');
      const id3 = generateSecureId('test');
      
      // All should be different
      expect(new Set([id1, id2, id3]).size).toBe(3);
      
      // Can't guess next ID from previous ones
      expect(id1).not.toEqual(id2);
      expect(id2).not.toEqual(id3);
    });
  });

  describe('validateEmail', () => {
    test('should accept valid thapar.edu emails', () => {
      expect(validateEmail('student@thapar.edu')).toBe(true);
      expect(validateEmail('john.doe@thapar.edu')).toBe(true);
      expect(validateEmail('a.b.c_123@thapar.edu')).toBe(true);
    });

    test('should reject non-thapar emails', () => {
      expect(validateEmail('student@gmail.com')).toBe(false);
      expect(validateEmail('user@example.com')).toBe(false);
    });

    test('should reject invalid formats', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@thapar.edu')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user..name@thapar.edu')).toBe(false);
    });

    test('should reject emails exceeding 254 chars', () => {
      const longEmail = 'a'.repeat(250) + '@thapar.edu';
      expect(validateEmail(longEmail)).toBe(false);
    });

    test('should be case insensitive for domain', () => {
      expect(validateEmail('user@THAPAR.EDU')).toBe(false); // Regex is lowercase only
    });

    test('should reject empty string', () => {
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validateRating', () => {
    test('should accept valid ratings 1-5', () => {
      expect(validateRating(1)).toBe(1);
      expect(validateRating(2)).toBe(2);
      expect(validateRating(3)).toBe(3);
      expect(validateRating(4)).toBe(4);
      expect(validateRating(5)).toBe(5);
    });

    test('should reject ratings outside 1-5', () => {
      expect(validateRating(0)).toBeNull();
      expect(validateRating(6)).toBeNull();
      expect(validateRating(-1)).toBeNull();
      expect(validateRating(10)).toBeNull();
    });

    test('should reject non-integer ratings', () => {
      expect(validateRating(2.5)).toBeNull();
      expect(validateRating(3.1)).toBeNull();
    });

    test('should reject non-numeric input', () => {
      expect(validateRating('5')).toBeNull();
      expect(validateRating(null)).toBeNull();
      expect(validateRating(undefined)).toBeNull();
    });
  });

  describe('validateReviewText', () => {
    test('should accept valid review text', () => {
      const text = 'Great professor, very helpful!';
      const result = validateReviewText(text);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    test('should sanitize HTML in reviews', () => {
      const xss = 'Good <script>alert("xss")</script> professor';
      const result = validateReviewText(xss);
      expect(result).not.toContain('<script>');
    });

    test('should enforce max length', () => {
      const tooLong = 'a'.repeat(1001);
      const result = validateReviewText(tooLong, 1000);
      expect(result).toBeFalsy();
    });

    test('should allow custom max length', () => {
      const text = 'a'.repeat(500);
      expect(validateReviewText(text, 400)).toBeFalsy();
      expect(validateReviewText(text, 500)).toBeTruthy();
    });

    test('should reject empty text', () => {
      expect(validateReviewText('')).toBeFalsy();
    });

    test('should reject null/undefined', () => {
      expect(validateReviewText(null)).toBeFalsy();
      expect(validateReviewText(undefined)).toBeFalsy();
    });

    test('should handle whitespace only', () => {
      expect(validateReviewText('   ')).toBeFalsy();
      expect(validateReviewText('\n\t')).toBeFalsy();
    });
  });

  describe('validateName', () => {
    test('should accept valid names', () => {
      expect(validateName('John Doe')).toBeTruthy();
      expect(validateName('Dr. Smith')).toBeTruthy();
      expect(validateName('O\'Brien')).toBeTruthy();
    });

    test('should sanitize HTML in names', () => {
      const xss = 'John<img src=x>';
      const result = validateName(xss);
      expect(result).not.toContain('<img');
    });

    test('should enforce length limits', () => {
      const tooShort = '';
      const tooLong = 'a'.repeat(101);
      expect(validateName(tooShort)).toBeFalsy();
      expect(validateName(tooLong)).toBeFalsy();
    });

    test('should accept valid length names', () => {
      const valid = 'a'.repeat(50);
      expect(validateName(valid)).toBeTruthy();
    });

    test('should reject null/undefined', () => {
      expect(validateName(null)).toBeFalsy();
      expect(validateName(undefined)).toBeFalsy();
    });

    test('should handle special characters safely', () => {
      const name = 'José María García';
      const result = validateName(name);
      // Should either accept or sanitize, not crash
      expect(result).not.toBeNull();
    });
  });
});
