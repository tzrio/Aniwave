/**
 * Aniwave Toast Notification & Confirmation Dialog Service
 */
export const toastService = {
  container: null,

  init() {
    if (this.container) return;
    let el = document.getElementById('toast-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast-container';
      el.className = 'toast-container';
      document.body.appendChild(el);
    }
    this.container = el;
  },

  show(message, type = 'info', duration = 3500) {
    this.init();
    const item = document.createElement('div');
    item.className = `toast toast-${type}`;
    item.textContent = message;

    this.container.appendChild(item);

    setTimeout(() => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(10px)';
      item.style.transition = 'all 0.3s ease';
      setTimeout(() => item.remove(), 300);
    }, duration);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); },
  info(msg) { this.show(msg, 'info'); },

  // Custom Modern Modal Dialog (Menggantikan confirm() bawaan browser yang kaku)
  confirm({ title = 'Konfirmasi', message, confirmText = 'Lanjutkan', cancelText = 'Batal', danger = false }) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'modal-backdrop active';
      modal.style.zIndex = '9999';

      modal.innerHTML = `
        <div class="modal-card" style="max-width:420px; text-align:center;">
          <div style="font-size:2rem; margin-bottom:12px;">${danger ? '⚠️' : '☁️'}</div>
          <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:8px; color:var(--color-text-main);">${title}</h3>
          <p style="font-size:0.9rem; color:var(--color-text-muted); margin-bottom:24px; line-height:1.5;">${message}</p>
          <div style="display:flex; justify-content:center; gap:12px;">
            <button id="modal-btn-cancel" class="btn-secondary" style="padding:8px 20px;">${cancelText}</button>
            <button id="modal-btn-confirm" class="${danger ? 'btn-secondary' : 'btn-primary'}" style="${danger ? 'border-color:var(--color-danger); color:var(--color-danger); padding:8px 20px;' : 'padding:8px 20px;'}">${confirmText}</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const cleanup = (res) => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 200);
        resolve(res);
      };

      modal.querySelector('#modal-btn-cancel').onclick = () => cleanup(false);
      modal.querySelector('#modal-btn-confirm').onclick = () => cleanup(true);
    });
  }
};
