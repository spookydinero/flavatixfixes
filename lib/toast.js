import { toast } from 'react-toastify'

// Toast configuration
const toastConfig = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
}

// Success toast
export const showSuccessToast = (message) => {
  toast.success(message, {
    ...toastConfig,
    className: 'bg-green-50 text-green-800 border border-green-200',
  })
}

// Error toast
export const showErrorToast = (message) => {
  toast.error(message, {
    ...toastConfig,
    className: 'bg-red-50 text-red-800 border border-red-200',
  })
}

// Info toast
export const showInfoToast = (message) => {
  toast.info(message, {
    ...toastConfig,
    className: 'bg-blue-50 text-blue-800 border border-blue-200',
  })
}

// Warning toast
export const showWarningToast = (message) => {
  toast.warn(message, {
    ...toastConfig,
    className: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  })
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