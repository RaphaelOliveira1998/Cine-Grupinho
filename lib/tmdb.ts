const baseUrl = 'https://api.themoviedb.org/3'

export type TmdbMovie = {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  release_date: string | null
  popularity?: number
  vote_count?: number
  genre_ids?: number[]
  genres?: { id: number; name: string }[]
}

type TmdbMovieDetails = TmdbMovie & {
  belongs_to_collection?: { id: number; name: string } | null
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function uniqueMovies(movies: TmdbMovie[]) {
  return Array.from(new Map(movies.map((movie) => [movie.id, movie])).values())
}

function sortByReleaseDate(movies: TmdbMovie[]) {
  return [...movies].sort((a, b) => String(a.release_date || '9999').localeCompare(String(b.release_date || '9999')))
}

function titleRank(movie: TmdbMovie, normalizedQuery: string) {
  const title = normalize(movie.title)
  const originalTitle = normalize(movie.original_title || '')
  if (title === normalizedQuery || originalTitle === normalizedQuery) return 0
  if (title.startsWith(normalizedQuery) || originalTitle.startsWith(normalizedQuery)) return 1
  if (title.includes(normalizedQuery) || originalTitle.includes(normalizedQuery)) return 2
  return 3
}

function sortSearchResults(movies: TmdbMovie[], normalizedQuery: string) {
  return [...movies].sort((a, b) => {
    const rank = titleRank(a, normalizedQuery) - titleRank(b, normalizedQuery)
    if (rank !== 0) return rank
    const popularity = (b.popularity || 0) - (a.popularity || 0)
    if (popularity !== 0) return popularity
    const votes = (b.vote_count || 0) - (a.vote_count || 0)
    if (votes !== 0) return votes
    return String(a.release_date || '9999').localeCompare(String(b.release_date || '9999'))
  })
}

function isModernMovie(movie: TmdbMovie) {
  const year = Number.parseInt(String(movie.release_date || '').slice(0, 4), 10)
  return Number.isFinite(year) && year >= 1995
}

function tmdbKey() {
  const key = process.env.TMDB_API_KEY?.trim()
  if (!key) throw new Error('TMDB_API_KEY não configurada')
  return key
}

async function tmdbFetch<T>(path: string, params?: Record<string, string>) {
  const key = tmdbKey()
  const searchParams = new URLSearchParams(params)
  const headers: HeadersInit = { accept: 'application/json' }
  if (key.startsWith('ey')) headers.Authorization = `Bearer ${key}`
  else searchParams.set('api_key', key)
  const separator = path.includes('?') ? '&' : '?'
  const query = searchParams.toString()
  const response = await fetch(`${baseUrl}${path}${query ? `${separator}${query}` : ''}`, {
    headers,
    next: { revalidate: 3600 }
  })
  if (!response.ok) throw new Error('Falha na consulta ao TMDb')
  return response.json() as Promise<T>
}

async function getCollectionMovies(collectionId: number) {
  const data = await tmdbFetch<{ parts: TmdbMovie[] }>(`/collection/${collectionId}`, { language: 'pt-BR' })
  return data.parts || []
}

export async function searchMovies(query: string) {
  const data = await tmdbFetch<{ results: TmdbMovie[] }>('/search/movie', { query, language: 'pt-BR', include_adult: 'false' })
  const normalizedQuery = normalize(query)
  const baseResults = sortSearchResults(data.results.filter(isModernMovie).slice(0, 40), normalizedQuery)
  const collectionCandidates = baseResults.filter((movie) => normalize(`${movie.title} ${movie.original_title}`).includes(normalizedQuery)).slice(0, 8)
  const detailResults = await Promise.allSettled(collectionCandidates.map((movie) => getMovieDetails(movie.id)))
  const collectionIds = Array.from(new Set(detailResults.flatMap((result) => result.status === 'fulfilled' && result.value.belongs_to_collection ? [result.value.belongs_to_collection.id] : [])))
  const collectionResults = await Promise.allSettled(collectionIds.map((id) => getCollectionMovies(id)))
  const related = sortByReleaseDate(collectionResults.flatMap((result) => result.status === 'fulfilled' ? result.value : []).filter(isModernMovie))
  const primaryResults = baseResults.filter((movie) => titleRank(movie, normalizedQuery) <= 1)
  const secondaryResults = baseResults.filter((movie) => titleRank(movie, normalizedQuery) > 1)
  return uniqueMovies([...primaryResults, ...related, ...secondaryResults]).slice(0, 40)
}

export async function getMovieDetails(tmdbId: number) {
  return tmdbFetch<TmdbMovieDetails>(`/movie/${tmdbId}`, { language: 'pt-BR' })
}

export async function getTrendingMovies() {
  try {
    const data = await tmdbFetch<{ results: TmdbMovie[] }>('/trending/movie/week', { language: 'pt-BR' })
    return data.results.slice(0, 12)
  } catch {
    return []
  }
}
