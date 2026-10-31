/**
 * Aniwave Authentication & Session Management Service
 * Supports Guest Mode, Local User Registration, Role-Based Access (Admin/User)
 */
import { CONFIG } from './config.js';

export const authService = {
  // Get active session
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKeys.userSession);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // Check if current session has admin privileges
  isAdmin() {
    const user = this.getCurrentUser();
    return Boolean(user && user.role === 'admin');
  },

  // Login with email/username and password
  login(identifier, password) {
    const cleanId = String(identifier || '').trim().toLowerCase();
    const cleanPw = String(password || '').trim();

    if (!cleanId || !cleanPw) {
      throw new Error('Username / Email dan Password wajib diisi.');
    }

    // Default administrative credential check (Can be overridden via config/env)
    if ((cleanId === 'admin' || cleanId === 'admin@aniwave.local') && cleanPw === 'admin123') {
      const adminSession = {
        id: 'admin_root',
        username: 'Administrator',
        email: 'admin@aniwave.local',
        role: 'admin',
        avatar: 'assets/img/aniwave-mark.svg',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(CONFIG.storageKeys.userSession, JSON.stringify(adminSession));
      return adminSession;
    }

    // Check user database in localStorage
    const users = this.getAllUsers();
    const found = users.find(u => (u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId) && u.password === cleanPw);

    if (!found) {
      throw new Error('Kredensial tidak valid. Silakan periksa kembali akun Anda.');
    }

    const session = {
      id: found.id,
      username: found.username,
      email: found.email,
      role: found.role || 'user',
      avatar: found.avatar || 'assets/img/aniwave-mark.svg',
      createdAt: found.createdAt
    };

    localStorage.setItem(CONFIG.storageKeys.userSession, JSON.stringify(session));
    return session;
  },

  // Register new user
  register(username, email, password) {
    const cleanUser = String(username || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPw = String(password || '').trim();

    if (cleanUser.length < 3) throw new Error('Username minimal 3 karakter.');
    if (!cleanEmail.includes('@')) throw new Error('Format email tidak valid.');
    if (cleanPw.length < 6) throw new Error('Password minimal 6 karakter.');

    const users = this.getAllUsers();
    if (users.some(u => u.username.toLowerCase() === cleanUser.toLowerCase())) {
      throw new Error('Username sudah digunakan.');
    }
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('Email sudah terdaftar.');
    }

    const newUser = {
      id: 'usr_' + Date.now().toString(36),
      username: cleanUser,
      email: cleanEmail,
      password: cleanPw,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(CONFIG.storageKeys.usersList, JSON.stringify(users));

    // Auto-login after registration
    return this.login(cleanEmail, cleanPw);
  },

  // Logout
  logout() {
    localStorage.removeItem(CONFIG.storageKeys.userSession);
  },

  // Get list of registered users
  getAllUsers() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKeys.usersList);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
};
