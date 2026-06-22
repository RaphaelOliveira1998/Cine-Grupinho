const baseUrl = 'https://api.themoviedb.org/3'

export type TmdbMovie = {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  release_date: string | null
  genre_ids?: number[]
  genres?: { id: number; name: string }[]
}

type TmdbMovieDetails = TmdbMovie & {
  belongs_to_collection?: { id: number; name: string } | null
}

type FallbackMovie = TmdbMovieDetails & {
  collectionKey?: string
}

const fallbackMovies: FallbackMovie[] = [
  {
    id: 157336,
    title: 'Interestelar',
    original_title: 'Interstellar',
    overview: 'As reservas naturais da Terra estão chegando ao fim e um grupo de astronautas recebe a missão de verificar possíveis planetas para receberem a população mundial.',
    poster_path: '/nCbkOyOMTEwlEV0LtCOvCnwEONA.jpg',
    release_date: '2014-11-06',
    genres: [{ id: 12, name: 'Aventura' }, { id: 18, name: 'Drama' }, { id: 878, name: 'Ficção científica' }]
  },
  {
    id: 603,
    title: 'Matrix',
    original_title: 'The Matrix',
    overview: 'Um hacker descobre que a realidade é uma simulação controlada por máquinas e se junta à resistência humana.',
    poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    release_date: '1999-03-31',
    genres: [{ id: 28, name: 'Ação' }, { id: 878, name: 'Ficção científica' }],
    collectionKey: 'matrix'
  },
  {
    id: 604,
    title: 'Matrix Reloaded',
    original_title: 'The Matrix Reloaded',
    overview: 'Neo, Trinity e Morpheus continuam a guerra contra as máquinas enquanto Zion se aproxima do colapso.',
    poster_path: '/9TGHDvWrqKBzwDxDodHYXEmOE6J.jpg',
    release_date: '2003-05-15',
    genres: [{ id: 28, name: 'Ação' }, { id: 878, name: 'Ficção científica' }],
    collectionKey: 'matrix'
  },
  {
    id: 605,
    title: 'Matrix Revolutions',
    original_title: 'The Matrix Revolutions',
    overview: 'A batalha final entre humanos e máquinas decide o destino de Zion e da própria Matrix.',
    poster_path: null,
    release_date: '2003-11-05',
    genres: [{ id: 28, name: 'Ação' }, { id: 878, name: 'Ficção científica' }],
    collectionKey: 'matrix'
  },
  {
    id: 624860,
    title: 'Matrix Resurrections',
    original_title: 'The Matrix Resurrections',
    overview: 'Neo retorna a uma nova versão da simulação, porque aparentemente nem a Matrix respeita descanso.',
    poster_path: '/9DT4WVqZqBEI9Kub18gZ3m1D89m.jpg',
    release_date: '2021-12-16',
    genres: [{ id: 28, name: 'Ação' }, { id: 878, name: 'Ficção científica' }],
    collectionKey: 'matrix'
  },
  {
    id: 55931,
    title: 'Animatrix',
    original_title: 'The Animatrix',
    overview: 'Antologia animada que expande a mitologia da Matrix com histórias antes e durante a guerra contra as máquinas.',
    poster_path: '/eDjIG2hAeMU5cxLrd6oiQqdqoZt.jpg',
    release_date: '2003-05-09',
    genres: [{ id: 16, name: 'Animação' }, { id: 878, name: 'Ficção científica' }],
    collectionKey: 'matrix'
  },
  {
    id: 9799,
    title: 'Velozes e Furiosos',
    original_title: 'The Fast and the Furious',
    overview: 'Um policial se infiltra no mundo das corridas de rua para investigar roubos e encontra uma família movida a nitro e decisões ruins.',
    poster_path: '/gqY0ITBgT7A82poL9jv851qdnIb.jpg',
    release_date: '2001-06-22',
    genres: [{ id: 28, name: 'Ação' }, { id: 80, name: 'Crime' }],
    collectionKey: 'fast-furious'
  },
  {
    id: 584,
    title: '+ Velozes + Furiosos',
    original_title: '2 Fast 2 Furious',
    overview: 'Brian volta às corridas ilegais em Miami para derrubar um criminoso com carros chamativos e bom senso limitado.',
    poster_path: '/6nDZExrDKIXvSAghsFKVFRVJuSf.jpg',
    release_date: '2003-06-05',
    genres: [{ id: 28, name: 'Ação' }, { id: 80, name: 'Crime' }],
    collectionKey: 'fast-furious'
  },
  {
    id: 9615,
    title: 'Velozes e Furiosos: Desafio em Tóquio',
    original_title: 'The Fast and the Furious: Tokyo Drift',
    overview: 'Um jovem problemático descobre o drift em Tóquio e transforma trânsito em liturgia mecânica.',
    poster_path: '/cm2ffqb3XovzA5ZSzyN3jnn8qv0.jpg',
    release_date: '2006-06-03',
    genres: [{ id: 28, name: 'Ação' }, { id: 80, name: 'Crime' }],
    collectionKey: 'fast-furious'
  },
  {
    id: 13804,
    title: 'Velozes e Furiosos 4',
    original_title: 'Fast & Furious',
    overview: 'Dom e Brian voltam a acelerar juntos contra um cartel, porque aparentemente delegacias não bastam.',
    poster_path: '/zvjQPVttJWaCSbzMijyc2x2MLr4.jpg',
    release_date: '2009-04-02',
    genres: [{ id: 28, name: 'Ação' }, { id: 80, name: 'Crime' }],
    collectionKey: 'fast-furious'
  },
  {
    id: 51497,
    title: 'Velozes & Furiosos 5: Operação Rio',
    original_title: 'Fast Five',
    overview: 'No Rio de Janeiro, Dom e Brian planejam um roubo impossível enquanto a gravidade tira folga remunerada.',
    poster_path: '/l1gF9ZDT9ZJ4fQ7kV8fX4Sydk8p.jpg',
    release_date: '2011-04-20',
    genres: [{ id: 28, name: 'Ação' }, { id: 80, name: 'Crime' }],
    collectionKey: 'fast-furious'
  },
  {
    id: 496243,
    title: 'Parasita',
    original_title: '기생충',
    overview: 'Todos os membros de uma família pobre se infiltram na casa de uma família rica, iniciando uma cadeia de eventos imprevisíveis.',
    poster_path: '/igw938inb6Fy0YVcwIyxQ7Lu5FO.jpg',
    release_date: '2019-05-30',
    genres: [{ id: 35, name: 'Comédia' }, { id: 53, name: 'Thriller' }, { id: 18, name: 'Drama' }]
  },
  {
    id: 238,
    title: 'O Poderoso Chefão',
    original_title: 'The Godfather',
    overview: 'A família Corleone administra poder, lealdade e violência no submundo americano.',
    poster_path: '/oJagOzBu9Rdd9BrciseCm3U3MCU.jpg',
    release_date: '1972-03-14',
    genres: [{ id: 18, name: 'Drama' }, { id: 80, name: 'Crime' }]
  },
  {
    id: 155,
    title: 'Batman: O Cavaleiro das Trevas',
    original_title: 'The Dark Knight',
    overview: 'Batman enfrenta o Coringa enquanto Gotham descobre o preço da ordem.',
    poster_path: '/4lj1ikfsSmMZNyfdi8R8Tv5tsgb.jpg',
    release_date: '2008-07-16',
    genres: [{ id: 28, name: 'Ação' }, { id: 80, name: 'Crime' }, { id: 18, name: 'Drama' }]
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    original_title: 'Pulp Fiction',
    overview: 'Histórias criminosas se cruzam em Los Angeles com violência, ironia e decisões ruins.',
    poster_path: '/tptjnB2LDbuUWya9Cx5sQtv5hqb.jpg',
    release_date: '1994-09-10',
    genres: [{ id: 80, name: 'Crime' }, { id: 53, name: 'Thriller' }]
  },
  {
    id: 13,
    title: 'Forrest Gump',
    original_title: 'Forrest Gump',
    overview: 'Um homem atravessa décadas da história americana com inocência, sorte e uma caixa de chocolates.',
    poster_path: '/d74WpIsH8379TIL4wUxDneRCYv2.jpg',
    release_date: '1994-06-23',
    genres: [{ id: 35, name: 'Comédia' }, { id: 18, name: 'Drama' }, { id: 10749, name: 'Romance' }]
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    original_title: 'Oppenheimer',
    overview: 'A criação da bomba atômica e a queda moral de quem achou que controlar fogo nuclear seria simples.',
    poster_path: '/1OsQJEoSXBjduuCvDOlRhoEUaHu.jpg',
    release_date: '2023-07-19',
    genres: [{ id: 18, name: 'Drama' }, { id: 36, name: 'História' }]
  },
  {
    id: 346698,
    title: 'Barbie',
    original_title: 'Barbie',
    overview: 'Barbie deixa a perfeição fabricada e encontra o mundo real, uma escolha questionável como todas as outras.',
    poster_path: '/yRRuLt7sMBEQkHsd1S3KaaofZn7.jpg',
    release_date: '2023-07-19',
    genres: [{ id: 35, name: 'Comédia' }, { id: 12, name: 'Aventura' }]
  }
]

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function uniqueMovies(movies: TmdbMovie[]) {
  return Array.from(new Map(movies.map((movie) => [movie.id, movie])).values())
}

