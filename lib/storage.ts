import { CaseRecord } from '@/types/case'

const STORAGE_KEY = 'csr_cases_v1'

export function loadCases(): CaseRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as CaseRecord[]
  } catch {
    return []
  }
}

export function saveCases(cases: CaseRecord[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases))
}

export function upsertCase(record: CaseRecord) {
  const cases = loadCases()
  const idx = cases.findIndex(c => c.id === record.id)
  if (idx >= 0) cases[idx] = record
  else cases.unshift(record)
  saveCases(cases)
}

export function getCase(id: string) {
  return loadCases().find(c => c.id === id) || null
}

export function removeCase(id: string) {
  const filtered = loadCases().filter(c => c.id !== id)
  saveCases(filtered)
}
