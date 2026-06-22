'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { recommendMovieAction } from '@/lib/actions'
import { posterUrl } from '@/lib/utils'

type SearchResult = {
  id: number
  title: string
  overview: string
  poster_path: string | null
  release_date: string | null
}

export function MovieSearch({ groupId }: { groupId: string }) {
  const [query, setQuery] = useState('')
  const [movies, setMovies] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function search() {
    setLoading(true)
    setError('')
    const response = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`)
    setLoading(false)
    if (!response.ok) {
      setError('Falha ao buscar filmes')
      return
    }
    const data = await response.json()
    setMovies(data.results)
  }

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Buscar no TMDb</h2>
        <p className="text-sm text-slate-400">Encontre um filme e recomende para o grupo.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Matrix, Interestelar, Parasita..." />
        <Button type="button" onClick={search} disabled={loading || query.length < 1}>{loading ? 'Buscando...' : 'Buscar'}</Button>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {movies.map((movie) => {
          const poster = posterUrl(movie.poster_path)
          return (
            <div key={movie.id} className="flex gap-4 rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-900">
                {poster ? <Image src={poster} alt={movie.title} width={160} height={240} className="h-full w-full object-cover" /> : null}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <h3 className="line-clamp-1 font-semibold text-white">{movie.title}</h3>
                <p className="line-clamp-2 text-sm text-slate-400">{movie.overview || 'Sem sinopse.'}</p>
                <form action={recommendMovieAction}>
                  <input type="hidden" name="groupId" value={groupId} />
                  <input type="hidden" name="tmdbId" value={movie.id} />
                  <Button className="px-3 py-1.5 text-xs">Recomendar</Button>
                </form>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
