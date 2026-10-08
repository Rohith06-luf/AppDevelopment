/* ==========================================================================
   AUTHENTICATION & DATA HANDLING MODULE (src/auth.js)
   - Web Crypto API Password Hashing (SHA-256 + Random Salt)
   - localStorage persistence for Registered Users DB
   - sessionStorage management for Active Login Session
   ========================================================================== */

const STORAGE_USERS_KEY = 'registered_users_db';
const STORAGE_SESSION_KEY = 'current_user_session';

/**
 * Generate a random 16-byte salt as a hex string using Web Crypto API
 */
export function generateSalt() {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password with a salt using Web Crypto API (SHA-256)
 * @param {string} password 
 * @param {string} salt 
 * @returns {Promise<string>} SHA-256 hex string
 */
export async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Safely retrieve all registered users from localStorage
 * @returns {Array} Array of user objects
 */
export function getRegisteredUsers() {
  try {
    const data = localStorage.getItem(STORAGE_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading registered users from localStorage:', err);
    return [];
  }
}

/**
 * Safely save users array to localStorage
 * @param {Array} users 
 */
export function saveRegisteredUsers(users) {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users to localStorage:', err);
  }
}

/**
 * Register a new user
 * - Validates duplicate username or email
 * - Hashes password using SHA-256 + random salt
 * - Saves to localStorage
 */
export async function registerUser({ username, email, password }) {
  try {
    const users = getRegisteredUsers();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate username (case-insensitive)
    const duplicateUser = users.find(
      u => u.username.toLowerCase() === cleanUsername.toLowerCase()
    );
    if (duplicateUser) {
      return { success: false, message: 'Username is already taken. Please choose another.' };
    }

    // Check duplicate email (case-insensitive)
    const duplicateEmail = users.find(
      u => u.email.toLowerCase() === cleanEmail
    );
    if (duplicateEmail) {
      return { success: false, message: 'Email address is already registered. Please log in.' };
    }

    // Generate Salt & Hash Password
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);

    // Create User Record
    const newUser = {
      id: 'usr_' + Date.now(),
      username: cleanUsername,
      email: cleanEmail,
      salt: salt,
      passwordHash: passwordHash,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveRegisteredUsers(users);

    return {
      success: true,
      message: 'Account created successfully! You can now log in.'
    };
  } catch (err) {
    console.error('Registration failed:', err);
    return { success: false, message: 'An unexpected error occurred during registration.' };
  }
}

/**
 * Log in a user
 * - Finds user by email
 * - Re-hashes input password with stored salt & compares
 * - Creates active session in sessionStorage
 */
export async function loginUser({ email, password }) {
  try {
    const users = getRegisteredUsers();
    const cleanEmail = email.trim().toLowerCase();

    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, message: 'Invalid email address or password.' };
    }

    // Compute hash for input password using user's stored salt
    const inputHash = await hashPassword(password, user.salt);
    if (inputHash !== user.passwordHash) {
      return { success: false, message: 'Invalid email address or password.' };
    }

    // Password matches! Create active session in sessionStorage
    const sessionData = {
      id: user.id,
      username: user.username,
      email: user.email,
      loggedInAt: new Date().toLocaleString()
    };

    try {
      sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionData));
    } catch (err) {
      console.error('Error setting sessionStorage:', err);
    }

    return {
      success: true,
      user: sessionData,
      message: 'Login successful!'
    };
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, message: 'An unexpected error occurred during login.' };
  }
}

/**
 * Retrieve current active session from sessionStorage
 * @returns {Object|null} User session object or null
 */
export function getCurrentSession() {
  try {
    const session = sessionStorage.getItem(STORAGE_SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch (err) {
    console.error('Error reading sessionStorage:', err);
    return null;
  }
}

/**
 * Log out user by clearing sessionStorage
 */
export function logoutUser() {
  try {
    sessionStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (err) {
    console.error('Error clearing sessionStorage:', err);
  }
}
