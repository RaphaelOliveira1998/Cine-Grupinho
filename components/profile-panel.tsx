'use client'

import Image from 'next/image'
import { createPortal } from 'react-dom'
import { type ChangeEvent, useActionState, useEffect, useState } from 'react'
import { X, Pencil, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { updateProfilePanelAction } from '@/lib/actions'
import { posterUrl } from '@/lib/utils'
import { Button } from '@/components/button'
import { Input } from '@/components/input'

type FavoriteMovie = {
  id: string
  movieId: string
  tmdbId: number
  title: string
  overview: string | null
  posterPath: string | null
  releaseDate: string | null
  position: number
}

type ProfileData = {
  id: string
  name: string
  username: string | null
  avatarUrl: string | null
}

type SearchResult = {
  id: number
  title: string
  overview: string
  poster_path: string | null
  release_date: string | null
}

function toSearchResult(fav: FavoriteMovie): SearchResult {
  return {
    id: fav.tmdbId,
    title: fav.title,
    overview: fav.overview ?? '',
    poster_path: fav.posterPath ?? null,
    release_date: fav.releaseDate ?? null
  }
}

function EditForm({
  profile,
  favorites,
  onClose,
  onSuccess
}: {
  profile: ProfileData
  favorites: FavoriteMovie[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [state, formAction, isPending] = useActionState(updateProfilePanelAction, null)
  const router = useRouter()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [selectedMovies, setSelectedMovies] = useState<SearchResult[]>(favorites.map(toSearchResult))
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl ?? '')
  const [avatarObjectUrl, setAvatarObjectUrl] = useState('')
  const [avatarError, setAvatarError] = useState('')
  const [visibleCount, setVisibleCount] = useState(5)

  useEffect(() => {
    return () => {
      if (avatarObjectUrl) URL.revokeObjectURL(avatarObjectUrl)
    }
  }, [avatarObjectUrl])

  useEffect(() => {
    if (state?.success) {
      router.refresh()
      onSuccess()
    }
  }, [state, router, onSuccess])

  function changeAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (avatarObjectUrl) URL.revokeObjectURL(avatarObjectUrl)
    setAvatarError('')
    if (!file) {
      setAvatarObjectUrl('')
      setAvatarPreview(profile.avatarUrl ?? '')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setAvatarError('A imagem deve ter no máximo 10MB.')
      event.target.value = ''
      setAvatarObjectUrl('')
      setAvatarPreview(profile.avatarUrl ?? '')
      return
    }
    const url = URL.createObjectURL(file)
    setAvatarObjectUrl(url)
    setAvatarPreview(url)
  }

  async function search() {
    if (!query.trim()) return
    setSearching(true)
    setSearchError('')
    setVisibleCount(5)
    const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`)
    setSearching(false)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setSearchError(data?.error || 'Falha ao buscar filmes')
      return
    }
    const data = await res.json()
    setResults(data.results)
  }

  function addMovie(movie: SearchResult) {
    if (selectedMovies.some((m) => m.id === movie.id) || selectedMovies.length >= 5) return
    setSelectedMovies([...selectedMovies, movie])
  }

  function removeMovie(tmdbId: number) {
    setSelectedMovies(selectedMovies.filter((m) => m.id !== tmdbId))
  }

  const visible = results.slice(0, visibleCount)

  return (
    <form action={formAction} className="space-y-5">
      {/* Basic info */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">Dados do perfil</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input name="name" defaultValue={profile.name} placeholder="Nome" required minLength={2} />
          <Input name="username" defaultValue={profile.username ?? ''} placeholder="username" required minLength={3} maxLength={24} />
        </div>
        {/* Avatar */}
        <label className="block rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <span className="block text-xs uppercase tracking-[0.2em] text-violet-300">Foto</span>
          <div className="mt-3 flex items-center gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900 bg-cover bg-center text-xs text-slate-500"
              style={avatarPreview ? { backgroundImage: `url(${avatarPreview})` } : undefined}
            >
              {!avatarPreview && profile.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <input
                name="avatarFile"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={changeAvatar}
                className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-full file:border-0 file:bg-violet-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-violet-400"
              />
              <span className="mt-1 block text-xs text-slate-500">PNG, JPG, WEBP ou GIF até 10MB.</span>
              {avatarError && <span className="mt-1 block text-xs text-red-400">{avatarError}</span>}
            </div>
          </div>
          <input type="hidden" name="avatarUrl" value={profile.avatarUrl ?? ''} />
        </label>
      </div>

      {/* Favorites section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">Top 5 favoritos</h3>

        {/* Selected */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="mb-3 text-sm font-medium text-white">Selecionados {selectedMovies.length}/5</p>
          {selectedMovies.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum favorito selecionado.</p>
          ) : (
            <div className="space-y-2">
              {selectedMovies.map((movie, index) => (
                <div key={movie.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 text-xs text-violet-300">#{index + 1}</span>
                    {movie.poster_path && (
                      <Image
                        src={posterUrl(movie.poster_path)!}
                        alt={movie.title}
                        width={28}
                        height={42}
                        className="h-10 w-7 shrink-0 rounded object-cover"
                      />
                    )}
                    <p className="line-clamp-1 text-sm text-white">{movie.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMovie(movie.id)}
                    className="shrink-0 text-xs text-slate-400 hover:text-red-400"
                  >
                    Remover
                  </button>
                  <input type="hidden" name="favoriteTmdbIds" value={movie.id} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), search())}
            placeholder="Buscar filmes..."
          />
          <Button type="button" onClick={search} disabled={searching || !query.trim()} className="shrink-0">
            {searching ? '...' : 'Buscar'}
          </Button>
        </div>
        {searchError && <p className="text-sm text-red-300">{searchError}</p>}
        {visible.length > 0 && (
          <div className="space-y-2">
            {visible.map((movie) => {
              const poster = posterUrl(movie.poster_path)
              const selected = selectedMovies.some((m) => m.id === movie.id)
              return (
                <div key={movie.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-2">
                  <div className="h-12 w-8 shrink-0 overflow-hidden rounded-lg bg-slate-900">
                    {poster && <Image src={poster} alt={movie.title} width={80} height={120} className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-white">{movie.title}</p>
                    <p className="text-xs text-slate-400">{movie.release_date?.slice(0, 4) || '—'}</p>
                  </div>
                  <Button
                    type="button"
                    disabled={selected || selectedMovies.length >= 5}
                    onClick={() => addMovie(movie)}
                    className="shrink-0 px-3 py-1.5 text-xs"
                  >
                    {selected ? '✓' : '+'}
                  </Button>
                </div>
              )
            })}
            {results.length > visibleCount && (
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + 5)}
                className="w-full rounded-xl border border-white/10 py-2 text-sm text-slate-400 hover:bg-white/5"
              >
                Ver mais
              </button>
            )}
          </div>
        )}
      </div>

      {state?.error && <p className="rounded-xl bg-red-900/30 px-4 py-2 text-sm text-red-300">{state.error}</p>}

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button type="button" onClick={onClose} className="bg-white/10 hover:bg-white/20">
          Cancelar
        </Button>
      </div>
    </form>
  )
}

export function ProfilePanel({ profile, favorites }: { profile: ProfileData; favorites: FavoriteMovie[] }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)

  function close() {
    setOpen(false)
    setEditing(false)
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 hover:bg-white/10"
      >
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={profile.name}
            width={20}
            height={20}
            unoptimized
            className="h-5 w-5 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/30 text-xs font-bold text-violet-200">
            {profile.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="hidden sm:block">Perfil</span>
      </button>

      {/* Panel rendered via portal so it escapes the header's stacking context */}
      {open && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          {/* Slide-over */}
          <aside className="fixed right-0 top-0 z-[101] flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0a0c1e] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              {editing ? (
                <button onClick={() => setEditing(false)} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white">
                  <ArrowLeft size={16} />
                  Voltar
                </button>
              ) : (
                <h2 className="font-semibold text-white">Meu Perfil</h2>
              )}
              <button onClick={close} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {editing ? (
                <EditForm
                  profile={profile}
                  favorites={favorites}
                  onClose={() => setEditing(false)}
                  onSuccess={() => setEditing(false)}
                />
              ) : (
                <div className="space-y-6">
                  {/* Profile info */}
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-3xl bg-slate-900">
                      {profile.avatarUrl ? (
                        <Image
                          src={profile.avatarUrl}
                          alt={profile.name}
                          width={160}
                          height={160}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl font-bold text-violet-200">
                          {profile.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xl font-bold text-white">{profile.name}</p>
                      {profile.username && <p className="text-sm text-slate-400">@{profile.username}</p>}
                    </div>
                  </div>

                  {/* Favorites */}
                  <div>
                    <p className="mb-3 text-sm uppercase tracking-[0.2em] text-violet-300">Top 5 favoritos</p>
                    {favorites.length === 0 ? (
                      <p className="text-sm text-slate-400">Nenhum favorito adicionado ainda.</p>
                    ) : (
                      <div className="grid grid-cols-5 gap-2">
                        {favorites.map((movie) => {
                          const poster = posterUrl(movie.posterPath)
                          return (
                            <div key={movie.id} className="relative overflow-hidden rounded-xl bg-slate-900">
                              <div className="aspect-[2/3]">
                                {poster ? (
                                  <Image
                                    src={poster}
                                    alt={movie.title}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-xs text-slate-500">?</div>
                                )}
                              </div>
                              <span className="absolute left-1 top-1 rounded-full bg-black/70 px-1.5 py-0.5 text-xs font-bold text-violet-200">
                                {movie.position}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {favorites.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {favorites.map((movie) => (
                          <div key={movie.id} className="flex items-center gap-2">
                            <span className="w-4 text-xs text-violet-300">#{movie.position}</span>
                            <span className="line-clamp-1 text-sm text-slate-300">{movie.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Edit button */}
                  <button
                    onClick={() => setEditing(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-500/40 bg-violet-500/10 py-3 text-sm font-medium text-violet-200 hover:bg-violet-500/20"
                  >
                    <Pencil size={15} />
                    Editar Perfil
                  </button>
                </div>
              )}
            </div>
          </aside>
        </>,
        document.body
      )}
    </>
  )
}
