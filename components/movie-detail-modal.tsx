'use client'

import Image from 'next/image'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

type MovieDetail = {
  id: number
  title: string
  overview: string
  posterPath: string | null
  releaseDate: string | null
  genres: { id: number; name: string }[]
  trailerKey: string | null
}

export function MovieDetailModal({ tmdbId, onClose }: { tmdbId: number; onClose: () => void }) {
  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/tmdb/movie/${tmdbId}`)
      .then((r) => r.json())
      .then((data) => { setMovie(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [tmdbId])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const poster = movie?.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0f0f1a] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-2 text-slate-300 hover:text-white"
        >
          <X size={18} />
        </button>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-slate-400">Carregando...</div>
        ) : !movie ? (
          <div className="flex h-64 items-center justify-center text-slate-400">Não foi possível carregar.</div>
        ) : (
          <div className="space-y-5 p-6">
            <div className="flex gap-5">
              {poster && (
                <div className="hidden shrink-0 sm:block">
                  <Image src={poster} alt={movie.title} width={120} height={180} className="rounded-2xl object-cover" />
                </div>
              )}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">{movie.title}</h2>
                <p className="text-sm text-slate-400">{movie.releaseDate?.slice(0, 4) || 'Sem data'}</p>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.slice(0, 3).map((g) => (
                    <span key={g.id} className="rounded-full bg-violet-500/15 px-2.5 py-1 text-xs text-violet-200">{g.name}</span>
                  ))}
                </div>
                <p className="text-sm leading-6 text-slate-300">{movie.overview || 'Sem sinopse.'}</p>
              </div>
            </div>

            {movie.trailerKey && (
              <div className="overflow-hidden rounded-2xl border border-white/10 aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&mute=0`}
                  title="Trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            )}

            {!movie.trailerKey && (
              <p className="text-center text-sm text-slate-500">Trailer não disponível.</p>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
