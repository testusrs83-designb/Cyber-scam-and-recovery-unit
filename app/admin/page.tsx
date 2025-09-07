"use client"
import { useEffect, useMemo, useState } from 'react'
import { isAdminAuthed, loginAdmin, logoutAdmin } from '@/lib/auth'
import { loadCases, upsertCase } from '@/lib/storage'
import type { CaseRecord, CaseStatus } from '@/types/case'
import { ChatPanel } from '@/components/chat-panel'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [cases, setCases] = useState<CaseRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => { setAuthed(isAdminAuthed()) }, [])
  useEffect(() => { if (authed) setCases(loadCases()) }, [authed])

  useEffect(() => {
    const ch = new BroadcastChannel('csr_cases_global')
    const onMsg = () => setCases(loadCases())
    ch.addEventListener('message', onMsg)
    return () => ch.removeEventListener('message', onMsg)
  }, [])

  function updateStatus(c: CaseRecord, status: CaseStatus) {
    const updated = { ...c, status }
    upsertCase(updated)
    setCases(loadCases())
    const bc = new BroadcastChannel('csr_cases_global'); bc.postMessage({ type: 'case_update', id: c.id })
  }

  if (!authed) {
    return (
      <div className="container-responsive py-10">
        <div className="max-w-sm mx-auto card-surface p-6">
          <h1 className="section-title text-xl">Admin Login</h1>
          <div className="mt-4 space-y-3">
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" />
            <input value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="Password" type="password" className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" />
            <button onClick={()=>{ if (loginAdmin(email.trim(), pwd)) setAuthed(true) }} className="button-primary w-full">Sign In</button>
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">Only authorized personnel.</p>
        </div>
      </div>
    )
  }

  const selected = cases.find(c=>c.id===selectedId) || null

  return (
    <div className="container-responsive py-10">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Admin Panel</h1>
        <button onClick={()=>{ logoutAdmin(); setAuthed(false) }} className="button-secondary">Logout</button>
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 card-surface p-4">
          <h2 className="font-medium">Cases</h2>
          <ul className="mt-2 divide-y divide-slate-200 dark:divide-slate-800">
            {cases.map(c => (
              <li key={c.id} className="py-2 flex items-center justify-between">
                <button onClick={()=>setSelectedId(c.id)} className="text-left">
                  <div className="font-medium text-sm">{c.amount} {c.currency} • <span className="capitalize">{c.type}</span></div>
                  <div className="text-xs text-[var(--muted)]">{new Date(c.createdAt).toLocaleString()}</div>
                </button>
                <select value={c.status} onChange={e=>updateStatus(c, e.target.value as CaseStatus)} className="rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1 text-xs">
                  <option value="intake">intake</option>
                  <option value="under_review">under_review</option>
                  <option value="action_recommended">action_recommended</option>
                </select>
              </li>
            ))}
            {cases.length===0 && (<li className="py-6 text-sm text-[var(--muted)]">No reports yet.</li>)}
          </ul>
        </div>
        <div className="lg:col-span-2 space-y-6">
          {!selected ? (
            <div className="card-surface p-6 text-[var(--muted)]">Select a case to view details and chat.</div>
          ) : (
            <>
              <div className="card-surface p-6">
                <h2 className="font-medium">Case {selected.id.slice(0,8)}</h2>
                <div className="text-sm text-[var(--muted)]">{selected.amount} {selected.currency} • <span className="capitalize">{selected.type}</span></div>
                <div className="mt-3 grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-[var(--muted)]">Timeline</div>
                    <div className="font-medium">{selected.timeline || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[var(--muted)]">Evidence</div>
                    <div className="font-medium">{selected.evidence.length} file(s)</div>
                  </div>
                </div>
              </div>
              <ChatPanel sender="reviewer" showSystemIntro={false} record={selected} onUpdate={(c)=>{ upsertCase(c); setCases(loadCases()); const bc = new BroadcastChannel('csr_cases_global'); bc.postMessage({ type: 'message', id: c.id }) }} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
