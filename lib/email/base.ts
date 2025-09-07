export type EmailBrand = {
  appName: string
  primaryColor?: string
  accentColor?: string
  logoUrl?: string
  supportEmail?: string
  companyAddress?: string
}

export type EmailRenderInput = {
  subject: string
  previewText?: string
  heading: string
  contentHtml: string
  brand: EmailBrand
}

export function renderEmail({ subject, previewText, heading, contentHtml, brand }: EmailRenderInput) {
  const primary = brand.primaryColor || '#0b1e3a'
  const accent = brand.accentColor || '#14b87a'
  const app = brand.appName

  const html = `<!doctype html>
  <html lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${escapeHtml(subject)}</title>
      <style>
        @media (prefers-color-scheme: dark) {
          .bg-body { background:#0b0b0b !important; }
          .bg-card { background:#111315 !important; }
          .text { color:#f3f4f6 !important; }
          .muted { color:#9ca3af !important; }
        }
        .btn { background:${accent}; color:#ffffff; text-decoration:none; padding:12px 18px; border-radius:8px; display:inline-block; font-weight:600 }
        .code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; letter-spacing: 4px; font-size: 22px; color:${primary}; background:#f3f4f6; padding:12px 16px; border-radius:8px; }
      </style>
    </head>
    <body class="bg-body" style="margin:0; padding:0; background:#f6f7f9;">
      ${previewText ? `<div style="display:none; max-height:0; overflow:hidden; opacity:0;">${escapeHtml(previewText)}</div>` : ''}
      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="background:#f6f7f9;">
        <tr>
          <td align="center" style="padding:24px;">
            <table role="presentation" width="640" cellPadding="0" cellSpacing="0" style="width:100%; max-width:640px; background:#ffffff; border-radius:14px; box-shadow:0 2px 12px rgba(0,0,0,0.08);" class="bg-card">
              <tr>
                <td style="padding:24px 24px 0 24px;">
                  <div style="display:flex; align-items:center; gap:12px;">
                    ${brand.logoUrl ? `<img src="${brand.logoUrl}" alt="${escapeHtml(app)}" width="36" height="36" style="display:block;border-radius:8px;border:1px solid #e5e7eb;" />` : ''}
                    <div style="font-size:14px; font-weight:700; color:${primary}; letter-spacing:0.2px;">${escapeHtml(app)}</div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 24px 0 24px;">
                  <h1 class="text" style="margin:0; font-size:22px; line-height:28px; color:#111827;">${escapeHtml(heading)}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 24px 24px 24px;">
                  <div class="text" style="font-size:14px; line-height:22px; color:#111827;">
                    ${contentHtml}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 24px; border-top:1px solid #e5e7eb;">
                  <div class="muted" style="font-size:12px; color:#6b7280;">
                    <div>Questions? Email ${brand.supportEmail ? `<a href="mailto:${brand.supportEmail}" style="color:${primary}; text-decoration:none;">${escapeHtml(brand.supportEmail)}</a>` : 'support'}.</div>
                    ${brand.companyAddress ? `<div style="margin-top:6px;">${escapeHtml(brand.companyAddress)}</div>` : ''}
                  </div>
                </td>
              </tr>
            </table>
            <div style="font-size:11px; color:#9ca3af; margin-top:12px;">© ${new Date().getFullYear()} ${escapeHtml(app)}. All rights reserved.</div>
          </td>
        </tr>
      </table>
    </body>
  </html>`

  const text = htmlToText(`${heading}\n\n${stripHtml(contentHtml)}`)
  return { subject, html, text }
}

export function htmlToText(html: string) {
  return stripHtml(
    html
      .replace(/<br\s*\/>/gi, '\n')
      .replace(/<\/(p|div|h1|h2|h3|li)>/gi, '\n')
      .replace(/<li>/gi, '• ')
  )
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '')
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
