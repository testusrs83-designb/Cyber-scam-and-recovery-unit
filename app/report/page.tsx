"use client"
import { useMemo, useState } from 'react'
import * as Progress from '@radix-ui/react-progress'
import { motion, AnimatePresence } from 'framer-motion'
import { sha256OfFile } from '@/lib/hash'
import { upsertCase } from '@/lib/storage'
import { submitToFormsfree } from '@/lib/formsfree'
import type { CaseRecord, ScamType } from '@/types/case'
import { useRouter } from 'next/navigation'

const steps = [
  'Select scam type',
  'Add details',
  'Add TX hashes / refs',
  'Upload evidence',
  'Confirm & submit'
]

export default function ReportPage() {
  const [step, setStep] = useState(0)
  const [type, setType] = useState<ScamType>('crypto')
  const [amount, setAmount] = useState<number>(0)
  const [currency, setCurrency] = useState('USD')
  const [timeline, setTimeline] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [showVerify, setShowVerify] = useState(false)
  const [otp, setOtp] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [progressStage, setProgressStage] = useState<'idle'|'processing'|'done'>('idle')
  const [newCaseId, setNewCaseId] = useState<string | null>(null)
  const [txHashes, setTxHashes] = useState<string[]>([])
  const [bankRefs, setBankRefs] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [hashes, setHashes] = useState<string[]>([])
  const router = useRouter()

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step])

  async function handleFiles(selected: FileList | null) {
    if (!selected) return
    const arr = Array.from(selected)
    setFiles(arr)
    const hs = await Promise.all(arr.map(sha256OfFile))
    setHashes(hs)
  }

  function next() { setStep(s => Math.min(s + 1, steps.length - 1)) }
  function prev() { setStep(s => Math.max(s - 1, 0)) }

  async function submit() {
    const id = crypto.randomUUID()
    const record: CaseRecord = {
      id,
      createdAt: Date.now(),
      type,
      amount,
      currency,
      timeline,
      description,
      txHashes,
      bankRefs,
      evidence: files.map((f, i) => ({ name: f.name, size: f.size, type: f.type, hash: hashes[i] })),
      status: 'intake',
      messages: [
        { id: crypto.randomUUID(), from: 'system', text: 'Report submitted. An agent will be assigned in chat shortly.', at: Date.now() }
      ]
    }
    upsertCase(record)
    try {
      const payload = {
        id,
        createdAt: new Date(record.createdAt).toISOString(),
        type,
        amount,
        currency,
        timeline,
        description,
        txHashes,
        bankRefs,
        evidence: record.evidence,
      }
      const res = await submitToFormsfree(payload)
      if (!res.ok) {
        console.warn('Formsfree submission failed or endpoint missing', res.status)
      }
    } catch (e) {
      console.warn('Formsfree submission error', e)
    }
    router.push(`/dashboard?id=${id}&submitted=1`)
  }

  return (
    <div className="container-responsive py-10">
      <h1 className="section-title">Fraud Reporting Wizard</h1>
      <p className="section-subtitle mt-2">Provide accurate details to assist recovery.</p>

      <div className="mt-6">
        <Progress.Root value={progress} className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" aria-label="Progress">
          <Progress.Indicator
            className="h-full w-full bg-brand-green transition-transform"
            style={{ transform: `translateX(-${100 - progress}%)` }}
          />
        </Progress.Root>
        <p className="mt-2 text-sm text-[var(--muted)]">Step {step + 1} of {steps.length}: {steps[step]}</p>
      </div>

      <div className="mt-6 card-surface p-6">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <label className="block font-medium">Scam type</label>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4" role="radiogroup" aria-label="Scam type">
                {(['crypto','fiat','other'] as ScamType[]).map(v => (
                  <button key={v} onClick={() => setType(v)} aria-pressed={type===v} className={`p-4 rounded-lg border ${type===v ? 'border-brand-green ring-2 ring-brand-green/30' : 'border-slate-200 dark:border-slate-700'}`}>
                    <div className="font-medium capitalize">{v}</div>
                    <div className="text-sm text-[var(--muted)]">{v==='crypto'?'On-chain fraud including phishing, scams, exchanges.':v==='fiat'?'Banking and card-related fraud.':'Other types of scams.'}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">Amount</label>
                <input inputMode="decimal" value={amount || ''} onChange={e=>setAmount(Number(e.target.value)||0)} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" aria-label="Amount"/>
              </div>
              <div>
                <label className="block text-sm font-medium">Currency</label>
                <input value={currency} onChange={e=>setCurrency(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" aria-label="Currency"/>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">Timeline</label>
                <input value={timeline} onChange={e=>setTimeline(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" aria-label="Timeline"/>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">Description</label>
                <textarea value={description} onChange={e=>setDescription(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 min-h-[120px]" aria-label="Description"/>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid gap-4">
              {type !== 'fiat' && (
                <div>
                  <label className="block text-sm font-medium">Crypto TX hashes (one per line)</label>
                  <textarea onChange={e=>setTxHashes(e.target.value.split(/\n+/).map(s=>s.trim()).filter(Boolean))} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 min-h-[120px]" aria-label="Crypto transaction hashes"/>
                </div>
              )}
              {type !== 'crypto' && (
                <div>
                  <label className="block text-sm font-medium">Bank transfer references (one per line)</label>
                  <textarea onChange={e=>setBankRefs(e.target.value.split(/\n+/).map(s=>s.trim()).filter(Boolean))} className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 min-h-[120px]" aria-label="Bank transfer references"/>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <label className="block text-sm font-medium">Upload evidence files</label>
              <input type="file" multiple accept="image/*,application/pdf,text/plain" onChange={e=>handleFiles(e.target.files)} className="mt-2" aria-label="Upload evidence files"/>
              {files.length>0 && (
                <ul className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
                  {files.map((f,i)=> (
                    <li key={i} className="py-2 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{f.name}</div>
                        <div className="text-xs text-[var(--muted)]">{(f.size/1024).toFixed(1)} KB • {f.type || 'file'}{hashes[i] ? ` • ${hashes[i].slice(0,16)}…` : ''}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <div className="text-[var(--muted)]">Type</div>
                  <div className="font-medium capitalize">{type}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <div className="text-[var(--muted)]">Amount</div>
                  <div className="font-medium">{amount} {currency}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 col-span-2">
                  <div className="text-[var(--muted)]">Timeline</div>
                  <div className="font-medium">{timeline || '—'}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 col-span-2">
                  <div className="text-[var(--muted)]">Description</div>
                  <div className="font-medium whitespace-pre-wrap">{description || '—'}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 col-span-2">
                  <div className="text-[var(--muted)]">Evidence</div>
                  <div className="font-medium">{files.length} file(s)</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex justify-between">
          <button onClick={prev} disabled={step===0} className="button-secondary disabled:opacity-50">Back</button>
          {step < steps.length - 1 ? (
            <button onClick={next} className="button-primary">Next</button>
          ) : (
            <button onClick={submit} className="button-primary">Submit</button>
          )}
        </div>
      </div>
    </div>
  )
}
