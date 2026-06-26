'use client'

import Image from 'next/image'
import { type ChangeEvent, useEffect, useState } from 'react'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { updateProfileAction } from '@/lib/actions'
import { posterUrl } from '@/lib/utils'

type SearchResult = {
  id: number
  title: string
  overview: string
  poster_path: string | null
  release_date: string | null
}

type ProfileMoviePickerProps = {
  name: string
  username: string
  avatarUrl: string
}

export function ProfileMoviePicker({ name, username, avatarUrl }: ProfileMoviePickerProps) {
  const [query, setQuery] = useState('')
  const [movies, setMovies] = useState<SearchResult[]>([])
  const [favorites, setFavorites] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchedQuery, setSearchedQuery] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl)
  const [avatarObjectUrl, setAvatarObjectUrl] = useState('')
  const [visibleCount, setVisibleCount] = useState(5)

  useEffect(() => {
    return () => {
      if (avatarObjectUrl) URL.revokeObjectURL(avatarObjectUrl)
    }
  }, [avatarObjectUrl])

  function changeAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (avatarObjectUrl) URL.revokeObjectURL(avatarObjectUrl)
    if (!file) {
      setAvatarObjectUrl('')
      setAvatarPreview(avatarUrl)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setAvatarObjectUrl(objectUrl)
    setAvatarPreview(objectUrl)
  }

  async function search() {
    setLoading(true)
    setError('')
    setSearchedQuery(query)
    setVisibleCount(5)
    const response = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`)
    setLoading(false)
    if (!response.ok) {
      const data = await response.json().catch(() => null)
      setError(data?.error || 'Falha ao buscar filmes')
      return
    }
    const data = await response.json()
    setMovies(data.results)
  }

  const visibleMovies = movies.slice(0, visibleCount)

  function addFavorite(movie: SearchResult) {
    if (favorites.some((favorite) => favorite.id === movie.id) || favorites.length >= 5) return
    setFavorites([...favorites, movie])
  }

  function removeFavorite(tmdbId: number) {
    setFavorites(favorites.filter((movie) => movie.id !== tmdbId))
  }

  return (
    <form action={updateProfileAction} className="space-y-6">
      <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:grid-cols-3">
        <Input name="name" defaultValue={name} placeholder="Nome" required minLength={2} />
        <Input name="username" defaultValue={username} placeholder="username" required minLength={3} maxLength={24} />
        <label className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
          <span className="block text-xs uppercase tracking-[0.2em] text-violet-300">Foto</span>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900 bg-cover bg-center text-xs text-slate-500" style={avatarPreview ? { backgroundImage: `url(${avatarPreview})` } : undefined}>
              {!avatarPreview && 'Sem foto'}
            </div>
            <div className="min-w-0 flex-1">
              <input name="avatarFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={changeAvatar} className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-violet-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-violet-400" />
              <span className="mt-2 block text-xs text-slate-500">PNG, JPG, WEBP ou GIF até 10MB.</span>
            </div>
          </div>
        </label>
        <input type="hidden" name="avatarUrl" value={avatarUrl} />
      </section>
      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Top 5</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Escolha seus filmes favoritos</h2>
          <p className="mt-2 text-sm text-slate-400">Opcional. Se quiser, escolha até 5 filmes; se não quiser perder tempo agora, pule. A sociedade sobreviverá.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Matrix, Alien, Cidade de Deus..." />
          <Button type="button" onClick={search} disabled={loading || query.length < 1}>{loading ? 'Buscando...' : 'Buscar'}</Button>
        </div>
        {error && <p className="text-sm text-red-300">{error}</p>}
        {!error && !loading && searchedQuery && movies.length === 0 && <p className="text-sm text-slate-400">Nenhum resultado para essa busca.</p>}
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="grid gap-3 md:grid-cols-2">
            {visibleMovies.map((movie) => {
              const poster = posterUrl(movie.poster_path)
              const selected = favorites.some((favorite) => favorite.id === movie.id)
              return (
                <div key={movie.id} className="flex gap-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-900">
                    {poster ? <Image src={poster} alt={movie.title} width={160} height={240} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <h3 className="line-clamp-1 font-semibold text-white">{movie.title}</h3>
                    <p className="line-clamp-2 text-sm text-slate-400">{movie.overview || 'Sem sinopse.'}</p>
                    <Button type="button" disabled={selected || favorites.length >= 5} onClick={() => addFavorite(movie)} className="px-3 py-1.5 text-xs">{selected ? 'Selecionado' : 'Adicionar'}</Button>
                  </div>
                </div>
              )
            })}
            {movies.length > visibleCount && (
              <div className="flex justify-center md:col-span-2">
                <Button type="button" className="bg-white/10 hover:bg-white/20" onClick={() => setVisibleCount((count) => count + 5)}>Ver mais</Button>
              </div>
            )}
          </div>
          <aside className="h-fit rounded-3xl border border-white/10 bg-black/20 p-4">
            <h3 className="font-semibold text-white">Selecionados {favorites.length}/5</h3>
            <div className="mt-4 space-y-3">
              {favorites.map((movie, index) => (
                <div key={movie.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 p-3">
                  <div className="min-w-0">
                    <p className="text-xs text-violet-300">#{index + 1}</p>
                    <p className="line-clamp-1 text-sm font-medium text-white">{movie.title}</p>
                  </div>
                  <button type="button" onClick={() => removeFavorite(movie.id)} className="text-xs text-slate-400 hover:text-white">Remover</button>
                  <input type="hidden" name="favoriteTmdbIds" value={movie.id} />
                </div>
              ))}
              {favorites.length === 0 && <p className="text-sm text-slate-400">Nenhum favorito selecionado.</p>}
            </div>
            <div className="mt-5 grid gap-2">
              <Button className="w-full">Salvar perfil</Button>
              <Button type="submit" className="w-full bg-white/10 hover:bg-white/20">Pular favoritos</Button>
            </div>
          </aside>
        </div>
      </section>
    </form>
  )
}
