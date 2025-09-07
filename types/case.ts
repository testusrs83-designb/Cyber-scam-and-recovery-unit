export type ScamType = 'crypto' | 'fiat' | 'other'
export type CaseStatus = 'intake' | 'under_review' | 'action_recommended'

export interface EvidenceItem {
  name: string
  size: number
  type: string
  hash: string
}

export type MessageStatus = 'sent' | 'delivered' | 'read'
export interface ChatAttachment { name: string; type: string; size: number; hash?: string; previewDataUrl?: string }
export interface ChatMessage { id: string; from: 'victim' | 'reviewer' | 'system'; text: string; at: number; status?: MessageStatus; attachments?: ChatAttachment[] }

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
  messages?: ChatMessage[]
}
