"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import Hero from '@/app/_components/Hero'
import { CheckCircledIcon, RocketIcon, FileTextIcon, LockClosedIcon } from '@radix-ui/react-icons'

export default function HomePage() {
  return (
    <div>
      <Hero />

      <section id="how" className="container-responsive py-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="section-title">Start in three steps</h2>
            <p className="section-subtitle mt-2">Simple, guided, and secure.</p>
          </div>
          <Link href="/report" className="button-secondary">Begin report</Link>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { title: 'Submit', desc: 'Share details securely to open a case.', icon: <FileTextIcon className="h-6 w-6" /> },
            { title: 'Review', desc: 'Analysts validate evidence and scope.', icon: <CheckCircledIcon className="h-6 w-6" /> },
            { title: 'Action', desc: 'We coordinate steps to recover and protect.', icon: <RocketIcon className="h-6 w-6" /> },
          ].map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-surface p-6">
              <div className="h-11 w-11 rounded-md bg-brand-green/10 text-brand-green grid place-items-center">{s.icon}</div>
              <h3 className="mt-4 font-semibold text-lg">{s.title}</h3>
              <p className="mt-1 text-[var(--muted)]">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="trusted" className="container-responsive py-16">
        <h2 className="section-title">Built for sensitive work</h2>
        <p className="section-subtitle mt-2">Security and clarity at every step.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { t: 'Encryption', d: 'Transport-level encryption and strict access controls.', icon: <LockClosedIcon className="h-6 w-6" /> },
            { t: 'Evidence integrity', d: 'Hashing and chain-of-custody workflows.', icon: <CheckCircledIcon className="h-6 w-6" /> },
            { t: 'Transparent status', d: 'Clear updates and time-stamped events.', icon: <RocketIcon className="h-6 w-6" /> },
          ].map((s, i) => (
            <motion.div key={s.t} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="card-surface p-6">
              <div className="h-11 w-11 rounded-md bg-brand-green/10 text-brand-green grid place-items-center">{s.icon}</div>
              <h3 className="font-semibold text-lg mt-2">{s.t}</h3>
              <p className="mt-2 text-[var(--muted)]">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="container-responsive card-surface px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold">Act fast. Reporting early improves outcomes.</h3>
            <p className="mt-1 text-[var(--muted)]">Open a secure report—our team will guide you from there.</p>
          </div>
          <Link href="/report" className="button-primary">Report a case</Link>
        </div>
      </section>
    </div>
  )
}
