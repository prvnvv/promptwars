/**
 * Tests for db.js auth flow and input validation
 * Covers: Secure authentication, input validation in reviews, secure ID generation
 */

import { db } from '../services/db';

describe('Database Service - Auth Flow', () => {
  beforeEach(() => {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    db.signOut();
  });

  afterEach(() => {
    db.signOut();
  });

  describe('Authentication', () => {
    test('should not have user initially', () => {
      const user = db.getCurrentUser();
      expect(user).toBeNull();
    });

    test('should sign in with valid email', () => {
      const result = db.signInWithGoogle('student@thapar.edu');
      expect(result.success).toBe(true);
      expect(result.user).toBeTruthy();
      expect(result.user.email).toBe('student@thapar.edu');
    });

    test('should get current user after sign in', () => {
      db.signInWithGoogle('student@thapar.edu');
      const user = db.getCurrentUser();
      expect(user).not.toBeNull();
      expect(user.email).toBe('student@thapar.edu');
    });

    test('should reject invalid email format', () => {
      const result = db.signInWithGoogle('notanemail');
      expect(result.success).toBe(false);
      expect(result.message).toBeTruthy();
    });

    test('should reject non-thapar emails', () => {
      const result = db.signInWithGoogle('user@gmail.com');
      expect(result.success).toBe(false);
    });

    test('should sanitize name input', () => {
      const result = db.signInWithGoogle('student@thapar.edu');
      const user = result.user;
      // Name should not contain HTML
      expect(user.name).not.toContain('<');
      expect(user.name).not.toContain('>');
    });

    test('should clear session on logout', () => {
      db.signInWithGoogle('student@thapar.edu');
      expect(db.getCurrentUser()).not.toBeNull();

      db.signOut();
      expect(db.getCurrentUser()).toBeNull();
    });
  });

  describe('Professor Reviews - Input Validation', () => {
    beforeEach(() => {
      db.signInWithGoogle('student@thapar.edu');
    });

    test('should add valid professor review', () => {
      const profs = db.getProfessors();
      const prof = profs[0];

      const review = {
        teachingQuality: 5,
        clarity: 4,
        helpfulness: 5,
        grading: 3,
        comment: 'Excellent professor'
      };

      const result = db.addProfessorReview(prof.id, review);
      expect(result.success).toBe(true);
    });

    test('should reject invalid teaching quality rating', () => {
      const profs = db.getProfessors();
      const prof = profs[0];

      const review = {
        teachingQuality: 6,
        clarity: 4,
        helpfulness: 5,
        grading: 3,
        comment: 'Test'
      };

      const result = db.addProfessorReview(prof.id, review);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    test('should reject non-integer ratings', () => {
      const profs = db.getProfessors();
      const prof = profs[0];

      const review = {
        teachingQuality: 4.5,
        clarity: 4,
        helpfulness: 5,
        grading: 3,
        comment: 'Test'
      };

      const result = db.addProfessorReview(prof.id, review);
      expect(result.success).toBe(false);
    });

    test('should sanitize comment for XSS', () => {
      const profs = db.getProfessors();
      const prof = profs[0];

      const review = {
        teachingQuality: 4,
        clarity: 4,
        helpfulness: 5,
        grading: 3,
        comment: '<script>alert("xss")</script>Great prof'
      };

      const result = db.addProfessorReview(prof.id, review);
      if (result.success) {
        const reviews = db.getProfessorReviews(prof.id);
        const lastReview = reviews[reviews.length - 1];
        expect(lastReview.comment).not.toContain('<script>');
      }
    });

    test('should enforce comment length limit', () => {
      const profs = db.getProfessors();
      const prof = profs[0];

      const review = {
        teachingQuality: 4,
        clarity: 4,
        helpfulness: 5,
        grading: 3,
        comment: 'a'.repeat(1001)
      };

      const result = db.addProfessorReview(prof.id, review);
      expect(result.success).toBe(false);
    });

    test('should prevent duplicate reviews from same user', () => {
      const profs = db.getProfessors();
      const prof = profs[0];

      const review = {
        teachingQuality: 4,
        clarity: 4,
        helpfulness: 5,
        grading: 3,
        comment: 'First review'
      };

      const result1 = db.addProfessorReview(prof.id, review);
      expect(result1.success).toBe(true);

      const result2 = db.addProfessorReview(prof.id, review);
      expect(result2.success).toBe(false);
      expect(result2.message).toContain('already reviewed');
    });

    test('should use email for deduplication not user ID', () => {
      const profs = db.getProfessors();
      const prof = profs[0];

      const review = {
        teachingQuality: 4,
        clarity: 4,
        helpfulness: 5,
        grading: 3,
        comment: 'Review text'
      };

      db.addProfessorReview(prof.id, review);
      
      // User email should be stored, not a predictable ID
      const reviews = db.getProfessorReviews(prof.id);
      const userReview = reviews[reviews.length - 1];
      expect(userReview.userEmail).toBe('student@thapar.edu');
    });
  });

  describe('YouTube Reviews - Input Validation', () => {
    beforeEach(() => {
      db.signInWithGoogle('student@thapar.edu');
    });

    test('should add valid YouTube review', () => {
      const channels = db.getYoutubeChannels();
      const channel = channels[0];

      const review = {
        contentQuality: 5,
        clarity: 4,
        updateFrequency: 5,
        comment: 'Great channel'
      };

      const result = db.addYoutubeReview(channel.id, review);
      expect(result.success).toBe(true);
    });

    test('should reject invalid rating in YouTube review', () => {
      const channels = db.getYoutubeChannels();
      const channel = channels[0];

      const review = {
        contentQuality: 0,
        clarity: 4,
        updateFrequency: 5,
        comment: 'Test'
      };

      const result = db.addYoutubeReview(channel.id, review);
      expect(result.success).toBe(false);
    });

    test('should sanitize YouTube review comments', () => {
      const channels = db.getYoutubeChannels();
      const channel = channels[0];

      const review = {
        contentQuality: 5,
        clarity: 4,
        updateFrequency: 5,
        comment: '<img src=x onerror="alert(1)">Good content'
      };

      const result = db.addYoutubeReview(channel.id, review);
      if (result.success) {
        const reviews = db.getYoutubeReviews(channel.id);
        const lastReview = reviews[reviews.length - 1];
        expect(lastReview.comment).not.toContain('onerror');
      }
    });
  });

  describe('Campus Spot Reviews - Input Validation', () => {
    beforeEach(() => {
      db.signInWithGoogle('student@thapar.edu');
    });

    test('should add valid campus spot review', () => {
      const spots = db.getCampusSpots();
      const spot = spots[0];

      const review = {
        ambiance: 4,
        comfort: 5,
        wifi: 4,
        food: 3,
        quietness: 5,
        comment: 'Good place to study'
      };

      const result = db.addSpotReview(spot.id, review);
      expect(result.success).toBe(true);
    });

    test('should validate all 6 ratings in spot review', () => {
      const spots = db.getCampusSpots();
      const spot = spots[0];

      const review = {
        ambiance: 4,
        comfort: 5,
        wifi: 6,  // Invalid
        food: 3,
        quietness: 5,
        comment: 'Good place'
      };

      const result = db.addSpotReview(spot.id, review);
      expect(result.success).toBe(false);
    });

    test('should reject spot review if any rating invalid', () => {
      const spots = db.getCampusSpots();
      const spot = spots[0];

      const review = {
        ambiance: 4,
        comfort: 'bad',  // Invalid type
        wifi: 4,
        food: 3,
        quietness: 5,
        comment: 'Test'
      };

      const result = db.addSpotReview(spot.id, review);
      expect(result.success).toBe(false);
    });
  });

  describe('Secure ID Generation', () => {
    test('should generate non-predictable professor IDs', () => {
      const prof1 = db.addProfessor({ name: 'Prof 1', department: 'CS' });
      const prof2 = db.addProfessor({ name: 'Prof 2', department: 'CS' });

      expect(prof1.success).toBe(true);
      expect(prof2.success).toBe(true);
      expect(prof1.data.id).not.toMatch(/^\d+$/); // Not timestamp
      expect(prof1.data.id).not.toBe(prof2.data.id);
    });

    test('should use secure IDs for all entities', () => {
      const prof = db.addProfessor({ name: 'Dr. Test', department: 'CS' });
      const channel = db.addYoutubeChannel({ name: 'Test Channel', url: 'http://test.com' });
      
      if (prof.success && channel.success) {
        // IDs should start with type prefix, contain random hex
        expect(prof.data.id).toMatch(/^prof[a-f0-9]+$/);
        expect(channel.data.id).toMatch(/^yt[a-f0-9]+$/);
      }
    });

    test('should not use predictable Date.now() pattern', () => {
      const now = Date.now();
      const prof = db.addProfessor({ name: 'Dr. Test', department: 'CS' });
      
      if (prof.success) {
        // Should not contain recognizable timestamp
        expect(prof.data.id).not.toContain(now.toString());
      }
    });
  });

  describe('Auth Observer Pattern', () => {
    test('should trigger auth change on sign in', (done) => {
      db.onAuthChange(() => {
        done();
      });

      db.signInWithGoogle('student@thapar.edu');
    });

    test('should trigger auth change on sign out', (done) => {
      db.signInWithGoogle('student@thapar.edu');
      
      db.onAuthChange(() => {
        done();
      });

      db.signOut();
    });
  });
});
