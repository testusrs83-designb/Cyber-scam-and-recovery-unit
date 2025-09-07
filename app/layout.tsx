import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export const metadata: Metadata = {
  title: 'Cyber Scam & Recovery Unit',
  description: 'Report scams. Recover funds. Protect your money.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider>
          <header className="border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-slate-950/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container-responsive flex items-center justify-between py-4">
              <Link href="/" className="flex items-center gap-3" aria-label="Cyber Scam & Recovery Unit home">
                <div className="h-9 w-9 rounded-lg bg-brand-navy text-white grid place-items-center font-bold">CSR</div>
                <span className="font-semibold">Cyber Scam & Recovery Unit</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm">
                <Link className="hover:underline" href="/report">Report</Link>
                <Link className="hover:underline" href="/dashboard">Dashboard</Link>
                <Link className="hover:underline" href="/reviewer">Reviewer</Link>
              </nav>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link href="/report" className="button-primary">Report a Case</Link>
              </div>
            </div>
          </header>
          <main>{children}</main>
          <footer className="mt-16 border-t border-black/5 dark:border-white/10">
            <div className="container-responsive py-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-sm">
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-brand-navy text-white grid place-items-center font-semibold">CSR</div>
                  <span className="font-semibold">Cyber Scam & Recovery Unit</span>
                </div>
                <p className="mt-3 text-[var(--muted)] max-w-md">We support victims of crypto and fiat fraud with secure reporting and recovery guidance.</p>
              </div>
              <div>
                <h3 className="font-medium">About</h3>
                <ul className="mt-3 space-y-2 text-[var(--muted)]">
                  <li><a className="hover:underline" href="#">Our Mission</a></li>
                  <li><a className="hover:underline" href="#">Team</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium">Legal</h3>
                <ul className="mt-3 space-y-2 text-[var(--muted)]">
                  <li><a className="hover:underline" href="#">Terms</a></li>
                  <li><a className="hover:underline" href="#">Privacy</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium">Resources</h3>
                <ul className="mt-3 space-y-2 text-[var(--muted)]">
                  <li><a className="hover:underline" href="#">Help Center</a></li>
                  <li><a className="hover:underline" href="#">Contact</a></li>
                </ul>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
