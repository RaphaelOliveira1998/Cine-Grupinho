import { NextResponse } from 'next/server'
import { searchMovies } from '@/lib/tmdb'
import { searchSchema } from '@/lib/validators'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const parsed = searchSchema.safeParse({ q: url.searchParams.get('q') || '' })
  if (!parsed.success) return NextResponse.json({ results: [] }, { status: 400 })
  const results = await searchMovies(parsed.data.q)
  return NextResponse.json({ results })
}
