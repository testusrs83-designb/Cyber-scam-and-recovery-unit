import { NextResponse } from 'next/server'
import { otpEmail, passwordResetEmail, verifyEmailEmail, caseUpdateEmail } from '@/lib/email/templates'

export async function GET(req: Request, { params }: { params: { template: string } }) {
  try {
    const url = new URL(req.url)
    const t = params.template

    let subject = ''
    let html = ''

    if (t === 'otp') {
      const code = url.searchParams.get('code') || '834291'
      const exp = Number(url.searchParams.get('expires') || 10)
      const user = url.searchParams.get('user') || 'Investigator'
      const payload = otpEmail({ code, expiresMinutes: exp, userName: user, purpose: 'verify' })
      subject = payload.subject
      html = payload.html
    } else if (t === 'password-reset') {
      const link = url.searchParams.get('link') || 'https://csrunit.example/reset?token=abc123'
      const exp = Number(url.searchParams.get('expires') || 30)
      const user = url.searchParams.get('user') || 'Investigator'
      const payload = passwordResetEmail({ resetLink: link, expiresMinutes: exp, userName: user })
      subject = payload.subject
      html = payload.html
    } else if (t === 'verify-email') {
      const link = url.searchParams.get('link') || 'https://csrunit.example/verify?token=xyz789'
      const user = url.searchParams.get('user') || 'Investigator'
      const payload = verifyEmailEmail({ verifyLink: link, userName: user })
      subject = payload.subject
      html = payload.html
    } else if (t === 'case-update') {
      const id = url.searchParams.get('id') || '1024'
      const status = url.searchParams.get('status') || 'in review'
      const link = url.searchParams.get('link') || 'https://csrunit.example/cases/1024'
      const user = url.searchParams.get('user') || 'Investigator'
      const payload = caseUpdateEmail({ caseId: id, newStatus: status, detailsLink: link, userName: user })
      subject = payload.subject
      html = payload.html
    } else {
      return NextResponse.json({ error: 'Unknown template' }, { status: 404 })
    }

    const wrapped = `<!doctype html><html><head><meta charset="utf-8"><title>${subject}</title></head><body style="margin:0">${html}</body></html>`
    return new NextResponse(wrapped, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to render template' }, { status: 500 })
  }
}
