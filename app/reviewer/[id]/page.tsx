"use client"
import { useEffect, useState } from 'react'
import { getCase, upsertCase } from '@/lib/storage'
import type { CaseRecord } from '@/types/case'
import { useParams } from 'next/navigation'

export default function ReviewerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [record, setRecord] = useState<CaseRecord | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!id) return
    setRecord(getCase(id) )
  }, [id])

  if (!record) {
    return <div className="container-responsive py-10">Case not found.</div>
  }

  function setClassification(value: string) {
    const updated = { ...record, classification: value }
    upsertCase(updated)
    setRecord(updated)
  }

  function sendMessage() {
    if (!message.trim()) return
    const updated: CaseRecord = {
      ...record,
      messages: [...(record.messages || []), { from: 'reviewer', text: message.trim(), at: Date.now() }]
    }
    upsertCase(updated)
    setRecord(updated)
    setMessage('')
  }

  return (
    <div className="container-responsive py-10">
      <h1 className="section-title">Case {record.id.slice(0,8)}</h1>
      <p className="section-subtitle mt-2">{record.amount} {record.currency} • <span className="capitalize">{record.type}</span></p>

      <div className="mt-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card-surface p-6">
          <h2 className="font-medium">Details</h2>
          <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-[var(--muted)]">Timeline</dt>
              <dd className="font-medium">{record.timeline || '—'}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">TX Hashes</dt>
              <dd className="font-medium break-words whitespace-pre-wrap">{record.txHashes.join('\n') || '—'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[var(--muted)]">Description</dt>
              <dd className="font-medium whitespace-pre-wrap">{record.description || '—'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[var(--muted)]">Evidence</dt>
              <dd>
                <ul className="mt-2 divide-y divide-slate-200 dark:divide-slate-800">
                  {record.evidence.map((e,i)=> (
                    <li key={i} className="py-2 text-sm">
                      <div className="font-medium">{e.name}</div>
                      <div className="text-xs text-[var(--muted)]">{(e.size/1024).toFixed(1)} KB • {e.type} • {e.hash}</div>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </div>
        <div className="card-surface p-6">
          <h2 className="font-medium">Classification</h2>
          <select value={record.classification || ''} onChange={e=>setClassification(e.target.value)} className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2">
            <option value="">Unclassified</option>
            <option value="phishing">Phishing</option>
            <option value="romance">Romance scam</option>
            <option value="investment">Investment scam</option>
            <option value="account-takeover">Account takeover</option>
          </select>

          <h2 className="mt-6 font-medium">Secure Messaging</h2>
          <div className="mt-2 h-48 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-800 p-3 space-y-2 bg-white dark:bg-slate-950">
            {(record.messages||[]).map((m,i)=> (
              <div key={i} className={`max-w-[80%] rounded-md px-3 py-2 text-sm ${m.from==='reviewer' ? 'ml-auto bg-brand-green text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                <div>{m.text}</div>
                <div className="mt-1 text-xs opacity-80">{new Date(m.at).toLocaleString()}</div>
              </div>
            ))}
            {(!record.messages || record.messages.length===0) && (
              <div className="text-sm text-[var(--muted)]">No messages yet.</div>
            )}
          </div>
          <div className="mt-2 flex gap-2">
            <input value={message} onChange={e=>setMessage(e.target.value)} placeholder="Write a message" className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" />
            <button onClick={sendMessage} className="button-primary">Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}
