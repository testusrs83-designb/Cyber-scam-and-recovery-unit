'use client'

import { useEffect, useState } from 'react'

type Health = { ok: boolean; result?: number | null; error?: string }

export default function DiagnosticsPage() {
  const [health, setHealth] = useState<Health | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/db/health', { cache: 'no-store' })
        const json = (await res.json()) as Health
        if (mounted) setHealth(json)
      } catch (err: any) {
        if (mounted) setHealth({ ok: false, error: err?.message || 'Network error' })
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Diagnostics</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">Realtime check: frontend -> API -> Prisma -> Render Postgres</p>
      <div className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-black p-4">
        <pre className="whitespace-pre-wrap text-sm">
          {JSON.stringify(health, null, 2)}
        </pre>
      </div>
    </main>
  )
}