/**
 * Secure session management
 * Stores minimal data, uses session tokens instead of user objects
 */

const SESSION_KEY = 'studentos_session';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

class SessionManager {
  constructor() {
    this.listeners = new Set();
  }

  /**
   * Create a new session for authenticated user
   */
  createSession(email, name) {
    const sessionToken = this._generateToken();
    const session = {
      token: sessionToken,
      email,
      name,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this._notifyListeners();
    return session;
  }

  /**
   * Get current session (with timeout check)
   */
  getSession() {
    try {
      const data = sessionStorage.getItem(SESSION_KEY);
      if (!data) return null;
      
      const session = JSON.parse(data);
      
      // Check if session has expired
      if (Date.now() - session.createdAt > SESSION_TIMEOUT) {
        this.clearSession();
        return null;
      }
      
      // Update last activity
      session.lastActivity = Date.now();
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      
      return session;
    } catch (e) {
      console.error('Session parsing failed', e);
      this.clearSession();
      return null;
    }
  }

  /**
   * Clear session on logout
   */
  clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    this._notifyListeners();
  }

  /**
   * Generate cryptographically secure token
   */
  _generateToken() {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return Array.from(arr)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Listen for session changes
   */
  onChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of session change
   */
  _notifyListeners() {
    this.listeners.forEach(cb => cb());
  }
}

  export { SessionManager };
  export const sessionManager = new SessionManager();
