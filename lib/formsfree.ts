export async function submitToFormsfree(payload: unknown): Promise<{ ok: boolean; status: number }> {
  const endpoint = process.env.NEXT_PUBLIC_FORMSFREE_ENDPOINT
  if (!endpoint) {
    return { ok: false, status: 0 }
  }
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload),
  })
  return { ok: res.ok, status: res.status }
}
