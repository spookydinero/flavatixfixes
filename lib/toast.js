// Simple toast notification system
let toastContainer = null;

function createToastContainer() {
  if (toastContainer) return toastContainer;
  
  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
  `;
  document.body.appendChild(toastContainer);
  return toastContainer;
}

function showToast(message, type = 'info', duration = 3000) {
  const container = createToastContainer();
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
    word-wrap: break-word;
    pointer-events: auto;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
  });
  
  // Auto remove
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 300);
  }, duration);
}

// Create toast object
const toast = {
  success: (message, duration) => showToast(message, 'success', duration),
  error: (message, duration) => showToast(message, 'error', duration),
  info: (message, duration) => showToast(message, 'info', duration),
  warn: (message, duration) => showToast(message, 'warning', duration),
};

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { toast };
}

// Also set on window for browser usage
if (typeof window !== 'undefined') {
  window.toast = toast;
}

export { toast };

// Success toast
export const showSuccessToast = (message) => {
  toast.success(message)
}

// Error toast
export const showErrorToast = (message) => {
  toast.error(message)
}

// Info toast
export const showInfoToast = (message) => {
  toast.info(message)
}

// Warning toast
export const showWarningToast = (message) => {
  toast.warn(message)
}

// Authentication specific toasts
export const authToasts = {
  loginSuccess: () => showSuccessToast('¡Bienvenido! Has iniciado sesión correctamente'),
  loginError: (error) => showErrorToast(error || 'Error al iniciar sesión'),
  registerSuccess: () => showSuccessToast('¡Cuenta creada! Revisa tu email para confirmar tu cuenta'),
  registerError: (error) => showErrorToast(error || 'Error al crear la cuenta'),
  logoutSuccess: () => showInfoToast('Has cerrado sesión correctamente'),
  logoutError: (error) => showErrorToast(error || 'Error al cerrar sesión'),
  sessionExpired: () => showWarningToast('Tu sesión ha expirado. Por favor, inicia sesión nuevamente'),
  emailConfirmation: () => showInfoToast('Por favor, confirma tu email antes de continuar'),
}