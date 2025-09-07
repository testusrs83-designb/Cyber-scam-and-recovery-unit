"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import { upsertCase } from '@/lib/storage'
import type { CaseRecord, ChatMessage, ChatAttachment } from '@/types/case'
import { sha256OfFile } from '@/lib/hash'

function useChannel(name: string | null, onMessage: (data: any) => void) {
  useEffect(() => {
    if (!name) return
    const ch = new BroadcastChannel(`csr_chat_${name}`)
    const handler = (e: MessageEvent) => onMessage(e.data)
    ch.addEventListener('message', handler)
    return () => ch.removeEventListener('message', handler)
  }, [name, onMessage])

  const post = (data: any) => { if (!name) return; const ch = new BroadcastChannel(`csr_chat_${name}`); ch.postMessage(data) }
  return { post }
}

export function ChatPanel({ record, onUpdate }:{ record: CaseRecord, onUpdate: (c: CaseRecord)=>void }) {
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [typingAgent, setTypingAgent] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { post } = useChannel(record.id, (data) => {
    if (data?.type === 'message' && data.caseId === record.id) {
      onUpdate({ ...record, messages: [...(record.messages||[]), data.message as ChatMessage] })
    }
    if (data?.type === 'typing' && data.caseId === record.id) {
      setTypingAgent(Boolean(data.agent))
    }
  })

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [record.messages?.length])

  useEffect(() => {
    if (!(record.messages||[]).some(m => m.from === 'system')) {
      const sys: ChatMessage = { id: crypto.randomUUID(), from: 'system', text: 'Thanks for your report. We will assign a Recovery Unit agent to this chat shortly.', at: Date.now() }
      const updated = { ...record, messages: [...(record.messages||[]), sys] }
      upsertCase(updated); onUpdate(updated)
    }
  }, [])

  async function onSelectFiles(list: FileList | null) {
    if (!list) return
    const arr = Array.from(list).slice(0, 5)
    setFiles(arr)
  }

  async function send() {
    if (!text.trim() && files.length === 0) return
    const attachments: ChatAttachment[] = []
    for (const f of files) {
      const hash = await sha256OfFile(f)
      const previewDataUrl = f.type.startsWith('image/') ? await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(f) }) : undefined
      attachments.push({ name: f.name, type: f.type, size: f.size, hash, previewDataUrl })
    }
    const message: ChatMessage = { id: crypto.randomUUID(), from: 'victim', text: text.trim(), at: Date.now(), status: 'sent', attachments }
    const updated = { ...record, messages: [...(record.messages||[]), message] }
    upsertCase(updated); onUpdate(updated)
    post({ type: 'message', caseId: record.id, message })
    setText(''); setFiles([])

    // Simulate agent typing and quick acknowledgement
    setTypingAgent(true); post({ type: 'typing', caseId: record.id, agent: true })
    setTimeout(() => {
      const reply: ChatMessage = { id: crypto.randomUUID(), from: 'reviewer', text: 'Your case is being reviewed. We will follow up shortly with next steps.', at: Date.now(), status: 'delivered' }
      const upd2 = { ...updated, messages: [...(updated.messages||[]), reply] }
      upsertCase(upd2); onUpdate(upd2)
      post({ type: 'message', caseId: record.id, message: reply })
      setTypingAgent(false); post({ type: 'typing', caseId: record.id, agent: false })
    }, 1000)
  }

  return (
    <div className="card-surface p-4">
      <h3 className="font-medium">Secure Chat</h3>
      <div className="mt-3 h-64 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 space-y-2">
        {(record.messages||[]).map(m => (
          <div key={m.id} className={`max-w-[80%] rounded-md px-3 py-2 text-sm ${m.from==='victim' ? 'ml-auto bg-brand-green text-white' : m.from==='reviewer' ? 'bg-slate-200 dark:bg-slate-800' : 'mx-auto bg-slate-100 dark:bg-slate-900'}`}>
            <div>{m.text}</div>
            {m.attachments?.length ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {m.attachments.map((a,i)=> (
                  <div key={i} className="rounded border border-slate-200 dark:border-slate-800 p-2">
                    {a.previewDataUrl ? <img src={a.previewDataUrl} alt={a.name} className="w-full h-24 object-cover rounded"/> : (
                      <div className="text-xs text-[var(--muted)]">{a.name} • {(a.size/1024).toFixed(1)} KB</div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
            <div className="mt-1 text-xs opacity-80 flex items-center gap-2">
              <span>{new Date(m.at).toLocaleTimeString()}</span>
              {m.status ? <span>• {m.status}</span> : null}
            </div>
          </div>
        ))}
        {typingAgent && (
          <div className="max-w-[80%] rounded-md px-3 py-2 text-sm bg-slate-200 dark:bg-slate-800 inline-flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-slate-500 animate-bounce" />
            <span className="inline-block w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:120ms]" />
            <span className="inline-block w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:240ms]" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {files.length>0 && (
        <div className="mt-2 text-xs text-[var(--muted)]">{files.length} attachment(s) ready</div>
      )}
      <div className="mt-3 flex items-center gap-2">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Write a message" className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" aria-label="Message" />
        <label className="button-secondary cursor-pointer">
          <input type="file" multiple className="hidden" onChange={e=>onSelectFiles(e.target.files)} accept="image/*,application/pdf,text/plain" />
          Attach
        </label>
        <button onClick={send} className="button-primary">Send</button>
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">We will assign a Recovery Unit agent to this chat promptly.</p>
    </div>
  )
}
