/**
 * SMILEORA Navigation & Global Header Component
 * Brand: SMILEORA | Parent: SMILEON
 */
import { CONFIG } from './config.js';
import { authService } from './authService.js';
import { toastService } from './toastService.js';

export function setupNavigation() {
  // 1. Theme initialization
  const savedTheme = localStorage.getItem(CONFIG.storageKeys.theme) || CONFIG.site.defaultTheme;
  document.documentElement.setAttribute('data-theme', savedTheme);

  // 2. Render Auth state
  renderAuthNav();

  // 3. Theme Toggle Button
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(CONFIG.storageKeys.theme, next);
      toastService.info(`Tema diubah ke mode ${next === 'dark' ? 'Deep Aurora (Dark)' : 'Twilight (Light)'}`);
    });
  }

  // 4. Setup Auth Modal
  setupAuthModal();
}

export function renderAuthNav() {
  const container = document.getElementById('nav-auth-container');
  if (!container) return;

  const currentUser = authService.getCurrentUser();
  if (currentUser) {
    const adminLink = currentUser.role === 'admin' ? `<a href="admin.html" class="btn-secondary" style="font-size:0.8rem; padding:6px 14px;">Studio Admin</a>` : '';
    container.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        ${adminLink}
        <span style="font-size:0.85rem; font-weight:700; color:var(--color-text-main);">Hi, ${escapeHtml(currentUser.username)}</span>
        <button id="btn-logout" class="btn-secondary" style="padding:6px 12px; font-size:0.8rem;">Keluar</button>
      </div>
    `;

    document.getElementById('btn-logout')?.addEventListener('click', () => {
      authService.logout();
      toastService.info('Berhasil keluar dari akun SMILEORA.');
      renderAuthNav();
      window.dispatchEvent(new CustomEvent('auth-changed'));
    });
  } else {
    container.innerHTML = `
      <button id="btn-open-login" class="btn-primary" type="button">Masuk / Daftar</button>
    `;

    document.getElementById('btn-open-login')?.addEventListener('click', () => {
      openAuthModal();
    });
  }
}

function setupAuthModal() {
  let modal = document.getElementById('auth-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-card">
        <button class="modal-close" id="auth-modal-close" aria-label="Tutup modal">&times;</button>
        <div id="auth-modal-content">
          <div style="text-align:center; margin-bottom:16px;">
            <img src="assets/img/smileora-mark.svg" alt="SMILEORA" style="width:40px; height:40px; margin:0 auto 8px;" />
            <h2 style="font-size:1.4rem; font-weight:900;" id="auth-title">Masuk ke SMILEORA</h2>
            <p style="font-size:0.85rem; color:var(--color-text-muted);" id="auth-desc">${CONFIG.site.tagline}</p>
          </div>

          <form id="form-login">
            <div class="form-group">
              <label class="form-label" for="login-id">Username atau Email</label>
              <input class="form-input" id="login-id" type="text" placeholder="mis. admin atau email" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="login-pw">Password</label>
              <input class="form-input" id="login-pw" type="password" placeholder="••••••••" required />
            </div>
            <button class="btn-primary" style="width:100%; margin-top:8px;" type="submit">Masuk</button>
            <p style="text-align:center; margin-top:14px; font-size:0.85rem; color:var(--color-text-muted);">
              Belum punya akun? <a href="#" id="to-register" style="color:var(--color-primary); font-weight:700;">Daftar akun baru</a>
            </p>
          </form>

          <form id="form-register" style="display:none;">
            <div class="form-group">
              <label class="form-label" for="reg-user">Username</label>
              <input class="form-input" id="reg-user" type="text" placeholder="Username unik" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="reg-email">Alamat Email</label>
              <input class="form-input" id="reg-email" type="email" placeholder="nama@email.com" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="reg-pw">Password</label>
              <input class="form-input" id="reg-pw" type="password" placeholder="Minimal 6 karakter" required />
            </div>
            <button class="btn-primary" style="width:100%; margin-top:8px;" type="submit">Buat Akun SMILEORA</button>
            <p style="text-align:center; margin-top:14px; font-size:0.85rem; color:var(--color-text-muted);">
              Sudah punya akun? <a href="#" id="to-login" style="color:var(--color-primary); font-weight:700;">Masuk sekarang</a>
            </p>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('auth-modal-close')?.addEventListener('click', closeAuthModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAuthModal();
    });

    document.getElementById('to-register')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('form-login').style.display = 'none';
      document.getElementById('form-register').style.display = 'block';
      document.getElementById('auth-title').textContent = 'Gabung dengan SMILEORA';
    });

    document.getElementById('to-login')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('form-register').style.display = 'none';
      document.getElementById('form-login').style.display = 'block';
      document.getElementById('auth-title').textContent = 'Masuk ke SMILEORA';
    });

    document.getElementById('form-login')?.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const id = document.getElementById('login-id').value;
        const pw = document.getElementById('login-pw').value;
        authService.login(id, pw);
        toastService.success('Selamat datang kembali di SMILEORA!');
        closeAuthModal();
        renderAuthNav();
        window.dispatchEvent(new CustomEvent('auth-changed'));
      } catch (err) {
        toastService.error(err.message);
      }
    });

    document.getElementById('form-register')?.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const user = document.getElementById('reg-user').value;
        const email = document.getElementById('reg-email').value;
        const pw = document.getElementById('reg-pw').value;
        authService.register(user, email, pw);
        toastService.success('Akun SMILEORA berhasil dibuat!');
        closeAuthModal();
        renderAuthNav();
        window.dispatchEvent(new CustomEvent('auth-changed'));
      } catch (err) {
        toastService.error(err.message);
      }
    });
  }
}

export function openAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.add('active');
}

export function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('active');
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[m]);
}
