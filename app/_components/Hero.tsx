"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <Background />
      <div className="container-responsive pt-20 pb-16 relative z-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/60 dark:bg-white/5 backdrop-blur px-3 py-1 text-xs text-[var(--muted)]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Secure intake & guidance
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-semibold leading-tight text-balance">
            Professional recovery support for victims of scams and fraud
          </h1>
          <p className="mt-4 max-w-2xl text-[var(--muted)] text-base sm:text-lg">
            Confidential case reporting, expert analysis, and actionable steps to recover funds and prevent further loss.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/report" className="button-primary">Start a secure report</Link>
            <a href="#trusted" className="button-secondary">Why trust us</a>
          </div>
          <div className="mt-6 flex items-center gap-4 text-xs text-[var(--muted)]">
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400"/>Encrypted</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400"/>Evidence integrity</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400"/>Human review</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Background() {
  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(20,184,122,0.15),transparent),radial-gradient(800px_400px_at_90%_-20%,rgba(11,30,58,0.15),transparent)]" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute -inset-1"
      >
        <Grid />
      </motion.div>
    </div>
  )
}

function Grid() {
  const cells = Array.from({ length: 70 })
  return (
    <div className="absolute inset-0 opacity-[0.08]">
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#p)" />
      </svg>
      <div className="absolute inset-0">
        {cells.map((_, i) => (
          <motion.span
            key={i}
            className="absolute block h-2 w-2 rounded-sm bg-brand-green"
            style={{
              top: `${(i * 37) % 100}%`,
              left: `${(i * 57) % 100}%`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 3, delay: i * 0.04, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  )
}