function sortByReleaseDate(movies: TmdbMovie[]) {
  return [...movies].sort((a, b) => String(a.release_date || '9999').localeCompare(String(b.release_date || '9999')))
}

function editDistance(a: string, b: string) {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index)
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i]
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    previous.splice(0, previous.length, ...current)
  }
  return previous[b.length]
}

function fallbackMovieMatches(movie: FallbackMovie, term: string) {
  const haystack = normalize(`${movie.title} ${movie.original_title}`)
  if (haystack.includes(term) || term.includes(normalize(movie.title))) return true
  if (term.length < 5) return false
  return haystack.split(/[^a-z0-9]+/).some((word) => word.length >= 5 && editDistance(word, term) <= 2)
}

async function tmdbFetch<T>(path: string, params?: Record<string, string>) {
  const key = process.env.TMDB_API_KEY
  if (!key) throw new Error('TMDB_API_KEY não configurada')
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

function fallbackSearch(query: string) {
  const term = normalize(query)
  const matches = fallbackMovies.filter((movie) => fallbackMovieMatches(movie, term))
  const collectionKeys = new Set(matches.map((movie) => movie.collectionKey).filter(Boolean))
  const related = fallbackMovies.filter((movie) => movie.collectionKey && collectionKeys.has(movie.collectionKey))
  const results = uniqueMovies([...matches, ...related])
  return results.length ? sortByReleaseDate(results) : []
}

async function getCollectionMovies(collectionId: number) {
  const data = await tmdbFetch<{ parts: TmdbMovie[] }>(`/collection/${collectionId}`, { language: 'pt-BR' })
  return data.parts || []
}

export async function searchMovies(query: string) {
  if (!process.env.TMDB_API_KEY) return fallbackSearch(query).slice(0, 18)
  const data = await tmdbFetch<{ results: TmdbMovie[] }>('/search/movie', { query, language: 'pt-BR', include_adult: 'false' })
  const baseResults = data.results.slice(0, 12)
  const collectionCandidates = baseResults.filter((movie) => normalize(`${movie.title} ${movie.original_title}`).includes(normalize(query))).slice(0, 5)
  const detailResults = await Promise.allSettled(collectionCandidates.map((movie) => getMovieDetails(movie.id)))
  const collectionIds = Array.from(new Set(detailResults.flatMap((result) => result.status === 'fulfilled' && result.value.belongs_to_collection ? [result.value.belongs_to_collection.id] : [])))
  const collectionResults = await Promise.allSettled(collectionIds.map((id) => getCollectionMovies(id)))
  const related = collectionResults.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
  return sortByReleaseDate(uniqueMovies([...baseResults, ...related])).slice(0, 24)
}

export async function getMovieDetails(tmdbId: number) {
  const fallback = fallbackMovies.find((movie) => movie.id === tmdbId)
  if (!process.env.TMDB_API_KEY && fallback) return fallback
  return tmdbFetch<TmdbMovieDetails>(`/movie/${tmdbId}`, { language: 'pt-BR' })
}

export async function getTrendingMovies() {
  if (!process.env.TMDB_API_KEY) return fallbackMovies.slice(0, 9)
  const data = await tmdbFetch<{ results: TmdbMovie[] }>('/trending/movie/week', { language: 'pt-BR' })
  return data.results.slice(0, 12)
}

