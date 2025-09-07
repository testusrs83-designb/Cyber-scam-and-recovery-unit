const ADMIN_TOKEN_KEY = 'csr_admin_token'
const FIXED_EMAIL = 'super@admin.com'
const FIXED_PWD = 'Admin001'

export function isAdminAuthed(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(ADMIN_TOKEN_KEY) === 'ok'
}

export function loginAdmin(email: string, password: string): boolean {
  if (email === FIXED_EMAIL && password === FIXED_PWD) {
    localStorage.setItem(ADMIN_TOKEN_KEY, 'ok')
    return true
  }
  return false
}

export function logoutAdmin() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}
