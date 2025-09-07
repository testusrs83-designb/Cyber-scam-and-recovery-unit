const ADMIN_TOKEN_KEY = 'csr_admin_token'
const ENV_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || ''
const ENV_PWD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || ''

export function isAdminAuthed(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(ADMIN_TOKEN_KEY) === 'ok'
}

export function loginAdmin(email: string, password: string): boolean {
  if (!ENV_EMAIL || !ENV_PWD) return false
  if (email === ENV_EMAIL && password === ENV_PWD) {
    localStorage.setItem(ADMIN_TOKEN_KEY, 'ok')
    return true
  }
  return false
}

export function logoutAdmin() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}
