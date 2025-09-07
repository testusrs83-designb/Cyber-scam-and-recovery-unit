"use client"
import { useMemo, useState } from 'react'
import { loadCases, upsertCase } from '@/lib/storage'
import type { CaseRecord, CaseStatus } from '@/types/case'
import Link from 'next/link'

export default function ReviewerPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all'|CaseStatus>('all')
  const [type, setType] = useState<'all'|'crypto'|'fiat'|'other'>('all')
  const cases = loadCases()

  const filtered = useMemo(() => cases.filter(c =>
    (status==='all' || c.status===status) &&
    (type==='all' || c.type===type) &&
    (query==='' || c.description.toLowerCase().includes(query.toLowerCase()) || c.id.includes(query))
  ), [cases, query, status, type])

  return (
    <div className="container-responsive py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="section-title">Reviewer Dashboard</h1>
          <p className="section-subtitle mt-2">Classify cases and communicate securely.</p>
        </div>
      </div>

      <div className="mt-6 card-surface p-4">
        <div className="grid md:grid-cols-4 gap-3">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search description or ID" className="rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" aria-label="Search" />
          <select value={status} onChange={e=>setStatus(e.target.value as any)} className="rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" aria-label="Status filter">
            <option value="all">All statuses</option>
            <option value="intake">Intake</option>
            <option value="under_review">Under review</option>
            <option value="action_recommended">Action recommended</option>
          </select>
          <select value={type} onChange={e=>setType(e.target.value as any)} className="rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" aria-label="Type filter">
            <option value="all">All types</option>
            <option value="crypto">Crypto</option>
            <option value="fiat">Fiat</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <ul className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => (
          <li key={c.id} className="card-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{c.amount} {c.currency} • <span className="capitalize">{c.type}</span></div>
                <div className="text-xs text-[var(--muted)]">{new Date(c.createdAt).toLocaleString()}</div>
              </div>
              <Link className="button-secondary" href={`/reviewer/${c.id}`}>Open</Link>
            </div>
            <p className="mt-3 text-sm line-clamp-3 text-[var(--muted)]">{c.description}</p>
          </li>
        ))}
        {filtered.length===0 && (
          <li className="p-8 text-center text-[var(--muted)]">No matching cases.</li>
        )}
      </ul>
    </div>
  )
}
