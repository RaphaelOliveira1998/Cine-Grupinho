import { NextResponse } from 'next/server'
import { getMovieDetails, getMovieTrailer } from '@/lib/tmdb'

export async function GET(_req: Request, { params }: { params: Promise<{ tmdbId: string }> }) {
  const { tmdbId } = await params
  const id = Number(tmdbId)
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  try {
    const [details, trailerKey] = await Promise.all([getMovieDetails(id), getMovieTrailer(id)])
    return NextResponse.json({
      id: details.id,
      title: details.title,
      overview: details.overview,
      posterPath: details.poster_path,
      releaseDate: details.release_date,
      genres: details.genres ?? [],
      trailerKey,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 })
  }
}
