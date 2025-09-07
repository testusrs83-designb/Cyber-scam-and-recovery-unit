"use client"
import { useEffect, useMemo, useState } from 'react'
import { loadCases, upsertCase } from '@/lib/storage'
import type { CaseRecord, CaseStatus } from '@/types/case'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

function StatusBadge({ status }: { status: CaseStatus }) {
  const map = {
    intake: 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
    under_review: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200',
    action_recommended: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200'
  } as const
  return <span className={`px-2 py-1 rounded text-xs font-medium ${map[status]}`}>{status.replace('_',' ')}</span>
}

export default function DashboardPage() {
  const [cases, setCases] = useState<CaseRecord[]>([])
  const params = useSearchParams()
  const focusId = params.get('id')

  useEffect(() => {
    setCases(loadCases())
  }, [])

  const focused = useMemo(() => cases.find(c=>c.id===focusId) || null, [cases, focusId])

  function advanceStatus(c: CaseRecord) {
    const order: CaseStatus[] = ['intake','under_review','action_recommended']
    const next = order[Math.min(order.indexOf(c.status) + 1, order.length - 1)]
    const updated = { ...c, status: next }
    upsertCase(updated)
    setCases(loadCases())
  }

  return (
    <div className="container-responsive py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="section-title">Your Cases</h1>
          <p className="section-subtitle mt-2">Track progress and review evidence.</p>
        </div>
        <Link href="/report" className="button-secondary">New Report</Link>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 card-surface p-4">
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {cases.map(c => (
              <li key={c.id} className="py-3">
                <Link href={`/dashboard?id=${c.id}`} className="block">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium capitalize">{c.type}</div>
                      <div className="text-xs text-[var(--muted)]">{new Date(c.createdAt).toLocaleString()}</div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                </Link>
              </li>
            ))}
            {cases.length === 0 && (
              <li className="py-8 text-center text-[var(--muted)]">No cases yet. Create your first report.</li>
            )}
          </ul>
        </div>
        <div className="lg:col-span-2 card-surface p-6">
          {!focused ? (
            <div className="text-[var(--muted)]">Select a case to view details.</div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Case Details</h2>
                  <div className="text-sm text-[var(--muted)]">{focused.amount} {focused.currency} • {focused.type}</div>
                </div>
                <button onClick={()=>advanceStatus(focused)} className="button-primary">Advance Status</button>
              </div>

              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium">Evidence</h3>
                  <ul className="mt-2 divide-y divide-slate-200 dark:divide-slate-800">
                    {focused.evidence.map((e,i)=> (
                      <li key={i} className="py-2">
                        <div className="text-sm font-medium">{e.name}</div>
                        <div className="text-xs text-[var(--muted)]">{(e.size/1024).toFixed(1)} KB • {e.type} • {e.hash}</div>
                      </li>
                    ))}
                    {focused.evidence.length===0 && (
                      <li className="py-4 text-sm text-[var(--muted)]">No evidence added.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium">Timeline</h3>
                  <ol className="mt-2 space-y-3 text-sm">
                    {([
                      { k: 'intake', t: 'Intake received' },
                      { k: 'under_review', t: 'Under review by analyst' },
                      { k: 'action_recommended', t: 'Action recommended' },
                    ] as const).map((s) => (
                      <li key={s.k} className="flex items-start gap-3">
                        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${focused.status===s.k || (s.k==='intake') ? 'bg-brand-green' : 'bg-slate-300 dark:bg-slate-700'}`} />
                        <span className={focused.status===s.k ? 'font-medium' : ''}>{s.t}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
