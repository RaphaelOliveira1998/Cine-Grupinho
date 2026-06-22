import { NextResponse } from 'next/server'
import { searchMovies } from '@/lib/tmdb'
import { searchSchema } from '@/lib/validators'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const parsed = searchSchema.safeParse({ q: url.searchParams.get('q') || '' })
  if (!parsed.success) return NextResponse.json({ results: [], error: 'Busca inválida.' }, { status: 400 })
  try {
    const results = await searchMovies(parsed.data.q)
    return NextResponse.json({ results })
  } catch (error) {
    const message = error instanceof Error && error.message.includes('TMDB_API_KEY') ? 'Configure TMDB_API_KEY para ativar a busca real de filmes.' : 'Falha ao consultar o TMDb.'
    return NextResponse.json({ results: [], error: message }, { status: 503 })
  }
}
