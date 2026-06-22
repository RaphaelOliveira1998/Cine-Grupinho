import Image from 'next/image'
import type { TmdbMovie } from '@/lib/tmdb'

type MovieCarouselProps = {
  movies: TmdbMovie[]
}

function posterUrl(path: string | null) {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : null
}

export function MovieCarousel({ movies }: MovieCarouselProps) {
  if (!movies.length) return null
  return (
    <section className="mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20">
      <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Em alta</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Filmes mais vistos recentemente</h2>
        </div>
        <p className="max-w-md text-sm text-slate-400">Use como munição para decidir o próximo caos cinematográfico do grupo.</p>
      </div>
      <div className="flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:thin] [scrollbar-color:#7c3aed33_transparent]">
        {movies.map((movie) => {
          const poster = posterUrl(movie.poster_path)
          return (
            <article key={movie.id} className="group relative min-w-[180px] snap-start overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 sm:min-w-[210px]">
              <div className="relative aspect-[2/3] bg-slate-900">
                {poster ? (
                  <Image src={poster} alt={movie.title} fill sizes="220px" className="object-cover transition duration-300 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">Sem poster</div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 pt-16">
                  <h3 className="line-clamp-2 text-base font-semibold text-white">{movie.title}</h3>
                  <p className="mt-1 text-xs text-slate-300">{movie.release_date?.slice(0, 4) || 'Sem data'}</p>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <p className="line-clamp-3 text-sm leading-6 text-slate-400">{movie.overview || 'Sinopse indisponível.'}</p>
                <div className="flex flex-wrap gap-2">
                  {(movie.genres || []).slice(0, 2).map((genre) => (
                    <span key={genre.id} className="rounded-full bg-violet-500/15 px-2.5 py-1 text-xs text-violet-200">{genre.name}</span>
                  ))}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
