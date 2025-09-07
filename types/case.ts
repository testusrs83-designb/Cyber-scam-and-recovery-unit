export type ScamType = 'crypto' | 'fiat' | 'other'
export type CaseStatus = 'intake' | 'under_review' | 'action_recommended'

export interface EvidenceItem {
  name: string
  size: number
  type: string
  hash: string
}

export interface CaseRecord {
  id: string
  createdAt: number
  type: ScamType
  amount: number
  currency: string
  timeline: string
  description: string
  txHashes: string[]
  bankRefs: string[]
  evidence: EvidenceItem[]
  status: CaseStatus
  classification?: string
  messages?: { from: 'victim' | 'reviewer'; text: string; at: number }[]
}
