import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('tmdb search', () => {
  it('fails clearly when TMDB_API_KEY is missing', async () => {
    vi.stubEnv('TMDB_API_KEY', '')
    const { searchMovies } = await import('@/lib/tmdb')
    await expect(searchMovies('Matrix')).rejects.toThrow('TMDB_API_KEY não configurada')
  })

  it('uses TMDb search and collection expansion for franchises', async () => {
    vi.stubEnv('TMDB_API_KEY', 'test-key')
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/search/movie')) {
        return Response.json({
          results: [
            { id: 9799, title: 'Velozes e Furiosos', original_title: 'The Fast and the Furious', overview: '', poster_path: null, release_date: '2001-06-22' },
            { id: 385687, title: 'Velozes & Furiosos 10', original_title: 'Fast X', overview: '', poster_path: null, release_date: '2023-05-17' }
          ]
        })
      }
      if (url.includes('/movie/9799')) {
        return Response.json({ id: 9799, title: 'Velozes e Furiosos', original_title: 'The Fast and the Furious', overview: '', poster_path: null, release_date: '2001-06-22', belongs_to_collection: { id: 9485, name: 'Fast & Furious Collection' } })
      }
      if (url.includes('/movie/385687')) {
        return Response.json({ id: 385687, title: 'Velozes & Furiosos 10', original_title: 'Fast X', overview: '', poster_path: null, release_date: '2023-05-17', belongs_to_collection: { id: 9485, name: 'Fast & Furious Collection' } })
      }
      if (url.includes('/collection/9485')) {
        return Response.json({
          parts: [
            { id: 9799, title: 'Velozes e Furiosos', original_title: 'The Fast and the Furious', overview: '', poster_path: null, release_date: '2001-06-22' },
            { id: 584, title: '+ Velozes + Furiosos', original_title: '2 Fast 2 Furious', overview: '', poster_path: null, release_date: '2003-06-05' },
            { id: 9615, title: 'Velozes e Furiosos: Desafio em Tóquio', original_title: 'The Fast and the Furious: Tokyo Drift', overview: '', poster_path: null, release_date: '2006-06-03' },
            { id: 385687, title: 'Velozes & Furiosos 10', original_title: 'Fast X', overview: '', poster_path: null, release_date: '2023-05-17' }
          ]
        })
      }
      return new Response(null, { status: 404 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const { searchMovies } = await import('@/lib/tmdb')
    const results = await searchMovies('velozes e furiosos')
    expect(results.map((movie) => movie.title)).toEqual(['Velozes e Furiosos', '+ Velozes + Furiosos', 'Velozes e Furiosos: Desafio em Tóquio', 'Velozes & Furiosos 10'])
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/search/movie'), expect.any(Object))
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/collection/9485'), expect.any(Object))
  })

  it('prioritizes exact title matches before loose and more popular matches', async () => {
    vi.stubEnv('TMDB_API_KEY', 'test-key')
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/search/movie')) {
        return Response.json({
          results: [
            { id: 1, title: 'O Homem da Máscara de Ferro', original_title: 'The Man in the Iron Mask', overview: '', poster_path: null, release_date: '1998-03-13', popularity: 80, vote_count: 2000 },
            { id: 2, title: 'Cromwell, O Homem de Ferro', original_title: 'Cromwell', overview: '', poster_path: null, release_date: '1970-09-16', popularity: 60, vote_count: 500 },
            { id: 3, title: 'Homem de Ferro', original_title: 'Iron Man', overview: '', poster_path: null, release_date: '2008-04-30', popularity: 20, vote_count: 30000 }
          ]
        })
      }
      if (url.includes('/movie/3')) {
        return Response.json({ id: 3, title: 'Homem de Ferro', original_title: 'Iron Man', overview: '', poster_path: null, release_date: '2008-04-30', belongs_to_collection: { id: 131292, name: 'Iron Man Collection' } })
      }
      if (url.includes('/movie/1') || url.includes('/movie/2')) {
        return Response.json({ id: 1, title: 'Loose', original_title: 'Loose', overview: '', poster_path: null, release_date: null, belongs_to_collection: null })
      }
      if (url.includes('/collection/131292')) {
        return Response.json({ parts: [{ id: 4, title: 'Homem de Ferro 2', original_title: 'Iron Man 2', overview: '', poster_path: null, release_date: '2010-04-28' }] })
      }
      return new Response(null, { status: 404 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const { searchMovies } = await import('@/lib/tmdb')
    const results = await searchMovies('homem de ferro')
    expect(results.map((movie) => movie.title).slice(0, 3)).toEqual(['Homem de Ferro', 'Homem de Ferro 2', 'O Homem da Máscara de Ferro'])
    expect(results.map((movie) => movie.title)).not.toContain('Cromwell, O Homem de Ferro')
  })
})
