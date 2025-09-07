import { EmailBrand, renderEmail } from '@/lib/email/base'

export type EmailPayload = { subject: string; html: string; text: string }

const defaultBrand: EmailBrand = {
  appName: 'Cyber Scam Recovery Unit',
  primaryColor: '#0b1e3a',
  accentColor: '#14b87a',
  supportEmail: 'support@csrunit.example',
  companyAddress: 'PO Box 100, Portland, OR 97201'
}

export function otpEmail(params: { code: string; expiresMinutes: number; userName?: string; appName?: string; purpose?: 'verify'|'login'|'confirm_action'; brand?: Partial<EmailBrand> }): EmailPayload {
  const brand: EmailBrand = { ...defaultBrand, ...(params.brand || {}), appName: params.appName || (params.brand?.appName ?? defaultBrand.appName) }
  const purpose = params.purpose || 'verify'
  const purposeText = purpose === 'login' ? 'to sign in' : purpose === 'confirm_action' ? 'to confirm your action' : 'to verify your email'
  const heading = 'Your verification code'
  const subject = `${brand.appName}: ${params.code} is your one-time code`
  const preview = `Use this code ${purposeText}. Expires in ${params.expiresMinutes} minutes.`
  const greet = params.userName ? `Hi ${escape(params.userName)},` : 'Hi,'

  const contentHtml = `
    <p>${greet}</p>
    <p>Use the one-time code below ${purposeText}. This code expires in <strong>${params.expiresMinutes} minutes</strong>.</p>
    <div style="margin:14px 0 6px 0;">
      <span class="code">${escape(params.code)}</span>
    </div>
    <p style="margin-top:12px;" class="muted">If you did not request this code, you can safely ignore this email.</p>
  `
  return renderEmail({ subject, previewText: preview, heading, contentHtml, brand })
}

export function passwordResetEmail(params: { resetLink: string; expiresMinutes: number; userName?: string; appName?: string; brand?: Partial<EmailBrand> }): EmailPayload {
  const brand: EmailBrand = { ...defaultBrand, ...(params.brand || {}), appName: params.appName || (params.brand?.appName ?? defaultBrand.appName) }
  const heading = 'Reset your password'
  const subject = `${brand.appName}: Password reset link`
  const preview = `Reset link expires in ${params.expiresMinutes} minutes.`
  const greet = params.userName ? `Hi ${escape(params.userName)},` : 'Hi,'

  const contentHtml = `
    <p>${greet}</p>
    <p>We received a request to reset your password. Click the button below to continue. This link expires in <strong>${params.expiresMinutes} minutes</strong>.</p>
    <p style="margin:14px 0;">
      <a class="btn" href="${escapeAttr(params.resetLink)}" target="_blank" rel="noopener">Reset password</a>
    </p>
    <p>If the button doesn't work, copy and paste this URL into your browser:</p>
    <p style="word-break: break-all;"><a href="${escapeAttr(params.resetLink)}" style="color:${brand.primaryColor}; text-decoration:none;">${escape(params.resetLink)}</a></p>
    <p class="muted">If you didn’t request this, you can safely ignore this email.</p>
  `
  return renderEmail({ subject, previewText: preview, heading, contentHtml, brand })
}

export function verifyEmailEmail(params: { verifyLink: string; userName?: string; appName?: string; brand?: Partial<EmailBrand> }): EmailPayload {
  const brand: EmailBrand = { ...defaultBrand, ...(params.brand || {}), appName: params.appName || (params.brand?.appName ?? defaultBrand.appName) }
  const heading = 'Verify your email address'
  const subject = `${brand.appName}: Confirm your email`
  const preview = 'Confirm your email to finish setting up your account.'
  const greet = params.userName ? `Hi ${escape(params.userName)},` : 'Hi,'

  const contentHtml = `
    <p>${greet}</p>
    <p>Thanks for signing up. Please confirm your email address by clicking the button below.</p>
    <p style="margin:14px 0;">
      <a class="btn" href="${escapeAttr(params.verifyLink)}" target="_blank" rel="noopener">Verify email</a>
    </p>
    <p>If the button doesn't work, copy and paste this URL into your browser:</p>
    <p style="word-break: break-all;"><a href="${escapeAttr(params.verifyLink)}" style="color:${brand.primaryColor}; text-decoration:none;">${escape(params.verifyLink)}</a></p>
  `
  return renderEmail({ subject, previewText: preview, heading, contentHtml, brand })
}

export function caseUpdateEmail(params: { caseId: number | string; newStatus: string; detailsLink: string; userName?: string; appName?: string; brand?: Partial<EmailBrand> }): EmailPayload {
  const brand: EmailBrand = { ...defaultBrand, ...(params.brand || {}), appName: params.appName || (params.brand?.appName ?? defaultBrand.appName) }
  const heading = `Case #${params.caseId} status update`
  const subject = `${brand.appName}: Case #${params.caseId} is now ${params.newStatus}`
  const preview = `Your case was updated to ${params.newStatus}.`
  const greet = params.userName ? `Hi ${escape(params.userName)},` : 'Hi,'

  const contentHtml = `
    <p>${greet}</p>
    <p>Your case <strong>#${escape(String(params.caseId))}</strong> has been updated to <strong>${escape(params.newStatus)}</strong>.</p>
    <p style="margin:14px 0;">
      <a class="btn" href="${escapeAttr(params.detailsLink)}" target="_blank" rel="noopener">View case details</a>
    </p>
    <p>If the button doesn't work, copy and paste this URL into your browser:</p>
    <p style="word-break: break-all;"><a href="${escapeAttr(params.detailsLink)}" style="color:${brand.primaryColor}; text-decoration:none;">${escape(params.detailsLink)}</a></p>
  `
  return renderEmail({ subject, previewText: preview, heading, contentHtml, brand })
}

function escape(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function escapeAttr(str: string) {
  return escape(str)
}
