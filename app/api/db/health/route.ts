import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const res = await prisma.$queryRaw<{ result: number }[]>`SELECT 1 as result`
    const result = Array.isArray(res) && res.length ? res[0].result : null
    return NextResponse.json({ ok: true, result })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Unknown error' },
      { status: 500 }
    )
  }
}
