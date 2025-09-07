"use client"
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ShieldCheckIcon, RocketIcon, FileTextIcon } from '@radix-ui/react-icons'

export default function HomePage() {
  return (
    <div>
      <section className="container-responsive pt-16 pb-14">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <h1 className="section-title text-balance">Report scams. Recover funds. Protect your money.</h1>
          <p className="section-subtitle mt-4 max-w-2xl mx-auto">We support victims of crypto and fiat fraud with secure reporting and recovery guidance.</p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/report" className="button-primary">Report a Case</Link>
            <a href="#how" className="button-secondary">How Recovery Works</a>
          </div>
        </motion.div>
      </section>

      <section id="how" className="container-responsive py-14">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle mt-2">Three simple steps to start recovery.</p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { title: 'Submit', desc: 'Share details of the scam securely.', icon: <FileTextIcon className="h-6 w-6" /> },
            { title: 'Review', desc: 'Experts analyze your case and evidence.', icon: <ShieldCheckIcon className="h-6 w-6" /> },
            { title: 'Action', desc: 'We guide actions to recover and prevent.', icon: <RocketIcon className="h-6 w-6" /> },
          ].map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-surface p-6">
              <div className="h-11 w-11 rounded-md bg-brand-green/10 text-brand-green grid place-items-center">{s.icon}</div>
              <h3 className="mt-4 font-semibold text-lg">{s.title}</h3>
              <p className="mt-1 text-[var(--muted)]">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container-responsive py-14">
        <h2 className="section-title">Services</h2>
        <p className="section-subtitle mt-2">Specialized support from intake to action.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { t: 'Crypto Recovery', d: 'Tracing transactions and coordinating responses.' },
            { t: 'Fiat Recovery', d: 'Bank transfer disputes and coordination.' },
            { t: 'Evidence Handling', d: 'Secure collection and integrity protection.' },
            { t: 'Prevention', d: 'Education and tooling to avoid future risks.' },
          ].map((s, i) => (
            <motion.div key={s.t} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="card-surface p-6">
              <h3 className="font-semibold text-lg">{s.t}</h3>
              <p className="mt-2 text-[var(--muted)]">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container-responsive py-14">
        <h2 className="section-title">Why Trust Us</h2>
        <p className="section-subtitle mt-2">Built around security, transparency, and expertise.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { t: 'Security', d: 'Secure-by-default processes and data handling.' },
            { t: 'Transparency', d: 'Clear status updates and documented steps.' },
            { t: 'Expert Team', d: 'Experienced analysts and investigators.' },
          ].map((s, i) => (
            <motion.div key={s.t} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="card-surface p-6">
              <h3 className="font-semibold text-lg">{s.t}</h3>
              <p className="mt-2 text-[var(--muted)]">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-14">
        <div className="container-responsive card-surface px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold">Lost funds? Don’t wait — report now.</h3>
            <p className="mt-1 text-[var(--muted)]">Faster reporting increases recovery chances.</p>
          </div>
          <Link href="/report" className="button-primary">Report a Case</Link>
        </div>
      </section>
    </div>
  )
}
